// This module handles the ThreeJS model loading part.

import { t3d }                              from './threejs_setup.js'
import { prepareModelNode }                 from './threejs_brfv5_mapping.js'

import { brfv5 }                            from '../brfv5/brfv5__init.js'

import { log, error }                       from '../utils/utils__logging.js'
import { toRadian }                         from '../utils/utils__geom.js'

import { ObjectLoader,  FileLoader }        from './three.module.js'

const logName             = 'threejs_loading: '

export const loaders      = {}
export const loadersIdMap = {}

let addedDragAndDrop      = false
let _dragAndDropEnabled   = false

export const set3DModel   = (obj) => {

  log(logName + 'set3DModel', obj)

  const modelNode         = prepareModelNode(t3d.modelNode, t3d.occlusionNode)

  return new Promise((resolve, reject) => {

    if(obj && (obj.isMesh || obj.isGroup)) {

      modelNode.add(obj);

      resolve(obj.name)

    } else {

      reject()
    }
  })
}

export const load3DModel  = (url, texturePath, onProgress) => {

  log(logName + 'load3DModel', url)

  const modelNode       = prepareModelNode(t3d.modelNode, t3d.occlusionNode)
  const fileList        = [{ id: url, file:url }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parent: modelNode,
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

  const occlusionNode   = t3d.occlusionNode
  const fileList        = [{ id: url, file: url }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parent: occlusionNode,
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

  const fileList = [{ id: url, file: url }]

  return new Promise((resolve, reject) => {

    load3DFileList({
      list: fileList,
      path: '',
      texturePath: texturePath,
      parent: null,
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

  const modelNode     = t3d.modelNode
  const occlusionNode = t3d.occlusionNode

  t3d.model = null

  // choose model by name

  modelNode.traverse((child) => {

    if(child) {

      if(modelName !== null && child.name === modelName) {

        t3d.model = child
      }
    }
  })

  // choose default other than occlusionNode

  if(t3d.model === null) {

    if(onError) {

      onError()
    }

    t3d.model = modelNode

    // - (Group) modelNode structure
    // |- (Group) occlusionNode
    //  |- (Group/Mesh) occlusionMesh (head)
    // |- (Group) 'herbrand'    - a group including all available color variants of a model
    //  |- (Group) 'reference'  - a group with only standard material for position reference
    //  |- (Group) 'agate'      - a specific color variant to choose
    //  |- (Group) 'amber'      - a specific color variant to choose

    modelNode.traverse((child) => {

      if(t3d.model === modelNode && child && child !== occlusionNode) {

        if(child.type === 'Group') {

          if(child.children.length > 1 && child.children[1].type === 'Group') {

            t3d.model = child.children[1]

          } else if(child.children.length > 0 && child.children[0].type === 'Group') {

            t3d.model = child.children[0]

          } else {

            t3d.model = child
          }

        } else {

          t3d.model = child
        }
      }
    })
  }

  if(t3d.model !== null) {

    const show = true

    t3d.model.traverse(         (object) => { object.visible = show })
    t3d.model.traverseAncestors((object) => { object.visible = show })

    t3d.occlusionNode.traverse(         (object) => { object.visible = show })
    t3d.occlusionNode.traverseAncestors((object) => { object.visible = show })
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

          if(extension === 'json') {

            const reader = new FileReader()

            reader.addEventListener('load', (event) => {

              const text      = event.target.result
              const id        = filename
              const url       = filename

              const modelNode = prepareModelNode(t3d.modelNode, t3d.occlusionNode)

              onLoaded3DResource(text, id, url, texturePath, onComplete, onError, modelNode)

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

const handleLoaded3DJson = (json, id, url, texturePath, onComplete, onError, parentNode) => {

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

  parse3DResource(id, url, json, onComplete, parentNode)
}

const onLoaded3DResource = (text, id, url, texturePath, onComplete, onError, parentNode) => {

  let json = null

  try {

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      largeuint8ArrToString(brfv5['process'](new Uint8Array(text)), function(fileContent){

        json = JSON.parse( fileContent );

        handleLoaded3DJson(json, id, url, texturePath, onComplete, onError, parentNode)

      });

    } else {

      json = JSON.parse(text)

      handleLoaded3DJson(json, id, url, texturePath, onComplete, onError, parentNode)

    }

  } catch(e) {

    error( logName + 'THREE:ObjectLoader: Can\'t parse ' + url + '.', e.message )

    if(onError) { onError() }
  }
}

const load3DResource = (id, url, texturePath, onComplete, onProgress, onError, parentNode) => {

  log(logName + 'load3DResource: id: ' + id)

  let loader = loaders[url]

  if(!loader) {

    log(logName + 'load3DResource: added: ' + url)

    loader = new ObjectLoader()

    const fileLoader = new FileLoader(loader.manager)

    if(url.endsWith('.brfv5') || url.endsWith('.artov5')) {

      fileLoader.setResponseType('arraybuffer');
    }

    fileLoader.load( url, (text) => {

      onLoaded3DResource(text, id, url, texturePath, onComplete, onError, parentNode)

    }, onProgress, onError)

  } else {

    if(parentNode) { parentNode.add(loadersIdMap[id]) }
    if(onComplete) { onComplete() }
  }

  return loader
}

const parse3DResource = (id, url, json, onComplete, parentNode) => {

  log(logName + 'parse3DResource: id: ' + id)

  let loader = loaders[url]

  if(!loader) {

    log(logName + 'parse3DResource: added: ' + url)

    loader = new ObjectLoader()

    loaders[url] = loader

    const object3D = loader.parse(json)

    loadersIdMap[id] = object3D

    log(logName + 'loadersIdMap: ', loadersIdMap)

    object3D.name = id

    if(parentNode) { parentNode.add(object3D) }
    if(onComplete) { onComplete() }

  } else {

    if(parentNode) { parentNode.add(loadersIdMap[id]) }
    if(onComplete) { onComplete() }
  }

  return loader
}

const load3DFileList = (config) => {

  log(logName + 'load3DFileList', config.list)

  const fileList        = config.list
  const path            = config.path
  const texturePath     = config.texturePath
  const parent          = config.parent
  const onProgress      = config.onProgress

  return new Promise((resolve, reject) => {

    if(!fileList) {

      reject('No filelist given.')

    } else {

      let numLoaders    = fileList.length

      if(numLoaders > 0) {

        fileList.forEach((obj) => {

          const id = obj.id

          load3DResource(id, path + obj.file, texturePath, () => {

            // onComplete

            log(logName + 'load3DFileList: loaded: ' + id)

            obj.loader = loadersIdMap[id]

            adjustPlacement(obj.loader, obj)

            numLoaders--

            if(numLoaders <= 0) {
              resolve()
            }

          }, onProgress, (e) => { reject(e) }, parent, false)
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

export default { load3DMaterialCollection, load3DOcclusionModel, load3DModel, set3DModelByName, addDragAndDrop, set3DModel }
