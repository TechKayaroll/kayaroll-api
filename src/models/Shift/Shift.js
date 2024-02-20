const mongoose = require('mongoose');
const { SHIFT_DAY } = require('../../utils/constants');

const ShiftSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  day: {
    type: String,
    enum: Object.values(SHIFT_DAY),
    required: true,
  },
  shifts: [{
    startTime: {
      type: Date,
      required() {
        return typeof this.endTime !== 'undefined';
      },
    },
    endTime: {
      type: Date,
      required() {
        return typeof this.startTime !== 'undefined';
      },
    },
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Shift = mongoose.model('Shift', ShiftSchema, 'shift');

module.exports = Shift;
