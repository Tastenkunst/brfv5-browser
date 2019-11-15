importScripts('./brfv5__init__worker.js')

let _width  = 0 // will be set by main thread
let _height = 0

const sentTrackFaces = function() { self.postMessage("trackFaces"); }

self.addEventListener('message', function(e) {

  let dataBuffer = new Int32Array(e.data);

  if(dataBuffer.length === 2) {

    setSize(dataBuffer[0], dataBuffer[1])

  } else if(_width > 0 && dataBuffer.length === _width * _height) {

    _brfv5Manager.update({ data: new Uint8ClampedArray(e.data), width: _width, height: _height })

    const faces = _brfv5Manager.getFaces();

    if(faces.length > 0) {

      const face = faces[0]
      const vertices = new Float32Array(face.vertices.length);

      for(let k = 0; k < face.vertices.length; k++) {

        vertices[k] = face.vertices[k];
      }

      self.postMessage(vertices.buffer, [vertices.buffer]);
    }
  }

}, false);

const setSize = (width, height) => {

  _width  = width
  _height = height

  configureTracking()
}

loadBRFv5Model('68l', 8, '../brfv5/models/', _appId,
  (progress) => { console.log(progress) }).then(({ brfv5Manager, brfv5Config }) => {

  console.log('loadBRFv5Model: done')

  _brfv5Manager  = brfv5Manager
  _brfv5Config   = brfv5Config

  configureTracking()

}).catch((e) => { console.error('BRFv5 failed: ', e) })

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

    console.log('configureTracking:', _brfv5Config)

    _brfv5Manager.configure(_brfv5Config)

    sentTrackFaces();
  }
}
