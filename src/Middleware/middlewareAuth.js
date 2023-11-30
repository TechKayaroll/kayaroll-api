const { StatusCodes } = require('http-status-codes');
const model = require('../Users/modules/model');
const { decodeToken } = require('../../Helpers/jwt');
const struct = require('../Users/modules/struct');

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
    const user = await model.getDataUser(userId, organizationId);
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
