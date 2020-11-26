const { brfv5Module } = require('./js/brfv5/brfv5_js_tk261120_v5.2.1_trial_nodejs')

const fs        = require('fs')
const pixels    = require('image-pixels')

const imageURL  = './assets/tracking/brfv5_portrait_marcel.jpg'

let imageBuffer = null; // file buffer
let imageData   = null; // pixel buffer

// Set the BRFv5 library name here, also set your own appId for reference.

const _libraryName    = 'brfv5_js_tk261120_v5.2.1_trial.brfv5'
const _appId          = 'brfv5.nodejs.minimal' // (mandatory): 8 to 64 characters, a-z . 0-9 allowed
const brfv5           = {} // The library namespace.

// References to the video and canvas.
// const _webcam         = document.getElementById('_webcam')
// const _imageData      = document.getElementById('_imageData')

// Those variables will be retrieved from the stream and the library.
let _brfv5Manager     = null
let _brfv5Config      = null
let _width            = 0
let _height           = 0

// loadBRFv5Model and openCamera are being done simultaneously thanks to Promises. Both call
// configureTracking which only gets executed once both Promises were successful. Once configured
// trackFaces will do the tracking work and draw the results.

const loadBRFv5Model  = (modelName, numChunksToLoad, pathToModels = '', appId = null, onProgress = null) => {

  console.log('loadBRFv5Model')

  if(!modelName) { throw 'Please provide a modelName.' }

  return new Promise((resolve, reject) => {

    if(_brfv5Manager && _brfv5Config) {

      resolve({ brfv5Manager: _brfv5Manager, brfv5Config: _brfv5Config })

    } else {

      try {

        brfv5.appId             = appId ? appId : _appId
        brfv5.binaryLocation    = pathToModels + _libraryName
        brfv5.modelLocation     = pathToModels + modelName + '_c'
        brfv5.modelChunks       = numChunksToLoad // 4, 6, 8
        brfv5.binaryProgress    = onProgress
        brfv5.binaryError       = (e) => { reject(e) }
        brfv5.onInit            = (brfv5Manager, brfv5Config) => {

          _brfv5Manager         = brfv5Manager
          _brfv5Config          = brfv5Config

          resolve({ brfv5Manager: _brfv5Manager, brfv5Config: _brfv5Config })
        }

        brfv5Module(brfv5)

      } catch(e) {

        reject(e)
      }
    }
  })
}

const loadImage = async (imageURL) => {

  console.log('loadImage: ', imageURL)

  imageBuffer = fs.readFileSync(imageURL);

  const { data, width, height } = await pixels(imageBuffer)

  imageData = data;

  return { width: width, height: height };
}

const configureTracking = () => {

  if(_brfv5Config !== null && _width > 0) {

    // Camera stream and BRFv5 are ready. Now configure. Internal defaults are set for a 640x480 resolution.
    // So the following isn't really necessary.

    const brfv5Config = _brfv5Config
    const imageWidth  = _width
    const imageHeight = _height

    const inputSize = imageWidth > imageHeight ? imageHeight : imageWidth

    // Setup image data dimensions

    brfv5Config.imageConfig.inputWidth  = imageWidth
    brfv5Config.imageConfig.inputHeight = imageHeight

    const sizeFactor      = inputSize / 480.0

    // Set face detection region of interest and parameters scaled to the image base size.

    brfv5Config.faceDetectionConfig.regionOfInterest.setTo(0, 0, imageWidth, imageHeight)

    brfv5Config.faceDetectionConfig.minFaceSize = 144 * sizeFactor
    brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor

    if(imageWidth < imageHeight) {

      // Portrait mode: probably smartphone, faces tend to be closer to the camera, processing time is an issue,
      // so save a bit of time and increase minFaceSize.

      brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor
    }

    // Set face tracking region of interest and parameters scaled to the image base size.

    brfv5Config.faceTrackingConfig.regionOfInterest.setTo(0, 0, imageWidth, imageHeight)

    brfv5Config.faceTrackingConfig.minFaceScaleStart        =  50.0  * sizeFactor
    brfv5Config.faceTrackingConfig.maxFaceScaleStart        = 320.0  * sizeFactor

    brfv5Config.faceTrackingConfig.minFaceScaleReset        =  35.0  * sizeFactor
    brfv5Config.faceTrackingConfig.maxFaceScaleReset        = 420.0  * sizeFactor

    brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.001

    brfv5Config.faceTrackingConfig.enableStabilizer         = true

    brfv5Config.faceTrackingConfig.maxRotationXReset        = 35.0
    brfv5Config.faceTrackingConfig.maxRotationYReset        = 45.0
    brfv5Config.faceTrackingConfig.maxRotationZReset        = 34.0

    brfv5Config.faceTrackingConfig.numTrackingPasses        = 3
    brfv5Config.faceTrackingConfig.enableFreeRotation       = true
    brfv5Config.faceTrackingConfig.maxRotationZReset        = 999.0

    brfv5Config.faceTrackingConfig.numFacesToTrack          = 1
    brfv5Config.enableFaceTracking                          = true

    // console.log('configureTracking:', _brfv5Config)

    _brfv5Manager.configure(_brfv5Config)

    trackFaces()
  }
}

const trackFaces = () => {

  if(!_brfv5Manager || !_brfv5Config) { return }

  _brfv5Manager.update({ width: _width, height: _height, data: imageData })

  const faces = _brfv5Manager.getFaces()

  for(let i = 0; i < faces.length; i++) {

    console.log(faces[i].bounds)
  }
}

// TODO: warum geht 7 und 8 nicht bei 68l? Memory issue in nodejs? Not sure about it.
// for 68l, use 6 max model chunks
// for 42l, use 8 max model chunks
loadBRFv5Model('68l', 6, './js/brfv5/models/', _appId,
  (progress) => { console.log(progress) }).then(({ brfv5Manager, brfv5Config }) => {

  console.log('loadBRFv5Model: done')

  _brfv5Manager  = brfv5Manager
  _brfv5Config   = brfv5Config

  console.log(brfv5)

  loadImage(imageURL).then(({ width, height }) => {

    console.log('loadImage: done: ' + width + 'x' + height)

    _width            = width
    _height           = height

    configureTracking()

  }).catch((e) => { if(e) { console.error('loadImage failed: ', e) } })

}).catch((e) => { console.error('BRFv5 failed: ', e) })
