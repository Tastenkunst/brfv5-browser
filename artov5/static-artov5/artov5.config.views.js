(function() {

  var api                     = window.artov5.api;
  var views                   = window.artov5.views;
  var ARTOv5ViewSpot          = window.artov5.ARTOv5ViewSpot;

  var pathTo3DModels          = './static-artov5/3d/';
  var pathTo3DModelTextures   = './static-artov5/3d/textures/';

  var pathToOcclusionModel    = './static-artov5/3d/occlusion_head.artov5';
  var pathToOcclusionTextures = './static-artov5/3d/textures/';

  // We want a max of two views:
  // single view
  // double view top/bottom (portrait mode)
  // double view left/right (landscape mode)

  var view0, view1; // view0 is either the single view OR top or left in double view mode

  ARTOv5ViewSpot.prototype.loadModel = function(pathToModel, pathToTextures, nameModel) {

    var models = this.models;

    for(var i = 0; i < models.length; i++) {

      var model = models[i];

      if(!model.isOcclusionModel && !model.isMaterialCollection) {

        model.pathToModel     = pathToModel;
        model.pathToTextures  = pathToTextures;
        model.nameModel       = nameModel;
      }
    }
  }

  ARTOv5ViewSpot.prototype.setModelName = function(nameModel) {

    var models = this.models;

    for(var i = 0; i < models.length; i++) {

      var model = models[i];

      if(!model.isOcclusionModel && !model.isMaterialCollection) {

        model.nameModel = nameModel;
      }
    }
  }

  ARTOv5ViewSpot.prototype.updateMeshMaterial = function(config) {

    /* config: { nameMesh, color, opacity } */

    config = { nameMesh: 'glass', color: 0x228812, opacity: 0.75}

    if(this.api.updateMeshMaterial) {

      this.api.updateMeshMaterial(config)
    }
  }

  api.setupViews = function() {

    view0 = api.setup3DViewSpot('full-view', pathToOcclusionModel, pathToOcclusionTextures)
    view1 = api.setup3DViewSpot('hidden', pathToOcclusionModel, pathToOcclusionTextures)

    views.push(view0);
    views.push(view1);

    view0.loadModel(pathTo3DModels + 'rayban.artov5', pathTo3DModelTextures, 'black')
    view1.loadModel(pathTo3DModels + 'pearlearring_left.artov5', pathTo3DModelTextures)
  }

  api.switchToSingleView = function() {

    if(view0 && view1) {

      view0.viewSpot = 'full-view'
      view1.viewSpot = 'hidden'
    }
  }

  api.switchToDoubleViewLeftRight = function() {

    if(view0 && view1) {

      view0.viewSpot = 'left-column'
      view1.viewSpot = 'right-column'
    }
  }

  api.switchToDoubleViewTopBottom = function() {

    if(view0 && view1) {

      view0.viewSpot = 'top-row'
      view1.viewSpot = 'bottom-row'
    }
  }

  api.setupViews();
  api.switchToSingleView();

})();

// view_spot, either:
//
// .full-view    { top:      0; left:    0; width: 100%; height: 100% }
//
// .left-column  { top:      0; left:    0; width:  50%; height: 100% }
// .right-column { top:      0; right:   0; width:  50%; height: 100% }
//
// .top-row      { top:      0; left:    0; width: 100%; height:  50% }
// .bottom-row   { bottom:   0; left:    0; width: 100%; height:  50% }
//
// .top-left     { top:      0; left:    0; width:  50%; height:  50% }
// .top-right    { top:      0; right:   0; width:  50%; height:  50% }
// .bottom-left  { bottom:   0; left:    0; width:  50%; height:  50% }
// .bottom-right { bottom:   0; right:   0; width:  50%; height:  50% }
