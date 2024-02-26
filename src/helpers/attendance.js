const dayjs = require('dayjs');
const { ATTENDANCE_TYPE, SHIFT_DAY, ATTENDANCE_STATUS_HISTORY } = require('../utils/constants');

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

const attendanceStatusHistory = (
  attendanceType,
  actualTime,
  scheduleSnapshots = [],
) => {
  let status = ATTENDANCE_STATUS_HISTORY.NO_SCHEDULE;
  let timeDiff = 0;

  const currentDayIndex = dayjs(actualTime).day();
  const currentDay = Object.values(SHIFT_DAY)[currentDayIndex];

  scheduleSnapshots.forEach((schedule) => {
    const { gracePeriod, overtimeTolerance, scheduleShifts = [] } = schedule;
    scheduleShifts.forEach((shift) => {
      if (shift.day === currentDay) {
        shift.shifts.forEach((individualShift) => {
          const { startTime, endTime } = individualShift;
          const workScheduleStart = dayjs(startTime);
          const workScheduleEnd = dayjs(endTime);
          const currentTime = dayjs(actualTime);

          if (attendanceType === ATTENDANCE_TYPE.IN) {
            const isLate = currentTime.isAfter(
              workScheduleStart.add(gracePeriod, 'minute'),
            ) && currentTime.isBefore(workScheduleEnd);
            const onTime = (currentTime.isAfter(workScheduleStart)
                && currentTime.isBefore(workScheduleEnd))
              || currentTime.isBefore(workScheduleStart)
              || currentTime.isSame(workScheduleStart)
              || currentTime.isSame(workScheduleEnd);

            if (isLate) {
              status = ATTENDANCE_STATUS_HISTORY.LATE;
              timeDiff = workScheduleStart
                .add(gracePeriod, 'minutes')
                .diff(currentTime, 'seconds');
            } else if (onTime) {
              status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
              timeDiff = 0;
            }
          } else if (attendanceType === ATTENDANCE_TYPE.OUT) {
            const isEarlyDeparture = currentTime.isBefore(workScheduleEnd)
              && currentTime.isAfter(workScheduleStart.add(gracePeriod, 'minute'));
            const isOvertime = currentTime.isAfter(
              workScheduleEnd.add(overtimeTolerance, 'minutes'),
            )
              || currentTime.isSame(
                workScheduleEnd.add(overtimeTolerance, 'minutes'),
              );
            const onTime = (currentTime.isAfter(workScheduleStart)
                && currentTime.isBefore(
                  workScheduleEnd.add(overtimeTolerance, 'minutes'),
                ))
              || currentTime.isSame(workScheduleStart)
              || currentTime.isSame(
                workScheduleEnd.add(overtimeTolerance, 'minutes'),
              );

            if (isEarlyDeparture) {
              status = ATTENDANCE_STATUS_HISTORY.EARLY_DEPARTURE;
              timeDiff = workScheduleEnd.diff(currentTime, 'seconds');
            } else if (isOvertime) {
              status = ATTENDANCE_STATUS_HISTORY.OVERTIME;
              timeDiff = currentTime.diff(
                workScheduleEnd.add(overtimeTolerance, 'minutes'),
                'seconds',
              );
            } else if (onTime) {
              status = ATTENDANCE_STATUS_HISTORY.ON_TIME;
              timeDiff = 0;
            }
          }
        });
      }
    });
  });

  return { status, timeDiff };
};

module.exports = {
  pairInAndOut,
  attendanceStatusHistory,
};
