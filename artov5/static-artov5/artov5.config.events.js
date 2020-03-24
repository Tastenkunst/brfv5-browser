(function() {

  var events                    = window.artov5.events;
  var config                    = window.artov5;

  events.onProgress             = function(progress) { if(config.debugLevel > 0) console.log('artov5.events.onProgress: progress:', progress) }

  events.onCameraOpened         = function(resolution) { if(config.debugLevel > 0) console.log('artov5.events.onCameraOpened: resolution:', resolution) }
  events.onCameraClosed         = function( )     { if(config.debugLevel > 0) console.log('artov5.events.onCameraClosed') }
  events.onCameraError          = function(e)     { events.onError(e) }

  events.onBRFv5Ready           = function(numFacesToTrack) { if(config.debugLevel > 0) console.log('artov5.events.onBRFv5Ready: numFacesToTrack:', numFacesToTrack) }
  events.onBRFv5Tracked         = function(faces) { /*if(config.debugLevel > 0) console.log('artov5.events.onBRFv5Tracked', faces)*/ }
  events.onBRFv5Error           = function(e)     { events.onError(e) }

  events.onThreeJSReady         = function( )     { if(config.debugLevel > 0) console.log('artov5.events.onThreeJSReady') }
  events.onThreeJSModelsLoaded  = function( )     { if(config.debugLevel > 0) console.log('artov5.events.onThreeJSModelsLoaded') }
  events.onThreeJSError         = function(e)     { events.onError(e) }

  events.onError                = function(e) {

    console.error('artov5.events.onError', e.code, e.error);

    switch(e.code) {

      case 'CAMERA_FAILED': console.log('Show nice camera popup with instructions.'); break;
      case 'BRFV5_FAILED':  console.log('hmm, old browser (no WebAssembly)???'); break;
      case '3D_FAILED':

        if(e.error.message === 'SCENE_CREATION_FAILED') {

          console.log('hmm, old browser (no WebGL)???');

        } else if(e.error.message === 'LOADING_3D_MODEL_FAILED') {

          console.log('Check your 3d model paths!')

        } else if(e.error.message === 'SETTING_3D_MODEL_NAME_FAILED') {

          console.log('That 3d model name or sku doesn\'t exist for that model.')

        } else {

          console.log('hmm, not sure?')
        }

        break;

      default:

        console.log('hmm, unknwon error');

        break;
    }
  };

})();

