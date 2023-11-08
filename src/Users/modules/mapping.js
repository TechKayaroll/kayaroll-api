const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: {
    type: 'string',
  },
  profilePict: {
    type: 'string',
  },
  email: {
    type: 'string',
    required: true,
  },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
});

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
  invitationCode: {
    type: 'string',
  },
});

const UserOrganizationSchema = new mongoose.Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const RoleSchema = new mongoose.Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: 'string',
    required: true,
  },
});

exports.User = mongoose.model('User', UserSchema, 'user');
exports.Organization = mongoose.model('Organization', OrganizationSchema, 'organization');
exports.UserOrganization = mongoose.model('UserOrganization', UserOrganizationSchema, 'userOrganization');
exports.Role = mongoose.model('Role', RoleSchema, 'role');
