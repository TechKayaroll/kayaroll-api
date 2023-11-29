const {StatusCodes, ReasonPhrases} = require('http-status-codes');
const fs = require('fs');
const dayjs = require('dayjs');
const model = require('./model');
const {ResponseError} = require('../../../Helpers/response');
const struct = require('./struct');
const uploadGcp = require('../../../Helpers/gcp');

exports.attendanceCheckIn = async (req, res, next) => {
  try {
    const removeAfter = req.file.mimetype.substring(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
    req.file.modifiedName = `${req.user.userId}_${dayjs(Date.now()).locale('id').format('DDMMYYHHmmss')}.${removeAfter}`;
    req.file.attendanceType = 'In';
    await uploadGcp.UploadFile(req.file);

    const paramReq = struct.Attendance(req);
    paramReq.attendanceType = 'In';
    paramReq.attendanceImage = `${process.env.GCP_URL_PUBLIC}${process.env.GCP_BUCKET_NAME}/${process.env.GCP_FOLDER_ATTENDANCE_IN}/${req.file.modifiedName}`;

    await model.attandanceUser(paramReq);
    fs.unlinkSync(req.file.path);
    res.status(StatusCodes.OK).json({message: ReasonPhrases.OK, data: {}, code: StatusCodes.OK});
  } catch (e) {
    fs.unlinkSync(req.file.path);
    next(e);
  }
};

exports.attendanceCheckOut = async (req, res, next) => {
  try {
    const removeString = req.file.mimetype.substring(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
    req.file.modifiedName = `${req.user.userId}_${dayjs(Date.now()).locale('id').format('DDMMYYHHmmss')}.${removeString}`;
    req.file.attendanceType = 'Out';
    await uploadGcp.UploadFile(req.file);

    const paramReqOut = struct.Attendance(req);
    paramReqOut.attendanceType = 'Out';
    paramReqOut.attendanceImage = `${process.env.GCP_URL_PUBLIC}${process.env.GCP_BUCKET_NAME}/${process.env.GCP_FOLDER_ATTENDANCE_OUT}/${req.file.modifiedName}`;

    await model.attandanceUser(paramReqOut);
    fs.unlinkSync(req.file.path);
    res.status(StatusCodes.OK).json({message: ReasonPhrases.OK, data: {}, code: StatusCodes.OK});
  } catch (e) {
    fs.unlinkSync(req.file.path);
    next(e);
  }
};

exports.attendanceList = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from, 'YYYY-MM-DD').startOf('day').toISOString();
    req.query.to = dayjs(req.query.to, 'YYYY-MM-DD').endOf('day').toISOString();
    const list = await model.attandanceList(req.query, req.user.userId, req.user.organizationId);
    const dataList = list.list.map((eachList) => struct.AttendanceList(eachList));

    list.list = dataList;
    list.pagination = struct.AttendanceListPagination(
      req.query.page,
      req.query.limit,
      list.pagination,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: list,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.attendanceListAdmin = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from, 'YYYY-MM-DD').startOf('day').toISOString();
    req.query.to = dayjs(req.query.to, 'YYYY-MM-DD').endOf('day').toISOString();
    const list = await model.attandanceListAdmin(req.query, req.user.organizationId);
    const dataList = list.list.map((eachList) => struct.AttendanceListAdmin(eachList));

    list.list = dataList;
    list.pagination = struct.AttendanceListPagination(
      req.query.page,
      req.query.limit,
      list.pagination,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: list,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.attendanceApproval = async (req, res, next) => {
  try {
    const validationAttendanceId = await model.checkExitsAttendanceId(
      req.user.organizationId,
      req.body.attendanceId,
    );
    if (!validationAttendanceId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Attendance ID Invalid');
    }

    const update = await model.attandanceApproval(req.body.attendanceId, req.body.status);
    if (update === null) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'The final status is not Pending, so it cannot to be changed');
    }

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: ReasonPhrases.OK,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.attendanceUpdate = async (req, res, next) => {
  try {
    const validationAttendanceId = await model.checkExitsAttendanceId(
      req.user.organizationId,
      req.body.attendanceId,
    );
    if (!validationAttendanceId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Attendance ID Invalid');
    }

    const update = await model.attandanceUpdate(req.body, req.user.organizationId);
    if (update === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'The final status is not in [Pending, Approved, Rejected] so it cannot to be changes');
    }

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {},
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};
