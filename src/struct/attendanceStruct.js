const mongoose = require('mongoose');
const dayjs = require('dayjs');
const {
  secondsToHMS, calculateTotalTime,
} = require('../helpers/date');
const { ATTENDANCE_STATUS } = require('../utils/constants');

const Attendance = (
  req,
  attendanceImageUrl,
  attendanceType,
  userOrganizationId,
) => ({
  userId: new mongoose.Types.ObjectId(req.user.userId),
  organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
  userOrganizationId: new mongoose.Types.ObjectId(userOrganizationId),
  attendanceType,
  attendanceImage: attendanceImageUrl,
  attendanceDate: dayjs().toISOString(),
  lat: req.body.lat,
  long: req.body.long,
  status: 'Pending',
  browser: req?.useragent?.browser || '',
  os: req?.useragent?.os || '',
  platform: req?.useragent?.platform || '',
  createdBy: new mongoose.Types.ObjectId(req.user.userId),
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

const AttendanceList = (val) => ({
  attendanceId: val._id,
  attendanceType: val.attendanceType,
  attendanceImage: val.attendanceImage,
  employeeId: val.userOrganizationId?.uniqueUserId || '-',
  datetime: val.attendanceDate,
  lat: val.lat,
  long: val.long,
  status: val.status,
  createdDate: val.createdDate,
});

const AttendanceListPagination = (page, limit, totalData) => ({
  totalPage: Math.ceil(totalData / limit),
  currentPage: page,
});

const AttendanceListAdmin = (val) => ({
  attendanceId: val._id.toString(),
  attendanceType: val.attendanceType,
  attendanceImage: val.attendanceImage,
  employeeId: val.userOrganizationId?.uniqueUserId || '-',
  employeeName: val.userId?.fullname || 'unknown',
  datetime: val.attendanceDate,
  lat: val.lat,
  long: val.long,
  status: val.status,
  createdDate: val.createdDate,
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
});

const AttendanceSummaryData = (attendanceIn, attendanceOut) => {
  const inTime = attendanceIn?.attendanceDate;
  const outTime = attendanceOut?.attendanceDate;
  const totalTime = calculateTotalTime(attendanceIn, attendanceOut);
  let status = 'absent';
  if (attendanceIn && attendanceOut) {
    status = 'present';
  } else if (attendanceIn || attendanceOut) {
    status = 'incomplete';
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

const AdminAttendance = (req, employeeUserOrg, requestBody) => ({
  userId: new mongoose.Types.ObjectId(employeeUserOrg.userId),
  organizationId: new mongoose.Types.ObjectId(employeeUserOrg.organizationId),
  userOrganizationId: new mongoose.Types.ObjectId(employeeUserOrg.userOrganizationId),
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
