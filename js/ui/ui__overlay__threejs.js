import { log, error }           from '../utils/utils__logging.js'

import { ScaleMode }            from '../utils/utils__resize.js'
import { doResize }             from '../utils/utils__resize.js'
import { SystemUtils }          from '../utils/utils__system.js'

import { create3DScene }        from '../threejs/threejs__setup.js'
import { update3DLayout }       from '../threejs/threejs__setup.js'

import { updateByFace as update3D } from '../threejs/threejs__brfv5_mapping.js'
import { hideAllBaseNodes }     from '../threejs/threejs__brfv5_mapping.js'

const __brfv5__threejs_canvas   = document.createElement('canvas')
__brfv5__threejs_canvas.id      = '__brfv5__threejs_canvas'

const _name                     = 'BRFv5ThreejsOverlay'

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE

export const mountThreejsOverlay = (node, scaleMode, t3d) => {

  log(_name + ': mountThreejsOverlay')

  if(node && node.appendChild) {

    _scaleMode                        = scaleMode

    __brfv5__threejs_canvas.className = 'bg-t abs vh c'

    node.appendChild(__brfv5__threejs_canvas)

    if(create3DScene(t3d, __brfv5__threejs_canvas)) {

      window.addEventListener("resize", onResize)

    } else {

      error('ThreeJS scene could not be created: SystemUtils.isWebGLSupported: ', SystemUtils.isWebGLSupported)
    }
  }
}

export const setSizeThreejsOverlay = (width, height, t3d) => {

  log(_name + ': setSizeThreejsOverlay:', width, height)

  __brfv5__threejs_canvas.width  = width
  __brfv5__threejs_canvas.height = height

  update3DLayout(t3d, width, height)

  onResize()
}

export const hideThreejsOverlay = (t3d) => {

  log(_name + ': hideThreejsOverlay')

  __brfv5__threejs_canvas.classList.add('vh')
}

export const hide3DModels = (t3d) => {

  hideAllBaseNodes(t3d)
}

export const updateByFace = (t3d, cameraCtx, face, index, show) => {

  __brfv5__threejs_canvas.classList.remove('vh')

  update3D(t3d, face, index, show)
}

const onResize = () => {

  doResize(
    __brfv5__threejs_canvas,
    __brfv5__threejs_canvas.width,
    __brfv5__threejs_canvas.height,
    _scaleMode)
}

export default {
  mountThreejsOverlay,
  hideThreejsOverlay,
  setSizeThreejsOverlay,
  updateByFace
}
