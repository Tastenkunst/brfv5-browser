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
  let runningAvg;
  let isBenchmarking = false;

  return {
    startTracking: () => {
      isBenchmarking = true;
      trackingOn = true;
      console.log("Benchmarking has begun");
      console.log("Blink tracking has started successfully");

      avgInterval = setInterval(function () {
        runningAvg = totalCount / timer;
        // csvWriter
        //   .writeRecords(data)
        //   .then(() => console.log("The CSV file was written successfully"))
        //   .catch((error) =>
        //     console.log("Error occured while writting the CSV", error)
        //   );
      }, 200);

      timerInterval = setInterval(function () {
        if (trackingOn) timer += 200;
      }, 200);

      setTimeout(() => {
        isBenchmarking = false;
        benchmark = runningAvg;
        console.log(
          "Benchmarking has been completed - the benchmark is:",
          benchmark
        );
      }, 150000);
    },
    stopTracking: () => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearInterval(timerInterval);
    },
    addBlink: () => {
      if (trackingOn) {
        totalCount += 1;
      }
    },
    getCount: () => totalCount,
    getRunningAvg: () => runningAvg,
    isBenchmarking: () => isBenchmarking,
  };
})();
