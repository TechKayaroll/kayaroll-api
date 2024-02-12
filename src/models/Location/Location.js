const mongoose = require('mongoose');

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
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Location = mongoose.model('Location', LocationSchema, 'location');

module.exports = Location;
