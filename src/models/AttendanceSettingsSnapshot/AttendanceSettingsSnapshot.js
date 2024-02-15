const mongoose = require('mongoose');

const AttendanceSettingsSnapshotSchema = new mongoose.Schema({
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
  locationAddress: {
    type: String,
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
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const AttendanceSettingsSnapshot = mongoose.model('AttendanceSettingsSnapshot', AttendanceSettingsSnapshotSchema, 'attendanceSettingsSnapshot');

module.exports = AttendanceSettingsSnapshot;
