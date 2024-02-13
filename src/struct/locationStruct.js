exports.locationData = (reqBody, organizationId) => ({
  name: reqBody.locationName || undefined,
  placeId: reqBody.placeId || undefined,
  lat: reqBody.lat || undefined,
  long: reqBody.long|| undefined ,
  organizationId,
});

exports.locationProfile = (location, employeeIds) => ({
  id: location._id,
  locationName: location.name,
  employeeIds,
});
exports.updateLocationData = (locationPayload) => ({
  name: locationPayload?.locationName,
  placeId: locationPayload?.placeId,
  lat: locationPayload?.lat,
  long: locationPayload?.long,
});
