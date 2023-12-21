const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ResponseError } = require('../helpers/response');
const struct = require('../struct/attendanceStruct');
const { secondsToDuration, secondsToHMS } = require('../helpers/date');
const userModel = require('../models');

const attendanceModel = userModel;

exports.attandanceUser = async (param) => {
  const attendance = new attendanceModel.Attendance(param);
  try {
    return await attendance.save();
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attendanceDetail = async (attendanceId) => {
  try {
    const attendance = attendanceModel.Attendance.findById(attendanceId).populate({
      path: 'userId',
      populate: {
        path: 'roleId',
      },
    });
    return attendance;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
exports.attandanceList = async (param, userId, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const whereParam = {};
  const offset = param.page - 1;
  const sortBy = (param.sortBy === 'DESC') ? -1 : 1;
  if (param.attendanceType) {
    whereParam.attendanceType = param.attendanceType;
  }

  if (param.status.length !== 0) {
    whereParam.status = param.status;
  }

  try {
    const list = await attendances.find({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId,
      attendanceDate: { $gte: param.from, $lte: param.to },
    })
      .where(whereParam)
      .sort({ createdDate: sortBy })
      .limit(param.limit)
      .skip(offset * param.limit);

    const pagination = await attendances.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId,
      attendanceDate: { $gte: param.from, $lte: param.to },
    })
      .where(whereParam).exec();
    return { list, pagination };
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attendanceReportListAdmin = async (query, organizationId) => {
  try {
    const attendances = attendanceModel.Attendance;
    const userOrg = await userModel.UserOrganization
      .findOne({ userId: query.userId, organizationId })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      })
      .populate('organizationId');
    const isEmployee = userOrg?.userId?.roleId ? userOrg?.userId?.roleId?.name === 'employee' : false;
    if (!isEmployee) return [];

    const whereParam = {
      attendanceType: ['In', 'Out'],
      status: ['Approved'],
      userId: new mongoose.Types.ObjectId(query.userId),
    };
    const sortBy = 1; // ASC

    const list = await attendances.find({
      organizationId,
      attendanceDate: {
        $gte: query.from,
        $lte: query.to,
      },
    })
      .where(whereParam)
      .sort({ attendanceDate: sortBy });

    return { list, userOrg };
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attendanceReportAdminData = (attendances) => {
  let totalSeconds = 0;
  let currentInEntry = null;
  const data = [];

  attendances.forEach((eachAttendance, index) => {
    const { attendanceType, attendanceDate } = eachAttendance;

    let currentIndex = index;

    if (attendanceType === 'In') {
      let nextIndex = currentIndex + 1;
      while (nextIndex < attendances.length && attendances[nextIndex].attendanceType === 'In') {
        nextIndex += 1;
      }

      currentInEntry = {
        startTime: dayjs(eachAttendance.attendanceDate),
        attendance: eachAttendance,
        endTime: null,
      };
      currentIndex = nextIndex - 1;
    } else if (attendanceType === 'Out' && currentInEntry) {
      currentInEntry.endTime = {
        time: dayjs(attendanceDate),
        attendance: eachAttendance,
      };

      const startTime = {
        time: currentInEntry.startTime,
        attendance: currentInEntry.attendance,
      };
      const endTime = {
        time: currentInEntry.endTime.time,
        attendance: currentInEntry.endTime.attendance,
      };

      const duration = endTime.time.diff(startTime.time, 'second');
      totalSeconds += duration;

      data.push({
        inTime: dayjs(startTime.time).format('MMM, DD YYYY hh:mm:ss'),
        outTime: dayjs(endTime.time).format('MMM, DD YYYY hh:mm:ss'),
        attendanceIn: struct.AttendanceReport(startTime.attendance),
        attendanceOut: struct.AttendanceReport(endTime.attendance),
        duration: secondsToHMS(duration),
      });

      currentInEntry = null; // Reset currentInEntry
    }
  });

  return { totalDuration: secondsToDuration(totalSeconds), data };
};

exports.attandanceListAdmin = async (param, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const whereParam = {};
  const offset = param.page - 1;
  const sortBy = (param.sortBy === 'DESC') ? -1 : 1;
  if (param.attendanceType) {
    whereParam.attendanceType = param.attendanceType;
  }

  if (param.status.length !== 0) {
    whereParam.status = param.status;
  }

  if (param.employeeIds.length !== 0) {
    whereParam.userId = param.employeeIds;
  }
  try {
    const attendanceDateQuery = {
      $gte: dayjs(param.from).toISOString(),
      $lte: dayjs(param.to).toISOString(),
    };
    const list = await attendances.find({
      organizationId,
      attendanceDate: attendanceDateQuery,
    })
      .populate({ path: 'userId' })
      .where(whereParam)
      .sort({ attendanceDate: sortBy })
      .limit(param.limit)
      .skip(offset * param.limit);
    const pagination = await attendances.countDocuments({
      organizationId,
      attendanceDate: attendanceDateQuery,
    })
      .where(whereParam).exec();
    return { list, pagination };
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.checkExitsAttendanceId = async (organizationId, attendanceId) => {
  const attendances = attendanceModel.Attendance;
  try {
    const exists = await attendances.find({
      _id: new mongoose.Types.ObjectId(attendanceId),
      organizationId,
    });
    return exists.length === 1;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attandanceApproval = async (attendanceId, status) => {
  const attendances = attendanceModel.Attendance;
  try {
    return await attendances.findOneAndUpdate({ $and: [{ _id: attendanceId, status: 'Pending' }] }, { status });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attandanceUpdate = async (req, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const opts = { session };
    const dataAttendance = await attendances.findOne({
      $and: [{
        _id: new mongoose.Types.ObjectId(req.attendanceId),
        organizationId,
        status: {
          $in: ['Pending', 'Approved', 'Rejected'],
        },
      }],
    })
      .session(session);
    if (dataAttendance === null) {
      await session.commitTransaction();
      await session.endSession();
      return undefined;
    }

    const dataInsert = await struct.AttendanceDataResult(dataAttendance);
    dataInsert.attendanceDate = req.datetime.toISOString();
    dataInsert.originId = dataAttendance._id;
    dataInsert.status = 'Approved';
    await attendances.create([dataInsert], opts);

    await attendances.findByIdAndUpdate({ _id: dataAttendance._id }, { status: 'Discarded', updatedDate: dayjs(Date.now()).toISOString() }, opts);

    await session.commitTransaction();
    await session.endSession();

    return dataAttendance;
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};
