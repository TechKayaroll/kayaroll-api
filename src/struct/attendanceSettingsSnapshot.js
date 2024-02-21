exports.AttendanceSnapshotData = (location) => ({
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
});

exports.AttendanceScheduleSnapshots = (schedules) => {
  const scheduleSnapshots = schedules.map((schedule) => ({
    scheduleName: schedule.name,
    scheduleShifts: schedule.shifts.map((shift) => ({
      name: shift.name,
      day: shift.day,
      shifts: shift.shifts,
    })),
    effectiveStartDate: schedule.effectiveStartDate,
    effectiveEndDate: schedule.effectiveEndDate,
  }));
  return scheduleSnapshots;
};
