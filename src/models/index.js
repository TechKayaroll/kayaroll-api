const User = require('./User/User');
const Organization = require('./Organization/Organization');
const UserOrganization = require('./Relationship/UserOrganization');
const UserOrganizationLocation = require('./Relationship/UserOrganizationLocation');
const Attendance = require('./Attendance/Attendance');
const Role = require('./Role/Role');
const AttendanceAuditLog = require('./AttendanceAuditLog/AttendanceAuditLog');
const Location = require('./Location/Location');
const AttendanceSettingsSnapshot = require('./AttendanceSettingsSnapshot/AttendanceSettingsSnapshot');

const Model = {
  Organization,
  User,
  UserOrganization,
  UserOrganizationLocation,
  Attendance,
  Role,
  AttendanceAuditLog,
  Location,
  AttendanceSettingsSnapshot,
};

module.exports = Model;
