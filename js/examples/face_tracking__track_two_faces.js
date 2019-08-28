/**
 * BRFv5 - Track two Faces
 *
 * To track more than one face, you simply have to increase numFacesToTrack.
 * And, if necessary, increase the size of the regions of interest as well.
 *
 * See face_tracking__basics.js for more info.
 *
 * Works with both model types: 68l and 42l.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawCircles }                      from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { colorPrimary, colorSecondary }     from '../utils/utils__colors.js'

import { configureNumFacesToTrack }         from '../brfv5/brfv5__configure.js'
import { configureFaceTracking }            from '../brfv5/brfv5__configure.js'
import { setROIsWholeImage }                from '../brfv5/brfv5__configure.js'

export const configureExample = (brfv5Config) => {

  // Let's look for two faces.

  configureNumFacesToTrack(brfv5Config, 2)

  // Tracking two faces is CPU intensive. Let's reduce the number of tracking passes
  // per face to negate the longer processing time. This makes the tracking a bit
  // less stable though.

  configureFaceTracking(brfv5Config, 1, true)

  // Actually search in the whole image, not just the center square (default).

  setROIsWholeImage(brfv5Config)
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  // Here we draw the first face blue and the second face white.
  // If no face was tracked, draw the detected rectangles.

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  let doDrawFaceDetection = false

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      const color = i === 0 ? colorPrimary : colorSecondary

      drawCircles(ctx, face.landmarks, color, 3.0)

    } else {

      doDrawFaceDetection = true
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
