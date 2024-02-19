const Joi = require('joi');

exports.limit = Joi.number().integer().positive().min(1)
  .max(100)
  .empty(0)
  .default(100);
exports.page = Joi.number().integer().positive().min(1)
  .empty(0)
  .default(1);
