// ARTOv5 v1.0.0 - 10.07.2019

// ###### ARTOv5 Config ######

// ARTOv5 will be waiting for this config to be available (looking for config in the artov5 namespace in window).

const artov5 = window.artov5 || {}; if(!window.artov5) window.artov5 = artov5;

artov5.config = {

  // The following paths are read once on startup.

  path_to_assets:                 './artov5_static/',
  path_to_brfv5_models:           './artov5_static/js/brfv5/models/',

  path_to_3d_material_collection: null,
  path_to_3d_textures:            './artov5_static/3d/textures/',
  path_to_3d_occlusion_model:     './artov5_static/3d/occlusion_head_reference.artov5',

  // The 3d model file and the name of the model to show might be changed during runtime.
  // Once set, call updateConfig() to switch the 3d model. See short cut functions below.

  path_to_3d_model:               './artov5_static/3d/rayban.artov5',
  name_of_3d_model:               'blue',

  // Whether or not to to console.log and show debug information.

  show_debug:                     false,

  // Whether or not to show the initial preloader bar.

  show_preloader:                 true,

  // Whether or not the camera should be active (set initially to true for autostart).

  enable_camera:                  true,

  // If set to true it is possible to change the currently viewed model to a model dragged and dropped onto
  // the browser window. Might come in handy for testing new models.

  enable_draganddrop:             false,

  //  480p:   640x480@30, (default) only use higher settings, if you know your hardware does support it.
  //  720p:  1280x720@30, not recommended.
  // 1080p: 1920x1080@30, not recommended.

  camera_constraints: { width: 640, height: 480, frameRate: 30, facingMode: 'user', mirrored: true }
}

// ###### ARTOv5 Config ######



// ###### ARTOv5 Read Get Params ######

const overwriteConfig = () => {

  artov5.params = {}

  window.location.search
    .substr(1)
    .split('&')
    .forEach((item) => { const a = item.split('='); if(a.length === 2) { artov5.params[a[0]] = a[1] } })

  if(artov5.params.hasOwnProperty('sd')) { artov5.config.show_debug         = artov5.params.sd === 'true' || artov5.params.sd === '1' }
  if(artov5.params.hasOwnProperty('sp')) { artov5.config.show_preloader     = artov5.params.sp === 'true' || artov5.params.sp === '1' }
  if(artov5.params.hasOwnProperty('pm')) { artov5.config.path_to_3d_model   = artov5.params.pm }
  if(artov5.params.hasOwnProperty('nm')) { artov5.config.name_of_3d_model   = artov5.params.nm }
  if(artov5.params.hasOwnProperty('ec')) { artov5.config.enable_camera      = artov5.params.ec === 'true' || artov5.params.ec === '1' }
  if(artov5.params.hasOwnProperty('ed')) { artov5.config.enable_draganddrop = artov5.params.ed === 'true' || artov5.params.ed === '1' }
}

overwriteConfig()

// ###### ARTOv5 Read Get Params ######



// ###### ARTOv5 API ######

// ######
// The following functions will be internally set by ARTOv5, but are to be called by your website.
// ######

// void updateConfig(void)

// To change the 3d model, change either
//
// path_to_3d_model or
// name_of_3d_model
//
// then call updateConfig().

// Eg. change:
//
// + path_to_3d_model: from rayban.json to earrings.json
// + name_of_3d_model: from blue to silver
//
// This will display the earrings instead of the glasses.

// Or only change (while keeping rayban.json)
//
// + name_of_3d_model: from blue to black
//
// to display the black version of the glasses.
//
// The 3d model should be prepared using TPPTv5 (ThreeJS Post Processing Tool) to make sure the model fits the head.

// Also keep in mind:
// Switching 3d model files is not instant, model files need to be loaded first.
// Switching model names should be instant.

// To save download size/time, serve 3d model files using gzip or brotli compression, use TPPTv5 for a compressed export.

if(!artov5.updateConfig) artov5.updateConfig = null; // Will be set by ARTOv5 internally.

// ######
// The following functions are short cuts for setting a config value and updating the config
// ######

// camera

if(!artov5.startCamera) artov5.startCamera = () => {

  artov5.config.enable_camera = true

  if(artov5.updateConfig) { artov5.updateConfig() }
};

if(!artov5.stopCamera) artov5.stopCamera = () => {

  artov5.config.enable_camera = false

  if(artov5.updateConfig) { artov5.updateConfig() }
};

if(!artov5.toggleCameraFacingMode) artov5.toggleCameraFacingMode = () => {

  artov5.config.camera_constraints.facingMode =
    artov5.config.camera_constraints.facingMode === 'user' ? 'environment' : 'user'

  if(artov5.updateConfig) { artov5.updateConfig() }
};

// 3d

if(!artov5.load3DModel) artov5.load3DModel = (path_to_3d_model) => {

  artov5.config.path_to_3d_model = path_to_3d_model

  if(artov5.updateConfig) { artov5.updateConfig() }
};

if(!artov5.switch3DModel) artov5.switch3DModel = (name_of_3d_model) => {

  artov5.config.name_of_3d_model = name_of_3d_model

  if(artov5.updateConfig) { artov5.updateConfig() }
};

// misc

if(!artov5.showDebug) artov5.showDebug = (show) => {

  artov5.config.show_debug = show

  if(artov5.updateConfig) { artov5.updateConfig() }
};

if(!artov5.toggleDragAndDrop) artov5.toggleDragAndDrop = () => {

  artov5.config.enable_draganddrop = !artov5.config.enable_draganddrop

  if(artov5.updateConfig) { artov5.updateConfig() }
};

// ###### ARTOv5 API ######



// ###### ARTOv5 callbacks ######

// ######
// The following functions might be set/overwritten by your website and called by ARTOv5.
// ######

// void onInitialProgress(float)

// The function, if set, will provide a percentage value (0.0 to 1.0).
// Once progress reaches 1.0, the initial loading is done and an eventual preloader might be hidden.
// In Chrome: gzip doesn't provide the content total size. It's set to 0. So 1.0 might be reported several times.
// The simple provided preloader uses clearTimeout/setTimeout with 1 second delay to hide the
// preloader once loading finished.

if(!artov5.onInitialProgress) artov5.onInitialProgress = (progress) => {

  if(artov5.config.show_debug) {

     console.log("artov5.onInitialProgress", progress)
  }
}

// void onError(string)

// The function, if set, will be called whenever an error occurs.

artov5.ERRORS = {

  CAMERA_FAILED:                          -10, // Failed to access the camera, either no camera attached or forbidden by user.
  SCENE_CREATION_FAILED:                  -11, // no WebGL support? Device/Browser too old?
  BRFV5_FAILED:                           -12, // no WebAssembly support? Device/Browser too old?

  LOADING_3D_MATERIAL_COLLECTION_FAILED:  -20, // path_to_3d_material_collection could not be loaded.
  LOADING_3D_OCCLUSION_MODEL_FAILED:      -21, // path_to_3d_occlusion_model could not be loaded.
  LOADING_3D_MODEL_FAILED:                -22, // path_to_3d_model could not be loaded.
  DRAGANDDROP_3D_MODEL_FAILED:            -23, // Drag and Drop of a 3d model failed.
  SETTING_3D_MODEL_NAME_FAILED:           -24, // name_of_3d_model could not be found.
};

if(!artov5.onError) artov5.onError = (id) => {

  console.error("artov5.onError: " + id);
};

// ###### ARTOv5 callbacks ######
