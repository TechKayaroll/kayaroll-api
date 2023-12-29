// const mongoose = require('mongoose');
// const User = require('../User/User');
// const Organization = require('../Organization/Organization');
// const UserOrganization = require('../Relationship/UserOrganization');

// const AttendanceSchema = new mongoose.Schema({
//   userOrganizationId: {
//     type: mongoose.Types.ObjectId,
//     ref: UserOrganization,
//     required: true,
//   },
//   actionType: {
//     enum: ['Create', 'Edit', 'Delete'],
//     required: true,
//   },
//   attendanceId: {
//     type: mongoose.Types.ObjectId,
//   },
// }, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

// const Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance');

// module.exports = Attendance;

// // Attendance - ID 1 (Existing)

// // Admin Edit/Create/Delete
// // Step 1: Attendance - ID 2 - Origin ID - 1 - CreatedBy (User/Admin)
// // Step 2: AttendanceAuditLog - UserOrganizationId - actionType (edit) - attendanceId 1

// // Created Data:
// // Attendance - ID 2 (New Edited) - origin ID 1 -  CreatedBy (User/Admin)
// // AttendanceAuditLog - ID 1 - attendanceID 1

// // Admin Dashboard
// // Attendance - ID 1 - origin ID null - CreatedBy (User/Admin)
// // Attendance - ID 2 - origin ID 1 (Find AttendanceAuditLog with AttendanceID == originID )


// // Attendance ID 2 
// // - other data
// // - sourceBy (Admin)
// // - action: Edit
// // - 
