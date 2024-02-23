const shiftStruct = require('./shiftStruct');

const ScheduleData = ({
  scheduleName, employeeIds, ...otherPayload
}) => ({
  name: scheduleName,
  users: employeeIds,
  isDefault: false,
  ...otherPayload,
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

const ScheduleSnapshot = (attendanceSchedule) => {
  console.log(attendanceSchedule, 'suini');
  return ({
    name: attendanceSchedule.scheduleName,
    shifts: attendanceSchedule?.scheduleShifts?.map(shiftStruct.SingleShiftData),
    organizationId: attendanceSchedule.organizationId,
    effectiveStartDate: attendanceSchedule.effectiveStartDate,
    effectiveEndDate: attendanceSchedule.effectiveEndDate,
    isDefault: attendanceSchedule.isDefault,
    gracePeriod: attendanceSchedule.gracePeriod,
    overtimeTolerance: attendanceSchedule.overtimeTolerance,
  });
};

const SchedulePreview = (schedule) => ({
  id: schedule._id,
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
  gracePeriod: schedule.gracePeriod,
  overtimeTolerance: schedule.overtimeTolerance,
});

module.exports = {
  ScheduleData,
  SchedulePagination,
  UpdateScheduleData,
  ScheduleSnapshot,
  SchedulePreview,
};
