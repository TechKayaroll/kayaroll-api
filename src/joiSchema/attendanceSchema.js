const Joi = require('joi').extend(require('@joi/date'));
const dayjs = require('dayjs');
const { ATTENDANCE_STATUS, ATTENDANCE_TYPE } = require('../utils/constants');

exports.schemaAttendance = Joi.object({
  lat: Joi.number(),
  long: Joi.number(),
  fileImage: Joi.binary(),
});

exports.schemaAdminCreateAttendance = Joi.object({
  employeeIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
  attendanceType: Joi.string()
    .valid(
      ATTENDANCE_TYPE.IN,
      ATTENDANCE_TYPE.OUT,
    )
    .required(),
  datetime: Joi.date()
    .min(dayjs('1970-01-01').toISOString())
    .max(dayjs().toISOString())
    .required(),
});

exports.schemaAttendanceList = Joi.object({
  from: Joi.date().format('YYYY-MM-DD').empty('').default('1970-01-01'),
  to: Joi.date().format('YYYY-MM-DD').greater(Joi.ref('from')).empty('')
    .default(dayjs(Date.now()).toISOString()),
  sortBy: Joi.string().empty('').valid('ASC', 'DESC').default('DESC'),
  status: Joi.array().items(Joi.string().valid(
    ATTENDANCE_STATUS.PENDING,
    ATTENDANCE_STATUS.REJECTED,
    ATTENDANCE_STATUS.APPROVED,
    ATTENDANCE_STATUS.DISCARDED,
  )).empty(Joi.array().length(0)).default(Object.values(ATTENDANCE_STATUS)),
  limit: Joi.number().integer().positive().min(1)
    .max(100)
    .empty(0)
    .default(100),
  page: Joi.number().integer().positive().min(1)
    .empty(0)
    .default(1),
  attendanceType: Joi.array().items(Joi.string().valid(
    ATTENDANCE_TYPE.IN,
    ATTENDANCE_TYPE.OUT,
  )).empty(Joi.array().length(0)).default(Object.values(ATTENDANCE_TYPE)),
});

exports.schemaAttendanceReportAdmin = Joi.object({
  from: Joi.date()
    .format('YYYY-MM-DD')
    .empty('')
    .default('1970-01-01'),
  to: Joi.date()
    .format('YYYY-MM-DD')
    .greater(Joi.ref('from'))
    .allow(Joi.ref('from'))
    .empty('')
    .default(dayjs(Date.now()).toISOString()),
  employeeIds: Joi.array()
    .items(Joi.string()).required(),
});
exports.schemaAttendanceSummaryAdmin = Joi.object({
  from: Joi.date()
    .format('YYYY-MM-DD')
    .empty('')
    .default(dayjs().subtract('3', 'month').format('YYYY-MM-DD')),
  to: Joi.date()
    .format('YYYY-MM-DD')
    .greater(Joi.ref('from'))
    .allow(Joi.ref('from'))
    .empty('')
    .default(dayjs().format('YYYY-MM-DD')),
  employeeIds: Joi.array()
    .items(Joi.string()).empty(Joi.array().length(0)).default([]),
  limit: Joi.number().integer().positive().min(1)
    .max(100)
    .empty(0)
    .default(100),
  page: Joi.number().integer().positive().min(1)
    .empty(0)
    .default(1),
});
exports.schemaAttendanceListAdmin = Joi.object({
  from: Joi.date().format('YYYY-MM-DD').empty('').default('1970-01-01'),
  to: Joi.date().format('YYYY-MM-DD').greater(Joi.ref('from')).empty('')
    .default(dayjs(Date.now()).toISOString()),
  sortBy: Joi.string().empty('').valid('ASC', 'DESC').default('DESC'),
  status: Joi.array().items(Joi.string().valid(
    ATTENDANCE_STATUS.PENDING,
    ATTENDANCE_STATUS.REJECTED,
    ATTENDANCE_STATUS.APPROVED,
    ATTENDANCE_STATUS.DISCARDED,
  )).empty(Joi.array().length(0)).default(Object.values(ATTENDANCE_STATUS)),
  limit: Joi.number().integer().positive().min(1)
    .max(100)
    .empty(0)
    .default(100),
  page: Joi.number().integer().positive().min(1)
    .empty(0)
    .default(1),
  attendanceType: Joi.array().items(Joi.string().valid(
    ATTENDANCE_TYPE.IN,
    ATTENDANCE_TYPE.OUT,
  )).empty(Joi.array().length(0)).default(Object.values(ATTENDANCE_TYPE)),
  employeeIds: Joi.array().items(Joi.string()).empty(Joi.array().length(0)).default([]),
});

exports.schemaApproval = Joi.object({
  attendanceId: Joi.string().required(),
  status: Joi.string().valid(ATTENDANCE_STATUS.REJECTED, ATTENDANCE_STATUS.APPROVED).required(),
});

exports.schemaAttendanceUpdate = Joi.object({
  attendanceId: Joi.string().required(),
  datetime: Joi.date()
    .min(dayjs('1970-01-01').toISOString())
    .required(),
});
