// Set the BRFv5 import and library name here.
// Also set your own appId for reference.

importScripts('../brfv5/brfv5_js_tk261120_v5.2.1_trial_no_modules.js')

const _libraryName              = 'brfv5_js_tk261120_v5.2.1_trial.brfv5'
const _appId                    = 'brfv5.browser.worker' // (mandatory): 8 to 64 characters, a-z . 0-9 allowed

const brfv5                     = {}

let _brfv5Manager               = null
let _brfv5Config                = null

// numChunksToLoad: can be anything from 4 to 8.
const loadBRFv5Model            = (modelName, numChunksToLoad, pathToModels = '', appId = null, onProgress = null) => {

  if(!modelName) { throw 'Please provide a modelName.' }

  return new Promise((resolve, reject) => {

    if(_brfv5Manager && _brfv5Config) {

      resolve({ brfv5Manager: _brfv5Manager, brfv5Config: _brfv5Config })

    } else {

      try {

        brfv5.appId             = appId ? appId : _appId
        brfv5.binaryLocation    = pathToModels + _libraryName
        brfv5.modelLocation     = pathToModels + modelName + '_c'
        brfv5.modelChunks       = numChunksToLoad // 4, 6, 8
        brfv5.binaryProgress    = onProgress
        brfv5.binaryError       = (e) => { reject(e) }
        brfv5.onInit            = (brfv5Manager, brfv5Config) => {

          _brfv5Manager         = brfv5Manager
          _brfv5Config          = brfv5Config

          resolve({ brfv5Manager: _brfv5Manager, brfv5Config: _brfv5Config })
        }

        brfv5Module(brfv5)

      } catch(e) {

        reject(e)
      }
    }
  })
}
