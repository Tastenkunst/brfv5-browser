import { blinkTracker } from "./utils__blink_tracker";

export const writeBlinkData = ({ event }) => {
  const url = "http://localhost:3000";
  let path;
  let str;
  const movingAvg = blinkTracker.getMovingAvg();
  const displayingFeedback = blinkTracker.shouldShowBiofeedback();

  const data = {
    movingAvg,
    displayingFeedback,
  };

  //   const options = {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };

  //   switch (event) {
  //     case "phase1Completed":
  //       path = "benchmarkFound";

  //     case "phase2":
  //       path = "biofeedback";
  //       str = "bio feedback session begins";
  //       method = "GET";

  //     default:
  //       method = "POST";
  //       options.body = JSON.stringify(data),
  //   }

  //   options.method = method;

  //   fetch(`${url}/${path}`).then(function (response) {
  //     if (response.status >= 400) {
  //       throw new Error("Bad response from server");
  //     }
  //     //   return response.json();
  //     if (response.status === 200) {
  //       console.log(`${event || 'moving avg'} entry successfully recorded`);
  //     }
  //   });
};

// After they download it then we work with it
// function arrayToCSV(objArray) {
//   const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
//   let str =
//     `${Object.keys(array[0])
//       .map((value) => `"${value}"`)
//       .join(",")}` + "\r\n";

//   return array.reduce((str, next) => {
//     str +=
//       `${Object.values(next)
//         .map((value) => `"${value}"`)
//         .join(",")}` + "\r\n";
//     return str;
//   }, str);
// }
