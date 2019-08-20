import { log, error }                                                       from '../utils/utils__logging.js'
import { SystemUtils }                                                      from '../utils/utils__system.js'
import { ScaleMode }                                                        from '../utils/utils__resize.js'
import { drawFaceTrackingResultsDefault }                                   from '../utils/utils__draw_tracking_results.js'

import { loadBRFv5Model}                                                    from '../brfv5/brfv5__init.js'
import { configureInput, configureFaceTracking, configureNumFacesToTrack }  from '../brfv5/brfv5__configure.js'
import { onEnterFrame, onExitFrame, enableDynamicPerformance, averageTime } from '../brfv5/brfv5__dynamic_performance.js'

import { mountCamera, openCamera, startTracking }                           from '../ui/ui__camera.js'
import { mountPNGOverlay, setPNGOverlaySize, hidePNGOverlay }               from '../ui/ui__png_overlay.js'
import { mountTextureOverlay, setTextureOverlaySize, hideTextureOverlay }   from '../ui/ui__texture_overlay.js'
import { mountTextureExporter, setTextureExporterSize, hideTextureExporter} from '../ui/ui__texture_exporter.js'
import { mountThreejsOverlay, setThreejsOverlaySize, hideThreejsOverlay }   from '../ui/ui__threejs_overlay.js'
import { mountPreloader, onProgress }                                       from '../ui/ui__preloader.js'
import { mountStats, updateStats }                                          from '../ui/ui__stats.js'
import { mountLogo }                                                        from '../ui/ui__logo.js'
import { mountFullscreen, setFullscreenLayoutSize, setFullscreenState }     from '../ui/ui__fullscreen.js'

const _name                     = 'BRFv5CameraExample'

let _modelName                  = SystemUtils.isMobileOS ? '68l_min' : '68l_max'
let _brfv5Manager               = null
let _brfv5Config                = null

let _width                      = 0 // canvas size depends on video width and height
let _height                     = 0

let _numFacesToTrack            = 1;
let _numTrackingPasses          = 3;
let _enableDynamicPerformance   = SystemUtils.isMobileOS;

let _onConfigure                = null
let _onTracking                 = null

export const setupCameraExample = (config = null) => {

  if(config) { configureCameraExample(config) }

  log(_name + ': setupCameraExample')

  const __brfv5__stage = document.getElementById('__brfv5__stage')

  if(__brfv5__stage) {

    log(_name + ': setupCameraExample: already set up')

    hidePNGOverlay()
    hideTextureOverlay()
    hideTextureExporter()
    hideThreejsOverlay()

    return
  }

  const container = document.getElementById('__brfv5')
  const cameraCanvas = mountCamera(container, ScaleMode.PROPORTIONAL_OUTSIDE)

  mountTextureOverlay(cameraCanvas, ScaleMode.PROPORTIONAL_OUTSIDE)
  mountTextureExporter(container)
  mountPNGOverlay(cameraCanvas, ScaleMode.PROPORTIONAL_OUTSIDE)
  mountThreejsOverlay(cameraCanvas, ScaleMode.PROPORTIONAL_OUTSIDE)
  mountPreloader(cameraCanvas)
  mountStats(cameraCanvas)
  mountLogo(cameraCanvas)
  mountFullscreen(cameraCanvas)

  openCamera().then(({ width, height }) => {

    log(_name + ': openCamera: done: ' + width + 'x' + height)

    _width  = width
    _height = height

    setTextureOverlaySize(_width, _height)
    setTextureExporterSize(_width, _height)
    setPNGOverlaySize(_width, _height)
    setThreejsOverlaySize(_width, _height)
    setFullscreenLayoutSize(_width, _height)
    setFullscreenState()

    initTracking()

  }).catch((e) => { if(e) { error('CAMERA_FAILED: ', e.msg) } })

  loadBRFv5Model(_modelName, './js/brfv5/models/', null, onProgress)
    .then(({ brfv5Manager, brfv5Config }) => {

      log(_name + ': loadBRFv5Model: done')

      _brfv5Manager  = brfv5Manager
      _brfv5Config   = brfv5Config

      initTracking()

    }).catch((e) => { error('BRFV5_FAILED: WebAssembly supported: ', SystemUtils.isWebAssemblySupported, e) })
}

export const configureCameraExample = (config) => {

  log(_name + ': configureCameraExample: config:', config)

  _onConfigure = config.onConfigure
  _onTracking  = config.onTracking

  if(config.modelName)                { _modelName                = config.modelName }
  if(config.numFacesToTrack)          { _numFacesToTrack          = config.numFacesToTrack }
  if(config.enableDynamicPerformance) { _enableDynamicPerformance = config.enableDynamicPerformance }
  if(config.numTrackingPasses)        { _numTrackingPasses        = config.numTrackingPasses }

  initTracking()
}

const initTracking = () => {

  log(_name + ': initTracking: ' + (_brfv5Config !== null && _width > 0) + ' config:', _brfv5Config, 'width:' , _width)

  if(_brfv5Config !== null && _width > 0) {

    // Setup the video input size and configure sensible defaults for that size.
    configureInput(_brfv5Config, _width, _height)

    // Setup the face tracking settings that impact performance.
    configureFaceTracking(_brfv5Config, _numTrackingPasses, true)

    // In most cases a single face should be tracked.
    configureNumFacesToTrack(_brfv5Config, _numFacesToTrack)

    if(_onConfigure) { _onConfigure(_brfv5Config) }

    if(_enableDynamicPerformance) {

      // Let BRFv5 manager the numTrackingPasses depending on the CPU usage or...
      enableDynamicPerformance(_brfv5Manager, _brfv5Config)

    } else {

      // ... use fixed numTrackingPasses and enableFreeRotation
      _brfv5Manager.configure(_brfv5Config)
    }

    startTracking(onImageDataUpdate, onEnterFrame, onExitFrame)
  }
}

const onImageDataUpdate = ({ imageData, activeCanvas }) => {

  if(!_brfv5Manager || !imageData || !activeCanvas) { return }

  _brfv5Manager.update(imageData)

  let drawDebug = false

  if(_onTracking) {

    drawDebug = _onTracking(_brfv5Manager, _brfv5Config, activeCanvas)

  } else {

    drawDebug = true
  }

  if(drawDebug) {

    drawFaceTrackingResultsDefault(_brfv5Manager, _brfv5Config, activeCanvas)
  }

  if(_brfv5Config.enableFaceTracking) {

    updateStats(averageTime.time, 'numTrackingPasses: '+_brfv5Config.faceTrackingConfig.numTrackingPasses +
      '<br />enableFreeRotation: '+ ( _brfv5Config.faceTrackingConfig.enableFreeRotation ? 1 : 0 ))

  } else {

    updateStats(averageTime.time, '')
  }
}

export default { configureCameraExample, setupCameraExample }
