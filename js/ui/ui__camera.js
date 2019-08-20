import { log }                  from '../utils/utils__logging.js'

import { startCamera }          from '../utils/utils__camera.js'
import { stopCamera }           from '../utils/utils__camera.js'
import { _default480p }         from '../utils/utils__camera.js'

import { addOnEnterFrame }      from '../utils/utils__image_data.js'
import { addOnExitFrame }       from '../utils/utils__image_data.js'
import { addEnterFrame }        from '../utils/utils__image_data.js'
import { removeAllEnterFrame }  from '../utils/utils__image_data.js'

import { drawInput }            from '../utils/utils__canvas.js'
import { drawInputMirrored }    from '../utils/utils__canvas.js'

import { doResize, ScaleMode }  from '../utils/utils__resize.js'

import { ERRORS }               from '../utils/utils__errors.js'

const __brfv5__camera           = document.createElement('div')
const __brfv5__video            = document.createElement('video')
const __brfv5__camera_canvas_0  = document.createElement('canvas')
const __brfv5__camera_canvas_1  = document.createElement('canvas')

__brfv5__camera.id              = '__brfv5__stage'
__brfv5__video.id               = '__brfv5__input'
__brfv5__video.setAttribute('playsinline', true)

const _name                     = 'BRFv5CameraCanvas'

const _lastCameraConstraints    = { width: 640, height: 480, frameRate: 30, facingMode: 'user', mirrored: true }

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE
let _isFirstOpenCameraCall      = true
let _width                      = 0 // canvas size depends on video width and height
let _height                     = 0

let _onCameraOpened             = null
let _onCameraFailed             = null

export const addOnCameraOpened = (onCameraOpened) => { _onCameraOpened = onCameraOpened }
export const addOnCameraFailed = (onCameraFailed) => { _onCameraFailed = onCameraFailed }

export const mountCamera = (node, scaleMode) => {

  log(_name + ': mountCamera')

  if(node && node.appendChild) {

    _scaleMode = scaleMode

    __brfv5__camera.className           = 'bg-t rel mc fw fh oh'
    __brfv5__video.className            = 'bg-t abs vh cm'
    __brfv5__camera_canvas_0.className  = 'bg-t abs vh c'
    __brfv5__camera_canvas_1.className  = 'bg-t abs vh c'

    __brfv5__camera.appendChild(__brfv5__video)
    __brfv5__camera.appendChild(__brfv5__camera_canvas_0)
    __brfv5__camera.appendChild(__brfv5__camera_canvas_1)

    node.prepend(__brfv5__camera);

    window.addEventListener("resize", onResize)
  }

  return __brfv5__camera
}

export const hideCamera = () => {

  log(_name + ': hideCamera')

  __brfv5__camera.style.visibility = 'hidden'
}

const onResize = () => {

  doResize(__brfv5__video,           _width, _height, _scaleMode)
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

    if(!restartStream) { reject(); return }

    startCamera(__brfv5__video, _lastCameraConstraints).then(({ video })=>{

      _width                          = video.videoWidth
      _height                         = video.videoHeight

      __brfv5__camera_canvas_0.width  = _width
      __brfv5__camera_canvas_0.height = _height
      __brfv5__camera_canvas_1.width  = _width
      __brfv5__camera_canvas_1.height = _height

      onResize()

      resolve({ width: _width, height: _height })

    }).catch((e) => {

      reject({ error: ERRORS.CAMERA_FAILED, msg: e })
    })
  })
}

export const closeCamera = (pause = true, silent = false) => {

  log(_name + ': closeCamera:', pause, silent)

  addOnEnterFrame(null)
  addOnExitFrame(null)
  removeAllEnterFrame()

  stopCamera(__brfv5__video, pause, silent)

  __brfv5__camera_canvas_0.classList.add('vh')
  __brfv5__camera_canvas_1.classList.add('vh')
}

export const isVideoPaused = () => { return __brfv5__video.paused }

export const updateConfig = (config) => {

  if(config) {

    config.enable_camera ? openCamera(config.constraints) : closeCamera()
  }
}

const checkConstraintValue = (value, constraints) => {

  if(constraints[value] && _lastCameraConstraints[value] !== constraints[value]) {

    _lastCameraConstraints[value] = constraints[value]

    return true
  }

  return false
}

export const startTracking = (onImageDataUpdate, onEnterFrame, onExitFrame) => {

  log(_name + ': startTracking')

  addOnEnterFrame(onEnterFrame)
  addOnExitFrame(onExitFrame)

  removeAllEnterFrame()

  addEnterFrame(
    __brfv5__video,
    __brfv5__camera_canvas_0,
    __brfv5__camera_canvas_1,
    _lastCameraConstraints.mirrored ? drawInputMirrored : drawInput,
    (imageData, activeCanvas, inactiveCanvas) => {

      onImageDataUpdate({ imageData, activeCanvas, inactiveCanvas })

      activeCanvas.style.visibility   = 'visible'
      inactiveCanvas.style.visibility = 'hidden'
    });
}

export default {
  mountCamera,
  hideCamera,
  openCamera,
  closeCamera,
  addOnCameraOpened,
  addOnCameraFailed,
  startTracking,
  updateConfig,
  isVideoPaused
}
