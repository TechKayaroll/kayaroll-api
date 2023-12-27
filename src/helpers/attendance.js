function pairInAndOut(dayAttendances) {
  const pairedAttendances = [];
  let inAttendance = null;
  let outAttendance = null;

  dayAttendances.forEach((attendance, index) => {
    const isLastAttendance = index === dayAttendances.length - 1;

    if (attendance.attendanceType === 'In') {
      inAttendance = attendance;
    } else if (attendance.attendanceType === 'Out') {
      outAttendance = attendance;
    }

    if (inAttendance && outAttendance) {
      pairedAttendances.push({ attendanceIn: inAttendance, attendanceOut: outAttendance });
      inAttendance = null;
      outAttendance = null;
    } else if (outAttendance && inAttendance === null) {
      pairedAttendances.push({ attendanceIn: null, attendanceOut: outAttendance });
      outAttendance = null;
    } else if (isLastAttendance && inAttendance) {
      pairedAttendances.push({ attendanceIn: inAttendance, attendanceOut: outAttendance });
      inAttendance = null;
    }
  });

  return pairedAttendances;
}

module.exports = {
  pairInAndOut,
};
