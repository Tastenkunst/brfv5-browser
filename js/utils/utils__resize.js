export const ScaleMode      = {
  NO_SCALE:                 0,
  STRETCH:                  1,
  PROPORTIONAL_INSIDE:      2,
  PROPORTIONAL_OUTSIDE:     3
};

export const doResize = (element, elementWidth, elementHeight, scaleMode, scale) => {

  const ew    = elementWidth
  const eh    = elementHeight

  const rect  = element.parentElement.getBoundingClientRect()

  const rx    = parseInt(rect.left)
  const ry    = parseInt(rect.top)
  const rw    = parseInt(rect.right)  - rx
  const rh    = parseInt(rect.bottom) - ry

  let   sh    = rh;
  let   sw    = sh / eh * ew;

  if(scaleMode === ScaleMode.NO_SCALE) {

    sw = ew
    sh = eh

  } else if(scaleMode === ScaleMode.STRETCH) {

    sw = rw

  } else if(scaleMode === ScaleMode.PROPORTIONAL_INSIDE) {

    if(sw > rw) {

      sw    = rw
      sh    = sw / ew * eh
    }

  } else if(scaleMode === ScaleMode.PROPORTIONAL_OUTSIDE) {

    if(sw < rw) {

      sw    = rw
      sh    = sw / ew * eh
    }
  }

  if(scale) {

    let _scale = 1.0

    if(Math.abs(rw - sw) < 0.1) {

      _scale = sh / eh

    } else {

      _scale = sw / ew
    }

    element.style.left  = Math.floor((rw - sw) * 0.5) + 'px'
    element.style.top   = Math.floor((rh - sh) * 0.5) + 'px'
    element.style.transformOrigin = '0 0'

    if(rw > rh) {
      element.style.transform = 'scale(' + (_scale) + ')'
    } else {
      element.style.transform = 'scale(' + (_scale) + ')'
    }

  } else {

    element.style.width  = sw + "px"
    element.style.height = sh + "px"
  }
}

export const getScale = (element, elementWidth, elementHeight, scaleMode) => {

  const ew    = elementWidth
  const eh    = elementHeight

  const rect  = element.parentElement.getBoundingClientRect()

  const rx    = parseInt(rect.left)
  const ry    = parseInt(rect.top)
  const rw    = parseInt(rect.right)  - rx
  const rh    = parseInt(rect.bottom) - ry

  let   sh    = rh;
  let   sw    = sh / eh * ew;

  if(scaleMode === ScaleMode.NO_SCALE) {

    sw = ew
    sh = eh

  } else if(scaleMode === ScaleMode.STRETCH) {

    sw = rw

  } else if(scaleMode === ScaleMode.PROPORTIONAL_INSIDE) {

    if(sw > rw) {

      sw    = rw
      sh    = sw / ew * eh
    }

  } else if(scaleMode === ScaleMode.PROPORTIONAL_OUTSIDE) {

    if(sw < rw) {

      sw    = rw
      sh    = sw / ew * eh
    }
  }

  return sw / rw
}

export default { ScaleMode, doResize, getScale }
