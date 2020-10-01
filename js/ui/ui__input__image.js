import { log }                  from '../utils/utils__logging.js'

import { doResize, ScaleMode }  from '../utils/utils__resize.js'

import { ERRORS }               from '../utils/utils__errors.js'

const __brfv5__input            = document.createElement('img')
const __brfv5__image_canvas     = document.createElement('canvas')

__brfv5__input.id               = '__brfv5__input'
__brfv5__image_canvas.id        = '__brfv5__image_canvas'

const _name                     = 'BRFv5ImageCanvas'

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE

export const mountImage = (node, scaleMode) => {

  log(_name + ': mountImage')

  if(node && node.appendChild) {

    _scaleMode = scaleMode

    __brfv5__input.className        = 'bg-t abs vh cm'
    __brfv5__image_canvas.className = 'bg-t abs vh c'

    node.appendChild(__brfv5__input)
    node.appendChild(__brfv5__image_canvas)

    window.addEventListener("resize", onResize)
  }
}

export const hideImage = () => {

  log(_name + ': hideImage')

  __brfv5__image_canvas.classList.add('vh')
}

export const setSizeImage = (width, height) => {

  log(_name + ': setSizeImage:', width, height)

  __brfv5__image_canvas.width   = width
  __brfv5__image_canvas.height  = height

  onResize()
}

const onResize = () => {

  const width  = __brfv5__image_canvas.width
  const height = __brfv5__image_canvas.height

  doResize(__brfv5__input,        width, height, _scaleMode)
  doResize(__brfv5__image_canvas, width, height, _scaleMode)
}

export const loadImage = (path) => {

  log(_name + ': loadImage:', path)

  return new Promise((resolve, reject) => {

    __brfv5__input.onload = () => {

      resolve({width: __brfv5__input.naturalWidth, height: __brfv5__input.naturalHeight })
    }

    __brfv5__input.onerror = (e) => {

      reject({ error: ERRORS.IMAGE_FAILED, msg: e })
    }

    __brfv5__input.src = path
  })
}

export const closeImage = () => {

  log(_name + ': closeImage')

  hideImage()
}

export const getDataFromImage = () => {

  return { input: __brfv5__input, canvas0: __brfv5__image_canvas, canvas1: __brfv5__image_canvas }
}

export default {
  mountImage,
  hideImage,
  setSizeImage,
  loadImage,
  closeImage,
  getDataFromImage
}
