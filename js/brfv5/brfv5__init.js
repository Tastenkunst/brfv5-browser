// Set the BRFv5 import and library name here.
// Also set your own appId for reference.

import { brfv5Module }          from './BRFv5_JS_tk260819_v5.0.0_trial.js'

const _libraryName              = 'BRFv5_JS_tk260819_v5.0.0_trial'
const _appId                    = 'brfv5.browser.examples' // (mandatory): 8 to 64 characters, a-z . 0-9 allowed

export const brfv5              = {}

let _brfv5Manager               = null
let _brfv5Config                = null

export const loadBRFv5Model     = (modelName, pathToModels = '', appId = null, onProgress = null) => {

  if(!modelName) { throw 'Please provide a modelName.' }

  return new Promise((resolve, reject) => {

    if(_brfv5Manager && _brfv5Config) {

      resolve({ brfv5Manager: _brfv5Manager, brfv5Config: _brfv5Config })

    } else {

      try {

        brfv5.appId             = appId ? appId : _appId
        brfv5.binaryLocation    = pathToModels + _libraryName + '_' + modelName + '.brfv5'
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
