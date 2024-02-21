const { StatusCodes } = require('http-status-codes');
const Model = require('../models');
const scheduleStruct = require('../struct/scheduleStruct');
const shiftStruct = require('../struct/shiftStruct');
const { SHIFT_DAY } = require('../utils/constants');
const { validateShifts } = require('../helpers/scheduleShift');

const userService = require('./userService');
const { ResponseError } = require('../helpers/response');

const getScheduleList = async (organizationId, {
  page, limit, sortBy = 'asc', name, isDefault,
}) => {
  const skip = (page - 1) * limit;

  const sortCriteria = {
    createdAt: sortBy === 'asc' ? 1 : -1,
  };

  const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};
  const isDefaultFilter = isDefault ? { isDefault: Boolean(isDefault) } : {};

  const query = Model.Schedule.find({ organizationId, ...nameFilter, ...isDefaultFilter })
    .populate({
      path: 'users',
    })
    .populate({
      path: 'organizationId',
    })
    .populate({ path: 'shifts' })
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);

  const [schedules, totalData] = await Promise.all([
    query,
    Model.Schedule.countDocuments({ organizationId, ...nameFilter }),
  ]);

  return {
    list: schedules,
    pagination: scheduleStruct.SchedulePagination(
      page,
      limit,
      totalData,
    ),
  };
};

const createShifts = async (shifts, session) => {
  const shiftDatas = [];
  Object.values(SHIFT_DAY).forEach((eachDay, index) => {
    const shiftsByDay = shifts[index] || [];
    if (shiftsByDay) {
      const shift = shiftStruct.SingleShiftData({ day: eachDay, shifts: shiftsByDay });
      shiftDatas.push(shift);
    }
    const isValidShifts = validateShifts(shiftsByDay);
    if (!isValidShifts) {
      throw new Error(`There's an overlap shift! Day: [${eachDay}]`);
    }
  });
  const createdShifts = await Model.Shift.insertMany(shiftDatas, { session });
  return createdShifts;
};

const setDefaultWorkschedule = async (organizationId, schedulePayload, session) => {
  const otherWorkSchedules = await Model.Schedule.find({
    organizationId,
    isDefault: true,
  });
  if (otherWorkSchedules.length > 0) {
    const workScheduleIdsToBeUpdated = otherWorkSchedules.map((schedule) => schedule._id);
    await Model.Schedule.updateMany(
      { _id: { $in: workScheduleIdsToBeUpdated } },
      { $set: { isDefault: false, effectiveStartDate: undefined, effectiveEndDate: undefined } },
      { session },
    );
  }

  const scheduleToBeUpdated = await Model.Schedule.findOneAndUpdate(
    {
      _id: schedulePayload.scheduleId,
      organizationId,
    },
    {
      isDefault: true,
      effectiveStartDate: schedulePayload.effectiveStartDate,
      effectiveEndDate: schedulePayload.effectiveEndDate,
    },
    { new: true, session },
  );

  return scheduleToBeUpdated;
};

const findOneScheduleByName = async (organizationId, scheduleName, session) => {
  const schedule = await Model.Schedule.findOne({
    organizationId,
    name: scheduleName,
  })
    .populate({
      path: 'users',
    })
    .populate({
      path: 'organizationId',
    })
    .populate({ path: 'shifts' })
    .session(session);
  return schedule;
};

const createSchedule = async (organizationId, req, session) => {
  const createdShifts = await createShifts(req.body.shifts, session);

  const employeeIds = await userService.validateEmployeeIds(req.body.employeeIds);
  const scheduleNameExist = await findOneScheduleByName(req.body.scheduleName);
  if (scheduleNameExist) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Schedule with name: "${scheduleNameExist.name}" already exist!`,
    );
  }
  const schedulePayload = scheduleStruct.ScheduleData({
    employeeIds,
    organizationId,
    scheduleName: req.body.scheduleName,
    shifts: createdShifts.map((shift) => shift._id),
  });
  const createdSchedule = await Model.Schedule.create(schedulePayload);
  await createdSchedule.save({ session });

  let createdScheduleResult = createdSchedule;
  if (req.body.isDefault) {
    const createdDefaultWorkSchedule = await setDefaultWorkschedule(organizationId, {
      scheduleId: createdSchedule._id,
      effectiveEndDate: req.body.effectiveEndDate,
      effectiveStartDate: req.body.effectiveStartDate,
    }, session);
    createdScheduleResult = createdDefaultWorkSchedule;
  }
  return createdScheduleResult;
};

const deleteShifts = async (shiftIds, session) => {
  const deleteShiftQuery = { _id: { $in: shiftIds } };

  const shiftToDelete = await Model.Shift.find(deleteShiftQuery).session(session);
  await Model.Shift.deleteMany(deleteShiftQuery, { session });

  return shiftToDelete;
};
const deleteSchedules = async (organizationId, scheduleIds, session) => {
  const deleteScheduleQuery = { _id: { $in: scheduleIds }, organizationId };
  const schedulesToDelete = await Model.Schedule.find(deleteScheduleQuery).session(session);

  const shiftIdsToDelete = schedulesToDelete.flatMap((schedule) => schedule.shifts);
  const shiftToDelete = await deleteShifts(shiftIdsToDelete);
  await Model.Schedule.deleteMany(deleteScheduleQuery, { session });

  return { schedulesToDelete, shiftToDelete };
};

const findScheduleById = async (organizationId, scheduleId, session) => {
  const schedule = await Model.Schedule.findById(scheduleId)
    .where(organizationId)
    .populate({
      path: 'users',
    })
    .populate({
      path: 'organizationId',
    })
    .populate({ path: 'shifts' })
    .session(session);
  return schedule;
};
const updateScheduleById = async (organizationId, scheduleId, payload, session) => {
  const workScheduleToBeUpdated = await Model.Schedule
    .findById(scheduleId)
    .where({ organizationId });
  if (!workScheduleToBeUpdated) {
    throw new ResponseError(StatusCodes.BAD_REQUEST, 'Schedule not found!');
  }

  const shiftIdsToDelete = workScheduleToBeUpdated.shifts;
  await deleteShifts(shiftIdsToDelete, session);

  const createdShifts = await createShifts(payload.shifts, session);
  const employeeIds = await userService.validateEmployeeIds(payload.employeeIds, organizationId);

  const scheduleNameExist = await findOneScheduleByName(organizationId, payload.scheduleName);
  if (scheduleNameExist && scheduleNameExist._id !== scheduleId) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Schedule with name: "${payload.scheduleName}" already exists!`,
    );
  }

  const schedulePayload = {
    scheduleName: payload.scheduleName,
    users: employeeIds,
    shifts: createdShifts.map((shift) => shift._id),
  };
  let updatedSchedule = workScheduleToBeUpdated;
  if (payload.isDefault === true) {
    const createdDefaultWorkSchedule = await setDefaultWorkschedule(
      organizationId,
      {
        scheduleId: workScheduleToBeUpdated._id,
        effectiveEndDate: payload.effectiveEndDate,
        effectiveStartDate: payload.effectiveStartDate,
      },
      session,
    );
    updatedSchedule = createdDefaultWorkSchedule;
  } else {
    schedulePayload.isDefault = payload.isDefault;
    schedulePayload.effectiveEndDate = undefined;
    schedulePayload.effectiveStartDate = undefined;
  }
  Object.assign(updatedSchedule, schedulePayload);
  await updatedSchedule.save({ session });

  const schedule = await findScheduleById(organizationId, updatedSchedule._id);
  return schedule;
};

module.exports = {
  getScheduleList,
  createSchedule,
  deleteSchedules,
  setDefaultWorkschedule,
  updateScheduleById,
  findScheduleById,
};
