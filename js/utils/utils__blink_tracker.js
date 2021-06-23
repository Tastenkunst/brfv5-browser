// import createCsvWriter from "csv-writer";
// const csvWriter = createCsvWriter({
//   path: "out.csv",
//   header: [
//     { id: "runningBlinkAvg", title: "Blink Average" },
//     { id: "crossedThreshold", title: "Crossed Threshold" },
//   ],
// });

import { addEntry } from "../utils/utils__add_to_local_storage.js";

export const blinkTracker = (() => {
  let avgInterval;
  let timerInterval;
  let benchmarkTimeout;
  let experimentTimeout;
  let benchmark;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let movingAvg;
  let isBenchmarking = false;

  const startTracking = () => {
    localStorage.clear();
    isBenchmarking = true;
    trackingOn = true;
    console.log("Benchmarking has begun");
    console.log("Blink tracking has started successfully");

    avgInterval = setInterval(function () {
      movingAvg = totalCount / timer;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: benchmark && shouldShowBiofeedback(),
        benchmark: benchmark && benchmark,
      });
    }, 200);

    timerInterval = setInterval(function () {
      timer += 200;
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      isBenchmarking = false;
      benchmark = movingAvg;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: false,
        benchmark,
      });

      console.log(
        "Benchmarking has been completed - the benchmark is:",
        benchmark
      );

      experimentTimeout = setTimeout(() => {
        trackingOn = false;
        clearInterval(avgInterval);
        clearInterval(timerInterval);
        clearTimeout(benchmarkTimeout);

        console.log("The experiment has now been completed");
      }, 150000);
    }, 150000);
  };

  const stopTracking = () => {
    localStorage.clear();
    trackingOn = false;
    clearInterval(avgInterval);
    clearInterval(timerInterval);
    clearTimeout(benchmarkTimeout);
    console.log("The experiment was stopped - all data have now been deleted");
  };

  const addBlink = () => {
    if (trackingOn) {
      totalCount += 1;
    }
  };

  const shouldShowBiofeedback = () => movingAvg > benchmark;

  return {
    startTracking,
    stopTracking,
    addBlink,
    getCount: () => totalCount,
    getMovingAvg: () => movingAvg,
    isBenchmarking: () => isBenchmarking,
    shouldShowBiofeedback,
    tracking: () => trackingOn,
  };
})();
