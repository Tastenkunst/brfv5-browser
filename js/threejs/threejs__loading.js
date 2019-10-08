// This module handles the ThreeJS model loading part.

import { t3d, prepareModelNodes }           from './threejs__setup.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { log, error }                       from '../utils/utils__logging.js'
import { toRadian }                         from '../utils/utils__geom.js'

import { ObjectLoader,  FileLoader }        from './three.module.v109.js'

const logName             = 'threejs_loading: '

const _loaderURLMap       = {} // each URL has a single loader instance.
const _modelIdMap         = {} // each loaded model has an instance mapped by id
const _modelInstanceMap   = {} // each model id has numFacesToTrack instances to not clone more than necessary

let addedDragAndDrop      = false
let _dragAndDropEnabled   = false

export const set3DModel   = (obj) => {

  log(logName + 'set3DModel', obj)

  prepareModelNodes()

  const parents = t3d.modelNodes

  return new Promise((resolve, reject) => {

    if(obj && (obj.isMesh || obj.isGroup)) {

      if(parents) {

        addModelToAllParents(obj.name, obj, parents)
      }

      resolve(obj.name)

    } else {

      reject()
    }
  })
}

export const load3DModel  = (url, texturePath, onProgress) => {

  log(logName + 'load3DModel', url)

  prepareModelNodes()

  const fileList        = [{ id: url, file: url, loader: null }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parents: t3d.modelNodes,
      onProgress: onProgress
    })
      .then(() => {

        log(logName + 'load3DModel: done')

        extractMaterials(t3d.materialIdMap, t3d.materialNameMap, fileList)

        resolve()

      })
      .catch((msg) => { reject(msg) })
  })
}

export const load3DOcclusionModel = (url, texturePath, onProgress) => {

  log(logName + 'load3DOcclusionModel', url)

  const fileList        = [{ id: url, file: url, loader: null }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parents: t3d.occlusionNodes,
      onProgress: onProgress
    })
      .then(() => {

        log(logName + 'load3DOcclusionModel: done')

        makeOcclusionObjects(fileList)

        extractMaterials(t3d.materialIdMap, t3d.materialNameMap, fileList)

        resolve()

      })
      .catch((msg) => { reject(msg) })
  })
}

export const load3DMaterialCollection = (url, texturePath, onProgress) => {

  log(logName + 'load3DMaterialCollection', url)

  const fileList = [{ id: url, file: url, loader: null }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parents: null,
      onProgress: onProgress
    })
      .then(() => {

        log(logName + 'load3DMaterialCollection: done')

        extractMaterials(t3d.materialIdMap, t3d.materialNameMap, fileList)

        resolve()

      })
      .catch((msg) => { reject(msg) })
  })
}

export const set3DModelByName = (modelName, onError) => {

  log(logName + 'set3DModelByName:', modelName)

  const modelNodes      = t3d.modelNodes
  const occlusionNodes  = t3d.occlusionNodes

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode     = modelNodes[i]
    const occlusionNode = occlusionNodes[i]

    let foundModel      = false

    if(modelName) { // search for a model with that name...

      modelNode.traverse((child) => {

        if(child && child.name === modelName) {

          foundModel = child // ... found it ...
        }
      })
    }

    if(!foundModel) {

      // ... didn't find it ...
      // ... choose default other than occlusionNode

      if(onError) { onError() }

      foundModel = modelNode

      // - (Group) modelNode structure
      // |- (Group) occlusionNode
      //  |- (Group/Mesh) occlusionMesh (head)
      // |- (Group) 'herbrand'    - a group including all available color variants of a model
      //  |- (Group) 'reference'  - a group with only standard material for position reference
      //  |- (Group) 'agate'      - a specific color variant to choose
      //  |- (Group) 'amber'      - a specific color variant to choose

      modelNode.traverse((child) => {

        if(foundModel === modelNode && child && child.name.startsWith('occlusionNode') !== occlusionNode) {

          if(child.type === 'Group') {

            if(child.children.length > 1 && child.children[1].type === 'Group') {

              foundModel = child.children[1]

            } else if(child.children.length > 0 && child.children[0].type === 'Group') {

              foundModel = child.children[0]

            } else {

              foundModel = child
            }

          } else {

            foundModel = child
          }
        }
      })
    }

    if(foundModel !== null) {

      foundModel.traverse(         (object) => { object.visible = true })
      foundModel.traverseAncestors((object) => { object.visible = true })
    }
  }
}

export const addDragAndDrop = (add, texturePath, onComplete, onError) => {

  log(logName + 'addDragAndDrop:', add)

  _dragAndDropEnabled = add

  if(add && !addedDragAndDrop) {

    addedDragAndDrop = true

    document.addEventListener('dragover', (event) => {

      if(_dragAndDropEnabled) {

        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
      }

    }, false)

    document.addEventListener('drop', (event) => {

      if(_dragAndDropEnabled) {

        event.preventDefault()

        if(event.dataTransfer.files.length > 0) {

          const file = event.dataTransfer.files[0]

          const filename = file.name
          const extension = filename.split( '.' ).pop().toLowerCase()

          if(extension === 'json' || extension === 'artov5') {

            const reader = new FileReader()

            reader.addEventListener('load', (event) => {

              const text      = event.target.result
              const id        = filename
              const url       = filename

              prepareModelNodes()

              onLoaded3DResource(text, id, url, texturePath, onComplete, onError)

            }, false)

            reader.readAsText(file)
          }
        }
      }

    }, false)
  }
}

const largeuint8ArrToString = (uint8arr, callback) => {

  var bb = new Blob([uint8arr]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };

  f.readAsText(bb);
};

export const addModelToAllParents = (id, model, parents) => {

  if(!id || !model || !parents || parents.length === 0) {

    error(logName + 'addModelToAllParents: Could not add to parents.')

    return
  }

  log(logName + '_modelInstanceMap:', _modelInstanceMap)

  let modelInstances = _modelInstanceMap[id]

  if(!modelInstances) {

    modelInstances = []
    _modelInstanceMap[id] = modelInstances
  }

  for(let i = 0; i < parents.length; i++) {

    while(i >= modelInstances.length) {

      modelInstances.push(model.clone())
    }

    const modelInstance = modelInstances[i]

    parents[i].add(modelInstance)
  }
}

const handleLoaded3DJson = (json, id, url, texturePath, onComplete, onError) => {

  const metadata = json.metadata

  if(metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry') {

    error( 'THREE.ObjectLoader: Can\'t load ' + url + '. Use THREE.JSONLoader instead.' )

    if(onError) { onError() }

    return
  }

  if(texturePath && json && json.hasOwnProperty('images')) {

    for(let i = 0; i < json.images.length; i++) {

      let image = json.images[i]

      if(image.hasOwnProperty('url')) {

        if(image.url.indexOf('data:image') === -1) {

          let tmp = image.url.split('/')
          let fileName = tmp[tmp.length - 1]

          image.url = texturePath + fileName
        }
      }
    }
  }

  parse3DResource(id, url, json, onComplete)
}

const parse3DResource = (id, url, json, onComplete) => {

  log(logName + 'parse3DResource: id: ' + id)

  let loader = _loaderURLMap[url]

  if(!loader) {

    log(logName + 'parse3DResource: added: ' + url)

    loader = new ObjectLoader()
    _loaderURLMap[url] = loader

    const object3D = loader.parse(json)

    _modelIdMap[id] = object3D

    log(logName + '_modelIdMap: ', _modelIdMap)

    object3D.name = id
  }

  if(onComplete) { onComplete(id, _modelIdMap[id]) }
}

const onLoaded3DResource = (text, id, url, texturePath, onComplete, onError) => {

  try {

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      largeuint8ArrToString(brfv5['process'](new Uint8Array(text)), function(fileContent) {

        handleLoaded3DJson(JSON.parse( fileContent ), id, url, texturePath, onComplete, onError)

      });

    } else {

      handleLoaded3DJson(JSON.parse(text), id, url, texturePath, onComplete, onError)
    }
  } catch(e) {

    error( logName + 'THREE.ObjectLoader: Can\'t parse ' + url + '.', e.message )

    if(onError) { onError() }
  }
}

const load3DResource = (id, url, texturePath, onComplete, onProgress, onError) => {

  log(logName + 'load3DResource: id: ' + id)

  let parsedModel = _modelIdMap[id]

  if(!parsedModel) {

    log(logName + 'load3DResource: added: ' + url)

    const fileLoader = new FileLoader()

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      fileLoader.setResponseType('arraybuffer');
    }

    fileLoader.load( url, (text) => {

      onLoaded3DResource(text, id, url, texturePath, onComplete, onError)

    }, onProgress, onError)

  } else {

    if(onComplete) { onComplete(id, _modelIdMap[id]) }
  }
}

const load3DFileList = (config) => {

  log(logName + 'load3DFileList', config.list)

  const fileList        = config.list
  const path            = config.path
  const texturePath     = config.texturePath
  const parents         = config.parents
  const onProgress      = config.onProgress

  return new Promise((resolve, reject) => {

    if(!fileList) {

      reject('No filelist given.')

    } else {

      let numLoaders = fileList.length

      if(numLoaders > 0) {

        fileList.forEach((obj) => {

          load3DResource(obj.id, path + obj.file, texturePath, (id, modelInstance) => {

            // onComplete

            log(logName + 'load3DFileList: loaded: ' + id)

            obj.loader = modelInstance

            adjustPlacement(obj.loader, obj)

            if(parents) {

              addModelToAllParents(id, modelInstance, parents)
            }

            numLoaders--

            if(numLoaders <= 0) {

              resolve()
            }

          }, onProgress, (e) => { reject(e) }, parents, false)
        })

      } else {

        log(logName + 'load3DFileList: no files loaded.')

        resolve()
      }
    }
  })
}

const makeOcclusionObjects = (fileList) => {

  for(let i = 0; i < fileList.length; i++) {

    const loader = fileList[i].loader

    loader.traverse((child) => {

      child.renderOrder           = -1

      if(child.material) {

        child.material.colorWrite = false
        child.material.opacity    = 0.0
      }
    })
  }
}

const extractMaterial = (materialIdMap, materialNameMap, material) => {

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

const extractMaterials = (materialIdMap, materialNameMap, fileList) => {

  for(let i = 0; i < fileList.length; i++) {

    const loader = fileList[i].loader

    loader.traverse((child) => {

      if(child.material) {

        extractMaterial(materialIdMap, materialNameMap, child.material)
      }
    })
  }
}

const adjustPlacement = (obj, data) => {

  let x = 0
  let y = 0
  let z = 0
  let s = 1.0
  let rx = 0
  let ry = 0
  let rz = 0

  if(data.hasOwnProperty('x')) { x = data.x }
  if(data.hasOwnProperty('y')) { y = data.y }
  if(data.hasOwnProperty('z')) { z = data.z }
  if(data.hasOwnProperty('s')) { s = data.s }
  if(data.hasOwnProperty('rx')) { rx = data.rx }
  if(data.hasOwnProperty('ry')) { ry = data.ry }
  if(data.hasOwnProperty('rz')) { rz = data.rz }

  if( x !== 0 ||  y !== 0 ||  z !== 0) obj.position.set(x, y, z)
  if(rx !== 0 || ry !== 0 || rz !== 0) obj.rotation.set(toRadian(rx), toRadian(ry), toRadian(rz))
  if( s !== 1) obj.scale.set(s, s, s)
}

export default {
  load3DMaterialCollection,
  load3DOcclusionModel,
  load3DModel,
  set3DModel,
  set3DModelByName,
  addDragAndDrop
}
