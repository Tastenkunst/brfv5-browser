import { SystemUtils, SystemOS }  from '../utils/utils__system.js'
import { configureFaceTracking }  from './brfv5__configure.js'

// Dynamic reconfiguration depending on CPU usage (execution time in milliseconds).
// Must be explicitly enabled by an example, eg. setup__camera__example.js and see SystemUtils.isMobileOS;

let _enableDynamicPerformance     = false

let _brfv5Manager                 = null
let _brfv5Config                  = null

export const enableDynamicPerformance = (brfv5Manager, brfv5Config) => {

  _enableDynamicPerformance       = true

  _brfv5Manager                   = brfv5Manager
  _brfv5Config                    = brfv5Config

  configureFaceTracking(_brfv5Config, startParams.numTrackingPasses, startParams.enableFreeRotation)

  _brfv5Manager.configure(_brfv5Config)
}

export const disableDynamicPerformance = () => {

  _enableDynamicPerformance       = false
}

let _timeStart                    = 0
let _timeEnd                      = 0
let _times                        = [ 33 ]

export const averageTime          = { time: '' }

let _maxWaitingFrames             = 30
let _numWaitingFrames             = _maxWaitingFrames

let _numTrackingPasses            = SystemUtils.mobileOS === SystemOS.UNKNOWN ? 3 : 1
let _enableFreeRotation           = SystemUtils.mobileOS === SystemOS.UNKNOWN

export const startParams          = { numTrackingPasses: _numTrackingPasses, enableFreeRotation: _enableFreeRotation }

export const onEnterFrame = () => {

  _timeStart = window.performance.now()
}

export const onExitFrame = () => {

  _timeEnd = window.performance.now()

  dynamicPerformance()
}

const dynamicPerformance = () => {

  // We know the time it took to update the tracking.

  _times.push(_timeEnd - _timeStart)

  while(_times.length > 30) { _times.shift() }

  let _averageTime = 0
  let needReconfig = false

  for(let i = 0; i < _times.length; i++) { _averageTime += _times[i]; }

  _averageTime /= _times.length

  // We calculate the average of the last 1 - 2 seconds.
  // If the average was below 28ms, that's good enough to maybe increate the
  // tracking stability.
  // If it was above 37ms, then we first remove the ability to tilt the head
  // freely and then we decrease tracking stability.

  if(_averageTime < 28) {

    _numWaitingFrames--

    if(_numWaitingFrames < 1) {

      _numWaitingFrames = _maxWaitingFrames

      if(_numTrackingPasses < 3) {

        _numTrackingPasses++
        needReconfig = true

      } else {

        if(!_enableFreeRotation) {

          _enableFreeRotation = true
          needReconfig = true
        }
      }
    }

  } else if(_averageTime > 37) {

    _numWaitingFrames--

    if(_numWaitingFrames < 1) {

      _numWaitingFrames = 10

      if(_enableFreeRotation) {

        _enableFreeRotation = false
        needReconfig = true

      } else if(_numTrackingPasses > 1) {

        _numTrackingPasses--
        needReconfig = true
      }
    }
  }

  averageTime.time = _averageTime.toFixed(0)

  if(needReconfig && _enableDynamicPerformance) {

    configureFaceTracking(_brfv5Config, _numTrackingPasses, _enableFreeRotation)

    _brfv5Manager.configure(_brfv5Config)
  }
}

export default {
  enableDynamicPerformance,
  disableDynamicPerformance,
  onEnterFrame,
  onExitFrame,
  averageTime
}
