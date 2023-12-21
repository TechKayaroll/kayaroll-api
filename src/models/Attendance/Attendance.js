const mongoose = require('mongoose');
const User = require('../User/User');
const Organization = require('../Organization/Organization');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId, ref: User,
  },
  organizationId: {
    type: mongoose.Types.ObjectId, ref: Organization,
  },
  attendanceImage: {
    type: 'string',
  },
  long: {
    type: 'number',
  },
  lat: {
    type: 'number',
  },
  attendanceDate: {
    type: 'string',
  },
  attendanceType: {
    type: 'string',
  },
  status: {
    type: 'string',
  },
  browser: {
    type: 'string',
    default: '',
  },
  os: {
    type: 'string',
    default: '',
  },
  platform: {
    type: 'string',
    default: '',
  },
  originId: {
    type: mongoose.Types.ObjectId,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance');

module.exports = Attendance;
