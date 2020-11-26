(function() {

  var config                  = window.artov5;
  var brfv5                   = config.brfv5;
  var camera                  = config.camera;

  brfv5.appId                 = 'com.tastenkunst.artov5.ext';
  brfv5.pathToModels          = './static-brfv5/';

  var parseGetParams = function() {

    var params = {};

    window.location.search.substr(1).split('&').forEach(
      (item) => { var a = item.split('='); if(a.length === 2) { params[a[0]] = a[1] } });

    return params;
  };

  var overwriteConfig = function() {

    var params = parseGetParams();

    if(params.hasOwnProperty('dl')) {

      config.debugLevel   = parseInt(params.dl+'');
      brfv5.showDebugDraw = config.debugLevel > 1;
      brfv5.showStats     = config.debugLevel > 1;
    }

    if(params.hasOwnProperty('sp')) { config.showPreloader = params.sp === 'true' || params.sp === '1' }

    if(params.hasOwnProperty('nf')) {

      brfv5.numFacesToTrackOnMobile   = parseInt(params.nf+'');
      brfv5.numFacesToTrackOnDesktop  = parseInt(params.nf+'');
    }

    if(params.hasOwnProperty('nc')) {

      brfv5.numChunksToLoadOnMobile   = parseInt(params.nc+'');
      brfv5.numChunksToLoadOnDesktop  = parseInt(params.nc+'');
    }

    if(params.hasOwnProperty('ep')) { brfv5.enableDynamicPerformance  = params.ep === 'true' || params.ep === '1' }
    if(params.hasOwnProperty('mt')) { brfv5.modelType           = params.mt; }

    if(params.hasOwnProperty('ce')) { camera.enabled            = params.ce === 'true' || params.ce === '1' }
    if(params.hasOwnProperty('cw')) { camera.constraints.width  = parseInt(params.cw+''); }
    if(params.hasOwnProperty('ch')) { camera.constraints.height = parseInt(params.ch+''); }
    
    // if(params.hasOwnProperty('sv')) { config.numInitialViews      = parseInt(params.sv + '') }

    // TODO: SKU? (path to model including the SKU as mesh name + SKU as name)
    // Automatic checking of GET Param changes?
    // Layout?
    // >>> multiple SKUs?
  };

  overwriteConfig();

})();
