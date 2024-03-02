const { StatusCodes } = require('http-status-codes');
const { ResponseError } = require('../helpers/response');

const ErrorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res.status(err.code).json({
      message: err.message,
      data: err.data,
      code: err.code,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      data: {},
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = ErrorMiddleware;
