import { distance, setPointFromVertices } from './utils__geom.js'

const _p0 = { x: 0, y: 0 }
const _p1 = { x: 0, y: 0 }

// Returns a 'yawnFactor' between 0.0 ... 1.0
// Works only with a 68l model.
export const detectYawn = (vertices) => {

  const is68lModel = vertices.length === 68 * 2 || vertices.length === 74 * 2

  if(!is68lModel) return 0.0

  setPointFromVertices(vertices, 39, _p1); // left eye inner corner
  setPointFromVertices(vertices, 42, _p0); // right eye inner corner

  const eyeDist = distance(_p0, _p1);

  setPointFromVertices(vertices, 62, _p0); // mouth upper inner lip
  setPointFromVertices(vertices, 66, _p1); // mouth lower inner lip

  const mouthOpen = distance(_p0, _p1);

  let yawnFactor = mouthOpen / eyeDist;

  yawnFactor -= 0.20; // remove smiling

  if(yawnFactor < 0) yawnFactor = 0;

  yawnFactor *= 2.0; // scale up a bit

  if(yawnFactor > 1.0) yawnFactor = 1.0;

  if(yawnFactor < 0.0) { yawnFactor = 0.0; }
  if(yawnFactor > 1.0) { yawnFactor = 1.0; }

  return yawnFactor
};

export default { detectYawn }
