"use strict";

const configureExample  = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  configureBRFv5(imageWidth, imageHeight, 1, 3, false);

  console.log("basic__face_detection__example: configureExample");

  // In this example we only want to detect faces, not track them.
  // Detected faces are drawn as rectangles. All detected faces are drawn in blue.
  // If enough rectangles are detected in a certain area, a merged rectangle (drawn in yellow) is being created.
  // Restricting the region of interest, the area that is actually searched, is useful.

  // First, let's disable the face tracking part.
  brfv5Config.enableFaceTracking          = false;

  let __config_restrictDetectionToCenter  = true;  // Restricts the region of interest to the center of the image.
  let __config_onlyDetectNearFaces        = false; // Only detect faces that are close to the camera
  let __config_onlyDetectFarFaces         = false && !__config_onlyDetectNearFaces; // ... or further away.
  let __config_filterNoise                = true;  // Filter all rectangles that don't belong to a merged rectangle.

  let inputSize                           = imageWidth > imageHeight ? imageHeight : imageWidth;
  let sizeFactor                          = inputSize / 480.0;

  if(__config_restrictDetectionToCenter) {

    // Let's restrict face detection to the center square area of the camera/image input data:

    let innerBorderSize = 40;
    let size            = inputSize - (innerBorderSize * 2);

    brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
      (imageWidth - size) * 0.5, (imageHeight - size) * 0.5, size, size
    );
  }

  // defaults:
  brfv5Config.faceDetectionConfig.minFaceSize = 144 * sizeFactor;
  brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;

  if(imageWidth < imageHeight) {

    // portrait: probably smart-phone, faces tend to be closer to the camera, processing time is an issue,
    // so save a bit of time and increase minFaceSize.

    brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor;
  }

  if(__config_onlyDetectNearFaces) { // detect large faces

    brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor; // min face size larger -> closer to the camera
    brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;
  }

  if(__config_onlyDetectFarFaces) { // detect small faces

    // The smaller you choose to detect faces, the more computational intensive it becomes.
    // The larger the faces you choose to detect, the faster the detection is done.

    // With the following settings BRFv5 should detect faces down to 36px width
    // at a 480p resolution, that would be 54px for 720p etc.

    brfv5Config.faceDetectionConfig.minFaceSize =  12 * sizeFactor; // min face size smaller
    brfv5Config.faceDetectionConfig.maxFaceSize = 120 * sizeFactor; // max face size smaller -> further away from the camera

    // Additionally to a smaller face size, the step size of
    // the detection window must also be smaller to have any effect.

    // 12 or 24 or 36 and so on, default: 24
    brfv5Config.faceDetectionConfig.faceSizeIncrease = 12;

    // any number larger than 3, default is 12
    brfv5Config.faceDetectionConfig.minNumNeighbors  =  4;

    // dynamically chosen, 2 or higher for fixed search window size increase, default: 0 (dynamic)
    brfv5Config.faceDetectionConfig.stepSize         =  0;
  }

  brfv5Config.faceDetectionConfig.filterNoise   = __config_filterNoise;

  // ... and finally actually configure BRFv5.
  brfv5Manager.configure(brfv5Config);
};

const trackExample      = (brfv5Manager, brfv5Config, canvas) => {

  simpleTrack(brfv5Manager, brfv5Config); // BRFv5BasicInit

  let ctx               = canvas.getContext("2d");

  drawRect(ctx, brfv5Config.faceDetectionConfig.regionOfInterest, "#ffd200");

  drawRects(ctx, _brfv5Manager.getDetectedRects(), "#00a0ff", 1.0);
  drawRects(ctx, _brfv5Manager.getMergedRects(),   "#ffd200", 3.0);

  saveTime();
};

if (typeof exports === "object" && typeof module === "object") { module.exports = { configureExample, trackExample };
} else if (typeof define === "function" && define["amd"]) {      define([], function() { return { configureExample, trackExample }; });
} else if (typeof exports === "object") {                        exports["BRFv5Init"] = { configureExample, trackExample }; }