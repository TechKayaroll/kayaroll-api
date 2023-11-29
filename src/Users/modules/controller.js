const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const jwt = require('../../../Helpers/jwt');
const struct = require('./struct');
const model = require('./model');
const { ResponseError } = require('../../../Helpers/response');
const { generateCompanyCode } = require('../../../Helpers/randomString');
const cipher = require('../../../Helpers/encrypt');
const { hash, compare } = require('../../../Helpers/bcryptjs');

exports.ping = async (req, res) => {
  res.status(StatusCodes.OK).send({
    message: ReasonPhrases.OK,
    env_setting: process.env.NODE_ENV,
    code: StatusCodes.OK,
  });
};

exports.registerUser = async (req, res, next) => {
  try {
    const exists = await model.checkInvitationCodeExists(req.body);
    if (exists === null || exists.name === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');
    }

    const decode = await jwt.decodeToken(req.body.token);
    let userExists = await model.getUserExists(decode.email, req.body.companyId);
    if (!userExists.flag) {
      const org = struct.Organization(exists);
      const role = await model.getDataRole('employee');
      const user = struct.UserRegistration(req.body.companyId, decode);
      user.roleId = role._id;
      userExists = await model.insertDataUser(user, org);
    }

    if (userExists.flag && userExists.roleId.name === 'admin') {
      const role = await model.getDataRole('admin');
      const user = struct.UserRegistration(req.body.companyId, decode);
      user.roleId = role._id;
      await model.updateDataUserAdmin(userExists, user);
    }

    const usrRes = await model.getDataUser(userExists);
    usrRes.token = await cipher.EncryptToken(usrRes.userId);

    res.status(StatusCodes.OK).json({ message: 'OK', data: usrRes, code: StatusCodes.OK });
  } catch (e) {
    next(e);
  }
};

exports.registerAdmin = async (req, res, next) => {
  try {
    req.body.companyName = req.body.companyName.toUpperCase();
    let userAdmin = await model.getUserAdminExists(req.body.email, req.body.companyName);
    if (!userAdmin.email) {
      const role = await model.getDataRole('admin');
      const exists = await model.getOrganization(req.body.companyName);

      let user = struct.UserRegistration(req.body.companyName, req.body);
      let org = struct.Organization(req.body);
      if (exists !== null) {
        user = struct.UserRegistration(req.body.companyName, req.body);
        org = struct.Organization(exists);
      }

      org.invitationCode = generateCompanyCode(org.name);
      user.roleId = role._id;
      userAdmin = await model.insertDataUser(user, org);
    }

    const usrRes = await model.getDataUser(userAdmin);
    res.status(StatusCodes.OK).json({ message: 'OK', data: usrRes, code: StatusCodes.OK });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const {
      companyId, token: googleToken, email, password,
    } = req.body;
    const isExistOrg = await model.checkInvitationCodeExists(req.body);
    if (isExistOrg === null || isExistOrg.name === undefined) throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');

    let userData;
    if (!googleToken) {
      userData = await model.getUserExists(email, companyId);
    } else {
      const googlePayload = await jwt.decodeToken(googleToken);
      userData = await model.getUserExists(googlePayload.email, companyId);
    }
    if (!userData) throw new ResponseError(StatusCodes.BAD_REQUEST, 'User is not Exist');
    if (!googleToken) {
      const hashedPassword = userData.userId.password;
      if (!hashedPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
      const isValidPassword = compare(password, hashedPassword);
      if (!isValidPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
    }
    const jwtToken = await jwt.generateJwtToken({ userId: userData.userId._id });

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: jwtToken,
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
    const isExistOrg = await model.checkInvitationCodeExists(req.body);
    if (isExistOrg === null || isExistOrg.name === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');
    }

    let isRegisteredAccount = false;
    let registeredUser;
    const org = struct.Organization(isExistOrg);
    const roleData = await model.getDataRole(role);
    if (!token) {
      registeredUser = await model.getUserExists(email, companyId);
      if (!registeredUser) {
        const user = struct.UserRegistration(companyId, {
          name,
          email,
          password: hash(password),
        });
        user.roleId = roleData._id;
        registeredUser = await model.insertDataUser(user, org);
      } else {
        isRegisteredAccount = true;
      }
    } else {
      const googlePayload = await jwt.decodeToken(req.body.token);
      registeredUser = await model.getUserExists(googlePayload.email, companyId);
      if (!registeredUser) {
        const user = struct.UserRegistration(companyId, googlePayload);
        user.roleId = roleData._id;
        registeredUser = await model.insertDataUser(user, org);
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
