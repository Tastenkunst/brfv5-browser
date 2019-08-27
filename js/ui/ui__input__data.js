import { log }                  from '../utils/utils__logging.js'

import { addOnEnterFrame }      from '../utils/utils__image_data.js'
import { addOnExitFrame }       from '../utils/utils__image_data.js'
import { addEnterFrame }        from '../utils/utils__image_data.js'
import { removeAllEnterFrame }  from '../utils/utils__image_data.js'

const _name                     = 'BRFv5ImageData'

export const startTracking      = (
  input,              // either video or img
  canvas0,            // If canvas0 === canvas1, no new image check is performed
  canvas1,            // If canvas0 !== canvas1, updated occur only on image change
  drawFunction,       // either drawInput or drawInputMirrored
  trackOnlyOnce,      // whether or not to track only once instead of continuously.
  onImageDataUpdate,  // The callback for the tracking to happen
  onEnterFrame,       // The callback for the stats to start recording
  onExitFrame         // The callback for the stats to stop recording
) => {

  log(_name + ': startTracking')

  stopTracking()

  addOnEnterFrame(onEnterFrame)
  addOnExitFrame(onExitFrame)

  addEnterFrame(input, canvas0, canvas1, drawFunction,
    (imageData, activeCanvas, inactiveCanvas) => {

      onImageDataUpdate(imageData, activeCanvas, inactiveCanvas, trackOnlyOnce)

      // inactiveCanvas.classList.add('vh')
      // activeCanvas.classList.remove('vh')

      inactiveCanvas.style.visibility = 'hidden'
      activeCanvas.style.visibility = 'visible'

    }, trackOnlyOnce);
}

export const stopTracking       = () => {

  addOnEnterFrame(null)
  addOnExitFrame(null)

  removeAllEnterFrame()
}

export default {
  startTracking,
  stopTracking
}
