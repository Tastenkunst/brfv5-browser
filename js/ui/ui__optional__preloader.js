import { log }              from '../utils/utils__logging.js'

const __brfv5__preloader    = document.createElement('div')
const __brfv5__bar          = document.createElement('div')

__brfv5__preloader.id       = '__brfv5__preloader'

const _name                 = 'BRFv5Preloader'

const _progress             = { target: 1.0 }
const _loaders              = []

export const mountPreloader = (node) => {

  log(_name + ': mountPreloader')

  if(node && node.appendChild) {

    __brfv5__preloader.className    = 'abs tl fw bg-w preloader-fh'

    __brfv5__bar.className          = 'abs tl bar bar-t'
    __brfv5__bar.style.width        = '1%'

    __brfv5__preloader.appendChild(__brfv5__bar)

    node.appendChild(__brfv5__preloader);
  }
}

export const hidePreloader = () => {

  log(_name + ': hidePreloader')

  setTimeout(() => {

    __brfv5__preloader.classList.add('vh')
    __brfv5__preloader.classList.remove('preloader-fh')
    __brfv5__preloader.classList.add('preloader-mh')
  }, 500)
}

export const setProgress = (url, loaded, total) => {

  log(_name + ': setProgress:', url, loaded, total)

  let loader = _loaders[url]

  if(!loader) {

    loader = _loaders[url] = { loaded: loaded, total: total }

  } else {

    loader.loaded = loaded
    loader.total  = total
  }

  total  = 100;
  loaded = 1;

  for(url in _loaders) {

    if(_loaders[url].total > 0) {

      total  += _loaders[url].total
      loaded += _loaders[url].loaded

    } else {

      total  += _loaders[url].loaded
      loaded += _loaders[url].loaded
    }
  }

  if(total  > 100) total  -= 100
  if(loaded >   1) loaded -=   1

  __brfv5__preloader.classList.remove('vh')

  _progress.target = Math.ceil((loaded / total) * 100)

  __brfv5__bar.style.width = _progress.target + '%'
}

export const getProgress = () => { return _progress.target }

let idHidePreloader = -1;

export const onProgress = (progress) => {

  clearTimeout(idHidePreloader)

  // log(_name + ': onProgress:', progress)

  setProgress(progress.currentTarget.responseURL, progress.loaded, progress.total)

  const overallProgress = getProgress() / 100.0

  // log(_name + ': onProgress: overallProgress', overallProgress)

  if(overallProgress >= 1.00) {

    setTimeout(hidePreloader, 500)

  }
}

export default {
  mountPreloader,
  hidePreloader,
  setProgress,
  getProgress,
  onProgress
}
