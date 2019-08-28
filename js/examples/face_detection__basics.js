/**
 * BRFv5 - Face Detection - Basics
 *
 * This example only detects faces and omits the tracking part entirely.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

export const configureExample = (brfv5Config) => {

  // In this example we only want to >>detect<< faces, not >>track<< them.

  brfv5Config.enableFaceTracking = false;
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  // Detected faces are drawn as rectangles. All detected faces are drawn in blue.
  // If enough rectangles are detected in a certain area, a merged rectangle
  // (drawn in yellow) is being created.

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
