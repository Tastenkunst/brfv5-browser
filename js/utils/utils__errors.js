export const ERRORS = {

  CAMERA_FAILED:                          -10, // Failed to access the camera, either no camera attached or forbidden by user.
  IMAGE_FAILED:                           -11, // Failed to load an image.
  SCENE_CREATION_FAILED:                  -12, // no WebGL support? Device/Browser too old?
  BRFV5_FAILED:                           -13  // no WebAssembly support? Device/Browser too old?
};

export default { ERRORS }
