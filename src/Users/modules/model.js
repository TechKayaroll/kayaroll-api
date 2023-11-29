const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const userModel = require('./mapping');
const { ResponseError } = require('../../../Helpers/response');
const struct = require('./struct');
const { generateCompanyCode } = require('../../../Helpers/randomString');

const insertDataUser = async (payload, payloadOrg) => {
  const user = new userModel.User(payload);
  const organization = new userModel.Organization(payloadOrg);
  const userOrganization = new userModel.UserOrganization();
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
  const organization = userModel.Organization;
  try {
    const org = await organization.findOne({ name: companyName.toUpperCase() });
    return org;
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getDataRole = async (req) => {
  const organization = userModel.Role;
  try {
    return await organization.findOne({ name: req });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const getUserAdminExists = async (email, companyName) => {
  const userOrganizations = userModel.UserOrganization;
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

const getDataUser = async (req) => {
  const userOrganization = userModel.UserOrganization;
  try {
    const usrRes = await userOrganization.findOne({ userId: new mongoose.Types.ObjectId(req._id) })
      .populate({
        path: 'userId',
        match: { email: { $eq: req.email } },
        populate: {
          path: 'roleId',
          model: 'Role',
        },
      })
      .populate({ path: 'organizationId' })
      .exec();
    return struct.UserRegistrationResponse(
      usrRes.userId,
      usrRes.organizationId,
      usrRes.userId,
    );
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const checkInvitationCodeExists = async (req) => {
  const organization = userModel.Organization;
  try {
    return await organization.findOne({ invitationCode: req.companyId });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const findUserByCompanyAndRole = async (email, invitationCode, roleName) => {
  try {
    const user = await userModel.User.findOne({
      email,
    })
      .populate({
        path: 'roleId',
        match: { name: roleName },
        select: '_id',
      })
      .exec();

    if (user && user.roleId) {
      const organization = await userModel.Organization.findOne({
        invitationCode,
      }).exec();

      if (organization) {
        const userOrganization = await userModel.UserOrganization.findOne({
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
          .exec();

        return userOrganization;
      }
    }

    return null;
  } catch (error) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getUserExists = async (email, companyId) => {
  const userOrganization = userModel.UserOrganization;
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

const getDataUserMiddleware = async (userId) => {
  const userOrganization = userModel.UserOrganization;
  try {
    return await userOrganization.findOne({ userId: new mongoose.Types.ObjectId(userId) })
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
  const user = userModel.User;
  try {
    return await user.findByIdAndUpdate(req._id, payload, { upsert: true });
  } catch (e) {
    throw new ResponseError(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

const insertOrganization = async (companyName) => {
  try {
    const newOrganization = new userModel.Organization({
      companyName,
      invitationCode: generateCompanyCode(),
    });
    return await newOrganization.save();
  } catch (e) {
    throw new Response(StatusCodes.INTERNAL_SERVER_ERROR, e);
  }
};

module.exports = {
  insertDataUser,
  getOrganization,
  getDataRole,
  getUserAdminExists,
  getDataUser,
  checkInvitationCodeExists,
  getUserExists,
  findUserByCompanyAndRole,
  getDataUserMiddleware,
  updateDataUserAdmin,
  insertOrganization,
};
