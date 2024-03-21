const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const scheduleService = require('../services/scheduleService');
const locationService = require('../services/locationService');
const scheduleStruct = require('../struct/scheduleStruct');
const locationStruct = require('../struct/locationStruct');
const { ResponseError } = require('../helpers/response');
const Model = require('../models');

exports.createSchedule = async (req, res, next) => {
  if (req.body.effectiveStartDate) {
    req.body.effectiveStartDate = dayjs(req.body.effectiveStartDate).startOf('day').toISOString();
  }
  if (req.body.effectiveEndDate) {
    req.body.effectiveEndDate = dayjs(req.body.effectiveEndDate).endOf('day').toISOString();
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const adminOrganizationId = req.user.organizationId;
    const createdSchedule = await scheduleService.createSchedule(adminOrganizationId, req);
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: createdSchedule,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

exports.deleteSchedules = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { scheduleIds } = req.body;
    const adminScheduleId = req.user.organizationId;
    const { schedulesToDelete } = await scheduleService.deleteSchedules(
      adminScheduleId,
      scheduleIds,
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: schedulesToDelete.map(scheduleStruct.ScheduleDeletePreview),
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
exports.setDefaultScheduleById = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { scheduleId } = req.params;
    const { effectiveStartDate, effectiveEndDate } = req.body;
    const adminOrganizationId = req.user.organizationId;
    const updatedDetaulScheduleById = await scheduleService.setDefaultWorkschedule(
      adminOrganizationId,
      {
        scheduleId,
        effectiveStartDate,
        effectiveEndDate,
      },
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: updatedDetaulScheduleById,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
exports.getScheduleList = async (req, res, next) => {
  try {
    const adminOrganizationId = req.user.organizationId;
    const { list, pagination } = await scheduleService.getScheduleList(
      adminOrganizationId,
      req.query,
    );
    const enrichedSchedules = await scheduleService.enrichedSchedulesUsers(
      list,
      adminOrganizationId,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        list: enrichedSchedules.map((enrichedSchedule) => scheduleStruct
          .EnrichedSchedule(enrichedSchedule)),
        pagination,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateScheduleById = async (req, res, next) => {
  if (req.body.effectiveStartDate) {
    req.body.effectiveStartDate = dayjs(req.body.effectiveStartDate).startOf('day').toISOString();
  }
  if (req.body.effectiveEndDate) {
    req.body.effectiveEndDate = dayjs(req.body.effectiveEndDate).endOf('day').toISOString();
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Please provide param: scheduleId');
    }
    const adminOrganizationId = req.user.organizationId;

    const updatedSchedule = await scheduleService.updateScheduleById(
      adminOrganizationId,
      scheduleId,
      req.body,
      session,
    );
    // const [enrichedSchedule] =
    await scheduleService.enrichedSchedulesUsers(
      [updatedSchedule],
      adminOrganizationId,
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {},
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

exports.getScheduleDetail = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const adminOrganizationId = req.user.organizationId;
    const schedule = await scheduleService.findScheduleById(adminOrganizationId, scheduleId);
    const [enrichedSchedule] = await scheduleService.enrichedSchedulesUsers(
      [schedule],
      adminOrganizationId,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: scheduleStruct.EnrichedSchedule(enrichedSchedule),
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.addGraceAndtolerancePeriod = async (req, res, next) => {
  try {
    const result = await Model.Schedule.updateMany(
      { $or: [{ gracePeriod: { $exists: false } }, { overtimeTolerance: { $exists: false } }] },
      { $set: { gracePeriod: 30, overtimeTolerance: 30 } },
    );

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: result,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.userSchedule = async (req, res, next) => {
  try {
    const { userId, organizationId } = req.user;
    const result = await scheduleService.getScheduleByEmployeeId(
      { organizationId, userId, date: dayjs().format('DD MMM YYYY HH:mm:ss') },
    );
    const userOrgLocation = await locationService.getUserLocationProfile({ organizationId });
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        workLocations: userOrgLocation.map((userOrgLoc) => locationStruct
          .locationDetail(userOrgLoc.locationId)),
        schedule: result ? scheduleStruct.UserSchedule(result) : null,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
