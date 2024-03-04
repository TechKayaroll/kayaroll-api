/* eslint-disable max-len */
const dayjs = require('dayjs');
const {
  ATTENDANCE_TYPE, SHIFT_DAY, ATTENDANCE_STATUS_HISTORY, ATTENDANCE_LOCATION_STATUS,
} = require('../utils/constants');
const { getDistance } = require('./calculation');

const pairInAndOut = (dayAttendances) => {
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
};

function attendanceStatusSchedule(
  attendanceType,
  actualTime,
  attendanceSchedule,
) {
  let status = ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE;
  let timeDiff = 0;

  const currentTime = dayjs(actualTime);
  const currentDayIndex = currentTime.day();
  const currentDay = Object.values(SHIFT_DAY)[currentDayIndex];
  const startOfDay = dayjs(currentTime).startOf('day');

  attendanceSchedule.forEach((schedule) => {
    const { gracePeriod, overtimeTolerance, scheduleShifts } = schedule;
    scheduleShifts.forEach((shift) => {
      if (shift.day === currentDay) {
        shift.shifts.forEach((individualShift) => {
          const { startTime, endTime } = individualShift;
          const workScheduleStart = dayjs(startTime)
            .set('year', currentTime.year())
            .set('month', currentTime.month())
            .set('date', currentTime.date());
          const workScheduleEnd = dayjs(endTime)
            .set('year', currentTime.year())
            .set('month', currentTime.month())
            .set('date', currentTime.date());
          const startGracePeriod = workScheduleStart.add(gracePeriod, 'minute');
          const endOvertimeTolerace = workScheduleEnd.add(
            overtimeTolerance,
            'minute',
          );

          if (attendanceType === ATTENDANCE_TYPE.IN) {
            // isLate = currTime >= (workScheduleStart + gracePeriod) &&  currTime <= workScheduleEnd
            // onTime = currTime >= 00:00:00 && currTime < (workScheduleStart + gracePeriod)
            const isLate = (currentTime.isAfter(startGracePeriod)
                && currentTime.isBefore(workScheduleEnd))
              || currentTime.isSame(workScheduleEnd)
              || currentTime.isSame(workScheduleStart);

            const onTime = (currentTime.isAfter(startOfDay)
                && currentTime.isBefore(startGracePeriod))
              || currentTime.isSame(startOfDay);

            if (isLate) {
              status = ATTENDANCE_STATUS_HISTORY.LATE;
              timeDiff = currentTime.diff(startGracePeriod, 'seconds');
            } else if (onTime) {
              status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
              timeDiff = 0;
            }
            // console.log({
            //   isLate,
            //   onTime,
            //   workScheduleStart: workScheduleStart.format(
            //     'DD MMM YYYY, HH:mm:ss',
            //   ),
            //   workScheduleEnd: workScheduleEnd.format('DD MMM YYYY, HH:mm:ss'),
            //   currentTime: currentTime.format('DD MMM YYYY, HH:mm:ss'),
            //   startGracePeriod: startGracePeriod.format(
            //     'DD MMM YYYY, HH:mm:ss',
            //   ),
            //   endTime: workScheduleEnd.format('DD MMM YYYY, HH:mm:ss'),
            // });
          } else if (attendanceType === ATTENDANCE_TYPE.OUT) {
            // isEarlyDeparture = currTime < workScheduleEnd && currTime > (workschedulestart + graceperiod)
            // isOvertime = currTime >= (workscheduleEnd + overtimeTolerance)
            // onTime = currentTime >= workScheduleStart && currTime <= (workScheduleEnd + overtimeTolerance)

            const isEarlyDeparture = currentTime.isBefore(workScheduleEnd)
              && currentTime.isAfter(workScheduleStart);
            const isOvertime = currentTime.isAfter(endOvertimeTolerace)
              || currentTime.isSame(endOvertimeTolerace);
            const onTime = (currentTime.isAfter(workScheduleStart)
                && currentTime.isBefore(endOvertimeTolerace))
              || currentTime.isSame(workScheduleStart)
              || currentTime.isSame(endOvertimeTolerace);

            if (isEarlyDeparture) {
              status = ATTENDANCE_STATUS_HISTORY.EARLY_DEPARTURE;
              timeDiff = workScheduleEnd.diff(currentTime, 'seconds');
            } else if (isOvertime) {
              status = ATTENDANCE_STATUS_HISTORY.OVERTIME;
              timeDiff = currentTime.diff(endOvertimeTolerace, 'seconds');
            } else if (onTime) {
              status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
              timeDiff = 0;
            }
            // console.log({
            //   isEarlyDeparture,
            //   isOvertime,
            //   onTime,
            //   currentTime: currentTime.format('HH:mm:ss'),
            //   startTime: workScheduleStart.format('HH:mm:ss'),
            //   endTime: workScheduleEnd.format('HH:mm:ss'),
            //   startTimeGracePeriod: workScheduleStart
            //     .add(gracePeriod, 'minutes')
            //     .format('HH:mm:ss'),
            //   endTimeOvertimeTolerance: workScheduleEnd
            //     .add(overtimeTolerance, 'minutes')
            //     .format('HH:mm:ss'),
            // });
          }
        });
      }
    });
  });

  return { status, timeDiff };
}

function attendanceLocationStatus(attLocationSnapshot, attendanceCoordinate) {
  const result = {
    status: ATTENDANCE_LOCATION_STATUS.NO_LOCATION,
    distance: 0,
  };
  if (!attLocationSnapshot || !attendanceCoordinate?.lat || !attendanceCoordinate?.long) {
    return result;
  }

  const { locationLat, locationLong, locationRadius } = attLocationSnapshot;
  const centerCoordinates = [locationLat, locationLong];
  const otherCoordinates = [attendanceCoordinate.lat, attendanceCoordinate.long];
  const distance = getDistance(centerCoordinates, otherCoordinates);
  const withinRad = distance <= locationRadius;
  result.distance = distance;
  result.status = withinRad ? ATTENDANCE_LOCATION_STATUS.INSIDE_RADIUS : ATTENDANCE_LOCATION_STATUS.OUTSIDE_RADIUS;
  return result;
}
module.exports = {
  pairInAndOut,
  attendanceStatusSchedule,
  attendanceLocationStatus,
};
