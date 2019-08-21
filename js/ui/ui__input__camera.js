import { log }                  from '../utils/utils__logging.js'

import { startCamera }          from '../utils/utils__camera.js'
import { stopCamera }           from '../utils/utils__camera.js'
import { _default480p }         from '../utils/utils__camera.js'

import { doResize, ScaleMode }  from '../utils/utils__resize.js'

import { ERRORS }               from '../utils/utils__errors.js'

const __brfv5__input            = document.createElement('video')
const __brfv5__camera_canvas_0  = document.createElement('canvas')
const __brfv5__camera_canvas_1  = document.createElement('canvas')
__brfv5__camera_canvas_0.id     = '__brfv5__camera_canvas_0'
__brfv5__camera_canvas_1.id     = '__brfv5__camera_canvas_1'

__brfv5__input.setAttribute('playsinline', true)

const _name                     = 'BRFv5CameraCanvas'

const _lastCameraConstraints    = { width: 640, height: 480, frameRate: 30, facingMode: 'user', mirrored: true }

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE
let _isFirstOpenCameraCall      = true

let _width                      = 0 // canvas size depends on video width and height
let _height                     = 0

export const mountCamera = (node, scaleMode) => {

  log(_name + ': mountCamera')

  if(node && node.appendChild) {

    _scaleMode = scaleMode

    __brfv5__input.className            = 'bg-t abs vh cm'
    __brfv5__camera_canvas_0.className  = 'bg-t abs vh c'
    __brfv5__camera_canvas_1.className  = 'bg-t abs vh c'

    node.appendChild(__brfv5__input)
    node.appendChild(__brfv5__camera_canvas_0)
    node.appendChild(__brfv5__camera_canvas_1)

    window.addEventListener("resize", onResize)
  }
}

export const hideCamera = () => {

  log(_name + ': hideCamera')

  __brfv5__camera_canvas_0.classList.add('vh')
  __brfv5__camera_canvas_1.classList.add('vh')
}

export const setSizeCamera = (width, height) => {

  log(_name + ': setSizeCamera:', width, height)

  _width  = width
  _height = height

  __brfv5__camera_canvas_0.width  = _width
  __brfv5__camera_canvas_0.height = _height
  __brfv5__camera_canvas_1.width  = _width
  __brfv5__camera_canvas_1.height = _height

  onResize()
}

const onResize = () => {

  doResize(__brfv5__input,           _width, _height, _scaleMode)
  doResize(__brfv5__camera_canvas_0, _width, _height, _scaleMode)
  doResize(__brfv5__camera_canvas_1, _width, _height, _scaleMode)
}

export const openCamera = (constraints) => {

  log(_name + ': openCamera:', constraints)

  if(!constraints) constraints = _default480p

  let restartStream = _isFirstOpenCameraCall || isVideoPaused()

  restartStream     = checkConstraintValue('width',      constraints) || restartStream
  restartStream     = checkConstraintValue('height',     constraints) || restartStream
  restartStream     = checkConstraintValue('frameRate',  constraints) || restartStream
  restartStream     = checkConstraintValue('facingMode', constraints) || restartStream
  restartStream     = checkConstraintValue('mirrored',   constraints) || restartStream

  _isFirstOpenCameraCall = false

  return new Promise((resolve, reject) => {

    if(!restartStream) { resolve({ width: _width, height: _height }); return }

    startCamera(__brfv5__input, _lastCameraConstraints).then(({ video }) => {

      resolve({ width: video.videoWidth, height: video.videoHeight })

    }).catch((e) => {

      reject({ error: ERRORS.CAMERA_FAILED, msg: e })
    })
  })
}

export const closeCamera = (pause = true, silent = false) => {

  log(_name + ': closeCamera:', pause, silent)

  stopCamera(__brfv5__input, pause, silent)
  hideCamera()
}

export const getDataFromCamera = () => {

  return { input: __brfv5__input, canvas0: __brfv5__camera_canvas_0, canvas1: __brfv5__camera_canvas_1 }
}

export const isVideoPaused = () => { return __brfv5__input.paused }

const checkConstraintValue = (value, constraints) => {

  if(constraints[value] && _lastCameraConstraints[value] !== constraints[value]) {

    _lastCameraConstraints[value] = constraints[value]

    return true
  }

  return false
}

export default {
  mountCamera,
  hideCamera,
  setSizeCamera,
  openCamera,
  closeCamera,
  getDataFromCamera,
  isVideoPaused
}
