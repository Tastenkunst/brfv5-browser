export const blinkTracker = (() => {
  let avgInterval;
  let timerInterval;
  let firstPartAverage;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let runningAvg;

  return {
    startTracking: () => {
      trackingOn = true;

      avgInterval = setInterval(function () {
        runningAvg = totalCount / timer;
      }, 200);

      timerInterval = setInterval(function () {
        timer += 200;
      }, 200);
    },
    stopTracking: () => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearInterval(timerInterval);
    },
    track: () => {
      if (trackingOn) {
        totalCount += 1;
      }
    },
    getCount: () => totalCount,
    getRunningAvg: () => runningAvg,
  };
})();
