const mongoose = require('mongoose');
const User = require('../../Users/modules/mapping');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId, ref: User.User,
  },
  organizationId: {
    type: mongoose.Types.ObjectId, ref: User.Organization,
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

exports.Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance');
