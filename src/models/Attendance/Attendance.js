const mongoose = require('mongoose');
const User = require('../User/User');
const Organization = require('../Organization/Organization');
const UserOrganization = require('../Relationship/UserOrganization');
const {
  ATTENDANCE_TYPE,
  ATTENDANCE_STATUS,
  SHIFT_DAY,
  ATTENDANCE_STATUS_HISTORY,
  ATTENDANCE_LOCATION_STATUS,
} = require('../../utils/constants');

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
    type: String,
  },
  long: {
    type: Number,
  },
  lat: {
    type: Number,
  },
  attendanceDate: {
    type: String,
  },
  attendanceType: {
    type: String,
    enum: Object.values(ATTENDANCE_TYPE),
    required: true,
  },
  status: {
    type: 'string',
    enum: Object.values(ATTENDANCE_STATUS),
    default: ATTENDANCE_STATUS.PENDING,
  },
  attendanceStatusSchedule: {
    type: String,
    enum: Object.values(ATTENDANCE_STATUS_HISTORY),
    default: ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE,
  },
  attendanceStatusLocation: {
    type: String,
    enum: Object.values(ATTENDANCE_LOCATION_STATUS),
    default: ATTENDANCE_LOCATION_STATUS.NO_LOCATION,
  },
  timeDiff: {
    type: Number,
    default: 0,
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
    locationId: {
      type: String,
      immutable: true,
    },
    locationName: {
      type: String,
      immutable: true,
    },
    locationLat: {
      type: Number,
      immutable: true,
    },
    locationLong: {
      type: Number,
      immutable: true,
    },
    locationPlaceId: {
      type: String,
      immutable: true,
    },
    locationRadius: {
      type: Number,
      immutable: true,
    },
    locationAddress: {
      type: String,
      immutable: true,
    },
    locationStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_LOCATION_STATUS),
      default: ATTENDANCE_LOCATION_STATUS.NO_LOCATION,
    },
    locationDistance: {
      type: Number,
      default: 0,
    },
  }],
  attendanceScheduleSnapshots: [{
    scheduleId: {
      type: String,
      immutable: true,
    },
    scheduleName: {
      type: String,
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
    isDefault: {
      type: Boolean,
      immutable: true,
    },
    effectiveStartDate: {
      type: Date,
      immutable: true,
    },
    effectiveEndDate: {
      type: Date,
      immutable: true,
    },
    gracePeriod: {
      type: Number,
      immutable: true,
    },
    overtimeTolerance: {
      type: Number,
      immutable: true,
    },
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance');

module.exports = Attendance;
