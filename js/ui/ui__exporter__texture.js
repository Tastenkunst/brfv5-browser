import { log }                  from '../utils/utils__logging.js'

import { drawTexture }          from '../utils/utils__canvas.js'
import { drawTriangles }        from '../utils/utils__canvas.js'
import { colorPrimary }         from "../utils/utils__colors.js";

import {
  faceExtendedTriangles74l,
  faceExtendedTrianglesWithMouthWhole74l,
  faceTrianglesWithMouthWhole68l
} from '../utils/utils__face_triangles.js'


let __brfv5__texture_exporter   = null // This is the node to mount to.
const __brfv5__texture_canvas   = document.createElement('canvas')

const _name                     = 'BRFv5TextureExporter'

let _uvData                     = null
let _uvDataTmp                  = null

let _textureSize                = 256
let _width                      = 0
let _height                     = 0

export const mountTextureExporter = (node) => {

  log(_name + ': mountTextureExporter')

  if(node && node.appendChild) {

    __brfv5__texture_exporter          = node
    __brfv5__texture_canvas.className = 'bg-r fixed tr60 vh'

    __brfv5__texture_exporter.appendChild(__brfv5__texture_canvas)

    // Setup the texture to be 256x256 in size.

    __brfv5__texture_canvas.width  = _textureSize
    __brfv5__texture_canvas.height = _textureSize

    __brfv5__texture_canvas.addEventListener('click', function(event) {

      const json = {
        tex: __brfv5__texture_canvas.toDataURL('image/png'),
        uv: _uvData
      }

      const blob      = new Blob([ JSON.stringify(json) ], { type: 'text/plain' });
      const fileName  = 'texture.js'

      if(window.navigator.msSaveOrOpenBlob) {

        window.navigator.msSaveBlob(blob, fileName);

      } else {

        const elem = window.document.createElement('a');

        elem.href = window.URL.createObjectURL(blob);
        elem.download = fileName;

        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    })
  }
}

export const setSizeTextureExporter = (width, height) => {

  log(_name + ': setSizeTextureExporter:', width, height)

  _width  = width
  _height = height
}

export const hideTextureExporter = () => {

  log(_name + ': hideTextureExporter')

  __brfv5__texture_canvas.classList.add('vh')
}

export const updateByFace = (cameraCtx, face, index, show, imageData) => {

  if(index < 0 && index > 0) {

    return // Only consider the first face tracked.
  }

  const ctx = __brfv5__texture_canvas.getContext("2d")

  ctx.clearRect(0, 0, __brfv5__texture_canvas.width, __brfv5__texture_canvas.height)

  show = show && face !== null

  if(show) {

    const input = document.getElementById('__brfv5__input')
    _uvData = prepareFaceTexture(face, ctx, imageData)

    let triangles = faceTrianglesWithMouthWhole68l

    if(face.landmarks.length === 74) {

      triangles = faceExtendedTrianglesWithMouthWhole74l
    }

    // Draw an orange point on top to see that's the actual texture drawn onto the face.
    // drawCircle(ctx, _textureSize * 0.5, _textureSize * 0.5, 0xff7900, 4.0)

    drawTexture(cameraCtx, face.vertices, triangles, _uvData, __brfv5__texture_canvas, 0.25)

    drawTriangles(cameraCtx, face.vertices, faceExtendedTriangles74l, 1.0, colorPrimary, 0.4)
    drawTriangles(ctx, _uvDataTmp, faceExtendedTriangles74l, 1.0, colorPrimary, 0.4)

    __brfv5__texture_canvas.classList.remove('vh')

  } else {

    __brfv5__texture_canvas.classList.add('vh')
  }
}

const prepareFaceTexture = (face, ctx, imageData) => {

  const f = _textureSize / Math.max(face.bounds.width, face.bounds.height)
  const uvData = []

  _uvDataTmp = []

  ctx.drawImage(imageData, -face.bounds.x * f, -face.bounds.y * f, _width * f, _height * f)

  for(let u = 0; u < face.vertices.length; u += 2) {

    const ux = (((face.vertices[u]   - face.bounds.x) * f))
    const uy = (((face.vertices[u+1] - face.bounds.y) * f))

    _uvDataTmp.push(ux)
    _uvDataTmp.push(uy)

    uvData.push(ux / _textureSize)
    uvData.push(uy / _textureSize)
  }

  return uvData
}

export default {
  mountTextureExporter,
  hideTextureExporter,
  setSizeTextureExporter,
  updateByFace
}
