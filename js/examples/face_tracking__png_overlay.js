/**
 * face_tracking__08_png_overlay.js
 *
 * This example loads two images and tracks two faces.
 * Each face gets its own mask, either lion of glasses.
 *
 * Each image can have an alpha, scale, and offset for x and y.
 * Each image will be placed centered on the top of the nose.
 *
 **/

import { setupCameraExample }             from './setup__camera__example.js'

import { configureNumFacesToTrack }       from '../brfv5/brfv5__configure.js'
import { setROIsWholeImage }              from '../brfv5/brfv5__configure.js'

import { loadPNGOverlays, updateByFace }  from '../ui/ui__png_overlay.js'

const _images       = [
  { url: './assets/brfv5_img_lion.png',    alpha: 0.66,
    scale: 0.66, xOffset: 0.5, yOffset: 0.40 },
  { url: './assets/brfv5_img_glasses.png', alpha: 1.00,
    scale: 0.25, xOffset: 0.5, yOffset: 0.45 }
];

let numFacesToTrack   = _images.length // or set to one an choose a PNG.
let loadedImagesOnce  = false

export const configureExample = (brfv5Config) => {

  configureNumFacesToTrack(brfv5Config, numFacesToTrack)

  if(numFacesToTrack > 1) {

    setROIsWholeImage(brfv5Config)
  }

  if(!loadedImagesOnce) {

    loadedImagesOnce = true
    loadPNGOverlays(_images)
  }
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const faces = brfv5Manager.getFaces()

  for(let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if(face.state === 'face_tracking') {

      updateByFace(face, i, true)

    } else {

      updateByFace(null, i, false)
    }
  }

  return true
}

const exampleConfig = {

  onConfigure:              configureExample,
  onTracking:               handleTrackingResults,
}

export const run = (_numFacesToTrack = 1) => {
  numFacesToTrack = _numFacesToTrack
  setupCameraExample(exampleConfig)
}

run(_images.length)

export default { run }

