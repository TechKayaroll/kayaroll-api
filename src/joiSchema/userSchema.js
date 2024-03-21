const Joi = require('joi');
const { USER_ROLE } = require('../utils/constants');
const globalSchema = require('.');

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
  role: Joi.string()
    .valid(USER_ROLE.EMPLOYEE, USER_ROLE.ADMIN)
    .required(),
  email: Joi.string().email(),
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
exports.schemaRegister = Joi.object({
  companyId: Joi.string().required(),
  role: Joi.string()
    .valid(USER_ROLE.EMPLOYEE, USER_ROLE.ADMIN)
    .required(),
  email: Joi.string().email(),
  name: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  password: Joi.string().when('email', {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  token: Joi.string(),
})
  .xor('email', 'token')
  .messages({
    'object.missing': 'Either (companyId, email, name, password) or (companyId, token) is required.',
  });

exports.schemaRegisterCompany = Joi.object({
  companyName: Joi.string().required(),
});
