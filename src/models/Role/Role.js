const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Role = mongoose.model('Role', RoleSchema, 'role');

module.exports = Role;
