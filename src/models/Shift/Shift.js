const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Shift = mongoose.model('Shift', ShiftSchema, 'shift');

module.exports = Shift;
