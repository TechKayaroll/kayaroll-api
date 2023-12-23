const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const UserService = require('../../services/userService');

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
  },
});

async function userOrgIdPreSaveHook(next) {
  try {
    if (!this.uniqueUserId) {
      this.uniqueUserId = await UserService.generateUniqueUserOrgId(this.organizationId);
      await this.constructor.create(this);
    } else {
      await this.constructor.create(this);
    }
    next();
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      // Handle duplicate key error (MongoDB error code for unique constraint violation)
      this.uniqueUserId = await UserService.generateUniqueUserOrgId(this.organizationId);
      return this.save(next); // Retry saving
    }
    next(error);
  }
  return Promise.resolve();
}

UserOrganizationSchema.pre('save', userOrgIdPreSaveHook);

const UserOrganization = mongoose.model('UserOrganization', UserOrganizationSchema, 'userOrganization');
module.exports = UserOrganization;
