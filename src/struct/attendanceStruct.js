const mongoose = require('mongoose');
const dayjs = require('dayjs');
const {
  secondsToHMS, calculateTotalTime,
} = require('../helpers/date');
const { ATTENDANCE_STATUS, ATTENDANCE_REPORT_STATUS, ATTENDANCE_STATUS_HISTORY } = require('../utils/constants');

const Attendance = (
  req,
  userOrganizationId,
  {
    attendanceImageUrl,
    attendanceType,
    attendanceDate,
    attendanceLocationSnapshots,
    attendanceStatusLocation,
    attendanceScheduleSnapshots,
    attendanceStatusHistory,
    timeDiff,
  },
) => ({
  userId: new mongoose.Types.ObjectId(req.user.userId),
  organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
  userOrganizationId: new mongoose.Types.ObjectId(userOrganizationId),
  attendanceType,
  attendanceImage: attendanceImageUrl,
  attendanceDate,
  lat: req.body.lat,
  long: req.body.long,
  status: ATTENDANCE_STATUS.APPROVED,
  browser: req?.useragent?.browser || '',
  os: req?.useragent?.os || '',
  platform: req?.useragent?.platform || '',
  createdBy: new mongoose.Types.ObjectId(req.user.userId),
  attendanceStatusLocation,
  attendanceLocationSnapshots,
  attendanceScheduleSnapshots,
  attendanceStatusHistory,
  timeDiff: timeDiff || 0,
});

const AttendanceAuditLogData = (attendance, actionLogType, reqUser) => ({
  actionType: actionLogType,
  attendanceId: new mongoose.Types.ObjectId(attendance._id),
  attendanceType: attendance?.attendanceType,
  userOrganizationId: new mongoose.Types.ObjectId(reqUser?.userOrganizationId),
  userFullname: reqUser?.fullname,
  userEmail: reqUser?.email,
  userOrganization: reqUser?.organization,
  userRole: reqUser?.role,
});

const AttendanceAuditLog = (attendanceAuditLog) => ({
  id: attendanceAuditLog._id,
  actionType: attendanceAuditLog.actionType,
  attendanceId: attendanceAuditLog?.attendanceId._id,
  userId: attendanceAuditLog?.userOrganizationId?.userId,
  uniqueUserId: attendanceAuditLog?.userOrganizationId?.uniqueUserId,
  fullname: attendanceAuditLog?.userFullname,
  email: attendanceAuditLog?.userEmail,
  organization: attendanceAuditLog?.userOrganization,
  role: attendanceAuditLog?.userRole,
  createdDate: attendanceAuditLog?.createdDate,
});

const AttendanceLocationSnapshot = (snapshot) => ({
  locationId: snapshot?.locationId,
  locationName: snapshot?.locationName,
  locationLat: snapshot?.locationLat,
  locationLong: snapshot?.locationLong,
  locationPlaceId: snapshot?.locationPlaceId,
  locationAddress: snapshot?.locationAddress,
  locationStatus: snapshot?.locationStatus,
  locationDistance: snapshot?.locationDistance,
});

const AttendanceScheduleSnapshot = (snapshot) => ({
  scheduleId: snapshot?.scheduleId,
  scheduleName: snapshot?.scheduleName,
  scheduleShifts: snapshot?.scheduleShifts?.map((scheduleShift) => ({
    name: scheduleShift?.name,
    day: scheduleShift?.day,
    shifts: scheduleShift?.shifts?.map((eachShift) => ({
      startTime: eachShift.startTime,
      endTime: eachShift.endTime,
    })),
    id: scheduleShift?._id,
  })),
  isDefault: snapshot?.isDefault,
  effectiveStartDate: snapshot?.effectiveStartDate,
  effectiveEndDate: snapshot?.effectiveEndDate,
  gracePeriod: snapshot?.gracePeriod,
  overtimeTolerance: snapshot?.overtimeTolerance,
});

const AttendanceList = (val) => ({
  attendanceId: val._id,
  attendanceType: val.attendanceType,
  attendanceImage: val.attendanceImage,
  attendanceStatusHistory: val?.attendanceStatusHistory,
  attendanceStatusLocation: val?.attendanceStatusLocation,
  timeDiff: val?.timeDiff,
  employeeId: val.userOrganizationId?.uniqueUserId || '-',
  datetime: val.attendanceDate,
  lat: val.lat,
  long: val.long,
  status: val.status,
  createdDate: val.createdDate,
  attendanceLocationSnapshots: val.attendanceLocationSnapshots
    .map(AttendanceLocationSnapshot),
  attendanceScheduleSnapshots: val.attendanceScheduleSnapshots
    .map(AttendanceScheduleSnapshot),
});

const AttendanceListPagination = (page, limit, totalData) => ({
  totalPage: Math.ceil(totalData / limit),
  currentPage: page,
});

const AttendanceListAdmin = (val) => ({
  attendanceId: val._id.toString(),
  attendanceType: val.attendanceType,
  attendanceImage: val.attendanceImage,
  attendanceStatusHistory: val?.attendanceStatusHistory || ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE,
  timeDiff: val?.timeDiff || 0,
  employeeId: val.userOrganizationId?.uniqueUserId || '-',
  employeeName: val.userId?.fullname || 'unknown',
  datetime: val.attendanceDate,
  lat: val.lat,
  long: val.long,
  status: val.status,
  createdDate: val.createdDate,
  attendanceLocationSnapshots: val?.attendanceLocationSnapshots
    .map(AttendanceLocationSnapshot),
  attendanceScheduleSnapshots: val?.attendanceScheduleSnapshots.map(AttendanceScheduleSnapshot),
});

const AttendanceDataResult = (val, req) => ({
  userId: new mongoose.Types.ObjectId(val.userId),
  organizationId: new mongoose.Types.ObjectId(val.organizationId),
  userOrganizationId: new mongoose.Types.ObjectId(val.userOrganizationId),
  attendanceImage: val.attendanceImage,
  long: val.long,
  lat: val.lat,
  attendanceDate: '',
  attendanceType: val.attendanceType,
  status: val.status,
  originId: '',
  browser: req?.useragent?.browser || '',
  os: req?.useragent?.os || '',
  platform: req?.useragent?.platform || '',
  createdBy: new mongoose.Types.ObjectId(req.user.userId),
});

const AttendanceReport = (attendance) => ({
  id: attendance._id.toString(),
  userId: attendance.userId,
  organizationId: attendance.organizationId,
  attendanceImage: attendance.attendanceImage,
  long: attendance.long,
  lat: attendance.lat,
  attendanceDate: attendance.attendanceDate,
  attendanceType: attendance.attendanceType,
  status: attendance.status,
  attendanceStatusHistory: attendance?.attendanceStatusHistory
    || ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE,
  timeDiff: attendance?.timeDiff || 0,
  attendanceLocationSnapshots: attendance?.attendanceLocationSnapshots
    .map(AttendanceLocationSnapshot),
  attendanceScheduleSnapshots: attendance?.attendanceScheduleSnapshots
    .map(AttendanceScheduleSnapshot),
});

const AttendanceSummaryData = (attendanceIn, attendanceOut) => {
  const inTime = attendanceIn?.attendanceDate;
  const outTime = attendanceOut?.attendanceDate;
  const totalTime = calculateTotalTime(attendanceIn, attendanceOut);
  let status = ATTENDANCE_REPORT_STATUS.ABSENT;
  if (attendanceIn && attendanceOut) {
    status = ATTENDANCE_REPORT_STATUS.PRESENT;
  } else if (attendanceIn || attendanceOut) {
    status = ATTENDANCE_REPORT_STATUS.INCOMPLETE;
  }

  const attendance = {
    inTime,
    outTime,
    attendanceIn: attendanceIn ? AttendanceReport(attendanceIn) : null,
    attendanceOut: attendanceOut ? AttendanceReport(attendanceOut) : null,
    duration: secondsToHMS(totalTime),
    status,
  };
  return attendance;
};

const AdminAttendance = (
  req,
  employeeUserOrg,
  requestBody,
  {
    attendanceLocationSnapshots,
    attendanceStatusLocation,
    scheduleSnapshots,
    historyStatus,
  },
) => ({
  userId: new mongoose.Types.ObjectId(employeeUserOrg.userId),
  organizationId: new mongoose.Types.ObjectId(employeeUserOrg.organizationId),
  userOrganizationId: new mongoose.Types.ObjectId(employeeUserOrg._id),
  attendanceType: requestBody.attendanceType,
  attendanceImage: undefined,
  attendanceDate: dayjs(requestBody.datetime).toISOString(),
  lat: undefined,
  long: undefined,
  status: ATTENDANCE_STATUS.APPROVED,
  browser: req?.useragent?.browser || '',
  os: req?.useragent?.os || '',
  platform: req?.useragent?.platform || '',
  createdBy: new mongoose.Types.ObjectId(req.user.userId),
  attendanceStatusLocation,
  attendanceLocationSnapshots,
  scheduleSnapshots,
  attendanceScheduleSnapshots: scheduleSnapshots,
  attendanceStatusHistory: historyStatus?.status,
  timeDiff: historyStatus?.timeDiff || 0,
});

module.exports = {
  Attendance,
  AttendanceList,
  AttendanceListPagination,
  AttendanceListAdmin,
  AttendanceDataResult,
  AttendanceReport,
  AttendanceSummaryData,
  AttendanceAuditLogData,
  AttendanceAuditLog,
  AdminAttendance,
};
