// Keep the resolution to a minimum.

// Internally BRFv5 works on a 480p image. By setting a 640x480 resolution no image scaling will be performed.
// Other resolutions, eg. 1280x720 or 1920x1080 will need an internal scaling and thus be slower.

const _cameraVideo          = document.createElement("video");
let   _cameraStream         = null;

_cameraVideo.setAttribute("playsinline", "true");

export const startCamera    = (videoConstraints) => {

  return new Promise((resolve, reject) => {

    console.log("brfv5_basic_camera: startCamera");

    window.navigator.mediaDevices.getUserMedia({video: videoConstraints}).then((mediaStream) => {

      _cameraVideo.srcObject = _cameraStream = mediaStream;
      _cameraVideo.play().then(() => {

        console.log("brfv5_basic_camera: resolution: " + _cameraVideo.videoWidth + "x" + _cameraVideo.videoHeight);

        resolve({
          resolution: {
            width:  _cameraVideo.videoWidth,
            height: _cameraVideo.videoHeight
          },
          video:    _cameraVideo
        });

      }).catch(function (e) {

        reject(e);
      });
      
    }).catch(function (e) {

      reject(e);
    });
  }).catch((error) => {

    console.error("BRFv5Webcam:", error);
  });
};

export const stopCamera = () => {

  console.log("BRFv5Webcam.stopCamera");

  if(_cameraStream) {

    _cameraStream.getTracks().forEach((track) => {
      track.stop();
    });

    _cameraStream = null;
  }

  _cameraVideo.pause();
};