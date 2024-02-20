const Joi = require('joi');
const globalSchema = require('.');

exports.schemaCreateSchedule = Joi.object({
  scheduleName: Joi.string(),
  employeeIds: Joi.array().items(Joi.string())
    .empty(Joi.array().length(0))
    .default([]),
  isDefault: Joi.boolean().default(false),
  shifts: Joi.array().items(
    Joi.array().items(
      Joi.object({
        inTime: Joi.date().required(),
        outTime: Joi.date().greater(Joi.ref('inTime')).required(),
      }),
    ).default([]),
  ).length(7).required(),
  effectiveStartDate: Joi.date()
    .min('now')
    .iso()
    .optional()
    .messages({
      'date.min': 'effectiveStartDate must be tomorrow onwards.',
    }),
  effectiveEndDate: Joi.when('effectiveStartDate', {
    is: Joi.exist(),
    then: Joi.date()
      .min(Joi.ref('effectiveStartDate'))
      .iso()
      .required()
      .messages({
        'date.min': 'effectiveEndDate must not be before effectiveStartDate.',
        'any.required': 'effectiveEndDate is required.',
      }),
    otherwise: Joi.date().min('now').iso().optional()
      .messages({
        'date.min': 'effectiveEndDate must be tomorrow onwards.',
      }),
  }),
});

exports.schemaDeleteSchedule = Joi.object({
  scheduleIds: Joi.array().items(Joi.string())
    .empty(Joi.array().length(0))
    .default([]),
});

exports.schemaSetDefaultSchedule = Joi.object({
  effectiveStartDate: Joi.date().min('now').iso().required()
    .messages({
      'date.min': 'effectiveStartDate must be tomorrow onwards.',
      'any.required': 'effectiveStartDate is required.',
    }),
  effectiveEndDate: Joi.date().min(Joi.ref('effectiveStartDate')).iso().required()
    .messages({
      'date.min': 'Effective end date must not be before effectiveStartDate.',
      'any.required': 'Effective end date is required.',
    }),
});

exports.schemaGetScheduleListQuery = Joi.object({
  limit: globalSchema.limit(),
  page: globalSchema.page(),
});
