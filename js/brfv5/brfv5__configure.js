import { log } from '../utils/utils__logging.js'

const _name = 'brfv5__configure'

export const configureFaceTracking = (brfv5Config, numTrackingPasses, enableFreeRotation) => {

  log(_name + ': configureFaceTracking:', numTrackingPasses, enableFreeRotation)

  brfv5Config.faceTrackingConfig.numTrackingPasses  = numTrackingPasses ? numTrackingPasses : 3
  brfv5Config.faceTrackingConfig.enableFreeRotation = enableFreeRotation
  brfv5Config.faceTrackingConfig.maxRotationZReset  = !enableFreeRotation ? 34.0 : 999.0
}

export const configureNumFacesToTrack = (brfv5Config, numFacesToTrack) => {

  log(_name + ': configureNumFacesToTrack:', numFacesToTrack)

  if(numFacesToTrack > 0) {

    brfv5Config.faceTrackingConfig.numFacesToTrack  = numFacesToTrack
    brfv5Config.enableFaceTracking                  = true

  } else {

    brfv5Config.faceTrackingConfig.numFacesToTrack  = 1
    brfv5Config.enableFaceTracking                  = false
  }
}

export const configureCameraInput = (brfv5Config, imageWidth, imageHeight) => {

  log(_name + ': configureCameraInput:', imageWidth, imageHeight)

  const inputSize = Math.min(imageWidth, imageHeight)

  // Setup image data dimensions

  brfv5Config.imageConfig.inputWidth  = imageWidth
  brfv5Config.imageConfig.inputHeight = imageHeight

  const sizeFactor      = inputSize / 480.0

  const innerBorderSize = 20.0
  const roiSize         = inputSize - (innerBorderSize * 2) * sizeFactor

  // Set face detection region of interest and parameters scaled to the image base size.

  brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
    (imageWidth  - roiSize) * 0.5, (imageHeight - roiSize) * 0.5, roiSize, roiSize
  )

  brfv5Config.faceDetectionConfig.minFaceSize             = 144 * sizeFactor
  brfv5Config.faceDetectionConfig.maxFaceSize             = 480 * sizeFactor

  if(imageWidth < imageHeight) {

    // Portrait mode: probably smartphone, faces tend to be closer to the camera, processing time is an issue,
    // so save a bit of time and increase minFaceSize.

    brfv5Config.faceDetectionConfig.minFaceSize           = 240 * sizeFactor
  }

  brfv5Config.faceDetectionConfig.faceSizeIncrease        = 24
  brfv5Config.faceDetectionConfig.stepSize                = 0
  brfv5Config.faceDetectionConfig.minNumNeighbors         = 12
  brfv5Config.faceDetectionConfig.filterNoise             = true

  // Set face tracking region of interest and parameters scaled to the image base size.

  brfv5Config.faceTrackingConfig.regionOfInterest.setTo(
    innerBorderSize * sizeFactor,
    innerBorderSize * sizeFactor,
    imageWidth  - (innerBorderSize * 2) * sizeFactor,
    imageHeight - (innerBorderSize * 2) * sizeFactor
  )

  brfv5Config.faceTrackingConfig.minFaceScaleStart        =  50.0  * sizeFactor
  brfv5Config.faceTrackingConfig.maxFaceScaleStart        = 320.0  * sizeFactor

  brfv5Config.faceTrackingConfig.maxRotationXStart        = 15.0
  brfv5Config.faceTrackingConfig.maxRotationYStart        = 25.0
  brfv5Config.faceTrackingConfig.maxRotationZStart        = 20.0

  brfv5Config.faceTrackingConfig.confidenceThresholdStart = 0.800

  brfv5Config.faceTrackingConfig.minFaceScaleReset        =  35.0  * sizeFactor
  brfv5Config.faceTrackingConfig.maxFaceScaleReset        = 420.0  * sizeFactor

  brfv5Config.faceTrackingConfig.maxRotationXReset        = 35.0
  brfv5Config.faceTrackingConfig.maxRotationYReset        = 45.0
  brfv5Config.faceTrackingConfig.maxRotationZReset        = 34.0

  brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.001

  brfv5Config.faceTrackingConfig.enableStabilizer         = true

}

export const configureImageInput = (brfv5Config, imageWidth, imageHeight) => {

  log(_name + ': configureImageInput:', imageWidth, imageHeight)

  const inputSize = imageWidth > imageHeight ? imageHeight : imageWidth

  // Setup image data dimensions

  brfv5Config.imageConfig.inputWidth  = imageWidth
  brfv5Config.imageConfig.inputHeight = imageHeight

  setROIsWholeImage(brfv5Config)

  const sizeFactor      = inputSize / 480.0

  // Set face detection region of interest and parameters scaled to the image base size.

  brfv5Config.faceDetectionConfig.minFaceSize             = 48  * sizeFactor
  brfv5Config.faceDetectionConfig.maxFaceSize             = 480 * sizeFactor

  brfv5Config.faceDetectionConfig.faceSizeIncrease        = 24
  brfv5Config.faceDetectionConfig.stepSize                = 0
  brfv5Config.faceDetectionConfig.minNumNeighbors         = 12
  brfv5Config.faceDetectionConfig.filterNoise             = true

  brfv5Config.faceTrackingConfig.minFaceScaleStart        = 24.0    * sizeFactor
  brfv5Config.faceTrackingConfig.maxFaceScaleStart        = 1480.0  * sizeFactor

  brfv5Config.faceTrackingConfig.maxRotationXStart        = 999.0
  brfv5Config.faceTrackingConfig.maxRotationYStart        = 999.0
  brfv5Config.faceTrackingConfig.maxRotationZStart        = 999.0

  brfv5Config.faceTrackingConfig.confidenceThresholdStart = 0.000

  brfv5Config.faceTrackingConfig.minFaceScaleReset        = 16.0    * sizeFactor
  brfv5Config.faceTrackingConfig.maxFaceScaleReset        = 1480.0  * sizeFactor

  brfv5Config.faceTrackingConfig.maxRotationXReset        = 999.0
  brfv5Config.faceTrackingConfig.maxRotationYReset        = 999.0
  brfv5Config.faceTrackingConfig.maxRotationZReset        = 999.0

  brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.000

  brfv5Config.faceTrackingConfig.enableStabilizer         = true
}

export const setROIsWholeImage = (brfv5Config) => {

  log(_name + ': setROIWholeImage')

  const iw = brfv5Config.imageConfig.inputWidth
  const ih = brfv5Config.imageConfig.inputHeight

  brfv5Config.faceDetectionConfig.regionOfInterest.setTo(0, 0, iw, ih)
  brfv5Config.faceTrackingConfig.regionOfInterest.setTo(0, 0, iw, ih)
}

// This deep copy function gives an overview of the properties and parameters that are
// available.

export const deepCopyBRFv5Config = (src, dst) => {

  log(_name + ': deepCopyBRFv5Config:', src, dst)

  dst.imageConfig.inputWidth                              = src.imageConfig.inputWidth
  dst.imageConfig.inputHeight                             = src.imageConfig.inputHeight

  dst.faceDetectionConfig.regionOfInterest.x              = src.faceDetectionConfig.regionOfInterest.x
  dst.faceDetectionConfig.regionOfInterest.y              = src.faceDetectionConfig.regionOfInterest.y
  dst.faceDetectionConfig.regionOfInterest.width          = src.faceDetectionConfig.regionOfInterest.width
  dst.faceDetectionConfig.regionOfInterest.height         = src.faceDetectionConfig.regionOfInterest.height

  dst.faceDetectionConfig.minFaceSize                     = src.faceDetectionConfig.minFaceSize
  dst.faceDetectionConfig.maxFaceSize                     = src.faceDetectionConfig.maxFaceSize
  dst.faceDetectionConfig.faceSizeIncrease                = src.faceDetectionConfig.faceSizeIncrease

  dst.faceDetectionConfig.stepSize                        = src.faceDetectionConfig.stepSize
  dst.faceDetectionConfig.minNumNeighbors                 = src.faceDetectionConfig.minNumNeighbors

  dst.faceDetectionConfig.rectMergeFactor                 = src.faceDetectionConfig.rectMergeFactor
  dst.faceDetectionConfig.rectSkipFactor                  = src.faceDetectionConfig.rectSkipFactor
  dst.faceDetectionConfig.filterNoise                     = src.faceDetectionConfig.filterNoise

  dst.faceTrackingConfig.regionOfInterest.x               = src.faceTrackingConfig.regionOfInterest.x
  dst.faceTrackingConfig.regionOfInterest.y               = src.faceTrackingConfig.regionOfInterest.y
  dst.faceTrackingConfig.regionOfInterest.width           = src.faceTrackingConfig.regionOfInterest.width
  dst.faceTrackingConfig.regionOfInterest.height          = src.faceTrackingConfig.regionOfInterest.height

  dst.faceTrackingConfig.numFacesToTrack                  = src.faceTrackingConfig.numFacesToTrack
  dst.faceTrackingConfig.numTrackingPasses                = src.faceTrackingConfig.numTrackingPasses

  dst.faceTrackingConfig.minFaceScaleStart                = src.faceTrackingConfig.minFaceScaleStart
  dst.faceTrackingConfig.maxFaceScaleStart                = src.faceTrackingConfig.maxFaceScaleStart
  dst.faceTrackingConfig.maxRotationXStart                = src.faceTrackingConfig.maxRotationXStart
  dst.faceTrackingConfig.maxRotationYStart                = src.faceTrackingConfig.maxRotationYStart
  dst.faceTrackingConfig.maxRotationZStart                = src.faceTrackingConfig.maxRotationZStart
  dst.faceTrackingConfig.confidenceThresholdStart         = src.faceTrackingConfig.confidenceThresholdStart

  dst.faceTrackingConfig.minFaceScaleReset                = src.faceTrackingConfig.minFaceScaleReset
  dst.faceTrackingConfig.maxFaceScaleReset                = src.faceTrackingConfig.maxFaceScaleReset
  dst.faceTrackingConfig.maxRotationXReset                = src.faceTrackingConfig.maxRotationXReset
  dst.faceTrackingConfig.maxRotationYReset                = src.faceTrackingConfig.maxRotationYReset
  dst.faceTrackingConfig.maxRotationZReset                = src.faceTrackingConfig.maxRotationZReset
  dst.faceTrackingConfig.confidenceThresholdReset         = src.faceTrackingConfig.confidenceThresholdReset

  dst.faceTrackingConfig.enableStabilizer                 = src.faceTrackingConfig.enableStabilizer
  dst.faceTrackingConfig.enableFreeRotation               = src.faceTrackingConfig.enableFreeRotation

  dst.enableFaceTracking                                  = src.enableFaceTracking
}

export default {
  configureCameraInput,
  configureImageInput,
  configureFaceTracking,
  configureNumFacesToTrack,
  setROIsWholeImage,
  deepCopyBRFv5Config
}
