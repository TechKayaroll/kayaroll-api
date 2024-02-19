const { SHIFT_DAY } = require('../utils/constants');

const SingleShiftData = (data) => ({
  day: [data?.day],
  shifts: data.shifts.map((shiftTime) => ({
    startTime: shiftTime.inTime,
    endTime: shiftTime.outTime,
  })),
});

const MutlipleShiftData = (reqBody) => {
  const { shifts } = reqBody;
  const shiftDatas = Object.values(SHIFT_DAY).map((eachDay, index) => {
    const shiftsByDay = shifts[index];
    return SingleShiftData({ day: eachDay, shifts: shiftsByDay });
  });
  return shiftDatas;
};

module.exports = {
  MutlipleShiftData,
};
