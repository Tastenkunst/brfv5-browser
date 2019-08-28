/**
 * BRFv5 - Texture Exporter
 *
 * This example let's you create a facial texture overlay.
 *
 * Click the texture to download a 'texture.js' file (with the same structure
 * as brfv5_texture_overlay.js). To 'download' or 'export' the image data of
 * the texture, open your texture.js with face_texture_overlay.html
 *
 * Add the object to the textures in brfv5_texture_overlay.js and choose
 * the new texture in the code.
 *
 * See: ui__texture_exporter.js and face_tracking__texture_overlay.js
 *
 * Works only with a 68l model (normal an extended).
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { updateByFace }                     from '../ui/ui__exporter__texture.js'

export const configureExample = (brfv5Config) => {

  // No special configuration necessary, defaults are fine.
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if(face.state === brfv5.BRFv5State.FACE_TRACKING) {

      updateByFace(ctx, face, i, true, canvas)

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
