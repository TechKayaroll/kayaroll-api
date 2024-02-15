exports.AttendanceSnapshotData = (location) => ({
  locationName: location.name,
  locationLat: location.lat,
  locationLong: location.long,
  locationAddress: location.address,
  locationPlaceId: location.placeId,
  locationRadius: location.radius,
});
