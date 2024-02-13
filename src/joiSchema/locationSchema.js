const Joi = require('joi');

exports.schemaCreateLocationProfile = Joi.object({
  locationName: Joi.string().required(),
  placeId: Joi.string().required(),
  lat: Joi.number().required(),
  long: Joi.number().required(),
  employeeIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});

exports.schemaUpdateLocationProfile = Joi.object({
  locationId: Joi.string().required(),
  locationName: Joi.string().optional(),
  placeId: Joi.string().optional(),
  lat: Joi.number().optional(),
  long: Joi.number().optional(),
  employeeIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});
exports.schemaDeleteLocationProfile = Joi.object({
  locationIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});
