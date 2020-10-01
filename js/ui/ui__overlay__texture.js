import { log }                  from '../utils/utils__logging.js'

import { ScaleMode }            from '../utils/utils__resize.js'
import { doResize }             from '../utils/utils__resize.js'
import { drawTexture }          from '../utils/utils__canvas.js'
import { blendOnto }            from '../utils/utils__blend_modes.js'

let __brfv5__texture_overlay    = null // This is the node to mount to.

const __brfv5__texture_canvas   = document.createElement('canvas')

__brfv5__texture_canvas.id      = '__brfv5__texture_canvas'

const _name                     = 'BRFv5TextureOverlay'

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE

let _width                      = 0
let _height                     = 0

const _textures                 = []

export const mountTextureOverlay = (node, scaleMode) => {

  log(_name + ': mountTextureOverlay')

  if(node && node.appendChild) {

    _scaleMode                        = scaleMode
    __brfv5__texture_overlay          = node
    __brfv5__texture_canvas.className = 'bg-t abs vh c'

    __brfv5__texture_overlay.appendChild(__brfv5__texture_canvas)

    window.addEventListener("resize", onResize)
  }
}

export const setSizeTextureOverlay = (width, height) => {

  log(_name + ': setSizeTextureOverlay:', width, height)

  _width  = width
  _height = height

  __brfv5__texture_canvas.width  = _width
  __brfv5__texture_canvas.height = _height

  onResize()
}

export const hideTextureOverlay = () => {

  log(_name + ': hideTextureOverlay')

  __brfv5__texture_canvas.classList.add('vh')
}

export const loadTextureOverlays = (textureArray) => {

  _textures.length = 0

  // array element, eg.:
  // { tex: 'base64 image', uv: [68 * 2 coordinates], alpha: 1.0 }

  log(_name + ': loadTextureOverlays: ', textureArray)

  for(let i = 0; i < textureArray.length; ++i) {

    const image                 = document.createElement('img')
    const textureObj            = textureArray[i]

    image.src                   = textureObj.tex

    textureObj.image            = image

    _textures.push(textureObj)
  }
}

export const clearTextures = () => {

  const ctx         = __brfv5__texture_canvas.getContext("2d")
  ctx.clearRect(0, 0, __brfv5__texture_canvas.width, __brfv5__texture_canvas.height)
}

export const updateByFace = (cameraCtx, face, index, show) => {

  const textureObj  = _textures[index % _textures.length]
  const ctx         = __brfv5__texture_canvas.getContext("2d")

  if(show) {

    ctx.globalAlpha = textureObj.alpha

    for(let i = 0; i < textureObj.numPasses; ++i) {

      drawTexture(ctx, face.vertices, textureObj.triangles, textureObj.uv, textureObj.image, textureObj.overdraw)
    }

    ctx.globalAlpha = 1.0

    if(textureObj.blendMode) {

      blendOnto( ctx, cameraCtx, textureObj.blendMode, { destX: 0, destY: 0 } );

      __brfv5__texture_canvas.classList.add('vh')

    } else {

      __brfv5__texture_canvas.classList.remove('vh')
    }

  } else {

    __brfv5__texture_canvas.classList.add('vh')
  }
}

const onResize = () => {

  doResize(__brfv5__texture_canvas, _width, _height, _scaleMode)
}

export default {
  mountTextureOverlay,
  hideTextureOverlay,
  setSizeTextureOverlay,
  loadTextureOverlays,
  clearTextures,
  updateByFace
}
