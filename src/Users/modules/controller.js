const httpStatus = require('http-status');
const dayjs = require('dayjs');
const jwt = require('../../../Helpers/jwt');
const struct = require('./struct');
const model = require('./model');
const { ResponseError } = require('../../../Helpers/response');
const rndString = require('../../../Helpers/randomString');
const cipher = require('../../../Helpers/encrypt');

exports.ping = async (req, res) => {
  res.status(200).send({ message: 'OK', env_setting: process.env.NODE_ENV, code: httpStatus.OK });
};

exports.registerUser = async (req, res, next) => {
  try {
    const exists = await model.checkInvitationCodeExists(req.body);
    if (exists === null || exists.name === undefined) {
      throw new ResponseError(httpStatus.BAD_REQUEST, 'Company ID Not Exists!');
    }

    const decode = await jwt.decodeToken(req.body.token);
    let userExists = await model.getUserExists(decode.email, req.body.companyId);
    if (!userExists.flag) {
      const org = await struct.Organization(exists);
      const role = await model.getDataRole('employee');
      const user = await struct.UserRegistration(req.body.companyId, decode);
      user.roleId = role._id;
      userExists = await model.insertDataUser(user, org);
    }

    if (userExists.flag && userExists.roleId.name === 'admin') {
      const role = await model.getDataRole('admin');
      const user = await struct.UserRegistration(req.body.companyId, decode);
      user.roleId = role._id;
      await model.updateDataUserAdmin(userExists, user);
    }

    const usrRes = await model.getDataUser(userExists);
    usrRes.token = await cipher.EncryptToken(usrRes.userId);

    res.status(200).json({ message: 'OK', data: usrRes, code: httpStatus.OK });
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
      const exists = await model.checkOrganizationExists(req.body.companyName);

      let user = await struct.UserRegistration(req.body.companyName, req.body);
      let org = await struct.Organization(req.body);
      if (exists !== null) {
        user = await struct.UserRegistration(req.body.companyName, req.body);
        org = await struct.Organization(exists);
      }

      const companyCode = await rndString.CompanyCode(3, org.name);
      const rndStr = await rndString.RandomString(3);
      org.invitationCode = `${companyCode}-${rndStr}-${dayjs(Date.now()).format('DDMMYY')}`;
      user.roleId = role._id;
      userAdmin = await model.insertDataUser(user, org);
    }

    const usrRes = await model.getDataUser(userAdmin);
    res.status(200).json({ message: 'OK', data: usrRes, code: httpStatus.OK });
  } catch (e) {
    next(e);
  }
};
