import { setupPreloader, writeProgress }  from "../ui/ui__preloader.mjs";
import { setupStats, writeStats }         from "../ui/ui__stats.mjs";
import { resizeElement }                  from "../ui/ui__resize.mjs"

import { setupCameraExample }             from "../utils/utils__init.mjs";
import { setConfigDefaults }              from "../utils/utils__init.mjs";
import { simpleTrack, simpleDraw }        from "../utils/utils__init.mjs";

const fileName              = "camera__face_detection";
const modelName             = "42l_min"; // 68l_max, 68l_medium, 68l_min, 42l_max, 42l_medium, 42l_min

// BRFv5 face tracking is a two step process. The first step is face detection.

const configureExample      = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  setConfigDefaults(brfv5Config, imageWidth, imageHeight, 1, 1, true);

  console.log(fileName + ": configureExample");

  // In this example we only want to detect faces, not track them.

  // Detected faces are drawn as rectangles. All detected faces are drawn in blue.
  // If enough rectangles are detected in a certain area, a merged rectangle (drawn in yellow) is being created.
  // Restricting the region of interest, the area that is actually searched, helps in terms of performance.

  // First, let's disable the face tracking part.
  brfv5Config.enableFaceTracking            = false;

  // Try different configurations by setting them true or false.

  const __config_restrictDetectionToCenter  = true; // Restricts the region of interest to the center of the image.
  const __config_onlyDetectNearFaces        = false; // Only detect faces that are close to the camera
  const __config_onlyDetectFarFaces         = false  && !__config_onlyDetectNearFaces; // ... or further away.
  const __config_filterNoise                = true;  // Filter all rectangles that don't belong to a merged rectangle.

  const inputSize                           = imageWidth > imageHeight ? imageHeight : imageWidth;

  if(__config_restrictDetectionToCenter) {

    // Let's restrict face detection to the center square area of the camera/image input data:

    const innerBorderSize   = 40;
    const size              = inputSize - (innerBorderSize * 2);

    brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
      (imageWidth - size) * 0.5, (imageHeight - size) * 0.5, size, size
    );
  }

  // Input size is most likely 480p or 720p or 1080p, so we need to scale the params accordingly.
  const sizeFactor                              = inputSize / 480.0;

  // defaults:
  brfv5Config.faceDetectionConfig.minFaceSize   = 144 * sizeFactor;
  brfv5Config.faceDetectionConfig.maxFaceSize   = 480 * sizeFactor;

  if(imageWidth < imageHeight) {

    // Portrait mode: probably smartphone, faces tend to be closer to the camera, processing time is an issue,
    // so save a bit of time and increase minFaceSize.

    brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor;
  }

  if(__config_onlyDetectNearFaces) { // detect large faces

    brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor; // larger min face size -> closer to the camera
    brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;
  }

  if(__config_onlyDetectFarFaces) { // detect small faces

    // The smaller you choose to detect faces, the more computational intensive it becomes.
    // The larger the faces you choose to detect, the faster the detection is done.

    // With the following settings BRFv5 should detect faces sizes down to 36px at a 480p resolution,
    // that would be 54px for 720p, 81px for 1080p etc.

    brfv5Config.faceDetectionConfig.minFaceSize =  12 * sizeFactor; // very small min face size
    brfv5Config.faceDetectionConfig.maxFaceSize = 120 * sizeFactor; // small max face size -> further away from the camera

    // Additionally to a smaller face size, the step size of
    // the detection window must also be smaller to actually having an effect.

    // 12 or 24 or 36 and so on, default: 24
    brfv5Config.faceDetectionConfig.faceSizeIncrease = 12;

    // any number larger than 3, default is 12
    brfv5Config.faceDetectionConfig.minNumNeighbors  =  4;

    // dynamically chosen, 2 or higher for fixed search window size increase, default: 0 (dynamic)
    brfv5Config.faceDetectionConfig.stepSize         =  0;
  }

  brfv5Config.faceDetectionConfig.filterNoise = __config_filterNoise;

  // ... and finally actually configure BRFv5.
  brfv5Manager.configure(brfv5Config);
};

const trackExample          = (brfv5Manager, brfv5Config, input, canvas) => {

  const timeStart           = window.performance.now();

  simpleTrack(brfv5Manager, brfv5Config, input, canvas);
  simpleDraw(brfv5Manager, brfv5Config, canvas);

  const timeEnd             = window.performance.now();

  writeStats(timeEnd - timeStart);
};

console.log(fileName + ": setup");

setupPreloader(document.body);
setupStats(document.body);

setupCameraExample(modelName, document.body, configureExample, trackExample, writeProgress, resizeElement);