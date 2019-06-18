"use strict";

const _text                 = document.createElement("div");
const _times                = [];

const setupStats            = (node) => {

  if(node && node.appendChild) {

    node.appendChild(_text);

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

  let avgTime = 0;
  for(let i = 0; i < _times.length; i++) { avgTime += _times[i]; }
  avgTime /= _times.length;

  _text.innerHTML = avgTime.toFixed(2);
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { setupStats, writeStats };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { setupStats, writeStats }; });

} else if (typeof exports === "object") {

  exports["BRFv5Canvas"] = { setupStats, writeStats };
}