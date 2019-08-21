import { log, warn }          from './utils__logging.js'
import { isVideo, isCanvas }  from './utils__checks.js'

const logName = 'utils__image_data: '

const enterFrameObjects = []

let _onEnterFrame       = null
let _onExitFrame        = null

const getEFOByInput = (input) => {

  for(let i = 0; i < enterFrameObjects.length; i++) {

    const efo = enterFrameObjects[i]

    if(efo && efo.input === input) {

      return efo
    }
  }

  return null
}

export const removeAllEnterFrame = () => {

  log(logName + 'removeAllEnterFrame')

  for(let i = 0; i < enterFrameObjects.length; ++i) {

    const efo = enterFrameObjects[i]

    cancelAnimationFrame(efo.requestId)

    efo.input             = null
    efo.activeImageData   = null
    efo.activeCanvas      = null
    efo.inactiveImageData = null
    efo.inactiveCanvas    = null

    efo.requestId         = 0
  }

  enterFrameObjects.length = 0
}

export const addOnEnterFrame = (onEnterFrame) => {

  _onEnterFrame = onEnterFrame
}

export const addOnExitFrame = (onExitFrame) => {

  _onExitFrame = onExitFrame
}

export const addEnterFrame = (input, canvas0, canvas1, drawFunction, onImageData, doOnlyOnce) => {

  const prefix = logName + 'addEnterFrame: '

  log(prefix)

  if( !isCanvas(canvas0, prefix + 'Provide a HTML canvas element to add the enterframe event.') ||
      !isCanvas(canvas1, prefix + 'Provide a HTML canvas element to add the enterframe event.')) {

    return false
  }

  let efo = getEFOByInput(input)

  if(efo) {

    warn(prefix + 'input already has an enterframe event attached.')

  } else {

    log(prefix + 'attach enterframe event to input.')

    efo = {

      input:                  input,
      activeCanvas:           canvas0,
      activeImageData:        null,
      inactiveCanvas:         canvas1,
      inactiveImageData:      null,
      requestId:              0,

      onEnterFrame: ()        => {

        if(_onEnterFrame) _onEnterFrame()

        cancelAnimationFrame(efo.requestId)

        if(!doOnlyOnce) {

          efo.requestId = requestAnimationFrame(efo.onEnterFrame)
        }

        const canvasActive    = efo.activeCanvas
        const canvasInactive  = efo.inactiveCanvas

        const cw              = canvasActive.width
        const ch              = canvasActive.height

        const ctxActive       = canvasActive.getContext('2d')
        const ctxInactive     = canvasInactive.getContext('2d')

        drawFunction(ctxInactive, cw, ch, efo.input)

        if(efo.activeImageData === null) {

          efo.activeImageData = ctxActive.getImageData(0, 0, cw, ch)
        }

        const imageActive     = efo.activeImageData
        const imageInactive   = ctxInactive.getImageData(0, 0, cw, ch)

        const imageDataActive   = imageActive.data
        const imageDataInactive = imageInactive.data

        const rowStep         = imageInactive.height / 6

        let foundDifference   = canvasActive === canvasInactive

        for(let row = rowStep; row < imageInactive.height && !foundDifference; row += rowStep) { // going through 4/5 rows

          const startIndex    = row * cw * 4 + 1
          const endIndex      = row * cw * 5 + 1

          for(let g = startIndex; g < endIndex; g += 4 ) {

            if(imageDataActive[g] !== imageDataInactive[g]) {

              foundDifference = true
              break
            }
          }
        }

        if(!foundDifference) {

         // warn('no new image')

        } else {

          let tmp               = efo.activeCanvas

          efo.activeCanvas      = efo.inactiveCanvas
          efo.inactiveCanvas    = tmp

          tmp                   = efo.activeImageData

          efo.activeImageData   = imageInactive
          efo.inactiveImageData = tmp

          onImageData(efo.activeImageData, efo.activeCanvas, efo.inactiveCanvas)

          if(_onExitFrame) _onExitFrame()
        }
    }}

    enterFrameObjects.push(efo)
  }

  efo.onEnterFrame()
}

export default { addEnterFrame, removeAllEnterFrame, addOnEnterFrame, addOnExitFrame }
