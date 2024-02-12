exports.locationData = (req) => ({
  name: req.body.locationName,
  placeId: req.body.placeId,
  lat: req.body.lat,
  long: req.body.long,
});

exports.locationProfile = (location, employeeIds) => ({
  id: location._id,
  locationName: location.name,
  employeeIds,
});
