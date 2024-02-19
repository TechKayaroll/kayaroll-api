const User = require('./User/User');
const Organization = require('./Organization/Organization');
const UserOrganization = require('./Relationship/UserOrganization');
const UserOrganizationLocation = require('./Relationship/UserOrganizationLocation');
const Attendance = require('./Attendance/Attendance');
const Role = require('./Role/Role');
const AttendanceAuditLog = require('./AttendanceAuditLog/AttendanceAuditLog');
const Location = require('./Location/Location');
const Schedule = require('./Schedule/Schedule');
const Shift = require('./Shift/Shift');

const Model = {
  Organization,
  User,
  UserOrganization,
  UserOrganizationLocation,
  Attendance,
  Role,
  AttendanceAuditLog,
  Location,
  Schedule,
  Shift,
};

module.exports = Model;
