const User = require('./User/User');
const Organization = require('./Organization/Organization');
const UserOrganization = require('./Relationship/UserOrganization');
const Attendance = require('./Attendance/Attendance');
const Role = require('./Role/Role');

const Model = {
  Organization,
  User,
  UserOrganization,
  Attendance,
  Role,
};

module.exports = Model;