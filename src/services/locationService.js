const { default: mongoose } = require('mongoose');
const model = require('../models');
const struct = require('../struct/locationStruct');
const organizationService = require('./organizationService');
const userService = require('./userService');
const { USER_ROLE } = require('../utils/constants');

exports.createLocationProfile = async (req) => {
  const session = await model.startSession();
  session.startTransaction();
  try {
    const { employeeIds } = req.body;
    const adminOrgId = new mongoose.Types.ObjectId(req.user.organizationId);
    if (req.user.role !== USER_ROLE.ADMIN) {
      throw new Error('User is not Admin!');
    }
    const location = struct.locationData(req);
    const createdLocationProfile = await model.Location.create(location, { session });
    const updatedOrganization = await organizationService.updateOrganizationLocation(
      adminOrgId,
      createdLocationProfile._id,
      session,
    );
    const updatePromises = employeeIds.map(
      (employeeId) => userService.updateUserOrganizationAttendanceLocation(
        employeeId,
        createdLocationProfile._id,
        session,
      ),
    );
    const updatedUserOrg = await Promise.all(updatePromises);
    await session.commitTransaction();
    return {
      location: createdLocationProfile,
      userOrganization: updatedUserOrg,
      organization: updatedOrganization,
    };
  } catch (error) {
    await session.abortTransaction();
    return null;
  } finally {
    session.endSession();
  }
};

exports.getLocationProfile = async (req) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
  } catch (error) {

  }
};
