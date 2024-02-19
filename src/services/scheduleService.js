const Model = require('../models');
const scheduleStruct = require('../struct/scheduleStruct');
const shiftStruct = require('../struct/shiftStruct');
const userService = require('./userService');

const createSchedule = async (organizationId, req, session) => {
  const createdShifts = shiftStruct.MutlipleShiftData(req.body);

  const employeeIds = userService.validateEmployeeIds(req.body.employeeIds);
  const schedulePayload = scheduleStruct.ScheduleData({
    employeeIds,
    effectiveEndDate: req.body.effectiveEndDate,
    effectiveStartDate: req.body.effectiveStartDate,
    organizationId,
    scheduleName: '',
    shifts: createdShifts,
  });
  const createdSchedule = await Model.Schedule.create(schedulePayload);
  await createdSchedule.save({ session });
  return createdSchedule;
};

const deleteSchedules = async (scheduleIds) => {
  const deleteScheduleQuery = { _id: { $in: scheduleIds } };
  const deletedSchedule = await Model.Schedule.find(deleteScheduleQuery);
  await Model.Schedule.deleteMany(deleteScheduleQuery);
  return deletedSchedule;
};

module.exports = {
  createSchedule,
  deleteSchedules,
};