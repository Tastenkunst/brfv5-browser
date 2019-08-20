/**
 * BRFv5 - Extended Face Shape
 *
 * Also see: utils__face_extended.js
 *
 * This example adds 6 more landmarks to the forehead. These additional 6 points
 * are not tracked, but estimated from the other 68 (or 42) landmarks.
 **/

import { setupCameraExample }               from './setup__camera__example.js'

import { drawCircles, drawTriangles }       from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { BRFv5FaceExtended }                from '../utils/utils__face_extended.js'
import { faceExtendedTriangles74l }         from '../utils/utils__face_triangles.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'
import { colorPrimary }                     from '../utils/utils__colors.js'

const faceExtended = new BRFv5FaceExtended()

export const configureExample = (brfv5Config) => {

  // No special configuration necessary, defaults are fine.
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  let doDrawFaceDetection = false

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      faceExtended.update(face)

      drawCircles(ctx, faceExtended.landmarks, colorPrimary, 2.0)

      if(faceExtended.landmarks.length === 74) {

        drawTriangles(ctx, faceExtended.vertices, faceExtendedTriangles74l,
          1.0, colorPrimary, 0.4)
      }
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

