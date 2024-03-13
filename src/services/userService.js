const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const Model = require('../models');
const { ResponseError } = require('../helpers/response');
const { generateUserIdByNameAndIndex, generateCompanyCode } = require('../utils/common');

const generateUniqueUserOrgId = async (organizationId) => {
  const organization = await Model.Organization.findById(organizationId);
  if (!organization) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Organization not found.');
  }

  const userCountInOrg = await Model.UserOrganization.countDocuments({ organizationId });
  const uniqueId = generateUserIdByNameAndIndex(organization.name, userCountInOrg + 1);
  return uniqueId;
};

const createOrUpdateExistingUser = async (userPayload, session) => {
  const findByQuery = { email: userPayload.email };
  const opts = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
    session,
  };
  const user = Model.User.findOneAndUpdate(
    findByQuery,
    {
      fullname: userPayload.fullname,
      email: userPayload.email,
      password: userPayload.password || undefined,
      roleId: userPayload.roleId || '',
    },
    opts,
  );
  return user;
};
const insertUserOrganization = async (user, org, session) => {
  const userOrgPayload = {
    userId: user._id,
    organizationId: org._id,
  };
  const userOrganization = new Model.UserOrganization(userOrgPayload);
  const createdUserOrganization = await userOrganization.save({ session });
  return createdUserOrganization;
};

const getOrganization = async (companyName) => {
  const organization = Model.Organization;
  try {
    const org = await organization.findOne({ name: companyName.toUpperCase() });
    return org;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getAllUserOnOrganization = async (organizationId) => {
  const userOrganization = Model.UserOrganization;
  try {
    const listOfUsers = await userOrganization
      .find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
      })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
        },
      })
      .populate({ path: 'organizationId' });
    return listOfUsers;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getDataRole = async (req, session) => {
  try {
    return await Model.Role.findOne({ name: req }).session(session);
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getUserAdminExists = async (email, companyName) => {
  const userOrganizations = Model.UserOrganization;
  const res = {
    flag: false, _id: '', email: '', roleId: { name: '' }, organizationId: '',
  };
  try {
    const usr = await userOrganizations.find()
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      })
      .populate({ path: 'organizationId' })
      .exec();
    usr.forEach((eachUser) => {
      if (eachUser.userId.email === email && eachUser.organizationId.name === companyName) {
        res._id = eachUser.userId._id;
        res.email = eachUser.userId.email;
        res.roleId.name = eachUser.userId.roleId.name;
        res.organizationId = eachUser.organizationId._id;
        res.flag = true;
      }
    });
    return res;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const checkInvitationCodeExists = async (companyId, session) => {
  const organization = Model.Organization;
  try {
    return await organization.findOne({ invitationCode: companyId }).session(session);
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const findUserByCompanyAndRole = async (email, invitationCode, roleName, session) => {
  const role = await Model.Role
    .findOne({ name: roleName })
    .session(session);

  const organization = await Model.Organization
    .findOne({
      invitationCode,
    })
    .session(session);

  if (!role || !organization) return null;

  const user = await Model.User.findOne({
    email,
  })
    .populate({
      path: 'roleId',
    })
    .where({ roleId: role._id })
    .session(session);

  if (user) {
    const userOrganization = await Model.UserOrganization.findOne({
      userId: user._id,
      organizationId: organization._id,
    })
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      })
      .populate({ path: 'organizationId' })
      .session(session);
    return userOrganization;
  }
  return null;
};

const getUserExists = async (email, companyId, session) => {
  const userOrganization = Model.UserOrganization;
  try {
    const users = await userOrganization.find()
      .populate({
        path: 'userId',
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      })
      .populate({ path: 'organizationId' })
      .session(session);
    const userExist = users.find((eachUser) => {
      const { userId, organizationId } = eachUser;
      return userId.email === email && organizationId.invitationCode === companyId;
    });
    return userExist;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getDataUser = async (userId, organizationId, session) => {
  const userOrganization = Model.UserOrganization;
  const userOrg = await userOrganization.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    organizationId: new mongoose.Types.ObjectId(organizationId),
  })
    .populate({
      path: 'userId',
      populate: {
        path: 'roleId',
        model: 'Role',
      },
    })
    .populate({ path: 'organizationId' })
    .session(session);
  return userOrg;
};

const updateDataUserAdmin = async (req, payload) => {
  try {
    return await Model.User.findByIdAndUpdate(req._id, payload, { upsert: true });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const insertOrganization = async (companyName) => {
  try {
    const trimmedCompanyName = companyName.trim();
    const invitationCode = generateCompanyCode(trimmedCompanyName);
    const newOrganization = new Model.Organization({
      name: trimmedCompanyName,
      invitationCode,
    });
    return await newOrganization.save();
  } catch (e) {
    throw new Response(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const updateUserOrganizationAttendanceLocation = async (id, locationId, session) => {
  try {
    const userOrg = await Model.UserOrganization.findById(id);
    if (!userOrg) {
      throw new Error(`UserOrganization not found for ID ${id}`);
    }
    userOrg.attendanceLocation = locationId;

    await userOrg.save({ session });

    return userOrg;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const validateEmployeeIds = async (employeeIds, organizationId, session) => {
  if (!employeeIds || employeeIds.length === 0) return [];
  const uniqueEmployeeIds = [...new Set(employeeIds)];
  const users = await Model.UserOrganization.find({
    userId: { $in: uniqueEmployeeIds },
    organizationId,
  })
    .session(session);
  const foundUserIds = users.map((user) => user.userId.toString());
  const invalidUserIds = uniqueEmployeeIds.filter((id) => !foundUserIds.includes(id.toString()));
  if (invalidUserIds.length > 0) {
    throw new ResponseError(StatusCodes.BAD_REQUEST, 'Some user IDs do not belong to the specified organization.');
  }
  const ids = uniqueEmployeeIds.map((id) => new mongoose.Types.ObjectId(id));
  return ids;
};

const removeEmployeesFromOrganization = async (employeeIds, organizationId, session) => {
  const result = { deletedUsers: [], deletedUserOrganizationLocation: [], deletedSchedule: [] };
  if (!employeeIds || employeeIds.length === 0) return result;

  const orgId = new mongoose.Types.ObjectId(organizationId);
  const uniqueEmployeeIds = [...new Set(employeeIds)].map((id) => new mongoose.Types.ObjectId(id));
  const query = { userId: { $in: uniqueEmployeeIds }, organizationId: orgId };

  result.deletedUsers = await Model.UserOrganization.find(query)
    .populate('organizationId')
    .populate({
      path: 'userId',
      populate: {
        path: 'roleId',
      },
    })
    .session(session);
  result.deletedUserOrganizationLocation = await Model.UserOrganizationLocation
    .find(query)
    .session(session);

  result.deletedSchedule = await Model.Schedule
    .find({
      organizationId: orgId,
      users: query.userId,
    })
    .session(session);

  await Promise.all([
    Model.UserOrganization.deleteMany(query, { session }),
    Model.UserOrganizationLocation.deleteMany(query, { session }),
  ]);
  const userIdToDelete = employeeIds.map((id) => id.toString());
  const bulkUpdates = result.deletedSchedule.map(async (schedule) => {
    const updatedUserIds = schedule.users.filter((id) => !userIdToDelete.includes(id.toString()));
    const updatedSchedule = await Model.Schedule.updateOne(
      { _id: schedule._id },
      { users: updatedUserIds },
      { session },
    );
    return updatedSchedule;
  });
  await Promise.all(bulkUpdates.filter((update) => update !== null));
  return result;
};


module.exports = {
  createOrUpdateExistingUser,
  insertUserOrganization,
  getOrganization,
  getDataRole,
  getUserAdminExists,
  getDataUser,
  checkInvitationCodeExists,
  getUserExists,
  findUserByCompanyAndRole,
  updateDataUserAdmin,
  insertOrganization,
  getAllUserOnOrganization,
  generateUniqueUserOrgId,
  updateUserOrganizationAttendanceLocation,
  validateEmployeeIds,
  removeEmployeesFromOrganization,
};
