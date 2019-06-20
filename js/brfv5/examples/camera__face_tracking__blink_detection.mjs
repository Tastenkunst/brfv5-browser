import { setupPreloader, writeProgress }    from "../ui/ui__preloader.mjs";
import { setupStats, writeStats }           from "../ui/ui__stats.mjs";
import { resizeElement }                    from "../ui/ui__resize.mjs"
import { drawCircles, drawRect, drawRects } from "../ui/ui__canvas.mjs";

import { setupCameraExample }               from "../utils/utils__init.mjs";
import { setConfigDefaults }                from "../utils/utils__init.mjs";
import { simpleTrack, simpleDraw }          from "../utils/utils__init.mjs";

import { brfv5 }                            from "../utils/utils__init.mjs";

import { distance }                         from "../utils/utils__math.mjs";

const fileName              = "camera__face_tracking__blink_detection";

// Blink detection needs the eye landmarks. So we definitely need a 68l model.

const modelName             = "68l_max"; // 68l_max, 68l_medium, 68l_min

let _leftEyeBlinked         = false;
let _rightEyeBlinked        = false;

let _leftEyeTimeOut         = -1;
let _rightEyeTimeOut        = -1;

const _leftEyeLidDistances  = [];
const _rightEyeLidDistances = [];

const configureExample      = (brfv5Manager, brfv5Config, imageWidth, imageHeight) => {

  setConfigDefaults(brfv5Config, imageWidth, imageHeight, 1, 3, true);

  brfv5Manager.configure(brfv5Config);

  console.log(fileName + ": configureExample");
};

const trackExample          = (brfv5Manager, brfv5Config, input, canvas) => {

  const timeStart           = window.performance.now();

  simpleTrack(brfv5Manager, brfv5Config, input, canvas);

  // Simple blink detection algorithm.

  // A simple approach with quite a lot false positives. Fast movement isn't handled properly.
  // But this code is quite good when it comes to staring contest apps though.

  // For the last 13 frames (0.433 seconds at 30 FPS) it records the distance between upper and lower lid.
  // If looks at the first 3, the middle 3 and the last 3 frames and compares the distances.
  // If the middle segment is smaller than the other two, it's a blink. This lags 0.25 seconds behind
  // the actual blink, but works quite well.

  const ctx                 = canvas.getContext("2d");
  const faces               = brfv5Manager.getFaces();

  let drawFaceDetection     = false;
  let i;

  drawRect(ctx, brfv5Config.faceTrackingConfig.regionOfInterest, "#ffd200", 1.0);

  for(i = 0; i < faces.length; i++) {

    const face = faces[i];

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      drawCircles(ctx, face.landmarks, "#00a0ff", 2.0);

      const lm                = face.landmarks;
      const leftEyeLandmarks  = [lm[36], lm[39], lm[37], lm[38], lm[41], lm[40]];
      const rightEyeLandmarks = [lm[45], lm[42], lm[44], lm[43], lm[46], lm[47]];

      detectBlinkLeft( leftEyeLandmarks,  _leftEyeLidDistances,  ctx);
      detectBlinkRight(rightEyeLandmarks, _rightEyeLidDistances, ctx);

    } else {

      _leftEyeLidDistances.length = 0;

      drawFaceDetection = true;
    }
  }
  
  if(drawFaceDetection) {

    drawRect(ctx, brfv5Config.faceDetectionConfig.regionOfInterest, "#ffd200", 1.0);

    drawRects(ctx, brfv5Manager.getDetectedRects(), "#00a0ff", 1.0);
    drawRects(ctx, brfv5Manager.getMergedRects(),   "#ffd200", 3.0);
  }

  let timeEnd               = window.performance.now();

  writeStats(timeEnd - timeStart);
};

const detectBlinkLeft = (lm, distances, ctx) => {

  const blinked = detectBlink(lm[0], lm[1], lm[2], lm[3], lm[4], lm[5], distances);

  if(blinked) {

    _leftEyeBlinked = true;

    if(_leftEyeTimeOut > -1) { clearTimeout(_leftEyeTimeOut); }

    _leftEyeTimeOut = setTimeout(() => { _leftEyeBlinked = false; }, 150);
  }

  drawCircles(ctx, lm, _leftEyeBlinked ? "#ffd200" : "#00a0ff", 3.0);
};

const detectBlinkRight = (lm, distances, ctx) => {

  const blinked = detectBlink(lm[0], lm[1], lm[2], lm[3], lm[4], lm[5], distances);

  if(blinked) {

    _rightEyeBlinked = true;

    if(_rightEyeTimeOut > -1) { clearTimeout(_rightEyeTimeOut); }

    _rightEyeTimeOut = setTimeout(() => { _rightEyeBlinked = false; }, 150);
  }

  drawCircles(ctx, lm, _rightEyeBlinked ? "#ffd200" : "#00a0ff", 3.0);
};

const detectBlink = (
    eyeOuterCorner,
    eyeInnerCorner,
    eyeOuterUpperLid,
    eyeInnerUpperLid,
    eyeOuterLowerLid,
    eyeInnerLowerLid,
    eyeLidDistances) => {

  const eyeWidth            = distance(eyeOuterCorner, eyeInnerCorner);
  const eyeOuterLidDistance = distance(eyeOuterUpperLid, eyeOuterLowerLid);
  const eyeInnerLidDistance = distance(eyeInnerUpperLid, eyeInnerLowerLid);
  const eyeLidDistance      = 2.0 * ((eyeOuterLidDistance + eyeInnerLidDistance) / eyeWidth);

  eyeLidDistances.push(eyeLidDistance);

  while(eyeLidDistances.length > 13) { // keep 13.0/30.0=0.433 seconds of recording data

    eyeLidDistances.shift();
  }

  if(eyeLidDistances.length === 13) {

    let segment0 = 0;
    let segment1 = 0;
    let segment2 = 0;

    let i;

    for(i =  0; i <  3; i++) { segment0 += eyeLidDistances[i]; }
    for(i =  5; i <  8; i++) { segment1 += eyeLidDistances[i]; }
    for(i = 10; i < 13; i++) { segment2 += eyeLidDistances[i]; }

    segment0 /= 3.0;
    segment1 /= 3.0;
    segment2 /= 3.0;


    if(Math.abs(segment0 - segment2) < 0.12) {

      const outerSegments = (segment0 + segment2) * 0.5;
      const percent       = segment1 / outerSegments;

      if(segment1 < segment0 && segment1 < segment2 && percent < 0.82) {

        return true;
      }
    }
  }

  return false;
};

console.log(fileName + ": setup");

setupPreloader(document.body);
setupStats(document.body);

setupCameraExample(modelName, document.body, configureExample, trackExample, writeProgress, resizeElement);