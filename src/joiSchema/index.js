const Joi = require('joi');

exports.limit = (limitCount = 10) => Joi.number().integer().positive().min(1)
  .max(100)
  .empty(0)
  .default(limitCount);
exports.page = (page = 1) => Joi.number().integer().positive().min(1)
  .empty(0)
  .default(page);

exports.sortBy = (defaultSort = 'DESC') => Joi.string()
  .empty('')
  .valid('ASC', 'DESC')
  .default(defaultSort);
