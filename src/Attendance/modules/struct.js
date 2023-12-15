const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { secondsToDuration } = require('../../../Helpers/date');

const Attendance = (req) => ({
  userId: new mongoose.Types.ObjectId(req.user.userId),
  organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
  attendanceImage: '',
  lat: req.body.lat,
  long: req.body.long,
  attendanceDate: dayjs(Date.now()).toISOString(),
  attendanceType: '',
  status: 'Pending',
  browser: req?.useragent?.browser || '',
  os: req?.useragent?.os || '',
  platform: req?.useragent?.platform || '',
});

const AttendanceList = (val) => ({
  attendanceId: val._id,
  attendanceType: val.attendanceType,
  attendanceImage: val.attendanceImage,
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
  employeeId: val.userId?._id || '-',
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
  userId: attendance.userId,
  organizationId: attendance.organizationId,
  attendanceImage: attendance.attendanceImage,
  long: attendance.long,
  lat: attendance.lat,
  attendanceDate: attendance.attendanceDate,
  attendanceType: attendance.attendanceType,
  status: attendance.status,
});

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
};
