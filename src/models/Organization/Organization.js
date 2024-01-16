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

const Organization = mongoose.model('Organization', OrganizationSchema, 'organization');
module.exports = Organization;
