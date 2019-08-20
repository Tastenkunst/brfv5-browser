/**
 * BRFv5 - ThreeJS Example
 *
 * This example loads a 3D model and an occlusion model (to hide the end of each bow
 * behind an invisible head's ears).
 *
 * In these examples we always use 68l type models,
 * 68l_max (4.9MB) on desktop, 68l_min (2.4MB) on mobile.
 *
 * But we provide smaller 42l type models for 3d placement/Augmented Reality as well.
 * 42l_max (3.5MB) on desktop, 42l_min (2.4MB) on mobile.
 *
 * See: js/threejs folder
 */

import { error }                            from '../utils/utils__logging.js'

import { setupCameraExample }               from './setup__camera__example.js'

import { SystemUtils }                      from '../utils/utils__system.js'
import { drawCircles }                      from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { colorPrimary }                     from '../utils/utils__colors.js'

import { render3DScene }                    from '../threejs/threejs_setup.js'

import { load3DModel, load3DOcclusionModel }from '../threejs/threejs_loading.js'
import { set3DModelByName }                 from '../threejs/threejs_loading.js'

import { updateByFace }                     from '../ui/ui__threejs_overlay.js'

export const configureExample = (brfv5Config) => {

  // Load the occlusion model (an invisible head). It hides anything behind it.

  load3DOcclusionModel('./assets/3d/occlusion_head_reference.json',
    './assets/3d/textures/', null).then(() => {

  }).catch((e) => {

    error('Could not load 3D occlusion model:', e)
  })

  // The actual 3d model as exported from ThreeJS editor.
  // either rayban.json or earrings.json
  // Textures might be embedded or set as file name in a certain path.
  load3DModel('./assets/3d/rayban.json',
    './assets/3d/textures/', null).then(() => {

    set3DModelByName()

  }).catch((e) => {

    error('Could not load 3D model:', e)
  })
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  let doDrawFaceDetection = false

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i];

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      drawCircles(ctx, face.landmarks, colorPrimary, 2.0);

      // Update the 3d model placement.
      updateByFace(ctx, face, i, true)

      // ... and then render the 3d scene.
      render3DScene()

    } else {

      // Hide the 3d model, if the face wasn't tracked.
      updateByFace(ctx, face, i, false)

      doDrawFaceDetection = true;
    }
  }

  if(doDrawFaceDetection) {

    drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas)
  }

  return false
}

const exampleConfig = {

  // See face_tracking__choose_model.js for more info about the models.

  modelName:                SystemUtils.isMobileOS ? '42l_min' : '42l_max',

  // If true, numTrackingPasses and enableFreeRotation will be set depending
  // on the apps CPU usage. See brfv5__dynamic_performance.js for more insights.

  enableDynamicPerformance: true,

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

