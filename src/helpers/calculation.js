function haversine(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude from degrees to radians
  const toRadians = (angle) => angle * (Math.PI / 180);

  // Earth radius in meters
  const R = 6371000;

  // Calculate differences in coordinates
  const dlat = toRadians(lat2 - lat1);
  const dlon = toRadians(lon2 - lon1);

  // Haversine formula
  const a = Math.sin(dlat / 2) * Math.sin(dlat / 2)
            + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
            * Math.sin(dlon / 2) * Math.sin(dlon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  const distance = R * c;

  return distance;
}

function isWithinRadius(centerRadius, otherRadius, radius) {
  const distance = haversine(centerRadius[0], centerRadius[1], otherRadius[0], otherRadius[1]);
  return distance <= radius;
}

module.exports = {
  isWithinRadius,
};
