const Joi = require('joi');

exports.schemaRegisterUser = Joi.object({
  companyId: Joi.string().required(),
  token: Joi.string().required(),
});

exports.schemaRegisterAdmin = Joi.object({
  companyName: Joi.string().required(),
  email: Joi.string().email().required(),
});

exports.schemaLogin = Joi.object({
  companyId: Joi.string().required(),
  email: Joi.string(),
  password: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  token: Joi.string(),
})
  .xor('email', 'token')
  .messages({
    'object.missing': 'Either (companyId, email, password) or (companyId, token) is required.',
  });

exports.schemaRegisterCompany = Joi.object({
  companyName: Joi.string().required(),
});
