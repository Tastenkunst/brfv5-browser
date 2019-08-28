/**
 * BRFv5 - Smile Detection
 *
 * A simple smile detection (estimation) approach.
 *
 * The smileFactor returned by detectSmile is a percentage value between 0.0 and 1.0.
 *
 * Works with both model types: 68l and 42l.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawCircles }                      from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { detectSmile }                      from '../utils/utils__smile_detection.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

export const configureExample = (brfv5Config) => {

  // No special configuration necessary, defaults are fine.
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  let doDrawFaceDetection = false

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i];

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      const smileFactor = detectSmile(face);

      // Let the color show you how much you are smiling.
      // Green is closer to 1.0 (smile), red is closer to 0.0 (no smile).

      var color =
        (((0xff * (1.0 - smileFactor) & 0xff) << 16)) +
        (((0xff * smileFactor) & 0xff) << 8);

      drawCircles(ctx, face.landmarks, color, 2.0)

    } else {

      doDrawFaceDetection = true;
    }
  }

  if(doDrawFaceDetection) {

    drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas)
  }

  return false
}

const exampleConfig = {

  onConfigure:              configureExample,
  onTracking:               handleTrackingResults
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
