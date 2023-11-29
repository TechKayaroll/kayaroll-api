const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const model = require('../Users/modules/model');
const cipher = require('../../Helpers/encrypt');
const { decodeToken } = require('../../Helpers/jwt');
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
  const headerToken = req.header('Authorization');
  try {
    if (!headerToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Authorization header is missing',
        data: {},
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    const [bearer, token] = headerToken.split(' ');
    if (bearer !== 'Bearer') {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid Authorization header format',
        data: {},
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    const { userId, organizationId } = decodeToken(token);
    const user = await model.getDataUserMiddleware(userId, organizationId);
    req.user = struct.MiddlewareUserResponse(user.userId, user.organizationId);
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: error?.message,
      data: {},
      code: StatusCodes.UNAUTHORIZED,
    });
  }
};
