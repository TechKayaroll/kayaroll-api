const dayjs = require('dayjs');
const { SHIFT_DAY } = require('../utils/constants');

const SingleShiftData = (data) => ({
  day: data?.day,
  shifts: data?.shifts.map((shiftTime) => ({
    startTime: shiftTime.inTime,
    endTime: shiftTime.outTime,
  })),
});

const ShiftFormatedTime = (shift) => ({
  day: shift?.day,
  shifts: shift?.shifts.map((shiftTime) => ({
    startTime: dayjs(shiftTime.inTime).format('hh:mm'),
    endTime: dayjs(shiftTime.outTime).format('hh:mm'),
  })),
});

// const MutlipleShiftData = (reqBody) => {
//   const { shifts } = reqBody;
//   const shiftDatas = [];
//   Object.values(SHIFT_DAY).forEach((eachDay, index) => {
//     const shiftsByDay = shifts[index];
//     if (shiftsByDay) {
//       const shift = SingleShiftData({ day: eachDay, shifts: shiftsByDay });
//       shiftDatas.push(shift);
//     }
//   });
//   return shiftDatas;
// };

module.exports = {
  SingleShiftData,
  ShiftFormatedTime,
};
