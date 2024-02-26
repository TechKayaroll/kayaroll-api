const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ResponseError } = require('../helpers/response');
const {
  secondsToDuration, calculateTotalTime, isWeekend,
} = require('../helpers/date');
const { pairInAndOut, attendanceStatusHistory } = require('../helpers/attendance');
const userModel = require('../models');
const uploadGcp = require('../helpers/gcp');
const {
  ATTENDANCE_AUDIT_LOG, ATTENDANCE_STATUS, ATTENDANCE_TYPE, USER_ROLE,
} = require('../utils/constants');
const { isWithinRadius } = require('../helpers/calculation');

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

const createAttendanceLocationSnapshot = async (userId, organizationId, session) => {
  const userOrgLocations = await userModel.UserOrganizationLocation.find({
    userId,
    organizationId,
  })
    .session(session)
    .populate({
      path: 'locationId',
    });
  const locSnapshots = userOrgLocations.map(
    ({ locationId }) => attendanceSettingsStruct.AttendanceSnapshotData(locationId),
  );
  return locSnapshots;
};

const findAttendanceScheduleSnapshots = async (userId, organizationId, session) => {
  const scheduleSnapshots = await userModel.Schedule
    .find({ users: userId, organizationId })
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
  const [attLocationSnapshots, createdScheduleSnapshots] = await Promise.all([
    createAttendanceLocationSnapshot(
      userOrganization.userId,
      userOrganization.organizationId,
      session,
    ),
    findAttendanceScheduleSnapshots(
      userOrganization.userId,
      userOrganization.organizationId,
      session,
    ),
  ]);
  const attScheduleSnapshot = attendanceSettingsStruct
    .AttendanceScheduleSnapshots(createdScheduleSnapshots);
  const statusHistory = attendanceStatusHistory(
    attendanceType,
    req.body.attendanceDate,
    attScheduleSnapshot,
  );
  const attendancePayload = struct.Attendance(
    req,
    attendanceImageUrl,
    attendanceType,
    userOrganization._id,
    attLocationSnapshots,
    attScheduleSnapshot,
    statusHistory,
  );
  const attendance = new attendanceModel.Attendance(attendancePayload);
  const savedAttendance = await attendance.save({ session });
  await logAttendance(
    req.user,
    ATTENDANCE_AUDIT_LOG.CREATE,
    savedAttendance._id,
    session,
  );
  let inRadius = false;
  let inRadiusSnapshots = [];
  let scheduleSnapshots = [];
  if (attLocationSnapshots?.length === 0) {
    inRadius = true;
  } else {
    inRadiusSnapshots = attLocationSnapshots.filter((snapshot) => {
      const { locationLat, locationLong, locationRadius } = snapshot;
      const centerCoordinates = [locationLat, locationLong];
      const otherCoordinates = [savedAttendance?.lat, savedAttendance?.long];
      const withinRad = isWithinRadius(centerCoordinates, otherCoordinates, locationRadius);
      return withinRad;
    });
    inRadius = inRadiusSnapshots.length > 0;
  }
  if (savedAttendance?.attendanceScheduleSnapshots.length > 0) {
    scheduleSnapshots = savedAttendance?.attendanceScheduleSnapshots?.map(
      (schedule) => scheduleStruct.ScheduleSnapshot(schedule),
    );
  }
  return {
    savedAttendance, inRadius, inRadiusSnapshots, scheduleSnapshots, attLocationSnapshots,
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
      { $and: [{ _id: attendanceId, status: ATTENDANCE_STATUS.PENDING }] },
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

const createBulkAttendance = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      employeeIds,
    } = req.body;
    const adminOrganizationId = req.user.organizationId;
    const employeesUserOrg = await Promise.all(
      employeeIds.map((userId) => userModel.UserOrganization
        .findOne({
          userId,
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
            session,
          ),
          findAttendanceScheduleSnapshots(
            userOrgEmployee?.userId,
            userOrgEmployee?.organizationId,
            session,
          ),
        ]);
        const attScheduleSnapshot = attendanceSettingsStruct
          .AttendanceScheduleSnapshots(scheduleSnapshots);
        const statusHistory = attendanceStatusHistory(
          req.body.attendanceType,
          req.body.attendanceDate,
          attScheduleSnapshot,
        );

        const attendancePayload = struct.AdminAttendance(
          req,
          userOrgEmployee,
          req.body,
          attLocationSnapshots,
          statusHistory,
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
        await session.commitTransaction();
        return populatedAttendance;
      });

    const createdAttendances = await Promise.all(createAndLogPromises);
    return createdAttendances;
  } catch (error) {
    await session.abortTransaction();
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  } finally {
    await session.endSession();
  }
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
