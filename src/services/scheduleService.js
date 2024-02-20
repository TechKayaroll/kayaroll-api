const Model = require('../models');
const scheduleStruct = require('../struct/scheduleStruct');
const shiftStruct = require('../struct/shiftStruct');
const { SHIFT_DAY } = require('../utils/constants');
const { validateShifts } = require('../helpers/scheduleShift');

const userService = require('./userService');

const getScheduleList = async (organizationId, { page, limit }) => {
  const skip = (page - 1) * limit;

  const adminSchedules = await Model.Schedule.find({ organizationId })
    .populate({
      path: 'users',
    })
    .populate({
      path: 'organizationId',
    })
    .populate({ path: 'shifts' })
    .skip(skip)
    .limit(limit);

  const totalData = await Model.Schedule.countDocuments({ organizationId });
  return {
    list: adminSchedules,
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

const createSchedule = async (organizationId, req, session) => {
  const createdShifts = await createShifts(req.body.shifts, session);

  const employeeIds = await userService.validateEmployeeIds(req.body.employeeIds);
  const scheduleCount = await Model.Schedule.countDocuments({ organizationId }, { session });
  const schedulePayload = scheduleStruct.ScheduleData({
    employeeIds,
    effectiveEndDate: req.body.effectiveEndDate,
    effectiveStartDate: req.body.effectiveStartDate,
    organizationId,
    scheduleName: `Schedule ${scheduleCount + 1}`,
    shifts: createdShifts.map((shift) => shift._id),
  });
  const createdSchedule = await Model.Schedule.create(schedulePayload);
  await createdSchedule.save({ session });
  return createdSchedule;
};

const deleteSchedules = async (organizationId, scheduleIds) => {
  const deleteScheduleQuery = { _id: { $in: scheduleIds }, organizationId };
  const deletedSchedule = await Model.Schedule.find(deleteScheduleQuery);
  await Model.Schedule.deleteMany(deleteScheduleQuery);
  return deletedSchedule;
};

module.exports = {
  getScheduleList,
  createSchedule,
  deleteSchedules,
};
