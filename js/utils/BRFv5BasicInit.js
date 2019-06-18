"use strict";

// available models:

// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_68l_max.brfv5"
// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_68l_medium.brfv5"
// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_68l_min.brfv5"

// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_42l_max.brfv5"
// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_42l_medium.brfv5"
// "./js/brfv5/models/BRFv5_JS_tk150619_v5.0.0a_commercial_42l_min.brfv5"

let brfv5             = null;

let _brfv5Manager     = null;
let _brfv5Config      = null;

let _sizeFactor       = 1.0;
let _timeStart        = 0.0;
let _timeEnd          = 0.0;

let _inputObject      = null;
let _inputCanvas      = null;

let _intervalIdTrack  = null;

const initBRFv5       = (appId, modelName) => {

  console.log("BRFv5BasicInit.initBRFv5:", modelName);

  if(!appId)     { appId     = "com.tastenkunst.examples.browser"; }
  if(!modelName) { modelName = "BRFv5_JS_tk140619_v5.0.0a_trial_68l_max"; }

  return new Promise((resolve, reject) => {

    try {

      brfv5 = brfv5Module({

        // mandatory: set your app id (8 to 64 characters, a-z . 0-9 allowed)
        appId: appId,

        // mandatory: set the location of the model binary
        binaryLocation: "./js/brfv5/models/" + modelName + ".brfv5",

        // optional: progress and error handler
        binaryProgress: (p) => { console.log("BRFv5BasicInit:", p); if(typeof writeProgress === "function") writeProgress(p.loaded / p.total) },
        binaryError:    (e) => { console.log("BRFv5BasicInit:", e); },

        // called once the library is ready.
        onInit:         (brfv5Manager, brfv5Config) => {

          _brfv5Manager = brfv5Manager;  // or brfv5.BRFv5Manager.getInstance();
          _brfv5Config  = brfv5Config;   // or brfv5.BRFv5Config.createInstance();

          resolve({ _brfv5Manager, _brfv5Config });
        }
      });

    } catch(e) {

      reject(e);
    }

  }).catch((error) => {

    console.error("BRFv5BasicInit:", error);
  });
};

const scaleConfigToResolution = (sizeFactor, innerBorderSize) => {

  // Set face detection region of interest and parameters scaled to the image base size.

  let imageWidth        = _brfv5Config.imageConfig.inputWidth;
  let imageHeight       = _brfv5Config.imageConfig.inputHeight;

  _brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
    innerBorderSize * sizeFactor,
    innerBorderSize * sizeFactor,
    imageWidth  - (innerBorderSize * 2) * sizeFactor,
    imageHeight - (innerBorderSize * 2) * sizeFactor
  );
  _brfv5Config.faceDetectionConfig.minFaceSize = 144 * sizeFactor;
  _brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;

  // Set face tracking region of interest and parameters scaled to the image base size.

  _brfv5Config.faceTrackingConfig.regionOfInterest.setTo(
    innerBorderSize * sizeFactor,
    innerBorderSize * sizeFactor,
    imageWidth  - (innerBorderSize * 2) * sizeFactor,
    imageHeight - (innerBorderSize * 2) * sizeFactor
  );

  _brfv5Config.faceTrackingConfig.minFaceScaleStart =  50.0  * sizeFactor;
  _brfv5Config.faceTrackingConfig.maxFaceScaleStart = 320.0  * sizeFactor;

  _brfv5Config.faceTrackingConfig.minFaceScaleReset =  35.0  * sizeFactor;
  _brfv5Config.faceTrackingConfig.maxFaceScaleReset = 420.0  * sizeFactor;
};

const configureBRFv5    = (imageWidth, imageHeight, numFacesToTrack, numTrackingPasses, resetByConfidence) => {

  console.log("BRFv5BasicInit.configureBRFv5");

  let inputSize         = imageWidth > imageHeight ? imageHeight : imageWidth;

  // Setup image data dimensions

  _brfv5Config.imageConfig.inputWidth  = imageWidth;
  _brfv5Config.imageConfig.inputHeight = imageHeight;

  _sizeFactor           = inputSize / 480.0;

  scaleConfigToResolution(_sizeFactor, 20.0);

  _brfv5Config.faceTrackingConfig.numFacesToTrack          = numFacesToTrack;
  _brfv5Config.faceTrackingConfig.numTrackingPasses        = numTrackingPasses;
  _brfv5Config.faceTrackingConfig.confidenceThresholdReset = resetByConfidence ? 0.001 : 0.000;

  _brfv5Manager.configure(_brfv5Config);
};

const startTracking     = (trackingFunction, inputObject, inputCanvas, trackOnce) => {

  _inputObject          = inputObject;
  _inputCanvas          = inputCanvas;

  stopTracking();

  console.log("BRFv5BasicInit.startTracking: trackOnce: " + trackOnce);

  if(trackOnce) {

    trackingFunction(_brfv5Manager, _brfv5Config, inputCanvas);

  } else if(_intervalIdTrack === -1) {

    _intervalIdTrack    = setInterval(trackingFunction, 33, _brfv5Manager, _brfv5Config, inputCanvas);
  }
};

const stopTracking      = () => {

  console.log("BRFv5BasicInit.stopTracking");

  clearInterval(_intervalIdTrack);

  _intervalIdTrack      = -1;
};

const simpleTrackAndDraw = (_brfv5Manager, _brfv5Config) => {

  simpleTrack(_brfv5Manager, _brfv5Config);
  simpleDraw(_brfv5Manager, _brfv5Config);
  saveTime();
};

const simpleTrack       = (_brfv5Manager, _brfv5Config) => {

  if (!_brfv5Manager) return;

  _timeStart            = window.performance.now();

  let imageWidth        = _brfv5Config.imageConfig.inputWidth;
  let imageHeight       = _brfv5Config.imageConfig.inputHeight;

  let ctx               = _inputCanvas.getContext("2d");

  ctx.setTransform(-1.0, 0, 0, 1, imageWidth, 0); // A virtual mirror should be... mirrored
  ctx.drawImage(_inputObject, 0, 0, imageWidth, imageHeight);
  ctx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirror to draw the results

  _brfv5Manager.update(ctx.getImageData(0, 0, imageWidth, imageHeight));
};

const simpleDraw        = (_brfv5Manager, _brfv5Config) => {

  let ctx               = _inputCanvas.getContext("2d");

  let drawFaceDetection = true;
  let faces             = _brfv5Manager.getFaces();
  let i;

  drawRect(ctx, _brfv5Config.faceDetectionConfig.regionOfInterest, "#ffd200", 1.0);
  drawRect(ctx, _brfv5Config.faceTrackingConfig.regionOfInterest, "#ffd200", 1.0);

  for(i = 0; i < faces.length; i++) {

    let face = faces[i];

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      drawCircles(ctx, face.landmarks, "#00a0ff", 2.0);
      drawRect(   ctx, face.bounds,    "#ffd200", 3.0);

    } else {

      drawFaceDetection = true;
    }
  }

  if(drawFaceDetection) {

    drawRects(ctx, _brfv5Manager.getDetectedRects(), "#00a0ff", 1.0);
    drawRects(ctx, _brfv5Manager.getMergedRects(),   "#ffd200", 3.0);
  }
};

const saveTime          = () => {

  _timeEnd              = window.performance.now();

  if(typeof writeStats === "function") {

    writeStats(_timeEnd - _timeStart);
  }
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { initBRFv5, configureBRFv5, startTracking, stopTracking, simpleTrackAndDraw, simpleTrack, simpleDraw, saveTime };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { initBRFv5, configureBRFv5, startTracking, stopTracking, simpleTrackAndDraw, simpleTrack, simpleDraw, saveTime }; });

} else if (typeof exports === "object") {

  exports["BRFv5Init"] = { initBRFv5, configureBRFv5, startTracking, stopTracking, simpleTrackAndDraw, simpleTrack, simpleDraw, saveTime };
}