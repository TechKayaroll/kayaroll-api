const { default: mongoose } = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const Model = require('../models');

const struct = require('../struct/locationStruct');
const userStruct = require('../struct/userStruct');

const { GOOGLE_MAP_API_BASE_URL } = require('../utils/constants');
const { ResponseError } = require('../helpers/response');

const createLocationProfile = async (organizationId, reqBody, session) => {
  const adminOrganizationId = new mongoose.Types.ObjectId(organizationId);
  const locationData = struct.createLocationData(reqBody, adminOrganizationId);
  const locationExist = await Model.Location.findOne({
    name: locationData.name,
    organizationId: adminOrganizationId,
  });
  if (locationExist) {
    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      `Location with name: "${locationData.name}" already exist!`,
    );
  }
  const newLocationProfile = new Model.Location(locationData);
  newLocationProfile.save({ session });
  return newLocationProfile;
};

const getUserLocationProfile = async ({ organizationId }) => {
  const userByLocations = await Model.UserOrganizationLocation.find({
    organizationId,
  })
    .populate({
      path: 'userId',
      populate: {
        path: 'roleId',
      },
    })
    .populate({ path: 'locationId' })
    .populate({ path: 'organizationId' })
    .populate({
      path: 'userOrganizationId',
    });
  return userByLocations;
};

const getLocationProfileList = async (orgId, reqQuery) => {
  const { page = 1, limit = 5, name } = reqQuery;
  const skip = (page - 1) * limit;

  const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};

  const orgLocation = await Model.Location
    .find({ organizationId: orgId, ...nameFilter })
    .populate({ path: 'organizationId' })
    .skip(skip)
    .limit(limit);

  const totalData = await Model.Location.countDocuments({ organizationId: orgId });

  const promisesUserByLocation = orgLocation.map(
    (eachLocation) => Model.UserOrganizationLocation.find({
      locationId: eachLocation._id,
      organizationId: eachLocation.organizationId,
    })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
        },
      })
      .populate({ path: 'organizationId' })
      .populate({
        path: 'userOrganizationId',
      }),
  );
  const userByLocations = await Promise.all(promisesUserByLocation);
  const userGroupByLocation = orgLocation.map((eachLocation, index) => {
    const userByLocation = userByLocations[index];
    return ({
      location: struct.locationOrganizationData(eachLocation),
      users: userByLocation.map(userStruct.UserOrganizationLocationDetail),
    });
  });

  const pagination = struct.LocationPagination(page, limit, totalData);

  return {
    list: userGroupByLocation,
    pagination,
  };
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
  const locId = new mongoose.Types.ObjectId(locationId);
  const updatePayload = struct.updateLocationData(locationPayload);

  const locationToUpdate = await Model.Location.findById(locId);
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
      locationToUpdate._id,
      updatePayload,
      { session },
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

const searchLocation = async (coordinate = null, placeId = null) => {
  let results = [];
  let url = GOOGLE_MAP_API_BASE_URL;
  const queryParams = [];

  if (coordinate?.lat && coordinate?.long) {
    queryParams.push(`latlng=${coordinate.lat},${coordinate.long}`);
  } else if (placeId) {
    queryParams.push(`place_id=${placeId}`);
  } else {
    return results;
  }

  queryParams.push(`key=${process.env.GOOGLE_MAP_API_KEY}`);
  url += `?${queryParams.join('&')}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      results = response.data.results.map(struct.geocodeResults);
    } else {
      throw new Error(response.data.error_message || 'Google API error');
    }
  } catch (error) {
    throw new Error(`Internal server error: ${error.message}`);
  }

  return results;
};

const searchLocationByName = async (locationName) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: locationName,
        key: process.env.GOOGLE_MAP_API_KEY,
      },
    });
    const locations = response.data.predictions.map(struct.locationPrediction);
    return locations;
  } catch (error) {
    throw new Error('Failed to search location by name');
  }
};

module.exports = {
  getLocationProfileList,
  getUserLocationProfile,
  createLocationProfile,
  removeBulkLocationProfile,
  getLocationDetail,
  updateLocation,
  deleteUserOrgnizationLocations,
  searchLocation,
  searchLocationByName,
};
