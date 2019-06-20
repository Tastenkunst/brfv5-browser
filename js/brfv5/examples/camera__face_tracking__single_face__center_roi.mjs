import { setupPreloader, writeProgress }  from "../ui/ui__preloader.mjs";
import { setupStats, writeStats }         from "../ui/ui__stats.mjs";
import { resizeElement }                  from "../ui/ui__resize.mjs"

import { setupCameraExample }             from "../utils/utils__init.mjs";
import { setConfigROICenter }             from "../utils/utils__init.mjs";
import { simpleTrack, simpleDraw }        from "../utils/utils__init.mjs";

const fileName              = "camera__face_tracking__single_face";
const modelName             = "68l_max"; // 68l_max, 68l_medium, 68l_min, 42l_max, 42l_medium, 42l_min

let numFacesToTracking      = 1;
let numTrackingPasses       = 3;

const configureExample      = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  // This function sets the region of interest to the center square of the input image.
  // This reduces cpu load while faces are detected.
  setConfigROICenter(brfv5Config, imageWidth, imageHeight, numFacesToTracking, numTrackingPasses, true);

  brfv5Config.faceTrackingConfig.maxRotationZReset = 99.0;

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