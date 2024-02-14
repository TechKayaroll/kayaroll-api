const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
    minlength: 3,
  },
  invitationCode: {
    type: 'string',
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

async function removeDuplicateLocationsPreSaveHook(next) {
  try {
    const uniqueLocations = [...new Set(this.locations)];
    this.locations = uniqueLocations;
    next();
  } catch (error) {
    next(error);
  }
}

OrganizationSchema.pre('save', removeDuplicateLocationsPreSaveHook);
const Organization = mongoose.model('Organization', OrganizationSchema, 'organization');
module.exports = Organization;
