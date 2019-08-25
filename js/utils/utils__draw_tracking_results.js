import { drawCircles, drawRect, drawRects } from './utils__canvas.js'
import { drawTriangles }                    from './utils__canvas.js'

import { faceTriangles68l }                 from './utils__face_triangles.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'
import { colorPrimary, colorSecondary }     from './utils__colors.js'

export const drawFaceDetectionResults = (brfv5Manager, brfv5Config, canvas) => {

  if(!brfv5Manager || !brfv5Config || !canvas) { return }

  const ctx = canvas.getContext('2d')

  drawRect( ctx, brfv5Config.faceDetectionConfig.regionOfInterest, colorSecondary, 2.0)
  drawRects(ctx, brfv5Manager.getDetectedRects(), colorPrimary, 1.0)
  drawRects(ctx, brfv5Manager.getMergedRects(), colorSecondary, 3.0)
}

export const drawFaceTrackingResultsDefault = (brfv5Manager, brfv5Config, canvas) => {

  if(!brfv5Manager || !brfv5Config || !canvas) { return }

  const ctx = canvas.getContext('2d')

  let doDrawFaceDetection = !brfv5Config.enableFaceTracking || true

  if(brfv5Config.enableFaceTracking) {

    const sizeFactor = Math.min(canvas.width, canvas.height) / 480.0
    const faces      = brfv5Manager.getFaces()

    for(let i = 0; i < faces.length; i++) {

      const face = faces[i]

      if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

        drawRect(ctx, brfv5Config.faceTrackingConfig.regionOfInterest, colorPrimary, 2.0)

        if(face.landmarks.length === 68) {

          drawTriangles(ctx, face.vertices, faceTriangles68l, 1.5, colorPrimary, 0.4);
        }

        drawCircles(ctx, face.landmarks, colorPrimary, 2.0 * sizeFactor)
        drawRect(ctx, face.bounds, colorSecondary, 1.0)

      } else {

        doDrawFaceDetection = true
      }
    }
  }

  if(doDrawFaceDetection) {

    // Only draw face detection results, if face detection was performed.

    drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas)
  }
}

export default { drawFaceDetectionResults, drawFaceTrackingResultsDefault }
