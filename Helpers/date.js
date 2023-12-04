const secondsToDuration = (totalSeconds) => {
  let seconds = parseInt(totalSeconds, 10);

  // Ensure non-negative value
  seconds = Math.max(seconds, 0);

  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

module.exports = {
  secondsToDuration,
};
