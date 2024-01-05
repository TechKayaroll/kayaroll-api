const mongoose = require('mongoose');
const UserOrganization = require('../Relationship/UserOrganization');
const Attendance = require('../Attendance/Attendance');
const { ATTENDANCE_AUDIT_LOG, USER_ROLE } = require('../../utils/constants');

const AttendanceAuditLogSchema = new mongoose.Schema({
  actionType: {
    type: 'string',
    enum: Object.values(ATTENDANCE_AUDIT_LOG),
    required: true,
  },
  attendanceId: {
    type: mongoose.Types.ObjectId,
    ref: Attendance,
    required: true,
  },
  // Action Performed By:
  userOrganizationId: {
    type: mongoose.Types.ObjectId,
    ref: UserOrganization,
  },
  userFullname: {
    type: 'string',
    default: '',
  },
  userEmail: {
    type: 'string',
    default: '',
  },
  userOrganization: {
    type: 'string',
    default: '',
  },
  userRole: {
    type: 'string',
    enum: Object.values(USER_ROLE),
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const AttendanceAuditLog = mongoose.model('AttendanceAuditLog', AttendanceAuditLogSchema, 'attendanceAuditLog');

module.exports = AttendanceAuditLog;

// Attendance - ID 1 (Existing)

// Admin Edit/Create/Delete
// Step 1: Attendance - ID 2 - Origin ID - 1 - CreatedBy (User/Admin)
// Step 2: AttendanceAuditLog - UserOrganizationId - actionType (edit) - attendanceId 1

// Created Data:
// Attendance - ID 2 (New Edited) - origin ID 1 -  CreatedBy (User/Admin)
// AttendanceAuditLog - ID 1 - attendanceID 1

// Admin Dashboard
// Attendance - ID 1 - origin ID null - CreatedBy (User/Admin)
// Attendance - ID 2 - origin ID 1 (Find AttendanceAuditLog with AttendanceID == originID )

// Attendance ID 2
// - other data
// - sourceBy (Admin)
// - action: Edit
// -
