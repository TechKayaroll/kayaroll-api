const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const userService = require('../services/userService');
const { decodeToken } = require('../helpers/jwt');
const struct = require('../struct/userStruct');

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
    const user = await userService.getDataUser(userId, organizationId);
    req.user = struct.MiddlewareUserResponse(user.userId, user.organizationId);
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: ReasonPhrases.UNAUTHORIZED,
      data: {},
      code: StatusCodes.UNAUTHORIZED,
    });
  }
};
