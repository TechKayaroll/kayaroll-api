const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const fs = require('fs');
const dayjs = require('dayjs');
const mongoose = require('mongoose');
const { ResponseError } = require('../helpers/response');
const { generateAttendanceReports } = require('../helpers/generator');
const { ATTENDANCE_TYPE } = require('../utils/constants');
const attendanceService = require('../services/attendanceService');
const organizationService = require('../services/organizationService');
const struct = require('../struct/attendanceStruct');
const organizationStruct = require('../struct/organizationStruct');
const userStruct = require('../struct/userStruct');

exports.attendanceCheckIn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const attendanceType = ATTENDANCE_TYPE.IN;
    const attendanceImageUrl = await attendanceService.uploadAttendanceImage(req, attendanceType);
    const {
      inRadius,
      inRadiusSnapshots,
      scheduleSnapshots,
    } = await attendanceService.createAttendance(
      req,
      attendanceImageUrl,
      attendanceType,
      session,
    );

    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        inRadius,
        inRadiusSnapshots,
        scheduleSnapshots,
      },
      code: StatusCodes.OK,
    });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

exports.attendanceCheckOut = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const attendanceType = ATTENDANCE_TYPE.OUT;
    const attendanceImageUrl = await attendanceService.uploadAttendanceImage(req, attendanceType);
    const {
      inRadius,
      inRadiusSnapshots,
      scheduleSnapshots,
    } = await attendanceService.createAttendance(
      req,
      attendanceImageUrl,
      attendanceType,
    );

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        inRadius,
        inRadiusSnapshots,
        scheduleSnapshots,
      },
      code: StatusCodes.OK,
    });
  } catch (e) {
    fs.unlinkSync(req.file.path);
    next(e);
  }
};

exports.attendanceList = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from).startOf('day').toISOString();
    req.query.to = dayjs(req.query.to).endOf('day').toISOString();
    const list = await attendanceService.attandanceList(
      req.query,
      req.user.userId,
      req.user.organizationId,
    );
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
    req.query.from = dayjs(req.query.from).startOf('day').toISOString();
    req.query.to = dayjs(req.query.to).endOf('day').toISOString();
    const attendanceList = await attendanceService.attandanceListAdmin(
      req.query,
      req.user.organizationId,
    );
    const dataList = attendanceList.list.map((eachList) => struct.AttendanceListAdmin(eachList));
    attendanceList.list = dataList;
    attendanceList.pagination = struct.AttendanceListPagination(
      req.query.page,
      req.query.limit,
      attendanceList.pagination,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: attendanceList,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.attendanceApproval = async (req, res, next) => {
  try {
    const validationAttendanceId = await attendanceService.checkExitsAttendanceId(
      req.user.organizationId,
      req.body.attendanceId,
    );
    if (!validationAttendanceId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Attendance ID Invalid');
    }

    const updatedAttendance = await attendanceService.attandanceApproval(
      req.body.attendanceId,
      req.body.status,
      req.user,
    );
    if (updatedAttendance === null) {
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
    const validationAttendanceId = await attendanceService.checkExitsAttendanceId(
      req.user.organizationId,
      req.body.attendanceId,
    );
    if (!validationAttendanceId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Attendance ID Invalid');
    }

    const update = await attendanceService.attendanceUpdate(req, req.user.organizationId);
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

exports.attendanceReport = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from).startOf('day').toISOString();
    req.query.to = dayjs(req.query.to).endOf('day').toISOString();
    const { employeeIds } = req.query;
    const uniqueEmployeeIds = new Set();
    employeeIds.forEach((id) => uniqueEmployeeIds.add(id));

    const employeeListPromises = [];
    uniqueEmployeeIds.forEach((employeeId) => {
      const queryPayload = {
        userId: employeeId,
        from: req.query.from,
        to: req.query.to,
      };
      employeeListPromises.push(attendanceService.attendanceReportListAdmin(
        queryPayload,
        req.user.organizationId,
      ));
    });
    const employeeList = await Promise.all(employeeListPromises);
    const reports = [];
    Array.from(uniqueEmployeeIds).forEach((_, index) => {
      const { list, userOrg } = employeeList[index];
      const summaryReports = attendanceService.attendanceSummaryReports(list, {
        from: req.query.from,
        to: req.query.to,
      });
      reports.push({
        user: userStruct.UserReportProfile(
          userOrg,
        ),
        summaryReports,
      });
    });
    const filename = `AttendanceReport_${dayjs(req.query.from).format('DD-MMM-YYYY')}_${dayjs(req.query.to).format('DD-MMM-YYYY')}.xlsx`;
    const workbook = generateAttendanceReports(reports);
    const buf = await workbook.xlsx.writeBuffer();
    res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buf);
  } catch (e) {
    next(e);
  }
};

exports.attendanceSummaryList = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from).startOf('day').toISOString();
    req.query.to = dayjs(req.query.to).endOf('day').toISOString();
    const { employeeIds } = req.query;
    const uniqueEmployeeIds = new Set();
    employeeIds.forEach((id) => uniqueEmployeeIds.add(id));

    const employeeListPromises = [];
    uniqueEmployeeIds.forEach((employeeId) => {
      const queryPayload = {
        userId: employeeId,
        from: req.query.from,
        to: req.query.to,
      };
      employeeListPromises.push(attendanceService.attendanceReportListAdmin(
        queryPayload,
        req.user.organizationId,
      ));
    });
    const employeeList = await Promise.all(employeeListPromises);
    const reports = [];
    Array.from(uniqueEmployeeIds).forEach((_, index) => {
      const { list, userOrg } = employeeList[index];
      const summaryReports = attendanceService.attendanceSummaryReports(list, {
        from: req.query.from,
        to: req.query.to,
      });
      reports.push({
        user: userStruct.UserReportProfile(
          userOrg,
        ),
        summaryReports,
      });
    });

    // const currentPage = req.query.page || 1;
    // const startSlice = (currentPage - 1) * (req.query.limit);
    // const endSlice = currentPage * (req.query.limit);
    // const paginatedReports = {
    //   attendanceSummary: reports.slice(startSlice, endSlice),
    //   pagination: struct.AttendanceListPagination(currentPage, req.query.limit, reports.length),
    // };

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: reports,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.reportByOrganizationIds = async (req, res, next) => {
  try {
    req.query.from = dayjs(req.query.from).startOf('day').toISOString();
    req.query.to = dayjs(req.query.to).endOf('day').toISOString();

    const { organizationIds } = req.query;
    const uniqueOrganizationIdsSet = new Set(organizationIds);

    const fetchOrganizationData = async (orgId) => {
      const organizationDetail = await organizationService.getOrganizationDetail(orgId);
      const userIds = await organizationService.getEmployeeInOrganization(orgId);
      const list = await Promise.all(
        userIds.map(async (eachUser) => {
          const { list: attendances, userOrg } = await attendanceService.attendanceReportListAdmin(
            {
              userId: eachUser.userId._id,
              from: req.query.from,
              to: req.query.to,
            },
            orgId,
          );

          const summaryReports = attendanceService.attendanceSummaryReports(attendances, {
            from: req.query.from,
            to: req.query.to,
          });

          return {
            user: userStruct.UserReportProfile(userOrg),
            summaryReports,
          };
        }),
      );

      return {
        organizationId: organizationStruct.OrganizationData(organizationDetail),
        list,
      };
    };

    const organizationDataPromises = Array.from(uniqueOrganizationIdsSet)
      .map(fetchOrganizationData);
    const organizationDataArray = await Promise.all(organizationDataPromises);

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: organizationDataArray,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};
exports.attendanceDetailById = async (req, res, next) => {
  try {
    const attendanceId = req.params.id;
    const attendance = await attendanceService.attendanceDetail(attendanceId);
    let data = null;
    if (attendance) {
      data = struct.AttendanceListAdmin(attendance);
    }
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.attendanceAuditLogByAttendanceId = async (req, res, next) => {
  try {
    const attendanceId = req.params.id;
    if (!attendanceId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'missing attendanceId as param');
    }
    const logs = await attendanceService.attendanceAuditLogList(attendanceId);
    const auditLogs = logs.map((eachLog) => struct.AttendanceAuditLog(eachLog));
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: auditLogs,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.createAttendance = async (req, res, next) => {
  try {
    const createdAttendances = await attendanceService.createBulkAttendance(req);
    const dataResponse = createdAttendances.map(
      (attendance) => struct.AttendanceListAdmin(attendance),
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: dataResponse,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.employeeAttendanceDetails = async (req, res, next) => {
  try {
    const { userId, organizationId } = req.user;
    const { list: attendances, userOrg } = await attendanceService.attendanceReportListAdmin(
      {
        userId: new mongoose.Types.ObjectId(userId),
        from: req.query.from,
        to: req.query.to,
      },
      new mongoose.Types.ObjectId(organizationId),
    );

    const summaryReports = attendanceService.attendanceSummaryReports(attendances, {
      from: req.query.from,
      to: req.query.to,
    });

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        user: userStruct.UserReportProfile(userOrg),
        summaryReports,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
