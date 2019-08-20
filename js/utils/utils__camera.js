import { log, warn }        from './utils__logging.js'
import { isVideo }          from './utils__checks.js'

export const CameraFacingMode = {

  USER:                     "user",
  ENVIRONMENT:              "environment",
  LEFT:                     "left",
  RIGHT:                    "right"
};

export const _default480p   = { width:  640, height:  480, frameRate: 30, facingMode: CameraFacingMode.USER }

const _videoConstraints     = {

  width:                    { ideal: 640, min: 640, max: 1920 },
  height:                   { ideal: 480, min: 480, max: 1080 },
  frameRate:                { ideal:  30,           max: 30 },
  facingMode:               { ideal: CameraFacingMode.USER }
};

const logName               = 'utils__camera: '

const getUserMedia = (video) => {

  return new Promise((resolve, reject) => {

    window.navigator.mediaDevices.getUserMedia({ video: _videoConstraints })
      .then((mediaStream) => {

        video.srcObject = mediaStream
        video.play().then(() => { resolve({ video: video }) }).catch((e) => { reject(e) })

      }).catch((e) => { reject(e) })

  }) // catch must be added after then, so then isn't called
}

export const startCamera = (video, videoConstraints) => {

  if(!isVideo(video, logName + 'startCamera: Provide a HTML video element to start the camera stream.' )) {

    return
  }

  stopCamera(video, false, true)

  if(!videoConstraints)           { videoConstraints = _default480p }

  if(videoConstraints.width)      { _videoConstraints.width.ideal       = videoConstraints.width }
  if(videoConstraints.height)     { _videoConstraints.height.ideal      = videoConstraints.height }
  if(videoConstraints.frameRate)  { _videoConstraints.frameRate.ideal   = videoConstraints.frameRate }
  if(videoConstraints.facingMode) { _videoConstraints.facingMode.ideal  = videoConstraints.facingMode }

  log(logName + 'startCamera:', _videoConstraints)

  return getUserMedia(video)
}

export const stopCamera = (video, pause = true, silent = false) => {

  if(!silent) {

    log(logName + 'stopCamera')
  }

  if(!isVideo(video, logName + 'stopCamera: Provide a HTML video element to stop the camera stream.' )) {

    return
  }

  const mediaStream = video.srcObject

  if(mediaStream) {

    mediaStream.getTracks().forEach((track) => { track.stop() })

  } else if(!silent) {

    warn(logName + 'stopCamera: No mediaStream attached to video.')
  }

  if(pause && !video.paused) {

    video.pause()
  }
}

export const toggleCameraFacingMode = (video) => {

  log(logName + 'toggleCameraFacingMode')

  if(!isVideo(video, logName + 'toggleCameraFacingMode: Provide a HTML video element to toggle the facing mode.')) {

    return
  }

  const newMode = _videoConstraints.facingMode.ideal === CameraFacingMode.USER ? CameraFacingMode.ENVIRONMENT : CameraFacingMode.USER

  log(logName + 'toggleCameraFacingMode: to ' + newMode)

  return startCamera(video, { facingMode: newMode })
}

export default { startCamera, stopCamera, toggleCameraFacingMode }
