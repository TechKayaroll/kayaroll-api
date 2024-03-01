const { ATTENDANCE_LOCATION_STATUS } = require('../utils/constants');

exports.AttendanceSnapshotData = (location) => ({
  locationId: location?._id,
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
  locationAddress: location?.address || '',
  locationStatus: location.locationStatus || ATTENDANCE_LOCATION_STATUS.NO_LOCATION,
  locationDistance: location.locationDistance || 0,
});

exports.AttendanceScheduleSnapshots = (schedules) => {
  const scheduleSnapshots = schedules.map((schedule) => ({
    scheduleId: schedule?._id,
    scheduleName: schedule.name,
    scheduleShifts: schedule.shifts.map((shift) => ({
      name: shift.name || '',
      day: shift.day,
      shifts: shift.shifts.map((eachShift) => ({
        startTime: eachShift.startTime,
        endTime: eachShift.endTime,
      })),
    })),
    isDefault: schedule.isDefault,
    effectiveStartDate: schedule.effectiveStartDate,
    effectiveEndDate: schedule.effectiveEndDate,
    gracePeriod: schedule.gracePeriod,
    overtimeTolerance: schedule.gracePeriod,
  }));
  return scheduleSnapshots;
};
