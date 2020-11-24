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

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { SystemUtils }                      from '../utils/utils__system.js'
import { drawCircles }                      from '../utils/utils__canvas.js'
import { drawFaceDetectionResults }         from '../utils/utils__draw_tracking_results.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { configureNumFacesToTrack }         from '../brfv5/brfv5__configure.js'
import { setROIsWholeImage }                from '../brfv5/brfv5__configure.js'

import { colorPrimary }                     from '../utils/utils__colors.js'

import { render3DScene, setNumFaces, prepareModelNodes,
  hideAllModels, turnIntoOcclusionObject, add3DModel,
  set3DModelByName }                        from '../threejs/threejs__setup.js'

import { load3DModelList, getModelInstance } from '../threejs/threejs__loading.js'

import { hide3DModels, updateByFace }       from '../ui/ui__overlay__threejs.js'

let numFacesToTrack       = 1 // set be run()

let models = [

  // Load the occlusion model (an invisible head). It hides anything behind it.

  {
    pathToModel:          './assets/3d/occlusion_head.artov5',
    pathToTextures:       './assets/3d/textures/',

    nameModel:            null,

    isOcclusionModel:     true,
    isMaterialCollection: false
  },

  // The actual 3d model as exported from ThreeJS editor.
  // either rayban.json or earrings.json
  // Textures might be embedded or set as file name in a certain path.

  {
    pathToModel:          './assets/3d/rayban.artov5',
    pathToTextures:       './assets/3d/textures/',

    nameModel:            'black',

    isOcclusionModel:     false,
    isMaterialCollection: false
  }
]

export const configureExample = (brfv5Config, t3d) => {

  configureNumFacesToTrack(brfv5Config, numFacesToTrack)

  if(numFacesToTrack > 1) {

    setROIsWholeImage(brfv5Config)
  }

  brfv5Config.faceTrackingConfig.enableFreeRotation = false
  brfv5Config.faceTrackingConfig.maxRotationZReset  = 34.0

  setNumFaces(t3d, numFacesToTrack)

  hide3DModels(t3d)

  load3DModelList({ fileList: models, onProgress: null }).then(() => {

    prepareModelNodes(t3d)
    hideAllModels(t3d)

    for(let i = 0; i < models.length; i++) {

      const model = models[i]
      const obj3d = getModelInstance(t3d, model.pathToModel)

      if(model.isOcclusionModel) {

        turnIntoOcclusionObject(obj3d)
      }

      if(!model.isMaterialCollection && obj3d) {

        add3DModel(t3d, obj3d)
      }
    }

    for(let i = 0; i < models.length; i++) {

      const model = models[i]

      if(!model.isMaterialCollection) {

        set3DModelByName(t3d, model.pathToModel, model.nameModel, (url, name) => {
          error('SETTING_3D_MODEL_NAME_FAILED:', name, url)
        })
      }
    }

  }).catch((e) => { error(e) })
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas, t3d) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  let doDrawFaceDetection = false

  setNumFaces(t3d, numFacesToTrack)

  hide3DModels(t3d)

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i];

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      drawCircles(ctx, face.landmarks, colorPrimary, 2.0);

      // Update the 3d model placement.

      updateByFace(t3d, ctx, face, i, true)

      if(window.selectedSetup === 'image') {

        updateByFace(t3d, ctx, face, i, true)
        updateByFace(t3d, ctx, face, i, true)
        updateByFace(t3d, ctx, face, i, true)
      }

    } else {

      // Hide the 3d model, if the face wasn't tracked.
      updateByFace(t3d, ctx, face, i, false)

      doDrawFaceDetection = true;
    }

    // ... and then render the 3d scene.
    render3DScene(t3d)
  }

  if(doDrawFaceDetection) {

    drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas)
  }

  return false
}

const exampleConfig = {

  // See face_tracking__choose_model.js for more info about the models.

  modelName:                '42l',
  numChunksToLoad:          SystemUtils.isMobileOS ? 4 : 8,

  // If true, numTrackingPasses and enableFreeRotation will be set depending
  // on the apps CPU usage. See brfv5__dynamic_performance.js for more insights.

  enableDynamicPerformance: window.selectedSetup === 'camera',

  onConfigure:              configureExample,
  onTracking:               handleTrackingResults
}

// run() will be called automatically after 1 second, if run isn't called immediately after the script was loaded.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1

export const run = (_numFacesToTrack = 1) => {

  numFacesToTrack = _numFacesToTrack

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
