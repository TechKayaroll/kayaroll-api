const mongoose = require('mongoose');
const User = require('../User/User');
const Organization = require('../Organization/Organization');
const UserOrganization = require('../Relationship/UserOrganization');
const { ATTENDANCE_TYPE, ATTENDANCE_STATUS, SHIFT_DAY } = require('../../utils/constants');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User,
    required: true,
  },
  organizationId: {
    type: mongoose.Types.ObjectId,
    ref: Organization,
    required: true,
  },
  userOrganizationId: {
    type: mongoose.Types.ObjectId,
    ref: UserOrganization,
    required: true,
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
    enum: Object.values(ATTENDANCE_TYPE),
    required: true,
  },
  status: {
    type: 'string',
    enum: Object.values(ATTENDANCE_STATUS),
    default: ATTENDANCE_STATUS.PENDING,
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
  // origin of the Attendance
  originId: {
    type: mongoose.Types.ObjectId,
  },
  // Created By which user to know Employee / Admin ?
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: User,
    required: true,
  },
  attendanceLocationSnapshots: [{
    locationName: {
      type: String,
      immutable: true,
      required: true,
    },
    locationLat: {
      type: Number,
      immutable: true,
      required: true,
    },
    locationLong: {
      type: Number,
      immutable: true,
      required: true,
    },
    locationPlaceId: {
      type: String,
      immutable: true,
      required: true,
    },
    locationRadius: {
      type: Number,
      immutable: true,
      required: true,
    },
  }],
  attendanceScheduleSnapshots: [{
    scheduleName: {
      type: String,
      required: true,
      immutable: true,
    },
    scheduleShifts: [{
      name: {
        type: String,
        immutable: true,
      },
      day: {
        type: String,
        enum: Object.values(SHIFT_DAY),
        required: true,
        immutable: true,
      },
      shifts: [{
        startTime: {
          type: Date,
          required: true,
          immutable: true,
        },
        endTime: {
          type: Date,
          required: true,
          immutable: true,
        },
      }],
    }],
    effectiveStartDate: {
      type: Date,
      required: true,
      immutable: true,
    },
    effectiveEndDate: {
      type: Date,
      required: true,
      immutable: true,
    },
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance');

module.exports = Attendance;
