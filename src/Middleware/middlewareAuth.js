const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const model = require('../Users/modules/model');
const cipher = require('../../Helpers/encrypt');
const { decode } = require('../../Helpers/jwt');
const struct = require('../Users/modules/struct');

module.exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (token === undefined || !token.startsWith('Bearer ')) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: ReasonPhrases.UNAUTHORIZED,
      data: {},
      code: StatusCodes.UNAUTHORIZED,
    });
  } else {
    const originToken = token.substring(7, token.length);
    const dataCipher = await cipher.DecryptToken(originToken);
    const user = await model.getDataUserMiddleware(dataCipher);
    if (user === undefined || user === null) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
        data: {},
        code: StatusCodes.UNAUTHORIZED,
      });
    } else {
      req.user = struct.MiddlewareUserResponse(user.userId, user.organizationId);
      next();
    }
  }
};

// JWT Authentication
module.exports.authentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (token === undefined || !token.startsWith('Bearer ')) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
        data: {},
        code: StatusCodes.UNAUTHORIZED,
      });
    } else {
      const decodedToken = decode(token);
      const user = await model.getDataUserMiddleware(decodedToken);
      req.user = struct.MiddlewareUserResponse(user.userId, user.organizationId);
      next();
    }
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: ReasonPhrases.UNAUTHORIZED,
      data: {},
      code: StatusCodes.UNAUTHORIZED,
    });
  }
};
