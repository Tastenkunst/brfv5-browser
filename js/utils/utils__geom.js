export const toDegree = (x)       => { return (x * 180.0 / Math.PI); }
export const toRadian = (x)       => { return (x * Math.PI / 180.0); }
export const length   = (x, y)    => { return Math.sqrt((x * x) + (y * y)); };
export const distance = (p0, p1)  => { return length((p1.x - p0.x), (p1.y - p0.y)); };
export const angle    = (p0, p1)  => { return Math.atan2((p1.y - p0.y), (p1.x - p0.x)) };

export const setPointFromVertices = (v, i, p) => {

  p.x = v[i * 2]
  p.y = v[i * 2 + 1]
}

export const applyMovementVector = (p, p0, pmv, f) => {

  p.x = p0.x + pmv.x * f
  p.y = p0.y + pmv.y * f
}

export const interpolatePoint = (p, p0, p1, f) => {

  p.x = p0.x + f * (p1.x - p0.x)
  p.y = p0.y + f * (p1.y - p0.y)
}

export const getAveragePoint = (p, ar) => {

  p.x = 0.0
  p.y = 0.0

  for(let i = 0; i < ar.length; i++) {

    p.x += ar[i].x;
    p.y += ar[i].y;
  }

  p.x /= ar.length
  p.y /= ar.length;
}

export const getMovementVector = (p, p0, p1, f) => {

  p.x = f * (p1.x - p0.x)
  p.y = f * (p1.y - p0.y)
}

export const getMovementVectorOrthogonalCW = (p, p0, p1, f) => {

  getMovementVector(p, p0, p1, f)

  const x = p.x
  const y = p.y

  p.x = -y
  p.y = x
}

export const getMovementVectorOrthogonalCCW = (p, p0, p1, f) => {

  getMovementVector(p, p0, p1, f)

  const x = p.x
  const y = p.y

  p.x = y
  p.y = -x
}

export const getIntersectionPoint = (p, pk0, pk1, pg0, pg1) => {

  //y1 = m1 * x1  + t1 ... y2 = m2 * x2 + t1
  //m1 * x  + t1 = m2 * x + t2
  //m1 * x - m2 * x = (t2 - t1)
  //x * (m1 - m2) = (t2 - t1)

  let dx1 = (pk1.x - pk0.x); if(dx1 === 0) dx1 = 0.01;
  let dy1 = (pk1.y - pk0.y); if(dy1 === 0) dy1 = 0.01;

  let dx2 = (pg1.x - pg0.x); if(dx2 === 0) dx2 = 0.01;
  let dy2 = (pg1.y - pg0.y); if(dy2 === 0) dy2 = 0.01;

  const m1 = dy1 / dx1
  const t1 = pk1.y - m1 * pk1.x

  const m2 = dy2 / dx2
  const t2 = pg1.y - m2 * pg1.x

  let m1m2 = (m1 - m2); if(m1m2 === 0) m1m2 = 0.01;
  let t2t1 = (t2 - t1); if(t2t1 === 0) t2t1 = 0.01;

  const px = t2t1 / m1m2
  const py = m1 * px + t1

  p.x = px
  p.y = py
}
