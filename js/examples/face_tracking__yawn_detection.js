/**
 * BRFv5 - Yawn Detection
 *
 * A simple yawn detection approach.
 *
 * detectYawn() returns a yawnFactor between 0.0 and 1.0.
 *
 * Works only with a 68l model.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawCircles }                      from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { detectYawn }                       from '../utils/utils__yawn_detection.js'

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

      const yawnFactor = detectYawn(face.vertices)

      // Let the color show you how wide open your mouth is:
      // Green is near to 1.0, red is near to 0.0.

      var color =
        (((0xff * (1.0 - yawnFactor) & 0xff) << 16)) +
        (((0xff * yawnFactor) & 0xff) << 8);

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
