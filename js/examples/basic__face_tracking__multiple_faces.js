"use strict";

const configureExample  = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  // Set numFacesToTrack to 2 and numTrackingPAsses to 1.
  // Tracking more than one face is CPU intensive.
  // Less tracking passes result it faster processing.
  configureBRFv5(imageWidth, imageHeight, 2, 1, false);

  console.log("basic_track_basic__face_tracking__multiple_faces: configureExample");
};

const trackExample      = (brfv5Manager, brfv5Config, canvas) => {

  simpleTrackAndDraw(brfv5Manager, brfv5Config); // BRFv5BasicInit
};

if (typeof exports === "object" && typeof module === "object") { module.exports = { configureExample, trackExample };
} else if (typeof define === "function" && define["amd"]) {      define([], function() { return { configureExample, trackExample }; });
} else if (typeof exports === "object") {                        exports["BRFv5Init"] = { configureExample, trackExample }; }