const Joi = require('joi');

exports.schemaCreateLocationProfile = Joi.object({
  locationName: Joi.string().required(),
  placeId: Joi.string().required(),
  lat: Joi.number().required(),
  long: Joi.number().required(),
  radius: Joi.number().required(),
  employeeIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});

exports.schemaUpdateLocationProfile = Joi.object({
  locationId: Joi.string().required(),
  locationName: Joi.string().optional(),
  placeId: Joi.string().optional(),
  lat: Joi.number().optional(),
  long: Joi.number().optional(),
  radius: Joi.number().optional(),
  employeeIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});
exports.schemaDeleteLocationProfile = Joi.object({
  locationIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});

exports.schemaSearchLocation = Joi.object().keys({
  name: Joi.string().required(),
});

exports.schemaSearchLocationByCoordinateOrPlaceId = Joi.object().keys({
  lat: Joi.number(),
  long: Joi.number(),
  placeId: Joi.string(),
})
  .or('lat', 'placeId')
  .and('lat', 'long')
  .messages({
    'object.missing': 'Please provide either (lat, long) or (placeId)',
    'object.and': '(lat, long) must be provided together',
  });
