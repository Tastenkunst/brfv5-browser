/**
 * BRFv5 - Texture Overlay
 *
 * A png texture is drawn on top of the face (using UV data and triangles/polygons).
 *
 * To create a texture, you can either use the existing texture (save image from
 * face_texture_overlay.html) as a basis for your asset and use the same UV data.
 *
 * Or you could capture a new facial image and save the UV data of that captured
 * image as shown in brfv5_texture_overlay.js (See Texture Exporter example).
 *
 * Works only with a 68l model.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { faceTrianglesWithMouthWhole68l }   from '../utils/utils__face_triangles.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { configureNumFacesToTrack }         from '../brfv5/brfv5__configure.js'
import { setROIsWholeImage }                from '../brfv5/brfv5__configure.js'

import { loadTextureOverlays }              from '../ui/ui__overlay__texture.js'
import { clearTextures }                    from '../ui/ui__overlay__texture.js'
import { updateByFace }                     from '../ui/ui__overlay__texture.js'

import { faceTextures }                     from '../../assets/textures/brfv5_texture_overlay.js'

const _textures = [
  {
    // The texture image data, either Base64 string or url.
    tex:        faceTextures.grumpy.tex, // or faceTextures.marcel.tex

    // Array of Numbers between 0.0 and 1.0, [x, y, x, y, ..., x, y],
    // with either 68 * 2 or 74 * 2 length.
    uv:         faceTextures.grumpy.uv, // or faceTextures.marcel.uv

    // Choose the correct triangles for your texture, with or without
    // whole for the mouth. 68l for normal face shape, 74l for extended
    // face shape.
    triangles:  faceTrianglesWithMouthWhole68l,

    alpha:      1.00,

    // 0.25 for alpha: 1.00, 0.15 for alpha: less than 0.50, try to find the best setting.
    overdraw:   0.25,

    // How often a texture is drawn on top of each other, 2 removes most antialiased edges.
    numPasses:  2,

    // See utils__blend_modes.js > blendOnto()
    blendMode:  null
  }
];

let numFacesToTrack = 1 // set be run()

export const configureExample = (brfv5Config) => {

  configureNumFacesToTrack(brfv5Config, numFacesToTrack)

  if(numFacesToTrack > 1) {

    setROIsWholeImage(brfv5Config)
  }

  loadTextureOverlays(_textures)
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  clearTextures()

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      updateByFace(ctx, face, i, true)

    } else {

      updateByFace(ctx, null, i, false)
    }
  }

  return true
}

const exampleConfig = {

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
