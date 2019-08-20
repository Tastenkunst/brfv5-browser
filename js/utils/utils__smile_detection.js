import { distance, setPointFromVertices } from './utils__geom.js'

const _p0 = { x: 0, y: 0 }
const _p1 = { x: 0, y: 0 }

// Returns a 'smileFactor' between 0.0 ... 1.0
// Works with 68l and 42l models.
export const detectSmile = (face) => {

  const vertices = face.vertices
  const is68lModel = vertices.length === 68 * 2 || vertices.length === 74 * 2

  if(is68lModel) {

    setPointFromVertices(vertices, 48, _p0); // mouth corner left
    setPointFromVertices(vertices, 54, _p1); // mouth corner right

  } else { // 42l model

    setPointFromVertices(vertices, 40, _p0); // mouth corner left
    setPointFromVertices(vertices, 41, _p1); // mouth corner right
  }

  let mouthWidth = distance(_p0, _p1);

  if(is68lModel) {

    setPointFromVertices(vertices, 36, _p1); // left eye outer corner
    setPointFromVertices(vertices, 45, _p0); // right eye outer corner

  } else { // 42l model

    setPointFromVertices(vertices, 36, _p1); // left eye outer corner
    setPointFromVertices(vertices, 39, _p0); // right eye outer corner

    mouthWidth /= 0.8
  }

  const eyeDist = distance(_p0, _p1);

  let smileFactor = mouthWidth / eyeDist;

  const rotX     = face.rotationX < 0.0 ? face.rotationX : 0.0
  const percRotX = Math.abs(rotX) / 25.0

  smileFactor -= (0.60 + percRotX * 0.14); // 0.60 - neutral, 0.70 smiling

  if(smileFactor > 0.125) smileFactor = 0.125;
  if(smileFactor < 0.000) smileFactor = 0.000;

  smileFactor *= 8.0;

  if(smileFactor < 0.0) { smileFactor = 0.0; }
  if(smileFactor > 1.0) { smileFactor = 1.0; }

  return smileFactor;
};

export default { detectSmile }
