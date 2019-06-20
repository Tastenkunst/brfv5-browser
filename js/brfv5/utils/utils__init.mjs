import { setupCanvas, drawCircle, drawCircles, drawRect, drawRects, drawInput, drawInputMirrored }
                            from "../ui/ui__canvas.mjs"
import { startCamera }      from "../utils/utils__camera.mjs"

import { brfv5Module }      from "../BRFv5_JS_tk190619_v5.0.0a2_trial.js";

const libraryName           = "BRFv5_JS_tk190619_v5.0.0a2_trial";

// appId (mandatory): 8 to 64 characters, a-z . 0-9 allowed
const appId                 = "brfv5.examples.browser";

const fileName              = "brfv5_basic_init";
export const brfv5          = {};

let _sizeFactor             = 1.0;
let _intervalIdTrack        = -1;

const loadModel             = (modelName, onProgress) => {

  console.log(fileName + ": loadModel:", modelName);

  if(!modelName) { throw "Please provide a modelName." }

  return new Promise((resolve, reject) => {

    try {

      // appId (mandatory): 8 to 64 characters, a-z . 0-9 allowed
      brfv5.appId           = appId;

      // binaryLocation (mandatory):
      brfv5.binaryLocation  = "./js/brfv5/models/" + libraryName + "_" + modelName + ".brfv5";

      // optional: progress and error handler
      brfv5.binaryProgress  = onProgress;
      brfv5.binaryError     = (e) => { reject(e); };

      // called once the library is ready.
      brfv5.onInit          = (brfv5Manager, brfv5Config) => { resolve({ brfv5Manager, brfv5Config }); };

      brfv5Module(brfv5);

    } catch(e) {

      reject(e);
    }

  }).catch((error) => {

    console.error(fileName + ":", error);
  });
};

export const setupCameraExample = async (modelName, domNode, configureExample, trackExample, writeProgress, resizeElement ) => {

  console.log(fileName + ": setupCameraExample");

  const { brfv5Manager, brfv5Config } = await loadModel(modelName, writeProgress);
  const { resolution, video }         = await startCamera({ width:  640, height:  480, frameRate: 30 });

  if(brfv5Manager && brfv5Config && resolution && video) {

    const canvas = setupCanvas(resolution.width, resolution.height, domNode, resizeElement);

    if(typeof configureExample == "function") configureExample(brfv5Manager, brfv5Config, resolution.width, resolution.height);
    startTracking( brfv5Manager, brfv5Config, trackExample, video, canvas, false);
  }
};

export const setConfigDefaults = (brfv5Config, imageWidth, imageHeight, numFacesToTrack, numTrackingPasses, resetByConfidence) => {

  console.log(fileName + ": setConfigDefaults");

  const inputSize           = imageWidth > imageHeight ? imageHeight : imageWidth;

  // Setup image data dimensions

  brfv5Config.imageConfig.inputWidth  = imageWidth;
  brfv5Config.imageConfig.inputHeight = imageHeight;

  _sizeFactor              = inputSize / 480.0;
  const innerBorderSize    = 20.0;

  // Set face detection region of interest and parameters scaled to the image base size.

  brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
    innerBorderSize * _sizeFactor,
    innerBorderSize * _sizeFactor,
    imageWidth  - (innerBorderSize * 2) * _sizeFactor,
    imageHeight - (innerBorderSize * 2) * _sizeFactor
  );
  brfv5Config.faceDetectionConfig.minFaceSize = 144 * _sizeFactor;
  brfv5Config.faceDetectionConfig.maxFaceSize = 480 * _sizeFactor;

  // Set face tracking region of interest and parameters scaled to the image base size.

  brfv5Config.faceTrackingConfig.regionOfInterest.setTo(
    innerBorderSize * _sizeFactor,
    innerBorderSize * _sizeFactor,
    imageWidth  - (innerBorderSize * 2) * _sizeFactor,
    imageHeight - (innerBorderSize * 2) * _sizeFactor
  );

  brfv5Config.faceTrackingConfig.minFaceScaleStart        =  50.0  * _sizeFactor;
  brfv5Config.faceTrackingConfig.maxFaceScaleStart        = 320.0  * _sizeFactor;

  brfv5Config.faceTrackingConfig.minFaceScaleReset        =  35.0  * _sizeFactor;
  brfv5Config.faceTrackingConfig.maxFaceScaleReset        = 420.0  * _sizeFactor;

  brfv5Config.faceTrackingConfig.numFacesToTrack          = numFacesToTrack;
  brfv5Config.faceTrackingConfig.numTrackingPasses        = numTrackingPasses;
  brfv5Config.faceTrackingConfig.confidenceThresholdReset = resetByConfidence ? 0.001 : 0.000;
};

export const setConfigROICenter = (brfv5Config, imageWidth, imageHeight, numFacesToTrack, numTrackingPasses, resetByConfidence) => {

  console.log(fileName + ": setConfigROICenter");

  const inputSize           = imageWidth > imageHeight ? imageHeight : imageWidth;

  // Setup image data dimensions

  brfv5Config.imageConfig.inputWidth  = imageWidth;
  brfv5Config.imageConfig.inputHeight = imageHeight;

  _sizeFactor              = inputSize / 480.0;
  const innerBorderSize    = 40.0;
  const roiSize            = inputSize - (innerBorderSize * 2) * _sizeFactor;

  // Set face detection region of interest and parameters scaled to the image base size.

  brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
    (imageWidth  - roiSize) * 0.5, (imageHeight - roiSize) * 0.5, roiSize, roiSize
  );
  brfv5Config.faceDetectionConfig.minFaceSize = 144 * _sizeFactor;
  brfv5Config.faceDetectionConfig.maxFaceSize = 480 * _sizeFactor;

  // Set face tracking region of interest and parameters scaled to the image base size.

  brfv5Config.faceTrackingConfig.regionOfInterest.setTo(
    (imageWidth  - roiSize) * 0.5, (imageHeight - roiSize) * 0.5, roiSize, roiSize
  );

  brfv5Config.faceTrackingConfig.minFaceScaleStart        =  50.0  * _sizeFactor;
  brfv5Config.faceTrackingConfig.maxFaceScaleStart        = 320.0  * _sizeFactor;

  brfv5Config.faceTrackingConfig.minFaceScaleReset        =  35.0  * _sizeFactor;
  brfv5Config.faceTrackingConfig.maxFaceScaleReset        = 420.0  * _sizeFactor;

  brfv5Config.faceTrackingConfig.numFacesToTrack          = numFacesToTrack;
  brfv5Config.faceTrackingConfig.numTrackingPasses        = numTrackingPasses;
  brfv5Config.faceTrackingConfig.confidenceThresholdReset = resetByConfidence ? 0.001 : 0.000;
};

export const startTracking  = (brfv5Manager, brfv5Config, trackingFunction, inputObject, inputCanvas, trackOnce) => {

  stopTracking();

  console.log(fileName + ": startTracking: trackOnce: " + trackOnce);

  if(trackOnce) {

    trackingFunction(brfv5Manager, brfv5Config, inputCanvas);

  } else if(_intervalIdTrack === -1) {

    _intervalIdTrack        = setInterval(trackingFunction, 33, brfv5Manager, brfv5Config, inputObject, inputCanvas);
  }
};

export const stopTracking   = () => {

  console.log(fileName + ": stopTracking");

  clearInterval(_intervalIdTrack);

  _intervalIdTrack          = -1;
};

export const simpleTrack    = (brfv5Manager, brfv5Config, input, canvas) => {

  const imageWidth          = brfv5Config.imageConfig.inputWidth;
  const imageHeight         = brfv5Config.imageConfig.inputHeight;

  const ctx                 = canvas.getContext("2d");

  // drawInput(ctx, imageWidth, imageHeight, input);
  drawInputMirrored(ctx, imageWidth, imageHeight, input);

  brfv5Manager.update(ctx.getImageData(0, 0, imageWidth, imageHeight));
};

export const simpleDraw     = (brfv5Manager, brfv5Config, canvas) => {

  const ctx                 = canvas.getContext("2d");
  const faces               = brfv5Manager.getFaces();

  let drawFaceDetection     = false;
  let i;

  if(brfv5Config.enableFaceTracking) {

    drawRect(ctx, brfv5Config.faceTrackingConfig.regionOfInterest, "#ffd200", 1.0);

    for(i = 0; i < faces.length; i++) {

      const face = faces[i];

      if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

        drawCircles(ctx, face.landmarks, "#00a0ff", 2.0 * _sizeFactor);
        drawRect(   ctx, face.bounds,    "#ffd200", 3.0);

      } else {

        drawFaceDetection = true;
      }
    }
  }

  if(!brfv5Config.enableFaceTracking || drawFaceDetection) {

    drawRect(ctx, brfv5Config.faceDetectionConfig.regionOfInterest, "#ffd200", 1.0);

    drawRects(ctx, brfv5Manager.getDetectedRects(), "#00a0ff", 1.0);
    drawRects(ctx, brfv5Manager.getMergedRects(),   "#ffd200", 3.0);
  }
};