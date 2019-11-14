/**
 * BRFv5 - Choosing the right model for your project:
 *
 * '42l_min', '42l_medium', '42l_max'
 * '68l_min', '68l_medium', '68l_max'
 * 'fd_only'
 *
 * TL;DR:
 * 42l for 3d try-on apps, 68l for full tracking,
 * _max on desktop, _min on mobile.
 * 'fd_only' if no Face Tracking.
 *
 * There are two models available, the standard 68 landmarks version and
 * a model with 42 landmarks.
 *
 * The 68l model gives you full mouth and eye tracking, while the 42l model
 * mostly omits mouth and eyes, only tracking eye and mouth corners.
 *
 * The 42l model was designed to have a smaller file size and faster
 * processing time, giving a 3d engine, like ThreeJS, a bit more time
 * per frame for its additional processing.
 *
 * Max, medium and min versions of each model are a trade-off between file size,
 * speed and accuracy.
 *
 * While min files are smaller, they contain fewer cascades and are therefor less
 * accurate in edge cases. Max files are larger, the tracking takes longer, but
 * the tracking is more accurate in edge cases.
 * Rule of thumb: Max may be used on desktop and min on mobile platforms.
 *
 * fd_only can be loaded, if absolutely no Face Tracking is done.
 **/

import { setupExample }                     from './setup__example.js'
import { trackCamera, trackImage }          from './setup__example.js'

import { SystemUtils }                      from '../utils/utils__system.js'

const exampleConfig = {

  // These examples will load the model once per page load and reuse it for each example.
  // That's why we only load 68l. min for mobile, max for desktop.
  // BRFv5 can't reinitialize with a different model, so choose wisely.

  modelName:                '68l',
  numChunksToLoad:          SystemUtils.isMobileOS ? 4 : 8,
}

// run() will be called automatically after 1 second, if run isn't called immediately after the script was loaded.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1

export const run = () => {

  clearTimeout(timeoutId)
  setupExample(exampleConfig)

  if(window.selectedSetup === 'image') {

    trackImage('./assets/tracking/' + window.selectedImage)

  } else {

    trackCamera()
  }
}

timeoutId = setTimeout(() => { run() }, 1000)

export default { run }
