import { setupPreloader, writeProgress }  from "../ui/ui__preloader.mjs";
import { setupStats, writeStats }         from "../ui/ui__stats.mjs";
import { resizeElement }                  from "../ui/ui__resize.mjs"

import { setupCameraExample }             from "../utils/utils__init.mjs";
import { setConfigDefaults }              from "../utils/utils__init.mjs";
import { simpleTrack, simpleDraw }        from "../utils/utils__init.mjs";

const fileName              = "camera__face_tracking__multi_face";
const modelName             = "42l_min"; // 68l_max, 68l_medium, 68l_min, 42l_max, 42l_medium, 42l_min

// Number of faces to track: the more faces you try to track, the longer the processing time.

let numFacesToTracking      = 4;

// To negate the longer processing time for more than one face, you can decrease the number of tracking
// passes per frame. This makes the tracking a bit less stable though.

let numTrackingPasses       = 1;

const configureExample      = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  setConfigDefaults(brfv5Config, imageWidth, imageHeight, numFacesToTracking, numTrackingPasses, true);

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