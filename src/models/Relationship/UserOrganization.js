const mongoose = require('mongoose');
const Organization = require('../Organization/Organization');

const { generateUserIdByNameAndIndex } = require('../../utils/common');

const UserOrganizationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uniqueUserId: {
    type: 'string',
    unique: true,
    immutable: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

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
      const uniqueId = generateUserIdByNameAndIndex(organization.name, userCountInOrg);
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
