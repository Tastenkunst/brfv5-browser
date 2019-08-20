import { distance } from './utils__geom.js'

export const detectBlink = (
  eyeOuterCorner,
  eyeInnerCorner,
  eyeOuterUpperLid,
  eyeInnerUpperLid,
  eyeOuterLowerLid,
  eyeInnerLowerLid,
  eyeLidDistances) => {

  const eyeWidth            = distance(eyeOuterCorner, eyeInnerCorner);
  const eyeOuterLidDistance = distance(eyeOuterUpperLid, eyeOuterLowerLid);
  const eyeInnerLidDistance = distance(eyeInnerUpperLid, eyeInnerLowerLid);
  const eyeLidDistance      = 2.0 * ((eyeOuterLidDistance + eyeInnerLidDistance) / eyeWidth);

  eyeLidDistances.push(eyeLidDistance);

  while(eyeLidDistances.length > 13) { // keep 13.0/30.0=0.433 seconds of recording data

    eyeLidDistances.shift();
  }

  if(eyeLidDistances.length === 13) {

    let segment0 = 0;
    let segment1 = 0;
    let segment2 = 0;

    let i;

    for(i =  0; i <  3; i++) { segment0 += eyeLidDistances[i]; }
    for(i =  5; i <  8; i++) { segment1 += eyeLidDistances[i]; }
    for(i = 10; i < 13; i++) { segment2 += eyeLidDistances[i]; }

    segment0 /= 3.0;
    segment1 /= 3.0;
    segment2 /= 3.0;


    if(Math.abs(segment0 - segment2) < 0.12) {

      const outerSegments = (segment0 + segment2) * 0.5;
      const percent       = segment1 / outerSegments;

      if(segment1 < segment0 && segment1 < segment2 && percent < 0.88) {

        return true;
      }
    }
  }

  return false;
};

export default { detectBlink }
