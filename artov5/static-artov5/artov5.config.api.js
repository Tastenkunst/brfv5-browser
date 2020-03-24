(function() {

  var api                     = window.artov5.api;
  var camera                  = window.artov5.camera;

  // camera api

  api.startCamera             = function() { camera.enabled = true; };
  api.stopCamera              = function() { camera.enabled = false; };
  api.toggleCameraFacingMode  = function() {

    if(camera.constraints.facingMode === 'user') {

      camera.constraints.facingMode = 'environment';
      camera.constraints.mirrored   = false;

    } else {

      camera.constraints.facingMode = 'user';
      camera.constraints.mirrored   = true;
    }
  };

  // setup view/model objects

  api.setup3DModel = function(pathToModel, pathToTexture, nameModel,
                              isOcclusionModel, isMaterialCollection) {

    var model = new artov5.ARTOv5Model3D();

    model.pathToModel           = pathToModel           || null;
    model.pathToTextures        = pathToTexture         || null;
    model.nameModel             = nameModel             || null;
    model.isOcclusionModel      = isOcclusionModel      || false;
    model.isMaterialCollection  = isMaterialCollection  || false;

    return model;
  }

  api.setup3DViewSpot = function(viewSpot, pathToOcclusionModel, pathTextures) {

    var view = new artov5.ARTOv5ViewSpot();

    view.models.push(api.setup3DModel(pathToOcclusionModel, pathTextures, null, true));
    view.models.push(api.setup3DModel());

    view.viewSpot = viewSpot;

    return view;
  }

})();

