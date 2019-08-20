import { Group }                            from './three.module.js'

import { t3d }                              from './threejs_setup.js'
import { toDegree, toRadian }               from '../utils/utils__geom.js'

export const updateByFace = (face, index, show) => {

  const transforms    = t3d.transforms // TODO: make multi face compatible
  const baseNodes     = t3d.baseNodes
  const scene         = t3d.scene

  const canvasWidth   = t3d.renderer.domElement.width;
  const canvasHeight  = t3d.renderer.domElement.height;

  if(!scene || !face || !face.landmarks) {

    show3DModel(false)

    return
  }

  let modelZ = 2725

  if(t3d.camera.isPerspectiveCamera) {

    modelZ = (2725 / 480) * (canvasHeight / t3d.sceneScale)
  }

  if(index >= transforms.length) {

    let i = transforms.length

    while(i <= index) {

      transforms.push({ x: 0, y: 0, z: modelZ, rx: 0, ry: 0, rz: 0, scale: 0 })

      ++i
    }
  }

  if(index >= baseNodes.length) {

    let i = baseNodes.length

    while(i <= index) {

      const node = new Group()
      node.name = "baseNode_" + i
      baseNodes.push(node)
      scene.add(node)

      ++i
    }
  }

  const baseNode      = baseNodes[index]
  const transform     = transforms[index]

  if(show) {

    baseNode.add(t3d.modelNode)

    const si  = t3d.sceneScale
    const cw  = (canvasWidth  / si)
    const ch  = (canvasHeight / si)

    let scale =   face.scale * si * 0.0133
    let x     = -(face.translationX - cw * 0.5)  * si
    let y     = -(face.translationY - ch * 0.5)  * si
    let rx    = - face.rotationX * 1.30
    let ry    = - face.rotationY * 1.30
    let rz    =   face.rotationZ

    let ryp   = Math.abs(ry) / 30.0
    let rxp   = Math.abs(rx) / 30.0

    if(rx < 0) {

      rx *= 1.0 + ryp
      ry *= 0.95

      y -= rxp * 10

    } else {

      rx *= 1.33
      y += rxp * 7
    }

    if(ry < 0) {

      if(rx > 0)  {

        rz -= ryp + (ryp * rxp) * 10

      } else {

        rz += ryp + (ryp * rxp) * 10
      }

    } else {

      if(rx > 0)  {

        rz += ryp + (ryp * rxp) * 10

      } else {

        rz -= ryp + (ryp * rxp) * 10
      }
    }

    if(t3d.camera.isPerspectiveCamera) {

      rx -= toDegree(Math.atan(y / modelZ)) // perspective camera needs an adjustment for ry.
      ry += toDegree(Math.atan(x / modelZ)) // perspective camera needs an adjustment for ry.
    }

    transform.x       = x
    transform.y       = y
    transform.z       = modelZ
    transform.scale   = scale// * 0.01 * si * 1.33;

    // transform.rx      = rx
    // transform.ry      = ry
    // transform.rz      = rz

    const diffRx      = (rx - transform.rx)
    const diffRy      = (ry - transform.ry)
    const diffRz      = (rz - transform.rz)

    transform.rx      = transform.rx + diffRx * (Math.abs(diffRx) < 0.1 ? Math.abs(diffRx) * 1.5 : 0.66)
    transform.ry      = transform.ry + diffRy * (Math.abs(diffRy) < 0.1 ? Math.abs(diffRy) * 1.5 : 0.66)
    transform.rz      = transform.rz + diffRz * (Math.abs(diffRz) < 0.1 ? Math.abs(diffRz) * 1.5 : 0.66)

    baseNode.position.set(transform.x, transform.y, transform.z)
    baseNode.rotation.set(toRadian(transform.rx), toRadian(transform.ry), toRadian(transform.rz))
    baseNode.scale.set(transform.scale, transform.scale, transform.scale)

    t3d.light_front.lookAt(transform.x, transform.y, transform.z)

    show3DModel(true)

  } else {

    show3DModel(false)
  }
}

export const show3DModel = (show) => {

  const baseNodes = t3d.baseNodes

  if(baseNodes && baseNodes.length > 0) {

    const baseNode = baseNodes[0]

    if(baseNode !== null) {

      baseNode.traverse( function ( object ) {
        object.visible = false
      })

      if(t3d.model) {

        t3d.model.traverse( function ( object ) {
          object.visible = show
        })

        t3d.model.traverseAncestors(function ( object ) {
          object.visible = show
        })

        t3d.occlusionNode.traverse( function ( object ) {
          object.visible = show
        })

        t3d.occlusionNode.traverseAncestors(function ( object ) {
          object.visible = show
        })
      }
    }
  }
}

export const prepareModelNode = (modelNode, occlusionNode) => {

  while(modelNode.children.length) {
    modelNode.remove(modelNode.children[0]);
  }

  modelNode.add(occlusionNode);

  // TPPTv5 to ARTOv5 mapping.
  // occlusion and mesh need to be shifted a little bit to match
  // the tracked face as good as possible.

  modelNode.position.set(0.0, -2.0, -5.0);

  return modelNode;
};

export default { updateByFace, prepareModelNode, show3DModel }
