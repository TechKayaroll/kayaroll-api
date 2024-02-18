const mongoose = require('mongoose');

const ScheduleShiftSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const ScheduleShift = mongoose.model('ScheduleShift', ScheduleShiftSchema, 'scheduleShift');

module.exports = ScheduleShift;
