"use strict";

// Functions:
//
// startCamera(videoConstraints)
// stopCamera()
//
// Keep the resolution to a minimum.
// Internally BRFv5 works on a 480p image. By setting a 640x480 resolution no image scaling will be performed.
// Other resolutions, eg. 1280x720 or 1920x1080 will need an internal scaling and thus be slower.

const _cameraVideo  = document.createElement("video");
let   _cameraStream = null;

_cameraVideo.setAttribute("playsinline", "true");

const startCamera = (videoConstraints) => {

  console.log("BRFv5Webcam.startCamera");

  return new Promise((resolve, reject) => {

    window.navigator.mediaDevices.getUserMedia({video: videoConstraints}).then((mediaStream) => {

      _cameraVideo.srcObject = _cameraStream = mediaStream;
      _cameraVideo.play().then(() => {

        console.log("BRFv5Webcam: resolution: " + _cameraVideo.videoWidth + "x" + _cameraVideo.videoHeight);

        resolve({
          width:  _cameraVideo.videoWidth,
          height: _cameraVideo.videoHeight,
          video:  _cameraVideo
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

const stopCamera = () => {

  console.log("BRFv5Webcam.stopCamera");

  if(_cameraStream) {

    _cameraStream.getTracks().forEach((track) => {
      track.stop();
    });

    _cameraStream = null;
  }

  _cameraVideo.pause();
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { startCamera, stopCamera };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { startCamera, stopCamera }; });

} else if (typeof exports === "object") {

  exports["BRFv5Webcam"] = { startCamera, stopCamera };
}