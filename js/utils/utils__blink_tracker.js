// import createCsvWriter from "csv-writer";
// const csvWriter = createCsvWriter({
//   path: "out.csv",
//   header: [
//     { id: "runningBlinkAvg", title: "Blink Average" },
//     { id: "crossedThreshold", title: "Crossed Threshold" },
//   ],
// });

export const blinkTracker = (() => {
  let avgInterval;
  let timerInterval;
  let benchmark;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let movingAvg;
  let isBenchmarking = false;

  const startTracking = () => {
    isBenchmarking = true;
    trackingOn = true;
    console.log("Benchmarking has begun");
    console.log("Blink tracking has started successfully");

    avgInterval = setInterval(function () {
      // if (trackingOn) {
      movingAvg = totalCount / timer;
      // csvWriter
      //   .writeRecords(data)
      //   .then(() => console.log("The CSV file was written successfully"))
      //   .catch((error) =>
      //     console.log("Error occured while writting the CSV", error)
      //   );

      // }
    }, 200);

    timerInterval = setInterval(function () {
      // if (trackingOn)
      timer += 200;
    }, 200);

    setTimeout(() => {
      isBenchmarking = false;
      benchmark = movingAvg;
      console.log(
        "Benchmarking has been completed - the benchmark is:",
        benchmark
      );
    }, 150000);
  };

  const stopTracking = () => {
    trackingOn = false;
    clearInterval(avgInterval);
    clearInterval(timerInterval);
  };

  const addBlink = () => {
    if (trackingOn) {
      totalCount += 1;
    }
  };

  return {
    startTracking,
    stopTracking,
    addBlink,
    getCount: () => totalCount,
    getMovingAvg: () => movingAvg,
    isBenchmarking: () => isBenchmarking,
    shouldShowBiofeedback: () => movingAvg > benchmark,
  };
})();
