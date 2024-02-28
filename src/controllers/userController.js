const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const mongoose = require('mongoose');
const jwt = require('../helpers/jwt');
const struct = require('../struct/userStruct');
const model = require('../services/userService');
const { ResponseError } = require('../helpers/response');
const { hash, compare } = require('../helpers/bcryptjs');

exports.ping = async (req, res) => {
  res.status(StatusCodes.OK).send({
    message: ReasonPhrases.OK,
    env_setting: process.env.NODE_ENV,
    code: StatusCodes.OK,
  });
};

exports.login = async (req, res, next) => {
  try {
    const {
      companyId, token: googleToken, email, password, role,
    } = req.body;
    const isExistOrg = await model.checkInvitationCodeExists(companyId);
    if (isExistOrg === null || isExistOrg.name === undefined) throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');

    let userData;
    if (!googleToken) {
      userData = await model.findUserByCompanyAndRole(email, companyId, role);
    } else {
      const googlePayload = await jwt.decodeToken(googleToken);
      if (!googlePayload?.email) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Token');
      userData = await model.findUserByCompanyAndRole(googlePayload.email, companyId, role);
    }
    if (!userData?.userId) throw new ResponseError(StatusCodes.BAD_REQUEST, 'User is not Exist');

    if (!googleToken) {
      const hashedPassword = userData.userId.password;
      if (!hashedPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
      const isValidPassword = compare(password, hashedPassword);
      if (!isValidPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
    }
    const jwtToken = jwt.generateJwtToken({
      userId: userData.userId._id,
      organizationId: userData.organizationId._id,
    });

    const user = struct.UserData(userData.userId, userData.organizationId, userData.uniqueUserId);
    const responseData = {
      ...user,
      token: jwtToken,
    };
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: responseData,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      companyId, role, token, name, email, password,
    } = req.body;
    const organization = await model.checkInvitationCodeExists(companyId, session);
    if (organization === null || organization.name === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');
    }
    let registeredUser = null;
    const roleData = await model.getDataRole(role, session);
    if (!token) {
      registeredUser = await model.findUserByCompanyAndRole(email, companyId, role, session);
      if (registeredUser) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Account is already registered!');
      }
      const user = struct.UserRegistration(companyId, {
        name,
        email,
        password: hash(password),
      });
      user.roleId = roleData._id;
      const newUser = await model.createOrUpdateExistingUser(user, session);
      await model.insertUserOrganization(newUser, organization, session);
      registeredUser = await model.findUserByCompanyAndRole(
        newUser.email,
        companyId,
        roleData.name,
        session,
      );
    } else {
      const googlePayload = await jwt.decodeToken(req.body.token);
      registeredUser = await model.findUserByCompanyAndRole(
        googlePayload.email,
        companyId,
        role,
        session,
      );
      if (registeredUser) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Account is already registered!');
      }
      const user = struct.UserRegistration(companyId, {
        name: googlePayload.name,
        email: googlePayload.email,
      });
      user.roleId = roleData._id;
      const existingOrNewUser = await model.createOrUpdateExistingUser(user, session);
      await model.insertUserOrganization(
        existingOrNewUser,
        organization,
        session,
      );
      registeredUser = await model.findUserByCompanyAndRole(
        existingOrNewUser.email,
        companyId,
        roleData.name,
        session,
      );
    }
    const userOrgData = await model.getDataUser(
      registeredUser.userId._id,
      registeredUser.organizationId._id,
      session,
    );
    const userRes = struct.UserRegistrationResponse(userOrgData);
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userRes,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

exports.registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const isExistOrg = await model.getOrganization(companyName);
    if (isExistOrg) {
      const existOrg = struct.Organization(isExistOrg);
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: existOrg,
        code: StatusCodes.OK,
      });
    } else {
      const newOrganization = await model.insertOrganization(companyName);
      const organization = struct.Organization(newOrganization);
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: organization,
        code: StatusCodes.OK,
      });
    }
  } catch (e) {
    next(e);
  }
};

exports.employeeList = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const allUsers = await model.getAllUserOnOrganization(organizationId);
    const allEmployee = allUsers.filter((eachUser) => eachUser.userId.roleId.name === 'employee');
    const userList = allEmployee.map((userOrg) => struct.UserRegistrationResponse(userOrg));
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userList,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.organizationList = async (req, res, next) => {
  try {
    // const { userId } = req.user;
    // find organizations by userId
  } catch (error) {
    next(error);
  }
};
