const dayjs = require("dayjs");

const SingleShiftData = (data) => ({
  day: data?.day,
  shifts: data?.shifts.map((shiftTime) => ({
    startTime: shiftTime.startTime,
    endTime: shiftTime.endTime,
  })),
});

const ShiftFormatedTime = (shift) => ({
  id: shift?._id,
  name: shift?.name,
  day: shift?.day,
  shifts: shift?.shifts.map((shiftTime) => ({
    startTime: dayjs(shiftTime.startTime).toDate(),
    endTime: dayjs(shiftTime.endTime).toDate(),
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
