const Joi = require('joi');

exports.schemaAllOrganization = Joi.object({
  limit: Joi.number().integer().positive().min(1)
    .max(100)
    .empty(0)
    .default(100),
  page: Joi.number().integer().positive().min(1)
    .empty(0)
    .default(1),
});
