const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const mongoose = require('mongoose');
const scheduleService = require('../services/scheduleService');

exports.createSchedule = async (req, res, next) => {
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
    session.endSession();
  }
};

exports.deleteSchedules = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { scheduleIds } = req.body;
    const adminScheduleId = req.user.organizationId;
    const deletedSchedules = await scheduleService.deleteSchedules(
      adminScheduleId,
      scheduleIds,
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: deletedSchedules,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
    session.endSession();
  }
};
exports.getScheduleList = async (req, res, next) => {
  try {
    const adminOrganizationId = req.user.organizationId;
    const { list, pagination } = await scheduleService.getScheduleList(
      adminOrganizationId,
      req.query,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        list,
        pagination,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
