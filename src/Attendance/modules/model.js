const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ResponseError } = require('../../../Helpers/response');
const attendanceModel = require('./mapping');
const struct = require('./struct');

exports.attandanceUser = async (param) => {
  const attendance = new attendanceModel.Attendance(param);
  try {
    return await attendance.save();
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

exports.attandanceList = async (param, userId, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const whereParam = {};
  const offset = param.page - 1;
  const sortBy = (param.sortBy === 'DESC') ? -1 : 1;
  if (param.attendanceType) {
    const attendanceParam = 'attendanceType';
    const parts = attendanceParam.split(':');
    whereParam[parts[0]] = param.attendanceType;
  }

  if (param.status.length !== 0) {
    const statusParam = 'status';
    const pastsStatus = statusParam.split(':');
    whereParam[pastsStatus[0]] = param.status;
  }

  if (param.attendanceType.length !== 0) {
    const statusParam = 'attendanceType';
    const partsStatus = statusParam.split(':');
    whereParam[partsStatus[0]] = param.attendanceType;
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

exports.attandanceListAdmin = async (param, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const whereParam = {};
  const offset = param.page - 1;
  const sortBy = (param.sortBy === 'DESC') ? -1 : 1;
  if (param.attendanceType) {
    const attendanceParam = 'attendanceType';
    const parts = attendanceParam.split(':');
    whereParam[parts[0]] = param.attendanceType;
  }

  if (param.attendanceType.length !== 0) {
    const statusParam = 'attendanceType';
    const partsStatus = statusParam.split(':');
    whereParam[partsStatus[0]] = param.attendanceType;
  }

  if (param.status.length !== 0) {
    const statusParam = 'status';
    const partsStatus = statusParam.split(':');
    whereParam[partsStatus[0]] = param.status;
  }

  if (param.employeeIds.length !== 0) {
    const employeeIdParam = 'userId';
    const partsEmployee = employeeIdParam.split(':');
    whereParam[partsEmployee[0]] = param.employeeIds;
  }

  try {
    const list = await attendances.find({
      organizationId,
      attendanceDate: {
        $gte: param.from,
        $lte: param.to,
      },
    })
      .populate({ path: 'userId' })
      .where(whereParam)
      .sort({ attendanceDate: sortBy })
      .limit(param.limit)
      .skip(offset * param.limit);

    const pagination = await attendances.countDocuments({
      organizationId,
      attendanceDate: {
        $gte: param.from,
        $lte: param.to,
      },
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
