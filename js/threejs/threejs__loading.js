// This module handles the ThreeJS model loading part.

import { brfv5 }                  from '../brfv5/brfv5__init.js'
import { log, warn, error }       from '../utils/utils__logging.js'

import { ObjectLoader, FileLoader } from './threejs__setup.js'

const logName                     = 'threejs_loading:'
const modelInstanceMap            = {}
const materialIdMap               = {}
const materialNameMap             = {}

export const load3DModelList = ({ fileList, onProgress }) => {

  return new Promise((resolve, reject) => {

    log(logName, 'load3DModelList:', fileList)

    if(!fileList) {

      reject('No fileList given.')

    } else {

      let numLoaders = fileList.length

      if(numLoaders > 0) {

        fileList.forEach( (obj) => {

          if(obj.hasOwnProperty('pathToModel')) {

            obj.url = obj.pathToModel
          }

          if(obj.hasOwnProperty('pathToTextures')) {

            obj.texturePath = obj.pathToTextures
          }

          if(!obj.url) {

            log(logName, 'load3DModelList: url null:', obj.url)

            --numLoaders

            return
          }

          load3DJsonFile(obj.url, obj.texturePath, (url) => {

            log(logName, 'load3DModelList: loaded:', url)

            const obj3d = modelInstanceMap[url]

            extractMaterials(obj3d)

            if(--numLoaders <= 0) {

              log(logName, 'load3DModelList: all files loaded')

              resolve()
            }

          }, onProgress, (e) => { reject(e) })
        })

      } else {

        log(logName, 'load3DModelList: no files loaded.')

        resolve()
      }
    }
  })
}

const load3DJsonFile = (url, texturePath, onComplete, onProgress, onError) => {

  log(logName, 'load3DJsonFile: check: url:', url)

  let model = modelInstanceMap[url]

  if(url && !model) {

    log(logName, 'load3DJsonFile: added: url:', url)

    const fileLoader = new FileLoader()

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      fileLoader.setResponseType('arraybuffer')
    }

    fileLoader.load( url, (content) => {

      onLoaded3DJsonFile(content, url, texturePath, onComplete, onError)

    }, onProgress, onError)

  } else {

    log(logName, 'load3DJsonFile: already loaded: url:', url)

    if(onComplete) { onComplete(url) }
  }
}

const onLoaded3DJsonFile = (content, url, texturePath, onComplete, onError) => {

  try {

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      largeUint8ArrToString(brfv5['process'](new Uint8Array(content)), function(fileContent) {

        parse3DJsonFile(JSON.parse(fileContent), url, texturePath, onComplete, onError)

      })

    } else {

      parse3DJsonFile(JSON.parse(content), url, texturePath, onComplete, onError)
    }

  } catch(e) {

    error( logName, 'Can\'t parse ', url, e.message )

    if(onError) { onError(e) }
  }
}

const parse3DJsonFile = (json, url, texturePath, onComplete, onError) => {

  log(logName, 'parse3DJsonFile: url:', url)

  if(!json) {

    error(logName, 'Can\'t parse ' + url + '. No JSON given.')

    if(onError) { onError() }

    return
  }

  const metadata = json.metadata

  if(metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {

    error(logName, 'Can\'t parse ' + url + '. No metadata given.')

    if(onError) { onError() }

    return
  }

  if(texturePath && json.hasOwnProperty('images')) {

    for(let i = 0; i < json.images.length; i++) {

      let image = json.images[i]

      if(image.hasOwnProperty('url')) {

        if(image.url.indexOf('data:image') === -1) {

          image.url = texturePath + image.url.split('/').pop()
        }
      }
    }
  }

  if(!modelInstanceMap[url]) {

    log(logName, 'parse3DJsonFile: parse:', url)

    const loader = new ObjectLoader()

    const object3D = loader.parse(json)
    object3D.name = url

    modelInstanceMap[url] = object3D

    log(logName, 'object3D:', object3D)
  }

  if(onComplete) { onComplete(url) }
}

export const getModelInstance = (t3d, url) => {

  log(logName, 'getModelInstance:', url)

  if(!t3d || !url || !modelInstanceMap[url]) return null

  if(!t3d.hasOwnProperty('modelInstanceMap')) t3d.modelInstanceMap = {}

  if(t3d.modelInstanceMap[url]) {

    log(logName, 'getModelInstance: found:', t3d.modelInstanceMap[url])

  } else {

    t3d.modelInstanceMap[url] = modelInstanceMap[url].clone()

    log(logName, 'getModelInstance: added:', t3d.modelInstanceMap[url])
  }

  return t3d.modelInstanceMap[url]
}

export const getMaterialByName = (t3d, matName) => {

  log(logName, 'getMaterialByName:', matName, materialNameMap[matName])

  return materialNameMap[matName]
}

export const getMaterialById = (t3d, matId) => {

  log(logName, 'getMaterialById:', matId, materialIdMap[matId])

  return materialIdMap[matId]
}

const extractMaterial = (material) => {

  const matUUID = material.uuid
  const matName = material.name

  if(materialIdMap.hasOwnProperty(matUUID)) {

    // already exists

    if(materialNameMap.hasOwnProperty(matName)) {

      // also already exists

      if(materialNameMap[matName].uuid !== matUUID) {

        warn('Loaded material with same name, but different UUID, ' +
          'please check your materials: ' + matName +
          ' - ' + matUUID +
          ' - ' + materialNameMap[matName].uuid)
      }
    }

  } else {

    materialIdMap[matUUID]    = material
    materialNameMap[matName]  = material
  }
}

const extractMaterials = (obj3d) => {

  obj3d && obj3d.traverse((child) => {

    if(child.material) { extractMaterial(child.material) }
  })
}

const largeUint8ArrToString = (uint8arr, callback) => {

  const f = new FileReader();
  f.onload = (event) => callback(event.target.result);
  f.readAsText(new Blob([uint8arr]));
};

export default {
  load3DModelList,
  getModelInstance,
  getMaterialByName,
  getMaterialById
}
