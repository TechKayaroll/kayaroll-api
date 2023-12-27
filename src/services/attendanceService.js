const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ResponseError } = require('../helpers/response');
const struct = require('../struct/attendanceStruct');
const {
  secondsToDuration, secondsToHMS, isWeekend, calculateTotalTime,
} = require('../helpers/date');
const { pairInAndOut } = require('../helpers/attendance');
const userModel = require('../models');
const uploadGcp = require('../helpers/gcp');

const attendanceModel = userModel;

exports.attandanceUser = async (param) => {
  const attendance = new attendanceModel.Attendance(param);
  try {
    return await attendance.save();
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

// attendanceType: In | Out
exports.uploadAttendanceImage = async (req, attendanceType) => {
  try {
    const removeAfter = req.file.mimetype.substring(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
    req.file.modifiedName = `${req.user.userId}_${dayjs(Date.now()).locale('id').format('DDMMYYHHmmss')}.${removeAfter}`;
    req.file.attendanceType = attendanceType;

    let imageUrl = '';
    const imageBasePath = `${process.env.GCP_URL_PUBLIC}${process.env.GCP_BUCKET_NAME}`;
    if (attendanceType === 'In') {
      imageUrl = `${imageBasePath}/${process.env.GCP_FOLDER_ATTENDANCE_IN}/${req.file.modifiedName}`;
    } else if (attendanceType === 'Out') {
      imageUrl = `${imageBasePath}/${process.env.GCP_FOLDER_ATTENDANCE_OUT}/${req.file.modifiedName}`;
    } else {
      throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid Attendance Type when uploading attendance image');
    }
    await uploadGcp.UploadFile(req.file);
    fs.unlinkSync(req.file.path);
    return imageUrl;
  } catch (error) {
    fs.unlinkSync(req.file.path);
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
exports.createAttendance = async (req, attendanceImageUrl, attendanceType) => {
  try {
    const userOrganization = await userModel.UserOrganization.findOne({
      organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });
    if (!userOrganization) throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'UserOrganization is not exist!');

    const attendancePayload = struct.Attendance(
      req,
      attendanceImageUrl,
      attendanceType,
      userOrganization._id,
    );
    const attendance = new attendanceModel.Attendance(attendancePayload);
    const savedAttendance = await attendance.save();
    return savedAttendance;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
exports.attendanceDetail = async (attendanceId) => {
  try {
    const attendance = attendanceModel.Attendance.findById(attendanceId)
      .populate({ path: 'userOrganizationId' })
      .populate({
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
      .populate({ path: 'userOrganizationId' })
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
  const groupedAttendances = attendances.reduce((acc, attendance) => {
    const date = dayjs(attendance.attendanceDate).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(attendance);
    return acc;
  }, {});

  let totalDuration = 0;
  const result = Object.keys(groupedAttendances).map((date) => {
    const dayAttendances = groupedAttendances[date];
    // Find the earliest In and latest Out attendance for each day
    const inAttendance = dayAttendances.find(
      (att) => att.attendanceType === 'In',
    );
    const outAttendance = dayAttendances.reduce((latestOut, att) => {
      if (
        att.attendanceType === 'Out'
        && (!latestOut
          || dayjs(att.attendanceDate).isAfter(dayjs(latestOut.attendanceDate)))
      ) {
        return att;
      }
      return latestOut;
    }, null);
    // Format In and Out times using dayjs
    const inTime = inAttendance
      ? dayjs(inAttendance.attendanceDate).format('DD MMM YYYY, HH:mm:ss')
      : '';
    const outTime = outAttendance
      ? dayjs(outAttendance.attendanceDate).format('DD MMM YYYY, HH:mm:ss')
      : '';

    // Calculate totalTime in seconds
    const totalTime = inAttendance && outAttendance
      ? dayjs(outAttendance.attendanceDate).diff(
        dayjs(inAttendance.attendanceDate),
        'second',
      )
      : 0;
    totalDuration += totalTime;
    return {
      inTime,
      outTime,
      attendanceIn: inAttendance ? struct.AttendanceReport(inAttendance) : null,
      attendanceOut: outAttendance ? struct.AttendanceReport(outAttendance) : null,
      duration: secondsToHMS(totalTime),
    };
  });

  return { totalDuration: secondsToDuration(totalDuration), data: result };
};

exports.attendanceSummaryList = (attendances, dateRange) => {
  const groupedAttFormat = 'dddd, DD MMM YYYY';
  const groupedAttendances = attendances.reduce((acc, attendance) => {
    const date = dayjs(attendance.attendanceDate).format(groupedAttFormat);
    acc[date] = acc[date] || [];
    acc[date].push(attendance);
    return acc;
  }, {});

  let totalDuration = 0;
  const reports = [];

  const fromDate = dayjs(dateRange.from);
  const toDate = dayjs(dateRange.to);
  for (let currDate = fromDate; currDate.isBefore(toDate); currDate = currDate.add(1, 'days')) {
    if (!isWeekend(currDate)) {
      const currentDate = currDate.format(groupedAttFormat);
      const dayAttendances = groupedAttendances[currentDate] || [];
      const pairedAttendances = pairInAndOut(dayAttendances);
      if (pairedAttendances.length === 0) {
        reports.push({
          date: currentDate,
          attendanceLog: struct.AttendanceSummaryData(null, null),
        });
      } else {
        for (let i = 0; i < pairedAttendances.length; i += 1) {
          const pairedAttendance = pairedAttendances[i];
          const { attendanceIn, attendanceOut } = pairedAttendance;
          const totalTime = calculateTotalTime(attendanceIn, attendanceOut);
          totalDuration += totalTime;
          const attendance = struct.AttendanceSummaryData(attendanceIn, attendanceOut);
          reports.push({
            date: currentDate,
            attendanceLog: attendance,
          });
        }
      }
    }
  }

  const summaryReports = {
    totalDuration: secondsToDuration(totalDuration),
    data: reports,
  };

  return summaryReports;
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
      .populate({ path: 'userOrganizationId' })
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
