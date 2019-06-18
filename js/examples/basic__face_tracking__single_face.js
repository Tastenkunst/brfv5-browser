"use strict";

const configureExample  = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  // The most basic, default value, single face tracking. Just detection > tracking > drawing results.

  // Basic config:
  //   resolution (width, height)
  //   number of faces to track
  //   number of tracking passes per face and
  //   whether to reset by simple confidence value (available from 3 tracking passes)
  configureBRFv5(imageWidth, imageHeight, 1, 3, true);

  console.log("basic__face_tracking__single_face: configureExample");
};

const trackExample      = (brfv5Manager, brfv5Config, canvas) => {

  simpleTrackAndDraw(brfv5Manager, brfv5Config); // BRFv5BasicInit
};

if (typeof exports === "object" && typeof module === "object") { module.exports = { configureExample, trackExample };
} else if (typeof define === "function" && define["amd"]) {      define([], function() { return { configureExample, trackExample }; });
} else if (typeof exports === "object") {                        exports["BRFv5Init"] = { configureExample, trackExample }; }