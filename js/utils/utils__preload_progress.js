import { log } from './utils__logging.js'

const loaders = {}

let overallProgress   = 0.0
let tweenedProgress   = 0.0
let intervalId        = -1

let onProgressHandler = null

const onInterval = () => {

  if(overallProgress  > 0.98) { overallProgress = 1.00 }
  if(overallProgress <= 0.90) {

    if(overallProgress * 0.70 > tweenedProgress) { tweenedProgress = overallProgress * 0.70 }

  } else if(overallProgress >= 1.00) {

    tweenedProgress += 0.02

    if(tweenedProgress > 0.98) {

      tweenedProgress = 1.00

      clearInterval(intervalId)
    }
  }

  if(onProgressHandler) onProgressHandler(tweenedProgress)
}

export const onPreloadProgress = ({ url, loaded, total }, callback) => {

  onProgressHandler = callback

  let loader        = loaders[url]
  let logNumLoaders = false

  if(!loader) {

    loaders[url]    = { loaded: loaded, total: total }
    logNumLoaders   = true

  } else {

    loader.loaded   = loaded
    loader.total    = total
  }

  let _total        = 100
  let _loaded       = 1
  let numLoaders    = 0

  for(var obj in loaders) {

    if(loaders.hasOwnProperty(obj)) {

      if(loaders[obj].total > 0) {

        _total      += loaders[obj].total
        _loaded     += loaders[obj].loaded

      } else {

        _total      += loaders[obj].loaded
        _loaded     += loaders[obj].loaded
      }

      numLoaders++
    }
  }

  logNumLoaders && log('onProgress: numLoaders: ', numLoaders)

  if(_total  > 100) _total  -= 100
  if(_loaded >   1) _loaded -=   1

  overallProgress   = Math.ceil((_loaded / _total) * 10000) / 10000

  if(intervalId === -1) {

    intervalId = setInterval(onInterval, 50)

    log('onProgress: intervalId: ', intervalId)

  } else {

    onInterval()
  }

  return overallProgress
};

export default { onPreloadProgress }

