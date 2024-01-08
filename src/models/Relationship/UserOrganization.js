const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Organization = require('../Organization/Organization');
const { generateUserIdByNameAndIndex } = require('../../utils/common');

const UserOrganizationSchema = new mongoose.Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  uniqueUserId: {
    type: 'string',
    unique: true,
    immutable: true,
    required: true,
  },
});

async function userOrgIdPreSaveHook(next) {
  try {
    if (!this.uniqueUserId) {
      const organization = await Organization.findById(this.organizationId);
      if (!organization) {
        throw new Error('Organization not found.'); // Handle the error appropriately
      }
      const userCountInOrg = await this.constructor.countDocuments({
        organizationId: this.organizationId,
      });
      const uniqueId = generateUserIdByNameAndIndex(organization.name, userCountInOrg + 1);
      this.uniqueUserId = uniqueId;
    }
    next();
  } catch (error) {
    next(error);
  }
}

UserOrganizationSchema.pre('save', userOrgIdPreSaveHook);

const UserOrganization = mongoose.model('UserOrganization', UserOrganizationSchema, 'userOrganization');
module.exports = UserOrganization;
