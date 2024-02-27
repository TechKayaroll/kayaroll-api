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
        startTime: Joi.date().required(),
        endTime: Joi.date().greater(Joi.ref('startTime')).required(),
      }),
    ).default([]),
  ).length(7).required(),
  effectiveStartDate: Joi.date()
    .min('now')
    .when('isDefault', {
      is: true,
      then: Joi.date().required()
        .messages({
          'any.required': 'effectiveStartDate is required when isDefault is true.',
        }),
    })
    .optional()
    .messages({
      'date.min': 'effectiveStartDate must be tomorrow onwards.',
    }),
  effectiveEndDate: Joi.date()
    .min('now')
    .when('effectiveStartDate', {
      is: Joi.exist(),
      then: Joi.date()
        .min(Joi.ref('effectiveStartDate'))
        .required()
        .messages({
          'date.min': 'effectiveEndDate must not be before effectiveStartDate.',
          'any.required': 'effectiveEndDate is required when effectiveStartDate is provided.',
        }),
      otherwise: Joi.date()
        .min('now')
        .optional()
        .messages({
          'date.min': 'effectiveEndDate must be tomorrow onwards.',
        }),
    }),
  gracePeriod: Joi.number().min(0),
  overtimeTolerance: Joi.number().min(0),
});

exports.schemaUpdateScheduleById = Joi.object({
  scheduleName: Joi.string(),
  employeeIds: Joi.array().items(Joi.string()),
  isDefault: Joi.boolean().default(false),
  shifts: Joi.array().items(
    Joi.array().items(
      Joi.object({
        startTime: Joi.date().required(),
        endTime: Joi.date().greater(Joi.ref('startTime')).required(),
      }),
    ).default([]),
  ).length(7),
  effectiveStartDate: Joi.date()
    .min('now')
    .when('isDefault', {
      is: true,
      then: Joi.date().required()
        .messages({
          'any.required': 'effectiveStartDate is required when isDefault is true.',
        }),
    })
    .optional()
    .messages({
      'date.min': 'effectiveStartDate must be tomorrow onwards.',
    }),
  effectiveEndDate: Joi.date()
    .min('now')
    .when('effectiveStartDate', {
      is: Joi.exist(),
      then: Joi.date()
        .min(Joi.ref('effectiveStartDate'))
        .required()
        .messages({
          'date.min': 'effectiveEndDate must not be before effectiveStartDate.',
          'any.required': 'effectiveEndDate is required when effectiveStartDate is provided.',
        }),
      otherwise: Joi.date()
        .min('now')
        .optional()
        .messages({
          'date.min': 'effectiveEndDate must be tomorrow onwards.',
        }),
    }),
  gracePeriod: Joi.number().min(0).optional(),
  overtimeTolerance: Joi.number().min(0).optional(),
});

exports.schemaDeleteSchedule = Joi.object({
  scheduleIds: Joi.array().items(Joi.string())
    .empty(Joi.array().length(0))
    .default([]),
});

exports.schemaSetDefaultSchedule = Joi.object({
  effectiveStartDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'effectiveStartDate must be tomorrow onwards.',
      'any.required': 'effectiveStartDate is required.',
    }),
  effectiveEndDate: Joi.date()
    .min(Joi.ref('effectiveStartDate'))
    .required()
    .messages({
      'date.min': 'EffectiveEndDate must not be before effectiveStartDate.',
      'any.required': 'EffectiveEndDate is required.',
    }),
});

exports.schemaGetScheduleListQuery = Joi.object({
  limit: globalSchema.limit(),
  page: globalSchema.page(),
  sortBy: globalSchema.sortBy('DESC'),
  name: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
});
