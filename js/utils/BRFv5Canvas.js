"use strict";

const _image            = document.createElement("canvas");

const setupCanvas       = (width, height, node) => {

  _image.width          = width;
  _image.height         = height;

  if(node && node.appendChild) {

    node.prepend(_image);

    if(typeof resizeElement === "function") {

      resizeElement(_image);
    }
  }

  return _image;
};

const drawCircle        = (ctx, x, y, color, radius) => {

  ctx.strokeStyle       = null;
  ctx.fillStyle         = color;

  let _radius           = radius || 2.0;

  ctx.beginPath();
  ctx.arc(x, y, _radius * _sizeFactor, 0, 2 * Math.PI);
  ctx.fill();
};

const drawCircles       = (ctx, array, color, radius) => {

  ctx.strokeStyle       = null;
  ctx.fillStyle         = color;

  let _radius           = radius || 2.0;

  for(let i = 0; i < array.length; ++i) {

    ctx.beginPath();
    ctx.arc(array[i].x, array[i].y, _radius * _sizeFactor, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const drawRect          = (ctx, rect, color, lineWidth) => {

  ctx.strokeStyle       = color;
  ctx.fillStyle         = null;

  ctx.lineWidth         = lineWidth || 1.0;

  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.stroke();
};

const drawRects         = (ctx, rects, color, lineWidth) => {

  ctx.strokeStyle       = color;
  ctx.fillStyle         = null;

  ctx.lineWidth         = lineWidth || 1.0;

  for(let i = 0; i < rects.length; ++i) {

    let rect            = rects[i];

    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
  }
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { setupCanvas };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { setupCanvas }; });

} else if (typeof exports === "object") {

  exports["BRFv5Canvas"] = { setupCanvas };
}