(function() {

  function ARTOv5Model3D() {

    this.pathToModel                = null;
    this.pathToTextures             = null;

    this.nameModel                  = null;

    this.isOcclusionModel           = false;
    this.isMaterialCollection       = false;
  }

  function ARTOv5ViewSpot() {

    this.viewSpot                   = null;
    this.models                     = [];
    this.api                        = {}
  }

  function CameraConfig() {

    this.enabled                    = true;
    this.constraints                = { width: 640, height: 480, frameRate: 30, facingMode: 'user', mirrored: true };
  }

  function BRFv5Config() {

    this.appId                      = 'com.tastenkunst.artov5.ext';
    this.pathToModels               = './static-brfv5/';
    this.modelType                  = '42l';

    this.numFacesToTrackOnMobile    = 1;
    this.numChunksToLoadOnMobile    = 4;

    this.numFacesToTrackOnDesktop   = 1;
    this.numChunksToLoadOnDesktop   = 6;

    this.enableDynamicPerformance   = true;
    this.showStats                  = false;
    this.showDebugDraw              = false;
  }

  function ARTOv5Config() {

    this.debugLevel                 = 0;
    this.show3DOverlay              = true;
    this.show2DOverlay              = false; // Not implemented yet.
    this.showPreloader              = true;

    this.brfv5                      = new BRFv5Config();
    this.camera                     = new CameraConfig();
    this.views                      = [];

    this.events                     = {

      onProgress:                   null,

      onCameraOpened:               null,
      onCameraClosed:               null,
      onCameraError:                null,

      onBRFv5Ready:                 null,
      onBRFv5Tracked:               null,
      onBRFv5Error:                 null,

      onThreeJSReady:               null,
      onThreeJSModelsLoaded:        null,
      onThreeJSError:               null,

      onError:                      null
    };

    this.api                        = {}
  }

  var artov5                        = window.artov5 = new ARTOv5Config();

  artov5.ARTOv5Model3D              = ARTOv5Model3D;
  artov5.ARTOv5ViewSpot             = ARTOv5ViewSpot;

})();
