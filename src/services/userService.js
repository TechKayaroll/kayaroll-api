const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const Model = require('../models');
const { ResponseError } = require('../helpers/response');
const { generateCompanyCode } = require('../helpers/randomString');
const { generateUserIdByNameAndIndex } = require('../utils/common');

const generateUniqueUserOrgId = async (organizationId) => {
  const organization = await Model.Organization.findById(organizationId);
  if (!organization) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Organization not found.');
  }

  const userCountInOrg = await Model.UserOrganization.countDocuments({ organizationId });
  const uniqueId = generateUserIdByNameAndIndex(organization.name, userCountInOrg + 1);
  return uniqueId;
};

const createOrUpdateExistingUser = async (userPayload) => {
  try {
    const findByQuery = { email: userPayload.email };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
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
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error create User');
  }
};
const insertUserOrganization = async (user, org) => {
  try {
    const userOrgPayload = {
      userId: user._id,
      organizationId: org._id,
    };
    const userOrganization = new Model.UserOrganization(userOrgPayload);
    const createdUserOrganization = await userOrganization.save();
    return createdUserOrganization;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error create UserOrganization');
  }
};

const insertDataUser = async (payload, payloadOrg) => {
  const user = new Model.User(payload);
  const organization = new Model.Organization(payloadOrg);
  const userOrganization = new Model.UserOrganization();
  const session = await mongoose.startSession();
  let companyId = '';
  let org;
  try {
    session.startTransaction();
    const opts = { session };
    companyId = payloadOrg.organizationId;
    if (payloadOrg.organizationId === undefined) {
      org = await organization.save(opts);
      companyId = org._id;
    }

    const usr = await user.save(opts);
    if (usr !== undefined && (org !== undefined || companyId !== '')) {
      userOrganization.userId = usr._id;
      userOrganization.organizationId = companyId;
      await userOrganization.save(opts);
    }
    await session.commitTransaction();
    await session.endSession();
    return usr;
  } catch (e) {
    await session.abortTransaction();
    await session.endSession();
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error Insert to DB for user');
  }
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

const getDataRole = async (req) => {
  try {
    return await Model.Role.findOne({ name: req });
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

const checkInvitationCodeExists = async (companyId) => {
  const organization = Model.Organization;
  try {
    return await organization.findOne({ invitationCode: companyId });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const findUserByCompanyAndRole = async (email, invitationCode, roleName) => {
  try {
    const role = await Model.Role.findOne({ name: roleName });
    const organization = await Model.Organization.findOne({
      invitationCode,
    });
    if (!role || !organization) return null;

    const user = await Model.User.findOne({
      email,
    })
      .populate({
        path: 'roleId',
      })
      .where({ roleId: role._id });

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
        .populate({ path: 'organizationId' });
      return userOrganization;
    }

    return null;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getUserExists = async (email, companyId) => {
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
      .exec();
    const userExist = users.find((eachUser) => {
      const { userId, organizationId } = eachUser;
      return userId.email === email && organizationId.invitationCode === companyId;
    });
    return userExist;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getDataUser = async (userId, organizationId) => {
  const userOrganization = Model.UserOrganization;
  try {
    return await userOrganization.findOne({
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
      .exec();
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
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
    const invitationCode = generateCompanyCode(companyName);
    const newOrganization = new Model.Organization({
      name: companyName,
      invitationCode,
    });
    return await newOrganization.save();
  } catch (e) {
    throw new Response(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

module.exports = {
  insertDataUser,
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
};
