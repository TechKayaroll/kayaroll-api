exports.AttendanceSnapshotData = (location) => ({
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
});
