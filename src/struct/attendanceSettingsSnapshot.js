exports.AttendanceSnapshotData = (location) => ({
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
  locationAddress: location?.address || '',
});

exports.AttendanceScheduleSnapshots = (schedules) => {
  const scheduleSnapshots = schedules.map((schedule) => ({
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
