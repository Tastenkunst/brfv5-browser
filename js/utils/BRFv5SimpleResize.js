"use strict";

let _elements = [];

// fill the browser window completely

function onResize () {

  var ww   = window.innerWidth;
  var wh   = window.innerHeight;

  for(let i = 0; i < _elements.length; i++) {

    const element = _elements[i];

    var s  = wh / element.height;

    if (element.width * s < ww) {

      s    = ww / element.width;
    }

    var iw = element.width * s;
    var ih = element.height * s;
    var ix = (ww - iw) * 0.5;
    var iy = (wh - ih) * 0.5;

    element.style.transformOrigin = "0% 0%";
    element.style.transform = "matrix("+s+", 0, 0, "+s+", "+ix+", "+iy+")";
  }
}

window.addEventListener("resize", onResize, false);

const resizeElement = (element) => {

  for(let i = 0; i < _elements.length; i++) {

    const _element = _elements[i];

    if(element === _element) {

      return;
    }
  }

  _elements.push(element);

  onResize();
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { resizeElement };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { resizeElement }; });

} else if (typeof exports === "object") {

  exports["BRFv5Layout"] = { resizeElement };
}