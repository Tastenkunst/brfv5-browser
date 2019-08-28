/**
 * BRFv5 - Region of Interest
 *
 * Restricting the region of interest for the Face Detection algorithm results in
 * a much faster processing time.
 *
 * Restricting the region of interest for the Face Tracking algorithm will reset
 * the tracking, if a face moves outside this area.
 **/

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawRect }                         from '../utils/utils__canvas.js'

import { colorPrimary, colorSecondary }     from '../utils/utils__colors.js'

export const configureExample = (brfv5Config) => {

  // This is the camera stream resolution.

  const iw = brfv5Config.imageConfig.inputWidth
  const ih = brfv5Config.imageConfig.inputHeight

  // Let's restrict the region of interest (ROI) for Face Detection
  // to 50% of the center square...

  let size = Math.min(iw, ih) * 0.50
  let roi  = brfv5Config.faceDetectionConfig.regionOfInterest

  roi.width  = size
  roi.height = size
  roi.x = (iw - size) * 0.5
  roi.y = (ih - size) * 0.5

  // ... and to 75% of for the Face Tracking ROI.

  size = Math.min(iw, ih) * 0.75
  roi = brfv5Config.faceTrackingConfig.regionOfInterest

  roi.width  = size
  roi.height = size
  roi.x = (iw - size) * 0.5
  roi.y = (ih - size) * 0.5

  // Comment that in, if you want to see the Face Detection only.
  // brfv5Config.enableFaceTracking = false

  // Comment this in, if you want to set the ROI covering the whole image:
  // brfv5Config.faceDetectionConfig.regionOfInterest.setTo(0, 0, iw, ih)
  // brfv5Config.faceTrackingConfig.regionOfInterest.setTo(0, 0, iw, ih)
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx = canvas.getContext('2d')

  drawRect(ctx, brfv5Config.faceTrackingConfig.regionOfInterest, colorPrimary, 10.0)
  drawRect(ctx, brfv5Config.faceDetectionConfig.regionOfInterest, colorSecondary, 10.0)

  return true // draw defaults
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
