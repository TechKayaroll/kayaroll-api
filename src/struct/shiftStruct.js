const dayjs = require('dayjs');

const SingleShiftData = (data) => ({
  day: data?.day,
  shifts: data?.shifts.map((shiftTime) => ({
    startTime: shiftTime.startTime,
    endTime: shiftTime.endTime,
  })),
});

const ShiftFormatedTime = (shift) => ({
  day: shift?.day,
  shifts: shift?.shifts.map((shiftTime) => ({
    startTime: dayjs(shiftTime.startTime).format('hh:mm'),
    endTime: dayjs(shiftTime.endTime).format('hh:mm'),
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
