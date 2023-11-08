const httpStatus = require('http-status');
const model = require('../Users/modules/model');
const cipher = require('../../Helpers/encrypt');
const struct = require('../Users/modules/struct');

module.exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (token === undefined || !token.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).json({
      message: httpStatus['401_NAME'],
      data: {},
      code: httpStatus.UNAUTHORIZED,
    }).end();
  } else {
    const originToken = token.substring(7, token.length);
    const dataCipher = await cipher.DecryptToken(originToken);
    const user = await model.getDataUserMiddleware(dataCipher);
    if (user === undefined || user === null) {
      res.status(httpStatus.UNAUTHORIZED).json({
        message: httpStatus['401_NAME'],
        data: {},
        code: httpStatus.UNAUTHORIZED,
      }).end();
    } else {
      req.user = struct.MiddlewareUserResponse(user.userId, user.organizationId);
      next();
    }
  }
};
