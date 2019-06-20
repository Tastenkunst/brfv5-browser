const _image                = document.createElement("canvas");

export const setupCanvas    = (width, height, node, resizeFunction) => {

  _image.width              = width;
  _image.height             = height;

  if(node && node.prepend) {

    node.prepend(_image);

    if(typeof resizeFunction === "function") {

      resizeFunction(_image);

    } else {

      _image.style.top      = "calc(50% - " + ( height * 0.50 ) + "px)";
      _image.style.left     = "calc(50% - " + ( width  * 0.50 ) + "px)";
    }
  }

  return _image;
};

export const drawInput      = (ctx, imageWidth, imageHeight, input) => {

  ctx.drawImage(input, 0, 0, imageWidth, imageHeight);
};

export const drawInputMirrored = (ctx, imageWidth, imageHeight, input) => {

  ctx.setTransform(-1.0, 0, 0, 1, imageWidth, 0); // A virtual mirror should be... mirrored
  ctx.drawImage(input, 0, 0, imageWidth, imageHeight);
  ctx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirror to draw the results
};

export const drawCircle            = (ctx, x, y, color, radius) => {

  ctx.strokeStyle           = null;
  ctx.fillStyle             = color;

  let _radius               = radius || 2.0;

  ctx.beginPath();
  ctx.arc(x, y, _radius, 0, 2 * Math.PI);
  ctx.fill();
};

export const drawCircles           = (ctx, array, color, radius) => {

  ctx.strokeStyle           = null;
  ctx.fillStyle             = color;

  let _radius               = radius || 2.0;

  for(let i = 0; i < array.length; ++i) {

    ctx.beginPath();
    ctx.arc(array[i].x, array[i].y, _radius, 0, 2 * Math.PI);
    ctx.fill();
  }
};

export const drawRect              = (ctx, rect, color, lineWidth) => {

  ctx.strokeStyle           = color;
  ctx.fillStyle             = null;

  ctx.lineWidth             = lineWidth || 1.0;

  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.stroke();
};

export const drawRects             = (ctx, rects, color, lineWidth) => {

  ctx.strokeStyle           = color;
  ctx.fillStyle             = null;

  ctx.lineWidth             = lineWidth || 1.0;

  for(let i = 0; i < rects.length; ++i) {

    let rect                = rects[i];

    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
  }
};