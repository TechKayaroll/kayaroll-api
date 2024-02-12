const Joi = require('joi');

exports.schemaCreateLocationProfile = Joi.object({
  name: Joi.string().required(),
  placeId: Joi.string().required(),
  lat: Joi.number().required(),
  long: Joi.number().required(),
});
