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

const createSchedule = async (organizationId, req, session) => {
  const createdShifts = await createShifts(req.body.shifts, session);

  const employeeIds = await userService.validateEmployeeIds(req.body.employeeIds);
  const scheduleCount = await Model.Schedule.countDocuments({ organizationId }, { session });

  const scheduleNameExist = await Model.Schedule.findOne({
    organizationId,
    name: req.body.scheduleName,
  });
  if (scheduleNameExist) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Location with name: "${scheduleNameExist.name}" already exist!`,
    );
  }
  const schedulePayload = scheduleStruct.ScheduleData({
    employeeIds,
    organizationId,
    scheduleName: `Schedule ${scheduleCount + 1}`,
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

const deleteSchedules = async (organizationId, scheduleIds, session) => {
  const deleteScheduleQuery = { _id: { $in: scheduleIds }, organizationId };
  const schedulesToDelete = await Model.Schedule.find(deleteScheduleQuery).session(session);

  const shiftIdsToDelete = schedulesToDelete.flatMap((schedule) => schedule.shifts);
  const deleteShiftQuery = { _id: { $in: shiftIdsToDelete } };

  const shiftToDelete = await Model.Shift.find(deleteShiftQuery).session(session);
  await Model.Shift.deleteMany(deleteShiftQuery, { session });
  await Model.Schedule.deleteMany(deleteScheduleQuery, { session });

  return { schedulesToDelete, shiftToDelete };
};

module.exports = {
  getScheduleList,
  createSchedule,
  deleteSchedules,
  setDefaultWorkschedule,
};
