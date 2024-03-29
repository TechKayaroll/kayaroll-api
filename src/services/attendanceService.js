const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ResponseError } = require('../helpers/response');
const {
  secondsToDuration, calculateTotalTime, isWeekend,
} = require('../helpers/date');
const { pairInAndOut, attendanceStatusSchedule, attendanceLocationStatus } = require('../helpers/attendance');
const userModel = require('../models');
const uploadGcp = require('../helpers/gcp');
const {
  ATTENDANCE_AUDIT_LOG, ATTENDANCE_STATUS, ATTENDANCE_TYPE, USER_ROLE, ATTENDANCE_LOCATION_STATUS,
} = require('../utils/constants');
require('../helpers/calculation');

const struct = require('../struct/attendanceStruct');
const scheduleStruct = require('../struct/scheduleStruct');
const attendanceSettingsStruct = require('../struct/attendanceSettingsSnapshot');

const attendanceModel = userModel;
const logAttendance = async (reqUser, actionLogType, attendanceId, session) => {
  try {
    const populatedAttendance = await userModel.Attendance.findById(attendanceId)
      .populate({ path: 'userOrganizationId' })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
        },
      })
      .populate({ path: 'organizationId' });
    const isValidActionType = Object.values(ATTENDANCE_AUDIT_LOG).includes(actionLogType);
    if (!populatedAttendance || !isValidActionType) return null;
    const attendanceAuditLogData = struct.AttendanceAuditLogData(
      populatedAttendance,
      actionLogType,
      reqUser,
    );
    const attendanceLog = new attendanceModel.AttendanceAuditLog(attendanceAuditLogData);
    const loggedAttendance = await attendanceLog.save({ session });
    return loggedAttendance;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// attendanceType: In | Out
const uploadAttendanceImage = async (req, attendanceType) => {
  try {
    const removeAfter = req.file.mimetype.substring(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
    req.file.modifiedName = `${req.user.userId}_${dayjs(Date.now()).locale('id').format('DDMMYYHHmmss')}.${removeAfter}`;
    req.file.attendanceType = attendanceType;

    let imageUrl = '';
    const imageBasePath = `${process.env.GCP_URL_PUBLIC}${process.env.GCP_BUCKET_NAME}`;
    if (attendanceType === ATTENDANCE_TYPE.IN) {
      imageUrl = `${imageBasePath}/${process.env.GCP_FOLDER_ATTENDANCE_IN}/${req.file.modifiedName}`;
    } else if (attendanceType === ATTENDANCE_TYPE.OUT) {
      imageUrl = `${imageBasePath}/${process.env.GCP_FOLDER_ATTENDANCE_OUT}/${req.file.modifiedName}`;
    } else {
      throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Invalid Attendance Type when uploading attendance image');
    }
    await uploadGcp.UploadFile(req.file);
    fs.unlink(req.file.path, (err) => {
      if (err) {
        throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, err);
      }
    });

    return imageUrl;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const createAttendanceLocationSnapshot = async (userId, organizationId, coordinate, session) => {
  const userOrgLocations = await userModel.UserOrganizationLocation.find({
    userId,
    organizationId,
  })
    .session(session)
    .populate({
      path: 'locationId',
    });

  const statusCount = new Map();
  let finalLocationStatus = ATTENDANCE_LOCATION_STATUS.NO_LOCATION;
  const locSnapshots = userOrgLocations.map(
    ({ locationId }) => {
      const snapshot = attendanceSettingsStruct.AttendanceSnapshotData(locationId);
      const { status, distance } = attendanceLocationStatus(snapshot, coordinate);
      const currStatusCount = statusCount.get(status);
      if (!statusCount.has(status)) {
        statusCount.set(status, 1);
      } else {
        statusCount.set(status, currStatusCount + 1);
      }
      snapshot.locationStatus = status;
      snapshot.locationDistance = distance;
      return snapshot;
    },
  );
  if (statusCount.get(ATTENDANCE_LOCATION_STATUS.INSIDE_RADIUS) > 0) {
    finalLocationStatus = ATTENDANCE_LOCATION_STATUS.INSIDE_RADIUS;
  } else if (statusCount.get(ATTENDANCE_LOCATION_STATUS.OUTSIDE_RADIUS) > 0) {
    finalLocationStatus = ATTENDANCE_LOCATION_STATUS.OUTSIDE_RADIUS;
  }

  return { snapshot: locSnapshots, locationStatus: finalLocationStatus };
};

const findAttendanceScheduleSnapshots = async (userId, organizationId, attendanceDate, session) => {
  const scheduleSnapshots = await userModel.Schedule
    .find({
      users: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      effectiveStartDate: { $lte: attendanceDate },
      effectiveEndDate: { $gte: attendanceDate },
    })
    .populate({ path: 'users' })
    .populate({ path: 'shifts' })
    .populate({ path: 'organizationId' })
    .session(session);
  return scheduleSnapshots;
};
const createAttendance = async (req, attendanceImageUrl, attendanceType, session) => {
  const userOrgQuery = {
    organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
    userId: new mongoose.Types.ObjectId(req.user.userId),
  };
  const userOrganization = await userModel.UserOrganization.findOne(userOrgQuery).session(session);
  if (!userOrganization) throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'UserOrganization is not exist!');
  const attendanceDate = dayjs().toISOString();
  const [attLocationSnapshots, createdScheduleSnapshots] = await Promise.all([
    createAttendanceLocationSnapshot(
      userOrganization.userId,
      userOrganization.organizationId,
      { lat: req.body.lat, long: req.body.long },
      session,
    ),
    findAttendanceScheduleSnapshots(
      userOrganization.userId,
      userOrganization.organizationId,
      attendanceDate,
      session,
    ),
  ]);
  const attScheduleSnapshot = attendanceSettingsStruct
    .AttendanceScheduleSnapshots(createdScheduleSnapshots);
  const statusHistory = attendanceStatusSchedule(
    attendanceType,
    attendanceDate,
    attScheduleSnapshot,
  );

  const attendancePayload = struct.Attendance(
    req,
    userOrganization._id,
    {
      attendanceImageUrl,
      attendanceType,
      attendanceDate,
      attendanceLocationSnapshots: attLocationSnapshots.snapshot,
      attendanceStatusLocation: attLocationSnapshots.locationStatus,
      attendanceScheduleSnapshots: attScheduleSnapshot,
      attendanceStatusSchedule: statusHistory.status,
      timeDiff: statusHistory.timeDiff,
    },
  );
  const attendance = new attendanceModel.Attendance(attendancePayload);
  const savedAttendance = await attendance.save({ session });
  await logAttendance(
    req.user,
    ATTENDANCE_AUDIT_LOG.CREATE,
    savedAttendance._id,
    session,
  );
  let scheduleSnapshots = [];
  if (savedAttendance?.attendanceScheduleSnapshots.length > 0) {
    scheduleSnapshots = savedAttendance?.attendanceScheduleSnapshots?.map(
      (schedule) => scheduleStruct.ScheduleSnapshot(schedule),
    );
  }
  return {
    savedAttendance, scheduleSnapshots, attLocationSnapshots,
  };
};
const attendanceDetail = async (attendanceId) => {
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
const attandanceList = async (param, userId, organizationId) => {
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
      .sort({ attendanceDate: sortBy })
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

const attendanceReportListAdmin = async (query, organizationId) => {
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
      attendanceType: [ATTENDANCE_TYPE.IN, ATTENDANCE_TYPE.OUT],
      status: [ATTENDANCE_STATUS.APPROVED],
    };
    const sortBy = 1; // ASC

    const list = await attendances.find({
      userId: new mongoose.Types.ObjectId(query.userId),
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

const attendanceSummaryReports = (attendances, dateRange) => {
  const groupedAttFormat = 'MMM, DD YYYY';
  const groupedAttendances = (attendances || []).reduce((acc, attendance) => {
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
    const currentDate = currDate.format(groupedAttFormat);
    const dayAttendances = groupedAttendances[currentDate] || [];
    const pairedAttendances = pairInAndOut(dayAttendances);
    if (pairedAttendances.length === 0 && !isWeekend(currDate)) {
      reports.push({
        dateISOString: currDate.toISOString(),
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
          dateISOString: currDate.toISOString(),
          date: currentDate,
          attendanceLog: attendance,
        });
      }
    }
  }

  const summaryReports = {
    totalDuration: secondsToDuration(totalDuration),
    data: reports,
  };

  return summaryReports;
};

const attandanceListAdmin = async (param, organizationId) => {
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

const checkExitsAttendanceId = async (organizationId, attendanceId) => {
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

const attandanceApproval = async (attendanceId, status, reqUser) => {
  const attendances = attendanceModel.Attendance;
  try {
    const updatedAttendance = await attendances.findOneAndUpdate(
      { $and: [{ _id: attendanceId }] },
      { status },
      { new: true },
    );
    const auditLogType = status === ATTENDANCE_STATUS.APPROVED
      ? ATTENDANCE_AUDIT_LOG.APPROVE
      : ATTENDANCE_AUDIT_LOG.REJECT;
    await logAttendance(reqUser, auditLogType, updatedAttendance._id);
    return updatedAttendance;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const attendanceUpdate = async (req, organizationId) => {
  const attendances = attendanceModel.Attendance;
  const session = await mongoose.startSession();

  let createdAttendance;
  let discardedAttendance;

  try {
    session.startTransaction();
    const opts = { session };
    const attendanceToBeDiscarded = await attendances.findOne({
      $and: [{
        _id: new mongoose.Types.ObjectId(req.body.attendanceId),
        organizationId,
        status: {
          $in: ['Pending', 'Approved', 'Rejected'],
        },
      }],
    }).session(session);

    if (attendanceToBeDiscarded === null) {
      await session.commitTransaction();
      await session.endSession();
      return createdAttendance;
    }
    const dataInsert = struct.AttendanceDataResult(attendanceToBeDiscarded, req);
    dataInsert.attendanceDate = req.body.datetime.toISOString();
    dataInsert.originId = attendanceToBeDiscarded._id;
    dataInsert.status = 'Approved';

    [createdAttendance] = await attendances.create([dataInsert], opts);
    discardedAttendance = await attendances.findOneAndUpdate(
      { _id: attendanceToBeDiscarded._id },
      { $set: { status: 'Discarded', updatedDate: dayjs(Date.now()).toISOString() } },
      { new: true, ...opts },
    );

    await Promise.all([
      logAttendance(req.user, ATTENDANCE_AUDIT_LOG.CREATE, createdAttendance._id, session),
      logAttendance(req.user, ATTENDANCE_AUDIT_LOG.APPROVE, createdAttendance._id, session),
      logAttendance(req.user, ATTENDANCE_AUDIT_LOG.EDIT, discardedAttendance._id, session),
    ]);
    await session.commitTransaction();

    return createdAttendance;
  } catch (e) {
    await session.abortTransaction();
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  } finally {
    await session.endSession();
  }
};

const attendanceAuditLogList = async (attendanceId) => {
  try {
    const attendanceAuditLog = await attendanceModel.AttendanceAuditLog.find({
      attendanceId,
    })
      .populate('userOrganizationId')
      .populate('attendanceId');
    return attendanceAuditLog;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const createBulkAttendance = async (req, session) => {
  const {
    employeeIds,
  } = req.body;
  const adminOrganizationId = req.user.organizationId;
  const employeesUserOrg = await Promise.all(
    employeeIds.map((userId) => userModel.UserOrganization
      .findOne({
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: adminOrganizationId,
      })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
        },
      })),
  );

  const filteredUserOrg = employeesUserOrg
    .filter((userOrgEmployee) => {
      const isAdmin = userOrgEmployee?.userId?.roleId?.name === USER_ROLE.ADMIN;
      return (userOrgEmployee && !isAdmin);
    });
  const createAndLogPromises = filteredUserOrg
    .map(async (userOrgEmployee) => {
      const [attLocationSnapshots, scheduleSnapshots] = await Promise.all([
        createAttendanceLocationSnapshot(
          userOrgEmployee?.userId,
          adminOrganizationId,
          null,
          session,
        ),
        findAttendanceScheduleSnapshots(
          userOrgEmployee?.userId,
          userOrgEmployee?.organizationId,
          req.body.datetime,
          session,
        ),
      ]);
      const attScheduleSnapshots = attendanceSettingsStruct
        .AttendanceScheduleSnapshots(scheduleSnapshots);
      const statusHistory = attendanceStatusSchedule(
        req.body.attendanceType,
        req.body.datetime,
        attScheduleSnapshots,
      );
      const attendancePayload = struct.AdminAttendance(
        req,
        userOrgEmployee,
        req.body,
        {
          attendanceLocationSnapshots: attLocationSnapshots.snapshot,
          attendanceStatusLocation: attLocationSnapshots.locationStatus,
          scheduleSnapshots: attScheduleSnapshots,
          historyStatus: statusHistory,
        },
      );
      const createdAttendance = await new userModel.Attendance(attendancePayload)
        .save({ session });
      const populatedAttendance = await userModel.Attendance.findById(createdAttendance._id)
        .session(session)
        .populate({ path: 'userOrganizationId' })
        .populate({
          path: 'userId',
          populate: {
            path: 'roleId',
          },
        });
      await Promise.all([
        logAttendance(req.user, ATTENDANCE_AUDIT_LOG.CREATE, createdAttendance._id),
        logAttendance(req.user, ATTENDANCE_AUDIT_LOG.APPROVE, createdAttendance._id),
      ]);
      return populatedAttendance;
    });

  const createdAttendances = await Promise.all(createAndLogPromises);
  return createdAttendances;
};

module.exports = {
  logAttendance,
  uploadAttendanceImage,
  createAttendance,
  attendanceDetail,
  attandanceList,
  attendanceReportListAdmin,
  attendanceSummaryReports,
  attandanceListAdmin,
  checkExitsAttendanceId,
  attandanceApproval,
  attendanceUpdate,
  attendanceAuditLogList,
  createBulkAttendance,
  findAttendanceScheduleSnapshots,
};
