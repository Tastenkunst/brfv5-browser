/**
 * Switch examples by selecting a different one from the dropdown menu.
 */

/**
 * This example repository uses browser native ES6 modules without any bundler.
 * With few adaptations the included utilities should also work in bundler environments.
 */

/**
 * BRFv5 - Track A Single Face
 *
 * This example tracks a single face and draws the default tracking results, eg.
 * detected faces, facial landmarks, face bounds etc, as well as the regions of interest.
 *
 * The configuration sets reasonable defaults for single face tracking.
 * We set some of the main values anyway for educational purposes.
 *
 * BRFv5 comes with more than one model. Please see face_tracking__choose_model.js for
 * more information.
 */

import { setupCameraExample }       from './setup__camera__example.js'
import { SystemUtils }              from '../utils/utils__system.js'

export const configureExample = (brfv5Config) => {

  // In most cases you only want to track one face. If you need more than one face at a time,
  // performance will be lower, because face tracking is a CPU intensive task.

  brfv5Config.faceTrackingConfig.numFacesToTrack  = 1

  // numTrackingPasses: 3 (default), can either be 1, 2, 3, 4, 5 or 6.
  // 3 is a good trade-off between accuracy/stability and performance.
  // While 1 and two don't calculate the simple confidence value, 3 to 6 do.
  // The confidence value helps with resetting, if tracking is lost.

  // enableFreeRotation: true (default)
  // Enables rotationZ (head roll) to be larger than 34 degrees. This increased freedom
  // of head movement results in a bit of a performance loss, but it's most likely worth it.
  // Set it to false to restrict the head roll to -34 .. 0 .. 34 degrees.

  brfv5Config.faceTrackingConfig.numTrackingPasses  = 3
  brfv5Config.faceTrackingConfig.enableFreeRotation = true
  brfv5Config.faceTrackingConfig.maxRotationZReset  = 999.0
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  // No special handling necessary.
  // return true will draw the default face tracking results in setup__camera__example

  return true
}

const exampleConfig = {

  // See face_tracking__choose_model.js for more info about the models.

  modelName:                SystemUtils.isMobileOS ? '68l_min' : '68l_max',

  // If true, numTrackingPasses and enableFreeRotation will be set depending
  // on the apps CPU usage. See brfv5__dynamic_performance.js for more insights.

  enableDynamicPerformance: SystemUtils.isMobileOS,

  onConfigure:              configureExample,
  onTracking:               handleTrackingResults,
}

// run() will be called automatically.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1

export const run = () => {

  clearTimeout(timeoutId)
  setupCameraExample(exampleConfig)
}

timeoutId = setTimeout(() => { run() }, 1000)

export default { run }

