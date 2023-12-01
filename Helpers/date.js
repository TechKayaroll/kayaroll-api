const dayjs = require('dayjs');

const secondsToDuration = (totalSeconds) => {
  let seconds = parseInt(totalSeconds, 10);

  // Ensure non-negative value
  seconds = Math.max(seconds, 0);

  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

function getTotalSecondsWithData(attendances) {
  let totalSeconds = 0;
  let inEntry = null;
  const data = [];

  attendances.forEach((eachAttendance) => {
    const { attendanceType, attendanceDate } = eachAttendance;
    if (attendanceType === 'In' && !inEntry) {
      inEntry = {
        time: dayjs(attendanceDate),
        attendance: eachAttendance,
        outTime: null,
      };
    } else if (attendanceType === 'Out' && inEntry) {
      inEntry.outTime = {
        time: dayjs(attendanceDate),
        attendance: eachAttendance,
      };

      const inTime = {
        time: inEntry.time,
        attendance: inEntry.attendance,
      };
      const outTime = {
        time: inEntry.outTime.time,
        attendance: inEntry.outTime.attendance,
      };

      const duration = outTime.time.diff(inTime.time, 'second');
      totalSeconds += duration;

      data.push({
        inTime: inTime.time.toISOString(),
        outTime: outTime.time.toISOString(),
        attendanceIn: inTime.attendance,
        attendanceOut: outTime.attendance,
        duration: secondsToDuration(duration),
      });

      inEntry = null;
    }
  });

  return { totalSeconds, data };
}

module.exports = {
  getTotalSecondsWithData,
  secondsToDuration,
};
