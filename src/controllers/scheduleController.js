const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const scheduleService = require('../services/scheduleService');

exports.createSchedule = async (req, res, next) => {
  try {
    const adminOrganizationId = req.user.organizationId;
    const createdSchedule = await scheduleService.createSchedule(adminOrganizationId, req);
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
    const adminScheduleId = req.user.organizationId;
    const deletedSchedules = await scheduleService.deleteSchedules(adminScheduleId, scheduleIds);
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
    const adminOrganizationId = req.user.organizationId;
    const updatedDetaulScheduleById = await scheduleService.setDefaultScheduleById(
      adminOrganizationId,
      scheduleId,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: updatedDetaulScheduleById,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
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
