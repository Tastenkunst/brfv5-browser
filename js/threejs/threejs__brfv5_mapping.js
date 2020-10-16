import { error }                            from '../utils/utils__logging.js'
import { toDegree, toRadian }               from '../utils/utils__geom.js'

export const hideAllBaseNodes = (t3d) => {

  for(let i = 0; i < t3d.baseNodes.length; i++) {

    t3d.baseNodes[i].visible = false
  }
}

export const updateByFace = (t3d, face, index, show) => {

  const transforms    = t3d.transforms
  const baseNodes     = t3d.baseNodes
  const scene         = t3d.scene

  const canvasWidth   = t3d.renderer.domElement.width
  const canvasHeight  = t3d.renderer.domElement.height

  if(index >= baseNodes.length) {

    error('threejs_brfv5_mapping.updateByFace: Call setNumFaces before loading the models and starting the tracking.')

    return
  }

  const baseNode      = baseNodes[index]
  const transform     = transforms[index]

  if(!scene || !face || !face.landmarks) {

    baseNode.visible = false

    return
  }

  let modelZ = 1362

  if(t3d.camera.isPerspectiveCamera) {

    modelZ = 1362 * (canvasHeight / 480)
  }

  if(show) {

    const si  = t3d.sceneScale
    const cw  = (canvasWidth  / si)
    const ch  = (canvasHeight / si)

    let scale =   face.scale * si * 0.0133
    let x     = -(face.translationX - cw * 0.5) * si
    let y     = -(face.translationY - ch * 0.5) * si
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

    const diffX       = (x - transform.x)
    const diffY       = (y - transform.y)
    const diffXAbs    = Math.abs(diffX)
    const diffYAbs    = Math.abs(diffY)

    if(!baseNode.visible || diffXAbs > 3 || diffYAbs > 3) {

      transform.x       = transform.x + diffX
      transform.y       = transform.y + diffY

    } else {

      transform.x       = transform.x + diffX * (diffXAbs < 1.0 ? 0.25 : (diffXAbs < 2.0 ? 0.50 : 0.75))
      transform.y       = transform.y + diffY * (diffYAbs < 1.0 ? 0.25 : (diffYAbs < 2.0 ? 0.50 : 0.75))
    }

    transform.z       = modelZ - scale * 0.1 // offset a little bit for z sorting
    transform.scale   = scale // * 0.01 * si * 1.33

    const diffRx      = (rx - transform.rx)
    const diffRy      = (ry - transform.ry)
    const diffRz      = (rz - transform.rz)
    const diffRxAbs   = Math.abs(diffRx)
    const diffRyAbs   = Math.abs(diffRy)
    const diffRzAbs   = Math.abs(diffRz)

    transform.rx      = transform.rx + diffRx * (diffRxAbs < 1.0 ? 0.25 : (diffRxAbs < 2.0 ? 0.50 : 0.75))
    transform.ry      = transform.ry + diffRy * (diffRyAbs < 1.0 ? 0.25 : (diffRyAbs < 2.0 ? 0.50 : 0.75))
    transform.rz      = transform.rz + diffRz * (diffRzAbs < 1.0 ? 0.25 : (diffRzAbs < 2.0 ? 0.50 : 0.75))

    baseNode.position.set(transform.x, transform.y, transform.z)
    baseNode.rotation.set(toRadian(transform.rx), toRadian(transform.ry), toRadian(transform.rz))
    baseNode.scale.set(transform.scale, transform.scale, transform.scale)

    baseNode.visible  = true

  } else {

    baseNode.visible  = false
  }
}

export default {
  hideAllBaseNodes,
  updateByFace
}
