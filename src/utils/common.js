const dayjs = require('dayjs');
const { generateRandomString, generateCodeByString, getRandomString } = require('./randomString');
const { ATTENDANCE_TYPE, ATTENDANCE_STATUS_HISTORY } = require('./constants');

const padNumber = (number, length) => number.toString().padStart(length, '0');

const generateUserIdByNameAndIndex = (name, indexCount) => {
  const prefix = generateCodeByString(3, name);
  const randomString = generateRandomString(2).toUpperCase();
  const paddedCounter = padNumber(indexCount + 1, 3);

  const uniqueId = `${prefix}-${randomString}${paddedCounter}`;
  return uniqueId;
};

const generateCompanyCode = (companyName) => {
  const companyCode = generateCodeByString(3, companyName);
  const rndStr = getRandomString(3);
  return `${companyCode}-${rndStr}-${dayjs(Date.now()).format('DDMMYY')}`.toUpperCase();
};

// eslint-disable-next-line max-len
const calculationStatusAttendanceHistory = async (attendanceType, actualTime, attendanceSchedule) => {
  let workScheduleEnd = 0;
  let workScheduleStart = 0;
  let overtimeTolerance = 0;
  let gracePeriod = 0;
  let diffTime = 0;
  let status = '';

  attendanceSchedule.forEach((data) => {
    data.scheduleShifts.forEach((dataSchedule) => {
      if (dataSchedule.day === dayjs(actualTime).day) {
        dataSchedule.shifts.forEach((dataShifts) => {
          gracePeriod = data.gracePeriod;
          overtimeTolerance = data.overtimeTolerance;
          workScheduleStart = dataShifts.startTime;
          workScheduleEnd = dataShifts.endTime;
        });
      }
    });
  });

  switch (attendanceType) {
    case ATTENDANCE_TYPE.IN:
      if (actualTime <= workScheduleStart) {
        status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
        diffTime = 0;
        break;
      }

      // eslint-disable-next-line max-len
      if ((actualTime > workScheduleStart) && actualTime <= workScheduleStart.add(gracePeriod).minutes()) {
        status = ATTENDANCE_STATUS_HISTORY.LATE;
        diffTime = actualTime.add(gracePeriod).seconds() - actualTime;
        break;
      }

      // eslint-disable-next-line max-len
      if ((actualTime > workScheduleStart) && actualTime > workScheduleStart.add(gracePeriod).minutes()) {
        status = ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE;
        diffTime = actualTime.add(gracePeriod).seconds() - actualTime;
      }
      break;
    default:
      if (actualTime < workScheduleEnd) {
        status = ATTENDANCE_STATUS_HISTORY.EARLY_DEPARTURE;
        diffTime = workScheduleEnd - actualTime;
        break;
      }

      if (actualTime > workScheduleEnd.add(overtimeTolerance).minutes()) {
        status = ATTENDANCE_STATUS_HISTORY.OVERTIME;
        diffTime = actualTime.add(overtimeTolerance).seconds() - actualTime;
        break;
      }

      // eslint-disable-next-line max-len
      if ((actualTime === workScheduleEnd) && actualTime <= workScheduleEnd.add(overtimeTolerance).minutes()) {
        status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
        diffTime = actualTime.add(overtimeTolerance).seconds() - actualTime;
        break;
      }

      // eslint-disable-next-line max-len
      if ((actualTime > workScheduleEnd) && actualTime > workScheduleEnd.add(overtimeTolerance).minutes()) {
        status = ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE;
        diffTime = actualTime.add(overtimeTolerance).seconds() - actualTime;
        break;
      }
  }
  return { status, diffTime };
};

module.exports = {
  padNumber,
  generateUserIdByNameAndIndex,
  generateCompanyCode,
  calculationStatusAttendanceHistory,
};
