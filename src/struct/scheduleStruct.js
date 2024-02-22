const shiftStruct = require('./shiftStruct');

const ScheduleData = ({
  scheduleName, employeeIds, shifts,
  organizationId, effectiveStartDate,
  effectiveEndDate,
}) => ({
  name: scheduleName,
  users: employeeIds,
  shifts,
  organizationId,
  effectiveStartDate,
  effectiveEndDate,
  isDefault: false,
});

const UpdateScheduleData = ({
  scheduleName, employeeIds,
  shifts,
}) => ({
  name: scheduleName,
  users: employeeIds,
  shifts,
});

const SchedulePagination = (page, limit, totalData) => ({
  totalPage: Math.ceil(totalData / limit),
  currentPage: page,
});

const ScheduleSnapshot = (schedule) => ({
  name: schedule.name,
  shifts: schedule.shifts.map(shiftStruct.SingleShiftData),
  users: schedule.users,
  organizationId: schedule.organizationId,
  effectiveStartDate: schedule.effectiveStartDate,
  effectiveEndDate: schedule.effectiveEndDate,
  isDefault: schedule.isDefault,
});

module.exports = {
  ScheduleData,
  SchedulePagination,
  UpdateScheduleData,
  ScheduleSnapshot,
};
