const mongoose = require('mongoose');
const dayjs = require('dayjs');
const {
  secondsToDuration, secondsToHMS, formatDate, calculateTotalTime,
} = require('../helpers/date');

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

const AttendanceDataResult = (val) => ({
  userId: new mongoose.Types.ObjectId(val.userId),
  organizationId: new mongoose.Types.ObjectId(val.organizationId),
  attendanceImage: val.attendanceImage,
  long: val.long,
  lat: val.lat,
  attendanceDate: '',
  attendanceType: val.attendanceType,
  status: val.status,
  originId: '',
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
  const inTime = formatDate(attendanceIn?.attendanceDate);
  const outTime = formatDate(attendanceOut?.attendanceDate);
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
const AttendanceReportsData = (calculatedDatas, totalSeconds) => {
  const eachReports = calculatedDatas.map((eachData) => {
    const {
      inTime,
      outTime,
      attendanceIn,
      attendanceOut,
      duration,
    } = eachData;
    return {
      attendanceIn: {
        time: dayjs(inTime).format('DD MMM YYYY, HH:mm:ss'),
        detail: AttendanceListAdmin(attendanceIn),
      },
      attendanceOut: {
        time: dayjs(outTime).format('DD MMM YYYY, HH:mm:ss'),
        detail: AttendanceListAdmin(attendanceOut),
      },
      duration,
    };
  });
  return {
    result: eachReports,
    totalDuration: secondsToDuration(totalSeconds),
  };
};

module.exports = {
  Attendance,
  AttendanceList,
  AttendanceListPagination,
  AttendanceListAdmin,
  AttendanceDataResult,
  AttendanceReportsData,
  AttendanceReport,
  AttendanceSummaryData,
};
