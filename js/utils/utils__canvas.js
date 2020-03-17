import { getIntersectionPoint, interpolatePoint, distance } from './utils__geom.js'

export const drawInput      = (ctx, imageWidth, imageHeight, input) => {

  ctx.drawImage(input, 0, 0, imageWidth, imageHeight)
}

export const drawInputMirrored = (ctx, imageWidth, imageHeight, input) => {

  ctx.setTransform(-1.0, 0, 0, 1, imageWidth, 0) // A virtual mirror should be... mirrored
  ctx.drawImage(input, 0, 0, imageWidth, imageHeight)
  ctx.setTransform(1.0, 0, 0, 1, 0, 0) // unmirror to draw the results
}

export const drawCircle     = (ctx, x, y, color, radius) => {

  ctx.strokeStyle           = null
  ctx.fillStyle             = getColor(color, 1.0)

  let _radius               = radius || 2.0

  ctx.beginPath()
  ctx.arc(x, y, _radius, 0, 2 * Math.PI)
  ctx.fill()
}

export const drawCircles    = (ctx, array, color, radius) => {

  ctx.strokeStyle           = null
  ctx.fillStyle             = getColor(color, 1.0)

  let _radius               = radius || 2.0

  for(let i = 0; i < array.length; ++i) {

    ctx.beginPath()
    ctx.arc(array[i].x, array[i].y, _radius, 0, 2 * Math.PI)
    ctx.fill()
  }
}

export const drawVertices   = (ctx, vertices, color, radius) => {

  ctx.strokeStyle           = null
  ctx.fillStyle             = getColor(color, 1.0)

  let _radius               = radius || 2.0

  for(let i = 0; i < vertices.length; i += 2) {

    ctx.beginPath()
    ctx.arc(vertices[i], vertices[i + 1], _radius, 0, 2 * Math.PI)
    ctx.fill()
  }
}

export const drawRect       = (ctx, rect, color, lineWidth) => {

  ctx.strokeStyle           = getColor(color, 1.0)
  ctx.fillStyle             = null

  ctx.lineWidth             = lineWidth || 1.0

  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.width, rect.height)
  ctx.stroke()
}

export const drawRects      = (ctx, rects, color, lineWidth) => {

  ctx.strokeStyle           = getColor(color, 1.0)
  ctx.fillStyle             = null

  ctx.lineWidth             = lineWidth || 1.0

  for(let i = 0; i < rects.length; ++i) {

    let rect                = rects[i]

    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.width, rect.height)
    ctx.stroke()
  }
}

export const drawTriangles = (ctx, vertices, triangles, lineThickness = 0.5, color, alpha) => {

  ctx.strokeStyle           = getColor(color, alpha)
  ctx.fillStyle             = null
  ctx.lineWidth             = lineThickness

  for(let i = 0; i < triangles.length; i += 3) {

    var ti0 = triangles[i]
    var ti1 = triangles[i + 1]
    var ti2 = triangles[i + 2]

    var x0 = vertices[ti0 * 2]
    var y0 = vertices[ti0 * 2 + 1]
    var x1 = vertices[ti1 * 2]
    var y1 = vertices[ti1 * 2 + 1]
    var x2 = vertices[ti2 * 2]
    var y2 = vertices[ti2 * 2 + 1]

    ctx.beginPath()

    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x0, y0)

    ctx.stroke()
  }
}

export const drawFillTriangles = (ctx, vertices, triangles, color, alpha) => {

  ctx.strokeStyle           = getColor(color, alpha)
  ctx.fillStyle             = getColor(color, alpha)
  ctx.lineWidth             = 0.28

  for(let i = 0; i < triangles.length; i += 3) {

    const ti0 = triangles[i]
    const ti1 = triangles[i + 1]
    const ti2 = triangles[i + 2]

    const x0 = vertices[ti0 * 2]
    const y0 = vertices[ti0 * 2 + 1]
    const x1 = vertices[ti1 * 2]
    const y1 = vertices[ti1 * 2 + 1]
    const x2 = vertices[ti2 * 2]
    const y2 = vertices[ti2 * 2 + 1]

    ctx.beginPath()

    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x0, y0)

    ctx.fill()
    ctx.stroke()
  }
}

export const drawTexture = (ctx, vertices, triangles, uvData, texture, overdraw = 0.25) => {

  // Ported from: http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas

  const l = triangles.length;

  for(let i = 0; i < l; i += 3) {

    const i0 = triangles[i];
    const i1 = triangles[i + 1];
    const i2 = triangles[i + 2];

    let x0 = vertices[i0 * 2];
    let y0 = vertices[i0 * 2 + 1];
    let x1 = vertices[i1 * 2];
    let y1 = vertices[i1 * 2 + 1];
    let x2 = vertices[i2 * 2];
    let y2 = vertices[i2 * 2 + 1];

    const u0 = uvData[i0 * 2] * texture.width;
    const v0 = uvData[i0 * 2 + 1] * texture.height;
    const u1 = uvData[i1 * 2] * texture.width;
    const v1 = uvData[i1 * 2 + 1] * texture.height;
    const u2 = uvData[i2 * 2] * texture.width;
    const v2 = uvData[i2 * 2 + 1] * texture.height;

    const p0 = { x: x0, y: y0 }
    const p1 = { x: x1, y: y1 }
    const p2 = { x: x2, y: y2 }

    const p0mv = { x: 0, y: 0 }
    const p1mv = { x: 0, y: 0 }
    const p2mv = { x: 0, y: 0 }

    const p0m = { x: 0, y: 0 }
    const p1m = { x: 0, y: 0 }
    const p2m = { x: 0, y: 0 }

    const pi  = { x: 0, y: 0 }

    // move from centriod

    interpolatePoint(p0m, p1, p2, 0.5)
    interpolatePoint(p1m, p0, p2, 0.5)

    getIntersectionPoint(pi, p0, p0m, p1, p1m)

    interpolatePoint(p0, pi, p0, 1.00 + overdraw / distance(p0, pi))
    interpolatePoint(p1, pi, p1, 1.00 + overdraw / distance(p1, pi))
    interpolatePoint(p2, pi, p2, 1.00 + overdraw / distance(p2, pi))

    x0 = p0.x
    y0 = p0.y
    x1 = p1.x
    y1 = p1.y
    x2 = p2.x
    y2 = p2.y

    // Set clipping area so that only pixels inside the triangle will
    // be affected by the image drawing operation
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x0, y0)
    ctx.closePath();
    ctx.clip();

    // Compute matrix transform
    const delta   = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
    const delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
    const delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
    const delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2 - v0*u1*x2 - u0*x1*v2;
    const delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
    const delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
    const delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2 - v0*u1*y2 - u0*y1*v2;

    // Draw the transformed image
    ctx.setTransform(
      delta_a/delta, delta_d/delta,
      delta_b/delta, delta_e/delta,
      delta_c/delta, delta_f/delta);

    ctx.drawImage(texture, 0, 0);

    ctx.restore();
  }
}

export const getColor = (color, alpha) => {

  const colorStr = color + ''

  if(colorStr.startsWith('rgb')) {

    return color
  }

  if(colorStr.startsWith('#')) {

    color = parseInt('0x' + colorStr.substr(1))
  }

  return 'rgb(' +
    (((color >> 16) & 0xff).toString(10)) + ', ' +
    (((color >> 8) & 0xff).toString(10))  + ', ' +
    (((color) & 0xff).toString(10)) + ', ' + alpha +')'
}