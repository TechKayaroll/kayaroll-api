const Joi = require('joi');

exports.schemaRegisterUser = Joi.object({
  companyId: Joi.string().required(),
  token: Joi.string().required(),
});

exports.schemaRegisterAdmin = Joi.object({
  companyName: Joi.string().required(),
  email: Joi.string().email().required(),
});
