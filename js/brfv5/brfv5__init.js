// Set the BRFv5 import and library name here.
// Also set your own appId for reference.



import { brfv5Module }          from './brfv5_js_tk261120_v5.2.1_trial.js'          // WebAssembly is available is every major browser, no need for asm.js
const _libraryName              =      'brfv5_js_tk261120_v5.2.1_trial.brfv5'       // for WebAssembly

const _appId                    = 'brfv5.browser.examples' // (mandatory): 8 to 64 characters, a-z . 0-9 allowed

export const brfv5              = {}

let _brfv5Manager               = null
let _brfv5Config                = null

// numChunksToLoad: can be anything from 4 to 8.
export const loadBRFv5Model     = (modelName, numChunksToLoad, pathToModels = '', appId = null, onProgress = null) => {

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

export default { loadBRFv5Model, brfv5 }
