const mongoose = require('mongoose');
const Shift = require('../Shift/Shift');
const User = require('../User/User');
const Organization = require('../Organization/Organization');

const validateDate = (value) => value instanceof Date && !Number.isNaN(value);

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shifts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Shift,
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true,
  },
  effectiveStartDate: {
    type: Date,
    validate: [{
      validator: validateDate,
      message: 'Effective start date must be a valid date.',
    },
    {
      validator(value) {
        return !this.effectiveEndDate || (value && value < this.effectiveEndDate);
      },
      message: 'Effective start date must be before effective end date.',
    }],
  },
  effectiveEndDate: {
    type: Date,
    validate: [{
      validator: validateDate,
      message: 'Effective end date must be a valid date.',
    },
    {
      validator(value) {
        return !this.effectiveStartDate || (value && value > this.effectiveStartDate);
      },
      message: 'Effective end date must be after effective start date.',
    }],
  },
  isDefault: {
    type: Boolean,
    default: false,
    validate: {
      async validator(value) {
        if (value) {
          const existingDefaultSchedule = await mongoose.models.Schedule.findOne({
            isDefault: true,
            organizationId: this.organizationId,
            _id: { $ne: this._id }, // Exclude the current document being updated
          });
          return !existingDefaultSchedule;
        }
        return true;
      },
      message: 'Only one document with isDefault set to true is allowed per organization.',
      onlyWhenSetToTrue: true,
    },
  },
  gracePeriod: {
    type: Number,
    default: 30,
    required: true,
    min: 0,
  },
  overtimeTolerance: {
    type: Number,
    default: 30,
    required: true,
    min: 0,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedule');

module.exports = Schedule;
