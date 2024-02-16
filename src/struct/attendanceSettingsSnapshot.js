exports.AttendanceSnapshotData = (location) => ({
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationAddress: location.address,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
});

exports.AttendanceSnapshot = (attendanceSnapshot) => {
  if (attendanceSnapshot) {
    return {
      attendanceSnapshotId: attendanceSnapshot?._id || undefined,
      locationName: attendanceSnapshot?.locationName || undefined,
      locationLat: attendanceSnapshot?.locationLat || undefined,
      locationLong: attendanceSnapshot?.locationLong || undefined,
      locationAddress: attendanceSnapshot?.locationAddress || undefined,
      locationPlaceId: attendanceSnapshot?.locationPlaceId || undefined,
      locationRadius: attendanceSnapshot?.locationRadius || undefined,
    };
  }
  return null;
};
