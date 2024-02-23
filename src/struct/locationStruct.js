const globalStruct = require('.');

exports.locationData = (location) => ({
  id: location._id,
  name: location.name,
  placeId: location.placeId,
  lat: location.lat,
  long: location.long,
  radius: location.radius,
  address: location?.address || '',
  organizationId: location.organizationId,
});

exports.createLocationData = (reqBody, organizationId) => ({
  name: reqBody.locationName,
  placeId: reqBody.placeId,
  lat: reqBody.lat,
  long: reqBody.long,
  radius: reqBody.radius,
  address: reqBody.address,
  organizationId,
});

exports.locationOrganizationData = (locationOrg) => ({
  id: locationOrg._id,
  name: locationOrg.name,
  placeId: locationOrg.placeId,
  lat: locationOrg.lat,
  long: locationOrg.long,
  radius: locationOrg.radius,
  organizationId: locationOrg.organizationId._id,
  organizationName: locationOrg.organizationId.name,
  invitationCode: locationOrg.organizationId.invitationCode,
});

exports.updateLocationData = (locationPayload) => ({
  name: locationPayload?.locationName,
  placeId: locationPayload?.placeId,
  lat: locationPayload?.lat,
  long: locationPayload?.long,
  radius: locationPayload?.radius,
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

exports.LocationPagination = globalStruct.Pagination;
