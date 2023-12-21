const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const UserOrganizationSchema = new mongoose.Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const UserOrganization = mongoose.model('UserOrganization', UserOrganizationSchema, 'userOrganization');
module.exports = UserOrganization;
