// This module handles the ThreeJS scene setup.
// It's a simple scene with PerspectiveCamera, AmbientLight at 5.0 intensity and physical materials.

import { log, error }             from '../utils/utils__logging.js'
import { SystemUtils }            from '../utils/utils__system.js'
import { toRadian }               from '../utils/utils__geom.js'

import { Scene, Cache, PerspectiveCamera, WebGLRenderer, Group,
  AmbientLight, Color, Vector3 }  from './three.module.r123.js'
import * as THREE                 from './three.module.r123.js'

export const ObjectLoader         = THREE.ObjectLoader
export const FileLoader           = THREE.FileLoader

const logName                     = 'threejs_setup:'

Cache.enabled                     = true

export const create3DScene = (t3d, canvas) => {

  log(logName, 'create3DScene', t3d, canvas)

  if(!SystemUtils.isWebGLSupported || !t3d) { return false }

  if(!t3d.hasOwnProperty('sceneScale')) { t3d.sceneScale = 2.0 }

  if(t3d.scene) {

    // already initialized, switch renderer to new canvas

    createRenderer(t3d, canvas)

    return true
  }

  if(!canvas) { return false }

  t3d.scene           = new Scene()
  t3d.camera          = new PerspectiveCamera(
    20.0, canvas.width / canvas.height, 100, 20000
  )

  t3d.isInitialized   = true

  createRenderer(t3d, canvas)

  t3d.renderer.setClearColor(0x000000, 0.0) // the default
  t3d.renderer.outputEncoding = THREE.sRGBEncoding
  t3d.renderer.physicallyCorrectLights = true

  const lightNode     = new Group();
  lightNode.name      = 'lightNode'
  t3d.lightNode       = lightNode
  t3d.scene.add(lightNode)

  const ambient       = new AmbientLight(0xffffff, 5.000);
  ambient.name        = "light_ambient"
  t3d.ambient         = ambient

  lightNode.add(ambient)

  t3d.modelNodes      = []
  t3d.baseNodes       = []
  t3d.transforms      = []
  t3d.materialIdMap   = []
  t3d.materialNameMap = []

  return update3DLayout(t3d, canvas.width, canvas.height)
}

const isInitialized = (t3d) => {

  if(!t3d || !t3d.isInitialized) {

    error('Not initialized. Call create3DScene first.')

    return false
  }

  return true
}

const createRenderer = (t3d, canvas) => {

  log(logName, 'createRenderer', t3d, canvas)

  if(!isInitialized(t3d)) return

  t3d.renderer        = new WebGLRenderer({
    canvas:           canvas,
    powerPreference:  'high-performance', //'high-performance' 'low-power'
    alpha:            true,
    antialias:        true
  })
}

export const render3DScene = (t3d) => {

  if(!isInitialized(t3d)) return false

  t3d.renderer.render(t3d.scene, t3d.camera)

  return true
}

export const update3DLayout = (t3d, width, height) => {

  log(logName, 'update3DLayout', t3d, width, height)

  if(!isInitialized(t3d)) return false

  const cw    = width  * t3d.sceneScale
  const ch    = height * t3d.sceneScale
  const css   = cw < ch ? cw : ch
  const csl   = cw < ch ? ch : cw

  let nw      = 0
  let nh      = 0

  if(width < height) {

    nw        = css
    nh        = csl

  } else {

    nw        = csl
    nh        = css
  }

  t3d.renderer.domElement.width   = nw
  t3d.renderer.domElement.height  = nh

  t3d.camera.aspect = nw / nh

  t3d.camera.position.set(0, 0, 0)
  t3d.camera.lookAt(new Vector3(0, 0, 1))
  t3d.camera.updateProjectionMatrix()

  t3d.renderer.setSize(nw, nh, false)

  return true
}

export const setNumFaces = (t3d, numFaces) => {

  // log(logName, 'setNumFaces', t3d, numFaces)

  // Call this function before loading the 3d models and before the tracking starts.

  if(!isInitialized(t3d)) return false

  const modelNodes      = t3d.modelNodes
  const baseNodes       = t3d.baseNodes
  const transforms      = t3d.transforms
  const scene           = t3d.scene

  for(let i = baseNodes.length; i < numFaces; i++) {

    const baseNode      = new Group(); baseNode.name      = "baseNode_"      + i; baseNodes.push(baseNode)
    const modelNode     = new Group(); modelNode.name     = "modelNode_"     + i; modelNodes.push(modelNode)

    transforms.push({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 0 })

    baseNode.add(modelNode)
    scene.add(baseNode)
  }

  return true
}

export const prepareModelNodes = (t3d) => {

  log(logName, 'prepareModelNodes', t3d)

  if(!isInitialized(t3d)) return false

  const modelNodes      = t3d.modelNodes

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode = modelNodes[i]

    while(modelNode.children.length) {

      modelNode.remove(modelNode.children[0])
    }

    // TPPTv5 to ARTOv5 mapping.
    // occlusion and mesh need to be shifted a little bit to match
    // the tracked face as good as possible.

    modelNode.position.set(0.0, -4.0, -3.0)
  }

  return true
}

export const add3DModel = (t3d, model, adjustment) => {

  log(logName, 'add3DModel', t3d, model)

  if(!isInitialized(t3d)) return false

  if(adjustment) adjustPlacement(model, adjustment)

  const modelNodes = t3d.modelNodes

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode = modelNodes[i]

    modelNode.add(model.clone())
  }

  return true
}

export const hideAllModels = (t3d) => {

  log(logName, 'hideAllModels', t3d)

  if(!isInitialized(t3d)) return false

  const modelNodes = t3d.modelNodes

  for(let i = 0; i < modelNodes.length; i++) {

    modelNodes[i].traverse((child) => { child.visible = false })
  }

  return true
}

export const set3DModelByName = (t3d, pathModel, modelName, onError) => {

  log(logName, 'set3DModelByName', t3d, pathModel, modelName)

  if(!isInitialized(t3d)) return false

  const modelNodes      = t3d.modelNodes

  let foundModel        = null

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode     = modelNodes[i]

    if(pathModel && modelName) {

      modelNode.traverse((child) => {

        if(child && child.name === pathModel) {

          child.traverse((subchild) => {

            if(subchild && subchild.name === modelName) {

              foundModel = subchild // ... found it ...
            }
          })

          if(!foundModel) {

            if(pathModel && modelName && onError) onError(pathModel, modelName)

            child.traverse((subchild) => {

              if(!foundModel && subchild && subchild !== child) {

                foundModel = subchild // ... found it ...
              }
            })
          }

          if(!foundModel) {

            foundModel = child
          }
        }
      })

      modelNode.traverse((child) => {

        if(foundModel && child === foundModel) {

          for(let subChild of foundModel.parent.children) {

            subChild.visible = false
          }
        }
      })

    } else {

      if(pathModel) {

        modelNode.traverse((child) => {

          if(!foundModel && child && child.name === pathModel) {

            foundModel = child
          }
        })
      }
    }

    if(foundModel !== null) {

      foundModel.traverse(         (object) => { object.visible = true })
      foundModel.traverseAncestors((object) => { object.visible = true })
    }
  }

  return true //TODO: true? or if all foundModels?
}

const adjustPlacement = (obj, data) => {

  let x = 0
  let y = 0
  let z = 0
  let s = 1.0
  let rx = 0
  let ry = 0
  let rz = 0

  if(data.hasOwnProperty('x'))  { x = data.x }
  if(data.hasOwnProperty('y'))  { y = data.y }
  if(data.hasOwnProperty('z'))  { z = data.z }
  if(data.hasOwnProperty('s'))  { s = data.s }
  if(data.hasOwnProperty('rx')) { rx = data.rx }
  if(data.hasOwnProperty('ry')) { ry = data.ry }
  if(data.hasOwnProperty('rz')) { rz = data.rz }

  if( x !== 0 ||  y !== 0 ||  z !== 0) obj.position.set(x, y, z)
  if(rx !== 0 || ry !== 0 || rz !== 0) obj.rotation.set(toRadian(rx), toRadian(ry), toRadian(rz))
  if( s !== 1) obj.scale.set(s, s, s)
}

export const turnIntoOcclusionObject = (model) => {

  model && model.traverse((child) => {

    child.renderOrder           = -1

    if(child.material) {

      child.material.colorWrite = false
      child.material.opacity    = 0.0
    }
  })
}

export const updateMeshMaterial = (t3d, meshName, config) => {

  log(logName, 'updateMeshMaterial', t3d, meshName, config)

  if(!isInitialized(t3d)) return false

  const modelNodes      = t3d.modelNodes

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode     = modelNodes[i]

    if(meshName) {

      modelNode.traverse((child) => {

        if(child && child.name === meshName && child.material) {

          child.material = child.material.clone()

          if(config.hasOwnProperty('color')) {

            child.material.color = new Color(config.color)
          }

          if(config.hasOwnProperty('opacity')) {

            child.material.opacity = config.opacity
          }

          if(config.hasOwnProperty('envMap') && child.material.envMap) {

            child.material.reflectivity = config.envMap.reflectivity
          }
        }
      })
    }
  }
}

export default {
  create3DScene,
  render3DScene,
  update3DLayout,
  setNumFaces,
  prepareModelNodes,
  add3DModel,
  set3DModelByName,
  hideAllModels,
  turnIntoOcclusionObject,
  updateMeshMaterial,

  ObjectLoader,
  FileLoader
}
