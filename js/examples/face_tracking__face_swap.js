/**
 * BRFv5 - Face Swap
 *
 * This example tracks and swaps two faces. So you won't see anything happening
 * unless two faces are tracked.
 *
 * Works only with a 68l model.
 */

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { drawTexture }                      from '../utils/utils__canvas.js'
import { faceTrianglesWithMouthWhole68l }   from '../utils/utils__face_triangles.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { configureFaceTracking }            from '../brfv5/brfv5__configure.js'
import { configureNumFacesToTrack }         from '../brfv5/brfv5__configure.js'
import { setROIsWholeImage }                from '../brfv5/brfv5__configure.js'

const _extractedFace0   = document.createElement("canvas") // first face texture
const _extractedFace1   = document.createElement("canvas") // second face texture

const _textureSize      = 256

_extractedFace0.width   = _textureSize;
_extractedFace0.height  = _textureSize;
_extractedFace1.width   = _textureSize;
_extractedFace1.height  = _textureSize;

const _ctxFace0        = _extractedFace0.getContext("2d");
const _ctxFace1        = _extractedFace1.getContext("2d");

export const configureExample = (brfv5Config) => {

  // Track two faces and swap the two face textures.
  configureNumFacesToTrack(brfv5Config, 2)

  // Tracking might jitter because of numTrackingPasses = 1
  configureFaceTracking(brfv5Config, 1, true)
  setROIsWholeImage(brfv5Config)
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const ctx   = canvas.getContext('2d')
  const faces = brfv5Manager.getFaces()

  if(faces.length < 2) {

    return
  }

  const face0     = faces[0];
  const face1     = faces[1];
  const inputSize = {
    width: brfv5Config.imageConfig.inputWidth,
    height: brfv5Config.imageConfig.inputHeight
  }

  let drawDefaults = true

  if( face0.state === brfv5.BRFv5State.FACE_TRACKING &&
      face1.state === brfv5.BRFv5State.FACE_TRACKING) {

    var uvData0 = prepareFaceTexture(canvas, face0, _ctxFace0, _textureSize, inputSize);
    var uvData1 = prepareFaceTexture(canvas, face1, _ctxFace1, _textureSize, inputSize);

    // Draw both face textures twice with and overdraw per triangle of 0.25 to
    // get rid of antialiased edges between the triangles.

    drawTexture(ctx, face0.vertices, faceTrianglesWithMouthWhole68l,
      uvData1, _extractedFace1, 0.25);
    drawTexture(ctx, face0.vertices, faceTrianglesWithMouthWhole68l,
      uvData1, _extractedFace1, 0.25);

    drawTexture(ctx, face1.vertices, faceTrianglesWithMouthWhole68l,
      uvData0, _extractedFace0, 0.25);
    drawTexture(ctx, face1.vertices, faceTrianglesWithMouthWhole68l,
      uvData0, _extractedFace0, 0.25);

    drawDefaults = false
  }

  return drawDefaults
}

const prepareFaceTexture = (canvas, face, textureCtx, textureSize, resolution) => {

  textureCtx.clearRect(0, 0, textureSize, textureSize);

  const bx = face.bounds.x
  const by = face.bounds.y
  const bw = face.bounds.width
  const bh = face.bounds.height

  let f = textureSize / bw;

  if(bh > bw) {

    f = textureSize / bh;
  }

  textureCtx.drawImage(canvas, -bx * f, -by * f,
    resolution.width * f, resolution.height * f);

  const uvData = [];

  for(let u = 0; u < face.vertices.length; u += 2) {

    const ux = (((face.vertices[u    ] - bx) * f) / textureSize);
    const uy = (((face.vertices[u + 1] - by) * f) / textureSize);

    uvData.push(ux);
    uvData.push(uy);
  }

  return uvData;
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
