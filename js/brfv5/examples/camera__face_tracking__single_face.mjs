import { setupPreloader, writeProgress }  from "../ui/ui__preloader.mjs";
import { setupStats, writeStats }         from "../ui/ui__stats.mjs";
import { resizeElement }                  from "../ui/ui__resize.mjs"

import { setupCameraExample }             from "../utils/utils__init.mjs";
import { setConfigDefaults }              from "../utils/utils__init.mjs";
import { simpleTrack, simpleDraw }        from "../utils/utils__init.mjs";

const fileName              = "camera__face_tracking__single_face";

// Choosing the right model for your project:

// There are two model types available, the standard 68 landmarks version and one with 42 landmarks.
// A 68l model gives you full mouth and eye tracking, while a 42l model doesn't.
// The latter was designed to have a smaller file size and faster processing time for 3d object placement.

// Max, medium and min versions of each model type are a trade-off between file size, speed and accuracy.
// While min files are smaller, they contain fewer cascades and are therefor less accurate in edge cases.
// Max files are larger, the tracking takes longer, but the tracking is more accurate in edge cases.

const modelName             = "42l_min"; // 68l_max, 68l_medium, 68l_min, 42l_max, 42l_medium, 42l_min

// Number of faces to track: the more faces you try to track, the longer the processing time.

let numFacesToTracking      = 1;

// Increasing the number of tracking passes per face increases accuracy and stability.
// Setting it to a low value speeds up the processing. Again it's a trade-off between accuracy and speed.

let numTrackingPasses       = 1;

const configureExample      = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  setConfigDefaults(brfv5Config, imageWidth, imageHeight, numFacesToTracking, numTrackingPasses, true);

  brfv5Config.faceTrackingConfig.maxRotationZReset = 33.0;

  brfv5Manager.configure(brfv5Config);

  console.log(fileName + ": configureExample");
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