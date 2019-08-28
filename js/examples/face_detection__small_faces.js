/**
 * BRFv5 - Face Detection - Detailed Options
 *
 * This example only detects faces and omits the tracking part entirely.
 *
 * This is the same as face_detection__details, but with
 * __config_onlyDetectNearFaces = false and
 * __config_onlyDetectFarFaces = true
 *
 * to be able to showcase small faces detection.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

export const configureExample = (brfv5Config) => {

  // In this example we only want to >>detect<< faces, not >>track<< them.

  // Detected faces are drawn as rectangles. All detected faces are drawn in blue.
  // If enough rectangles are detected in a certain area, a merged rectangle
  // (drawn in yellow) is being created. Restricting the region of interest,
  // the area that is actually searched, helps a lot in terms of performance.

  // First, let's disable the face tracking part.
  brfv5Config.enableFaceTracking      = false;

  // Try different configurations by setting them true or false.

  // Restricts the region of interest to the center of the image.
  const __config_restrictToCenter     = false;

  // Only detect faces that are close to the camera ...
  const __config_onlyDetectNearFaces  = false;

  // ... or further away.
  const __config_onlyDetectFarFaces   = true && !__config_onlyDetectNearFaces;

  // Filter all rectangles that don't belong to a merged rectangle.
  const __config_filterNoise          = true;

  const imageWidth            = brfv5Config.imageConfig.inputWidth
  const imageHeight           = brfv5Config.imageConfig.inputHeight

  const inputSize             = Math.min(imageWidth, imageHeight)

  const fdConfig              = brfv5Config.faceDetectionConfig

  if(__config_restrictToCenter) {

    // Let's restrict face detection to the square center area of the image input data:

    const innerBorderSize     = 40;
    const size                = inputSize - (innerBorderSize * 2);

    fdConfig.regionOfInterest.setTo(
      (imageWidth - size)  * 0.5,
      (imageHeight - size) * 0.5,
      size, size
    );

  } else {

    // Let's cover almost the whole image.

    fdConfig.regionOfInterest.setTo(5, 5, imageWidth - 10, imageHeight - 10);
  }

  // Input size is likely 480p, 720p or 1080p, so we need to scale the params accordingly.
  const scaleFactor           = inputSize / 480.0;

  // defaults are as set for 480p (scaleFactor === 1.0):
  fdConfig.minFaceSize        = 144 * scaleFactor;
  fdConfig.maxFaceSize        = 480 * scaleFactor;

  if(imageWidth < imageHeight) {

    // Portrait mode: probably a mobile device, faces tend to be closer to
    // the camera, processing time is an issue, so save a bit of time and increase
    // minFaceSize (minimal face size to search for).

    fdConfig.minFaceSize      = 240 * scaleFactor;
  }

  if(__config_onlyDetectNearFaces) { // detect large faces

    // larger min face size -> closer to the camera
    fdConfig.minFaceSize      = 240 * scaleFactor;
    fdConfig.maxFaceSize      = 480 * scaleFactor;
  }

  if(__config_onlyDetectFarFaces) { // detect small faces

    // The smaller you choose to detect faces, the more computational intensive
    // Face Detection becomes. The larger the faces you choose to detect, the
    // faster the detection is done.

    // With the following settings BRFv5 should detect faces sizes down to 36px
    // at a 480p resolution, that would be 54px for 720p, 81px for 1080p etc.

    fdConfig.minFaceSize      =  24 * scaleFactor; // very small min face size
    fdConfig.maxFaceSize      = 120 * scaleFactor; // only far away faces

    // Additionally to a smaller face size, the step size of
    // the detection window must also be smaller to actually have an effect.

    // 12 or 24 or 36 and so on, default: 24
    fdConfig.faceSizeIncrease = 12;

    // any number larger than 3, default is 12
    fdConfig.minNumNeighbors  =  2;

    // default: 0 (dynamic), or >= 2 for fixed search window size increase.
    fdConfig.stepSize         =  4;
  }

  // filterNoise removes all rectangles that don't belong to a merged rectangle.
  fdConfig.filterNoise        = __config_filterNoise;
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  // Only draw Face Detection results here, since Face Tracking is disabled...

  drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas)

  return false // ... and omit the rest of the default drawing.
}

const exampleConfig = {

  // If you don't need Face Tracking at all, you can choose 'fd_only' as the model of choice.
  // This would reduce the file size and loading time significantly.
  // BRFv5 can't reinitialize with a different model, so we choose '68l' anyway.

  // modelName: 'fd_only',

  onConfigure:  configureExample,
  onTracking:   handleTrackingResults
}

// run() will be called automatically after 1 second, if run isn't called immediately after the script was loaded.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1

export const run = () => {

  clearTimeout(timeoutId)
  setupExample(exampleConfig)

  if(window.selectedSetup === 'image') {

    trackImage('./assets/tracking/' + window.selectedImage)

  } else {

    trackCamera()
  }
}

timeoutId = setTimeout(() => { run() }, 1000)

export default { run }
