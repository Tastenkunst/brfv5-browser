import { log }              from '../utils/utils__logging.js'
import { SystemUtils }      from '../utils/utils__system.js'

const __brfv5__fullscreen   = document.createElement('a')
const __brfv5__img_large    = document.createElement('img')
const __brfv5__img_small    = document.createElement('img')

__brfv5__fullscreen.id      = '__brfv5__fullscreen'

const _name                 = 'BRFv5FullscreenButton'

let _isFullscreen           = false

export const mountFullscreen = (node) => {

  log(_name + ': mountFullscreen')

  if(node && node.appendChild) {

    __brfv5__fullscreen.className = 'abs img br10 ontop br50 cb o6'
    __brfv5__img_large.className  = 'abs fsimg'
    __brfv5__img_small.className  = 'abs fsimg vh'

    __brfv5__fullscreen.onclick   = function(event) {

      _isFullscreen = !_isFullscreen

      setFullscreenState()
    }

    setFullscreenState()

    __brfv5__img_large.src        = './assets/ui/baseline-fullscreen-24px.svg'
    __brfv5__img_large.alt        = 'Show Camera Fullscreen in Browser'

    __brfv5__img_small.src        = './assets/ui/baseline-fullscreen_exit-24px.svg'
    __brfv5__img_small.alt        = 'Exit Fullscreen'

    __brfv5__fullscreen.appendChild(__brfv5__img_large)
    __brfv5__fullscreen.appendChild(__brfv5__img_small)

    node.appendChild(__brfv5__fullscreen);
  }
}

export const setFullscreenState = () => {

  __brfv5__img_large.classList.remove('vh')
  __brfv5__img_small.classList.remove('vh')

  if(_isFullscreen) {

    __brfv5__img_large.classList.add('vh')

  } else {

    __brfv5__img_small.classList.add('vh')
  }

  const __brfv5__code_container = document.getElementById('__brfv5__code_container')

  if(__brfv5__code_container) {

    if(SystemUtils.isMobileOS) {

      __brfv5__code_container.classList.remove('swl')
      __brfv5__code_container.classList.add('swp')

    } else {

      __brfv5__code_container.classList.add('swl')
      __brfv5__code_container.classList.remove('swp')
    }
  }

  const __brfv5__stage = document.getElementById('__brfv5__stage')

  if(__brfv5__stage) {

    if(_isFullscreen) {

      __brfv5__stage.classList.remove('swl')
      __brfv5__stage.classList.remove('shl')
      __brfv5__stage.classList.remove('swp')
      __brfv5__stage.classList.remove('shp')
      __brfv5__stage.classList.add('fvw')
      __brfv5__stage.classList.add('fvh')

      __brfv5__stage.classList.add('oh')

      window.dispatchEvent(new Event('resize'));

    } else {

      __brfv5__stage.classList.remove('fvw')
      __brfv5__stage.classList.remove('fvh')
      __brfv5__stage.classList.add('swl')
      __brfv5__stage.classList.add('shl')

      __brfv5__stage.classList.remove('oh')

      if(SystemUtils.isMobileOS) {

        // __brfv5__stage.classList.add('swp')
        // __brfv5__stage.classList.add('shp')
      }

      window.dispatchEvent(new Event('resize'));
    }
  }
}

export default {
  mountFullscreen,
  setFullscreenState
}
