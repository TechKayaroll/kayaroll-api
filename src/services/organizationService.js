const { StatusCodes } = require('http-status-codes');
const { ResponseError } = require('../helpers/response');

const model = require('../models');
const { USER_ROLE } = require('../utils/constants');
const userStruct = require('../struct/userStruct');

const Model = require('../models');

const getAllOrganization = async (param) => {
  try {
    const offset = param.page - 1;
    const list = await model.Organization.find()
      .limit(param.limit)
      .skip(offset * param.limit);

    const pagination = await model.Organization.countDocuments();
    return { list, pagination };
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getEmployeeInOrganization = async (organizationId) => {
  try {
    const userOrgs = await model.UserOrganization.find({ organizationId })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      });
    return userOrgs.filter((userOrg) => userOrg?.userId?.roleId?.name === USER_ROLE.EMPLOYEE);
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getOrganizationDetail = async (organizationId) => {
  try {
    const organization = await model.Organization.findById(organizationId);
    return organization;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const associateEmployeeWithLocation = async (payload, session) => {
  try {
    const userOrganizationLocationData = userStruct.UserOrganizationLocation(payload);
    const existingRecord = await model.UserOrganizationLocation
      .findOne(userOrganizationLocationData);

    if (!existingRecord) {
      const newUserOrgLocation = new model.UserOrganizationLocation(userOrganizationLocationData);
      await newUserOrgLocation.save({ session });
      return userStruct.UserOrganizationLocation(newUserOrgLocation);
    }
    return userStruct.UserOrganizationLocation(existingRecord);
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getAllOrganization,
  getEmployeeInOrganization,
  getOrganizationDetail,
  associateEmployeeWithLocation,
};
