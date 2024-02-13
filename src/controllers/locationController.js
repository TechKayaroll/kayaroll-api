const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { default: mongoose } = require('mongoose');

const locationServices = require('../services/locationService');
const organizationService = require('../services/organizationService');

const createLocationProfile = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const data = await locationServices.createLocationProfile(
      req.user.organizationId,
      req.body,
      session,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const getLocationProfile = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const data = await locationServices.getLocationProfileList(organizationId);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

const getUserLocationProfile = async (req, res, next) => {
  try {
    const { userId, organizationId } = req.user;
    const data = await locationServices.getUserLocationProfile(userId, organizationId);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

const removeLocationProfiles = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { organizationId } = req.user;
    const { locationIds } = req.body;
    const data = await locationServices.removeBulkLocationProfile(
      organizationId,
      locationIds,
      session,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const updateLocationProfile = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const session = await mongoose.startSession();
    session.startTransaction();
    const { locationId, employeeIds, ...updateLocationPayload } = req.body;
    const updatedLocationProfile = await locationServices.updateLocation(
      locationId,
      updateLocationPayload,
      session,
    );
    await locationServices.deleteUserOrgnizationLocations(
      organizationId,
      updatedLocationProfile._id,
      session,
    );
    const associateUserOrgWithLocationPromises = employeeIds
      .map((userId) => organizationService.associateEmployeeWithLocation({
        userId,
        organizationId,
        locationId: updatedLocationProfile._id,
      }, session));
    const userOrgLocations = await Promise.all(associateUserOrgWithLocationPromises);
    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        location: updatedLocationProfile,
        users: userOrgLocations,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createLocationProfile,
  getLocationProfile,
  getUserLocationProfile,
  removeLocationProfiles,
  updateLocationProfile,
};
