const { default: mongoose, model } = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Model = require('../models');
const struct = require('../struct/locationStruct');
const organizationService = require('./organizationService');
const userService = require('./userService');
const { USER_ROLE } = require('../utils/constants');
const { ResponseError } = require('../helpers/response');

const createLocationProfile = async (organizationId, reqBody, session) => {
  const { employeeIds, ...locationPayload } = reqBody;
  const adminOrganizationId = new mongoose.Types.ObjectId(organizationId);
  const location = struct.locationData(locationPayload, adminOrganizationId);
  const locationExist = await Model.Location.findOne({
    name: location.name,
    organizationId: location.organizationId,
  });
  if (locationExist) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Location with name: "${location.name}" already exist!`,
    );
  }
  const newLocationProfile = new Model.Location(location);
  newLocationProfile.save({ session });

  const associateUserOrgWithLocationPromises = employeeIds
    .map((userId) => organizationService.associateEmployeeWithLocation({
      userId,
      organizationId: adminOrganizationId,
      locationId: newLocationProfile._id,
    }, session));

  const userOrgLocations = await Promise.all(associateUserOrgWithLocationPromises);
  await session.commitTransaction();
  return {
    location: newLocationProfile,
    users: userOrgLocations,
  };
};

const getUserLocationProfile = async (userId) => {

};

const getLocationProfileList = async (orgId) => {
  const orgLocation = await Model.Location
    .find({ organizationId: orgId })
    .populate({ path: 'organizationId' });

  const promisesUserByLocation = orgLocation.map((eachLocation) => {
    const { _id, organizationId } = eachLocation;
    return Model.UserOrganizationLocation.find({ locationId: _id, organizationId });
  });
  const userByLocations = await Promise.all(promisesUserByLocation);

  return orgLocation.map((eachLocation, index) => ({
    location: eachLocation,
    users: userByLocations[index],
  }));
};

const removeBulkLocationProfile = async (organizationId, locationIds, session) => {
  const locationQuery = { organizationId, _id: { $in: locationIds } };
  const userOrgLocationQuery = { organizationId, locationId: { $in: locationIds } };

  const deletedLocations = await Model.Location
    .find(locationQuery)
    .session(session);
  const deletedUserOrgLocations = await Model.UserOrganizationLocation
    .find(userOrgLocationQuery)
    .session(session);

  await Promise.all([
    Model.Location.deleteMany(locationQuery, { session }),
    Model.UserOrganizationLocation.deleteMany(userOrgLocationQuery, { session }),
  ]);

  await session.commitTransaction();
  return { deletedLocations, deletedUserOrgLocations };
};

const getLocationDetail = async (locationId) => {
  try {
    const location = await Model.Location.findById(locationId).populate({ path: 'organizationId' });
    return location;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateLocation = async (locationId, locationPayload, session) => {
  const id = new mongoose.Types.ObjectId(locationId);
  const updatePayload = struct.updateLocationData(locationPayload);

  const locationToUpdate = await Model.Location.findById(id);
  if (!locationToUpdate) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Location with ID ${locationId} not found.`,
    );
  }
  const locationsInOrganization = await Model.Location.find({
    organizationId: locationToUpdate.organizationId,
    _id: { $ne: locationToUpdate._id },
  });
  const hasDuplicateName = locationsInOrganization.some(
    (location) => location.name === updatePayload.name,
  );
  if (!hasDuplicateName) {
    const updatedLocation = await Model.Location.findByIdAndUpdate(
      id,
      updatePayload,
      { session, new: true },
    );
    return updatedLocation;
  }
  throw new ResponseError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    `Location with name "${updatePayload.name}" already exists in the organization.`,
  );
};

const deleteUserOrgnizationLocations = async (organizationId, locationId, session) => {
  const deleted = await Model.UserOrganizationLocation.deleteMany(
    { locationId: locationId._id, organizationId },
    { session },
  );
  return deleted;
};

module.exports = {
  getLocationProfileList,
  getUserLocationProfile,
  createLocationProfile,
  removeBulkLocationProfile,
  getLocationDetail,
  updateLocation,
  deleteUserOrgnizationLocations,
};
