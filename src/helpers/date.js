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

const secondsToHMS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

const isWeekend = (date) => {
  const dayOfWeek = date.day();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
};

const formatDate = (date, format = 'DD MMM YYYY, HH:mm:ss') => (date ? dayjs(date).format(format) : '');

const calculateTotalTime = (attendanceIn, attendanceOut) => (attendanceIn && attendanceOut
  ? dayjs(attendanceOut.attendanceDate).diff(dayjs(attendanceIn.attendanceDate), 'second')
  : 0);

module.exports = {
  secondsToDuration,
  secondsToHMS,
  isWeekend,
  formatDate,
  calculateTotalTime
};
