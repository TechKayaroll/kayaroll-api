const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { default: mongoose } = require('mongoose');

const locationServices = require('../services/locationService');
const organizationService = require('../services/organizationService');

const struct = require('../struct/locationStruct');
const userStruct = require('../struct/userStruct');

const createLocationProfile = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { employeeIds } = req.body;
    const adminOrganizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const newLocationProfile = await locationServices.createLocationProfile(
      req.user.organizationId,
      req.body,
      session,
    );
    const associateUserOrgWithLocationPromises = employeeIds
      .map((userId) => organizationService.associateEmployeeWithLocation({
        userId,
        organizationId: adminOrganizationId,
        locationId: newLocationProfile._id,
      }, session));

    const userOrgLocations = await Promise.all(associateUserOrgWithLocationPromises);
    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        location: struct.locationData(newLocationProfile),
        users: userOrgLocations.map(userStruct.UserOrganizationLocation),
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

const getLocationProfile = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const data = await locationServices.getLocationProfileList(organizationId, req.query);
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
    const { deletedLocations } = await locationServices.removeBulkLocationProfile(
      organizationId,
      locationIds,
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        deletedLocationCount: deletedLocations.length,
        deletedLocationIds: deletedLocations.map((location) => location._id),
      },
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
  const session = await mongoose.startSession();
  try {
    const { organizationId } = req.user;
    session.startTransaction();
    const { locationId, employeeIds, ...updateLocationPayload } = req.body;
    const updatedLocationProfile = await locationServices.updateLocation(
      locationId,
      updateLocationPayload,
      session,
    );
    await locationServices.deleteUserOrgnizationLocations(
      updatedLocationProfile.organizationId,
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
        location: struct.locationOrganizationData(updatedLocationProfile),
        users: userOrgLocations.map(userStruct.UserOrganizationLocation),
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

const queryLocationByName = async (req, res, next) => {
  try {
    const {
      name,
    } = req.query;
    const locations = await locationServices.searchLocationByName(name);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        locations,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

const searchLocationByCoordinateOrPlaceId = async (req, res, next) => {
  try {
    const {
      lat, long, placeId,
    } = req.query;
    const locations = await locationServices.searchLocation({ lat, long }, placeId);

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        locations,
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
  removeLocationProfiles,
  updateLocationProfile,
  queryLocationByName,
  searchLocationByCoordinateOrPlaceId,
};
