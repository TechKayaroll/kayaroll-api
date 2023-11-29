const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const jwt = require('../../../Helpers/jwt');
const struct = require('./struct');
const model = require('./model');
const { ResponseError } = require('../../../Helpers/response');
const { hash, compare } = require('../../../Helpers/bcryptjs');

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

    const user = struct.UserData(userData.userId, userData.organizationId);
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
  try {
    const {
      companyId, role, token, name, email, password,
    } = req.body;
    const organization = await model.checkInvitationCodeExists(companyId);
    if (organization === null || organization.name === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');
    }

    let isRegisteredAccount = false;
    let registeredUser;

    const roleData = await model.getDataRole(role);
    if (!token) {
      registeredUser = await model.findUserByCompanyAndRole(email, companyId, role);
      if (!registeredUser) {
        const user = struct.UserRegistration(companyId, {
          name,
          email,
          password: hash(password),
        });
        user.roleId = roleData._id;
        const newUser = await model.createOrUpdateExistingUser(user);
        await model.insertUserOrganization(newUser, organization);
        registeredUser = await model.findUserByCompanyAndRole(
          newUser.email,
          companyId,
          roleData.name,
        );
      } else {
        isRegisteredAccount = true;
      }
    } else {
      const googlePayload = await jwt.decodeToken(req.body.token);
      registeredUser = await model.findUserByCompanyAndRole(googlePayload.email, companyId, role);
      if (!registeredUser) {
        const user = struct.UserRegistration(companyId, {
          name: googlePayload.name,
          email: googlePayload.email,
        });
        user.roleId = roleData._id;
        const existingOrNewUser = await model.createOrUpdateExistingUser(user);
        await model.insertUserOrganization(existingOrNewUser, organization);
        registeredUser = await model.findUserByCompanyAndRole(
          existingOrNewUser.email,
          companyId,
          roleData.name,
        );
      } else {
        isRegisteredAccount = true;
      }
    }
    if (isRegisteredAccount) throw new ResponseError(StatusCodes.BAD_REQUEST, 'Account is already registered!');
    const userData = await model.getDataUser(registeredUser);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userData,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    let organization = struct.Organization(req.body);
    const isExistOrg = await model.getOrganization(companyName);
    if (isExistOrg) {
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: organization,
        code: StatusCodes.OK,
      });
    } else {
      const newOrganization = await model.insertOrganization(companyName);
      organization = struct.Organization(newOrganization);
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
