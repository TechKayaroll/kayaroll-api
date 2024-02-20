const sortAndCheckOverlap = (shifts) => {
  shifts.sort((a, b) => a.startTime - b.startTime);
  return shifts.every((currentShift, index) => {
    if (index === 0) {
      return true;
    }
    return currentShift.startTime >= shifts[index - 1].endTime;
  });
};

// param "shifts": shiftStruct.SingleShiftData[]
const validateShifts = (shifts) => sortAndCheckOverlap(shifts);

module.exports = {
  validateShifts,
};
