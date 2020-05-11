import { log }                  from '../utils/utils__logging.js'

import { ScaleMode }            from '../utils/utils__resize.js'
import { doResize }             from '../utils/utils__resize.js'

let __brfv5__png_overlay        = null // This is the node to mount to.

const _name                     = 'BRFv5PNGOverlay'

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE

let _width                      = 0
let _height                     = 0

const _images                   = []

export const mountPNGOverlay = (node, scaleMode) => {

  log(_name + ': mountPNGOverlay')

  if(node && node.appendChild) {

    _scaleMode = scaleMode

    __brfv5__png_overlay = node

    window.addEventListener("resize", onResize)

    __brfv5__png_overlay.addEventListener('click', () => shiftImages())
  }
}

export const setSizePNGOverlay = (width, height) => {

  log(_name + ': setSizePNGOverlay:', width, height)

  _width  = width
  _height = height

  onResize()
}

export const hidePNGOverlay = () => {

  // log(_name + ': hidePNGOverlay')

  for(let i = 0; i < _images.length; ++i) {

    if(_images[i].container) {

      _images[i].container.classList.add('vh')
    }
  }
}

export const loadPNGOverlays = (imageArray) => {

  // array element, eg.:
  // { url: '../assets/brfv4_lion.png', scale: 0.66, alpha: 1.0, xOffset: 0.5, yOffset: 0.40 }

  log(_name + ': loadPNGOverlays: ', imageArray)

  for(let i = 0; i < imageArray.length; ++i) {

    // imageContainer behaves like the camera canvas to match its size
    const imageContainer        = document.createElement('div')
    const image                 = document.createElement('img')
    const imageObj              = imageArray[i]

    imageContainer.className    = 'bg-t abs vh'
    imageContainer.style.width  = _width  + 'px'
    imageContainer.style.height = _height + 'px'

    image.className             = 'bg-t abs'
    image.onload                = function(e) {

      this.width  = this.naturalWidth  * imageObj.scale
      this.height = this.naturalHeight * imageObj.scale
      this.style.transformOrigin = (imageObj.xOffset * 100) + '% ' + (imageObj.yOffset * 100) +  '%'
    }
    image.src                   = imageObj.url

    imageObj.image              = image
    imageObj.container          = imageContainer

    imageContainer.appendChild(image)

    __brfv5__png_overlay.appendChild(imageContainer)

    _images.push(imageObj)
  }
}

export const updateByFace = (face, index, show) => {

  const imageObj  = _images[index % _images.length]
  const container = imageObj.container

  if(show) {

    doResize(container, _width, _height, _scaleMode, true)

    const image     = imageObj.image

    const scaleX = face.scale * (1.00 - (Math.abs(face.rotationY) / 45.0) * 0.75) * 0.01
    const scaleY = face.scale * (1.00 - (Math.abs(face.rotationX) / 35.0) * 0.75) * 0.01

    let x = face.landmarks[27].x - image.width  * imageObj.xOffset
    let y = face.landmarks[27].y - image.height * imageObj.yOffset

    image.width  = image.naturalWidth  * imageObj.scale
    image.height = image.naturalHeight * imageObj.scale
    image.style.transformOrigin = (imageObj.xOffset * 100) + '% ' + (imageObj.yOffset * 100) +  '%'
    image.style.transform =
      'matrix(' + scaleX + ', 0.0, 0.0, ' + scaleY + ', ' + x + ', ' + y +') ' +
      'rotate(' + face.rotationZ + 'deg)'
    container.style.opacity = imageObj.alpha

    container.classList.remove('vh')

  } else {

    container.classList.add('vh')
  }
}

export const shiftImages = () => {

  log(_name + ': shiftImages')

  if(_images.length > 1) {

    const first = _images.shift()
    _images.push(first)
  }
}

const onResize = () => {

  for(let i = 0; i < _images.length; ++i) {

    const container = _images[i].container

    if(container) {

      container.style.width  = _width  + 'px'
      container.style.height = _height + 'px'

      doResize(container, _width, _height, _scaleMode, true)
    }
  }
}

export default {
  mountPNGOverlay,
  hidePNGOverlay,
  setSizePNGOverlay,
  loadPNGOverlays,
  updateByFace,
  shiftImages
}
