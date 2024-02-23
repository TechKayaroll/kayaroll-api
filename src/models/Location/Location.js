const mongoose = require('mongoose');
const Organization = require('../Organization/Organization');

const LocationSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
  placeId: {
    type: 'string',
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  long: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Location = mongoose.model('Location', LocationSchema, 'location');

module.exports = Location;
