const shiftStruct = require('./shiftStruct');
const userStruct = require('./userStruct');
const organizationStruct = require('./organizationStruct');

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

const SchedulePreview = (schedule) => ({
  name: schedule.name,
  shifts: schedule.shifts.map(shiftStruct.ShiftFormatedTime),
  users: schedule.users.map((user) => ({
    id: user?._id,
    name: user?.fullname,
    email: user?.email,
  })),
  organization: {
    id: schedule.organizationId._id,
    name: schedule.organizationId.name,
    invitationCode: schedule.organizationId.invitationCode,
  },
  effectiveStartDate: schedule.effectiveStartDate,
  effectiveEndDate: schedule.effectiveEndDate,
  isDefault: schedule.isDefault,
});

module.exports = {
  ScheduleData,
  SchedulePagination,
  UpdateScheduleData,
  ScheduleSnapshot,
  SchedulePreview,
};
