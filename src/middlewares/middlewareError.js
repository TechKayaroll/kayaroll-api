const { ResponseError } = require('../../Helpers/response');

const ErrorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res.status(err.code).json({
      message: err.message,
      data: {},
      code: err.code,
    });
  } else {
    res.status(500).json({
      message: err.message,
      data: {},
      code: err.code,
    });
  }
};

module.exports = ErrorMiddleware;
