const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const { ResponseError } = require('../helpers/response');

exports.validate = (schemaBody = null, schemaQuery = null) => (req, res, next) => {
  let result = {};
  if (req.file !== undefined) {
    if ((req.file.size / 1000000).toFixed(1) > 4.0) {
      fs.unlinkSync(req.file.path);
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Invalid Image Size');
    }

    if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg') {
      fs.unlinkSync(req.file.path);
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'File Type must be (jpeg or png)');
    }
  }

  if (schemaQuery) {
    result = schemaQuery.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
    });
  }

  if (schemaBody) {
    result = schemaBody.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });
  }

  if (result.error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: result.error.message,
      data: {},
      code: StatusCodes.BAD_REQUEST,
    }).end();
  } else {
    if (schemaBody) {
      req.body = result.value;
    }

    if (schemaQuery) {
      req.query = result.value;
    }
    next();
  }
};
