const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
});

const Role = mongoose.model('Role', RoleSchema, 'role');

module.exports = Role;
