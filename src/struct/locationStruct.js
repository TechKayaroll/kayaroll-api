exports.locationQuery = (reqBody, organizationId) => ({
  name: reqBody.locationName || undefined,
  placeId: reqBody.placeId || undefined,
  lat: reqBody.lat || undefined,
  long: reqBody.long || undefined,
  organizationId,
});

exports.locationData = (location) => ({
  id: location._id,
  name: location.name,
  placeId: location.placeId,
  lat: location.lat,
  long: location.long,
  organizationId: location.organizationId,
});

exports.locationOrganizationData = (locationOrg) => ({
  id: locationOrg._id,
  name: locationOrg.name,
  placeId: locationOrg.placeId,
  lat: locationOrg.lat,
  long: locationOrg.long,
  organizationId: locationOrg.organizationId._id,
  organizationName: locationOrg.organizationId.name,
  invitationCode: locationOrg.organizationId.invitationCode,
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

exports.geocodeResults = (result) => ({
  address: result.formatted_address,
  latitude: result.geometry.location.lat,
  longitude: result.geometry.location.lng,
  placeId: result.place_id,
});

exports.locationPrediction = (prediction) => ({
  address: prediction.description,
  placeId: prediction.place_id,
});
