const mongoose = require('mongoose');
const Shift = require('../Shift/Shift');
const User = require('../User/User');
const Organization = require('../Organization/Organization');

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
    required: true,
  },
  effectiveEndDate: {
    type: Date,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
    validate: {
      async validator(value) {
        if (value) {
          const count = await mongoose.models.Schedule.countDocuments({
            isDefault: true,
            organizationId: this.organizationId,
          });
          return count === 0;
        }
        return true;
      },
      message: 'Only one document with isDefault set to true is allowed per organization.',
    },
  },

}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

ScheduleSchema.path('effectiveStartDate').validate(
  (value) => value < this.effectiveEndDate,
  'Effective start date must be before effective end date.',
);

ScheduleSchema.path('effectiveEndDate').validate(
  (value) => value > this.effectiveStartDate,
  'Effective end date must be after effective start date.',
);

const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedule');

module.exports = Schedule;
