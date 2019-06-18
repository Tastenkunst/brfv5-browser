"use strict";

const _text                 = document.createElement("div");
const _times                = [];
let   _avgTime              = 0.0;

const setupStats            = (node) => {

  if(node && node.appendChild) {

    node.appendChild(_text);

    _text.style.position    = "absolute";
    _text.style.top         = "8px";
    _text.style.left        = "8px";
    _text.style.color       = "#00a0ff";
    _text.style.textShadow  = "1px 1px #ffd200";
    _text.style.fontSize    = "1.4em";
  }
};

const writeStats            = (time) => {

  _times.push(time);

  if(_times.length > 33) { _times.shift(); }

  _avgTime = 0;
  for(let i = 0; i < _times.length; i++) { _avgTime += _times[i]; }
  _avgTime /= _times.length;

  _text.innerHTML = _avgTime.toFixed(2);
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { setupStats, writeStats };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { setupStats, writeStats }; });

} else if (typeof exports === "object") {

  exports["BRFv5Canvas"] = { setupStats, writeStats };
}