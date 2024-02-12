const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const struct = require('../struct/locationStruct');
const userStruct = require('../struct/userStruct');
const organizationStruct = require('../struct/organizationStruct');

const locationServices = require('../services/locationService');

exports.createLocationProfile = async (req, res, next) => {
  try {
    const {
      location,
      userOrganization,
      organization,
    } = await locationServices.createLocationProfile(req);
    const locationProfile = struct.locationProfile(location);
    const userOrgs = userStruct.UserRegistrationResponse(userOrganization);
    const org = organizationStruct.OrganizationData(organization);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        locationProfile,
        employees: userOrgs,
        organization: org,
      },
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.getLocationProfile = async (req,res, next) => {
  try {
    const { organizationId } = req.user;
    // get location id by organization id 
    // map the result the retunrs
  } catch (error ) {

  }
};

exports.updateLocationProfile = async (req,res,next) => {
  
}