const Joi = require('joi');
const globalSchema = require('.');

exports.schemaCreateSchedule = Joi.object({
  scheduleName: Joi.string(),
  employeeIds: Joi.array().items(Joi.string())
    .empty(Joi.array().length(0))
    .default([]),
  isDefault: Joi.boolean().default(false),
  shifts: Joi.array().items(
    Joi.array().length(7).items(
      Joi.object({
        inTime: Joi.date().required(),
        outTime: Joi.date().required(),
      }),
    ),
  ).min(1),
  effectiveStartDate: Joi.date().optional(),
  effectiveEndDate: Joi.date().optional(),
});

exports.schemaDeleteSchedule = Joi.object({
  scheduleIds: Joi.array().items(Joi.string())
    .empty(Joi.array().length(0))
    .default([]),
});

exports.schemaSetDefaultSchedule = Joi.object({
  effectiveStartDate: Joi.date().optional(),
  effectiveEndDate: Joi.date().optional(),
});

exports.schemaGetScheduleListQuery = Joi.object({
  limit: globalSchema.limit,
  page: globalSchema.page,
});
