const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const scheduleService = require('../services/scheduleService');

exports.createSchedule = async (req, res, next) => {
  try {
    const adminOrganizationId = req.user.organizationId;
    const createdSchedule = scheduleService.createSchedule(adminOrganizationId, req);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: createdSchedule,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedules = async (req, res, next) => {
  try {
    const { scheduleIds } = req.body;
    const deletedSchedules = scheduleService.deleteSchedules(scheduleIds);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: deletedSchedules,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
exports.setDefaultScheduleById = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: req.params,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
exports.getScheduleList = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: req.query,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
