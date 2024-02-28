const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const UserOrganization = require('../Relationship/UserOrganization');

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
  password: {
    type: 'string',
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  userOrganizationId: {
    type: Schema.Types.ObjectId,
    ref: UserOrganization,
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const User = mongoose.model('User', UserSchema, 'user');
module.exports = User;
