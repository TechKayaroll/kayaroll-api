const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const RoleSchema = new mongoose.Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: 'string',
    required: true,
  },
});

const Role = mongoose.model('Role', RoleSchema, 'role');

module.exports = Role;
