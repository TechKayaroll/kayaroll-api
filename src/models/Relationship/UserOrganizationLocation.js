const mongoose = require('mongoose');

const User = require('../User/User');
const Location = require('../Location/Location');
const Organization = require('../Organization/Organization');
const UserOrganization = require('./UserOrganization');

const UserOrganizationLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true,
  },
  userOrganizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserOrganization,
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Location,
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const UserOrganizationLocation = mongoose.model(
  'UserOrganizationLocation',
  UserOrganizationLocationSchema,
  'userOrganizationLocation',
);
module.exports = UserOrganizationLocation;
