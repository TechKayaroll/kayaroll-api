const User = require('./User/User');
const Organization = require('./Organization/Organization');
const UserOrganization = require('./Relationship/UserOrganization');
const Attendance = require('./Attendance/Attendance');
const Role = require('./Role/Role');
const AttendanceAuditLog = require('./AttendanceAuditLog/AttendanceAuditLog');

const Model = {
  Organization,
  User,
  UserOrganization,
  Attendance,
  Role,
  AttendanceAuditLog,
};

module.exports = Model;
