const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedule');

module.exports = Schedule;
