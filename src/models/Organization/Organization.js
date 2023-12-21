const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
  invitationCode: {
    type: 'string',
  },
});

const Organization = mongoose.model('Organization', OrganizationSchema, 'organization');
module.exports = Organization;
