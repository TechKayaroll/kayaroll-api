const { ATTENDANCE_TYPE } = require('../utils/constants');

function pairInAndOut(dayAttendances) {
  const pairedAttendances = [];
  let inAttendance = null;
  let outAttendance = null;

  let isCycled = false;
  dayAttendances.forEach((attendance, index) => {
    const isLastAttendance = index === dayAttendances.length - 1;

    if (attendance.attendanceType === ATTENDANCE_TYPE.IN && !inAttendance) {
      inAttendance = attendance;
    } else if (attendance.attendanceType === ATTENDANCE_TYPE.OUT) {
      outAttendance = attendance;
    }

    if (inAttendance && outAttendance) {
      pairedAttendances.push({
        attendanceIn: inAttendance,
        attendanceOut: outAttendance,
      });
      inAttendance = null;
      outAttendance = null;
      isCycled = true;
    } else if (outAttendance && inAttendance === null) {
      if (!isCycled) {
        pairedAttendances.push({
          attendanceIn: inAttendance,
          attendanceOut: outAttendance,
        });
        isCycled = true;
      }
      outAttendance = null;
    } else if (isLastAttendance && inAttendance) {
      pairedAttendances.push({
        attendanceIn: inAttendance,
        attendanceOut: outAttendance,
      });
      inAttendance = null;
    }
  });

  return pairedAttendances;
}

module.exports = {
  pairInAndOut,
};
