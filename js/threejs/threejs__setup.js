// This module handles the ThreeJS scene setup.
// It's a simple scene with PerspectiveCamera and 2 lights.

import { error }                            from '../utils/utils__logging.js'
import { SystemUtils }                      from '../utils/utils__system.js'

import { Scene, PerspectiveCamera, WebGLRenderer, Group,
  AmbientLight, DirectionalLight, Vector3 } from './three.module.v109.js'

export const t3d = {

  sceneScale: 2.0
}

export const create3DScene = (canvas) => {

  if(!SystemUtils.isWebGLSupported) { return false }

  if(t3d.scene) {

    // already initialized, switch renderer to new canvas

    createRenderer(canvas)

    return true
  }

  if(!canvas) { return false }

  t3d.scene           = new Scene()
  t3d.camera          = new PerspectiveCamera(
    20.0, canvas.width / canvas.height, 20, 10000
  )

  createRenderer(canvas)

  t3d.renderer.setClearColor(0x000000, 0.0) // the default
  t3d.renderer.gammaInput  = true
  t3d.renderer.gammaOutput = true
  t3d.renderer.gammaFactor = 1.2

  const lightNode     = new Group();
  lightNode.name      = 'lightNode'
  t3d.lightNode       = lightNode
  t3d.scene.add(lightNode)

  setupLights(lightNode)

  t3d.modelNodes      = []
  t3d.occlusionNodes  = []
  t3d.baseNodes       = []
  t3d.transforms      = []
  t3d.materialIdMap   = []
  t3d.materialNameMap = []

  return update3DLayout(canvas.width, canvas.height)
}

const setupLights = (lightNode) => {

  const ambient       = new AmbientLight( 0xffffff, 1.15);      ambient.name = "light_ambient"
  const light_front   = new DirectionalLight( 0xffffff, 0.15);  light_front.name = "light_front"

  lightNode.add(ambient)
  lightNode.add(light_front)

  light_front.position.set(0, 0, -1000)
  light_front.lookAt(0, 0, 0)

  t3d.ambient         = ambient
  t3d.light_front     = light_front
}

const createRenderer = (canvas) => {

  t3d.renderer        = new WebGLRenderer({
    canvas:           canvas,
    powerPreference:  'high-performance', //'high-performance' 'low-power'
    alpha:            true,
    antialias:        true
  })
}

export const render3DScene = () => {

  if(!t3d || !t3d.renderer || !t3d.scene || !t3d.camera) {

    return false
  }

  t3d.renderer.render(t3d.scene, t3d.camera)

  return true
}

export const update3DLayout = (width, height) => {

  if(!t3d || !t3d.camera || !t3d.renderer || !t3d.renderer.domElement) {

    return false
  }

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

export const prepareModelNodes = () => {

  const modelNodes      = t3d.modelNodes
  const occlusionNodes  = t3d.occlusionNodes

  for(let i = 0; i < modelNodes.length; i++) {

    const modelNode = modelNodes[i]

    while(modelNode.children.length) {

      modelNode.remove(modelNode.children[0])
    }

    modelNode.add(occlusionNodes[i])

    // TPPTv5 to ARTOv5 mapping.
    // occlusion and mesh need to be shifted a little bit to match
    // the tracked face as good as possible.

    modelNode.position.set(0.0, -4.0, -3.0)
  }
}

export const setNumFaces = (numFaces) => {

  // Call this function before loading the 3d models and before the tracking starts.

  if(!t3d || !t3d.scene) {

    error('threejs__setup.setNumFaces: Call create3DScene first.')

    return false
  }

  const modelNodes      = t3d.modelNodes
  const occlusionNodes  = t3d.occlusionNodes
  const baseNodes       = t3d.baseNodes
  const transforms      = t3d.transforms
  const scene           = t3d.scene

  for(let i = baseNodes.length; i < numFaces; i++) {

    const baseNode      = new Group(); baseNode.name      = "baseNode_"      + i; baseNodes.push(baseNode)
    const modelNode     = new Group(); modelNode.name     = "modelNode_"     + i; modelNodes.push(modelNode)
    const occlusionNode = new Group(); occlusionNode.name = "occlusionNode_" + i; occlusionNodes.push(occlusionNode)

    transforms.push({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 0 })

    modelNode.add(occlusionNode)
    baseNode.add(modelNode)
    scene.add(baseNode)
  }
}

export default {
  t3d,
  create3DScene,
  render3DScene,
  update3DLayout,
  setNumFaces,
  prepareModelNodes
}
