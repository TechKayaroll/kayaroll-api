const dayjs = require('dayjs');
const shiftStruct = require('./shiftStruct');
const userStruct = require('./userStruct');

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
  totalPage: Math.ceil(totalData / limit) || 0,
  currentPage: page || 0,
});

const ScheduleSnapshot = (attendanceSchedule) => ({
  name: attendanceSchedule.scheduleName,
  shifts: attendanceSchedule?.scheduleShifts?.map(shiftStruct.SingleShiftData),
  organizationId: attendanceSchedule.organizationId,
  effectiveStartDate: attendanceSchedule.effectiveStartDate,
  effectiveEndDate: attendanceSchedule.effectiveEndDate,
  isDefault: attendanceSchedule.isDefault,
  gracePeriod: attendanceSchedule.gracePeriod,
  overtimeTolerance: attendanceSchedule.overtimeTolerance,
});

const EnrichedSchedule = ({ schedule, userOrgs }) => ({
  id: schedule._id,
  name: schedule.name,
  shifts: schedule.shifts.map(shiftStruct.ShiftFormatedTime),
  users: userOrgs.map((userOrg) => ({
    userId: userOrg?._id,
    fullname: userOrg?.fullname,
    email: userOrg?.email,
    uniqueUserId: userOrg?.uniqueUserId,
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
const SchedulePreview = (schedule) => ({
  id: schedule._id,
  name: schedule.name,
  shifts: schedule.shifts.map(shiftStruct.ShiftFormatedTime),
  users: schedule.users.map((user) => ({
    userId: user?._id,
    name: user?.fullname,
    email: user?.email,
    uniqueUserId: user?.uniqueUserId,
  })),
  organization: {
    id: schedule.organizationId._id,
    name: schedule.organizationId.name,
    invitationCode: schedule.organizationId.invitationCode,
  },
  effectiveStartDate: schedule.effectiveStartDate,
  effectiveEndDate: schedule.effectiveEndDate,
  formattedStartDate: dayjs(schedule.effectiveStartDate).format('DD MMM YYYY, HH:mm:ss'),
  formattedEndDate: dayjs(schedule.effectiveEndDate).format('DD MMM YYYY, HH:mm:ss'),
  isDefault: schedule.isDefault,
  gracePeriod: schedule.gracePeriod,
  overtimeTolerance: schedule.overtimeTolerance,
  updatedDate: schedule?.updatedDate,
  createdDate: schedule?.createdDate,
});

const ScheduleDeletePreview = (schedule) => ({
  id: schedule._id,
  name: schedule.name,
  shifts: schedule.shifts,
  users: schedule.users,
  organizationId: schedule.organizationId,
  isDefault: schedule.isDefault,
  gracePeriod: schedule.gracePeriod,
  overtimeTolerance: schedule.overtimeTolerance,
  effectiveStartDate: schedule.effectiveStartDate,
  effectiveEndDate: schedule.effectiveEndDate,
  formattedStartDate: dayjs(schedule.effectiveStartDate).format('DD MMM YYYY, HH:mm:ss'),
  formattedEndDate: dayjs(schedule.effectiveEndDate).format('DD MMM YYYY, HH:mm:ss'),
});

const UserSchedule = (schedule) => ({
  id: schedule._id,
  name: schedule.name,
  shifts: schedule.shifts.map(shiftStruct.ShiftFormatedTime),
  users: schedule.users.map(userStruct.UserOrgProfile),
  organizationId: userStruct.Organization(schedule.organizationId),
  isDefault: schedule.isDefault,
  gracePeriod: schedule.gracePeriod,
  overtimeTolerance: schedule.overtimeTolerance,
  effectiveStartDate: schedule.effectiveStartDate,
  effectiveEndDate: schedule.effectiveEndDate,
  formattedStartDate: dayjs(schedule.effectiveStartDate).format('DD MMM YYYY, HH:mm:ss'),
  formattedEndDate: dayjs(schedule.effectiveEndDate).format('DD MMM YYYY, HH:mm:ss'),
});

module.exports = {
  ScheduleData,
  SchedulePagination,
  UpdateScheduleData,
  ScheduleSnapshot,
  SchedulePreview,
  ScheduleDeletePreview,
  EnrichedSchedule,
  UserSchedule,
};
