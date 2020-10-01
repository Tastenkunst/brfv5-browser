// This adds 6 points to the 68 landmarks. These points cover the forehead,
// but are not actually tracked, they are just estimated depending on the 68 landmarks.

import { brfv5 } from '../brfv5/brfv5__init.js'

import {
  distance, interpolatePoint, applyMovementVector, setPointFromVertices,
  getMovementVectorOrthogonalCCW, getIntersectionPoint
} from './utils__geom.js'

export const BRFv5FaceExtended = function() {

  this.state        = 'reset'

  this.confidence   = 0.0

  this.landmarks    = [] // BRFv5Landmark
  this.vertices     = [] // Number
  this.bounds       = null

  this.scale        = 1.0
  this.translationX = 0.0
  this.translationY = 0.0
  this.rotationX    = 0.0
  this.rotationY    = 0.0
  this.rotationZ    = 0.0

  this._tmpPoint0   = null
  this._tmpPoint1   = null
  this._tmpPoint2   = null
  this._tmpPoint3   = null
  this._tmpPoint4   = null
  this._tmpPoint5   = null
}

BRFv5FaceExtended.prototype.update = function(face /* BRFv5Face */, _scale) {

  if(!_scale) _scale  = 1.0

  this.state        = face.state

  this.confidence   = face.confidence

  this.scale        = face.scale
  this.translationX = face.translationX
  this.translationY = face.translationY
  this.rotationX    = face.rotationX
  this.rotationY    = face.rotationY
  this.rotationZ    = face.rotationZ

  if(this.bounds === null) {

    this.bounds       = new brfv5.BRFv5Rectangle(0, 0, 0, 0)

    this._tmpPoint0   = new brfv5.BRFv5Landmark(0, 0)
    this._tmpPoint1   = new brfv5.BRFv5Landmark(0, 0)
    this._tmpPoint2   = new brfv5.BRFv5Landmark(0, 0)
    this._tmpPoint3   = new brfv5.BRFv5Landmark(0, 0)
    this._tmpPoint4   = new brfv5.BRFv5Landmark(0, 0)
    this._tmpPoint5   = new brfv5.BRFv5Landmark(0, 0)
  }

  let i = 0

  for(; i < face.landmarks.length; ++i) {

    const faceLandmark = face.landmarks[i]

    if(i >= this.landmarks.length) {

      this.landmarks.push(new brfv5.BRFv5Landmark(0, 0))
    }

    const thisLandmark        = this.landmarks[i]

    thisLandmark.x            = faceLandmark.x * _scale
    thisLandmark.y            = faceLandmark.y * _scale

    this.vertices[i * 2]      = faceLandmark.x * _scale
    this.vertices[i * 2 + 1]  = faceLandmark.y * _scale
  }

  this.vertices.length = face.landmarks.length * 2

  this.addUpperForeheadVertices()
  this.updateBounds(this.vertices)

  for(; i < face.landmarks.length + 6; ++i) {

    const x = this.vertices[i * 2]
    const y = this.vertices[i * 2 + 1]

    if(i >= this.landmarks.length) {

      this.landmarks.push(new brfv5.BRFv5Landmark(0, 0))
    }

    const thisLandmark = this.landmarks[i]

    thisLandmark.x = x
    thisLandmark.y = y
  }
}

BRFv5FaceExtended.prototype.addUpperForeheadVertices = function() {

  const v  = this.vertices

  const p0 = this._tmpPoint0;
  const p1 = this._tmpPoint1;
  const p2 = this._tmpPoint2;
  const p3 = this._tmpPoint3;
  const p4 = this._tmpPoint4;
  const p5 = this._tmpPoint5;

  // base distance

  setPointFromVertices(v, 33, p0); // nose base
  setPointFromVertices(v, 27, p1); // nose top
  const baseDist = distance(p0, p1) * 1.5;

  // eyes as base line for orthogonal vector

  const is68lModel = v.length === 68 * 2 || v.length === 74 * 2

  if(is68lModel) {

    setPointFromVertices(v, 39, p0); // left eye inner corner
    setPointFromVertices(v, 42, p1); // right eye inner corner

  } else {

    setPointFromVertices(v, 37, p0); // left eye inner corner
    setPointFromVertices(v, 38, p1); // right eye inner corner
  }

  const distEyes = distance(p0, p1);

  getMovementVectorOrthogonalCCW(p4, p0, p1, baseDist / distEyes);

  // orthogonal line for intersection point calculation

  setPointFromVertices(v, 27, p2); // nose top
  applyMovementVector(p3, p2, p4, 10.95);
  applyMovementVector(p2, p2, p4, -10.95);

  getIntersectionPoint(p5, p2, p3, p0, p1);

  // simple head rotation

  const f = 0.5 - distance(p0, p5) / distEyes;

  // outer left forehead point

  setPointFromVertices(v, 0, p5); // top left outline point
  const dist = distance(p0, p5) * 0.75;

  interpolatePoint(p2, p0, p1, (dist / -distEyes));
  applyMovementVector(p3, p2, p4, 0.75);

  v.push(p3.x); v.push(p3.y)

  // upper four forehead points

  interpolatePoint(p2, p0, p1, f - 0.65);
  applyMovementVector(p3, p2, p4, 1.02);

  v.push(p3.x); v.push(p3.y)

  interpolatePoint(p2, p0, p1, f/* + 0.0*/);
  applyMovementVector(p3, p2, p4, 1.10);

  v.push(p3.x); v.push(p3.y)

  interpolatePoint(p2, p0, p1, f + 1.0);
  applyMovementVector(p3, p2, p4, 1.10);

  v.push(p3.x); v.push(p3.y)

  interpolatePoint(p2, p0, p1, f + 1.65);
  applyMovementVector(p3, p2, p4, 1.02);

  v.push(p3.x); v.push(p3.y)

  // outer right forehead point

  setPointFromVertices(v, 16, p5); // top right outline point

  interpolatePoint(p2, p1, p0, (distance(p1, p5) * 0.75 / -distEyes));
  applyMovementVector(p3, p2, p4, 0.75);

  v.push(p3.x); v.push(p3.y)
}

BRFv5FaceExtended.prototype.updateBounds = function() {

  let minX = 9999
  let minY = 9999
  let maxX = -9999
  let maxY = -9999

  for(let i = 0, l = this.vertices.length; i < l; ++i) {

    const value = this.vertices[i];

    if((i % 2) === 0) {

      if(value < minX) minX = value;
      if(value > maxX) maxX = value;

    } else {

      if(value < minY) minY = value;
      if(value > maxY) maxY = value;
    }
  }

  this.bounds.x       = minX;
  this.bounds.y       = minY;
  this.bounds.width   = maxX - minX;
  this.bounds.height  = maxY - minY;
}

export default { BRFv5FaceExtended }
