"use strict";

const _bar                  = document.createElement("div");

const setupPreloader        = (node) => {

  if(node && node.appendChild) {

    _bar.style.width        = "1%";
    _bar.style.height       = "8px";
    _bar.style.top          = "0px";
    _bar.style.background   = "#00a0ff";

    node.appendChild(_bar);
  }
};

const writeProgress         = (progress) => {

  progress                  = Math.ceil(progress * 100);

  _bar.style.width          = progress+"%";

  if(progress >= 100) {

    setTimeout(function () {

      _bar.style.visibility = "hidden";

    }, 500);
  }
};

if (typeof exports === "object" && typeof module === "object") {

  module.exports = { setupPreloader, writeProgress };

} else if (typeof define === "function" && define["amd"]) {

  define([], function() { return { setupPreloader, writeProgress }; });

} else if (typeof exports === "object") {

  exports["BRFv5Canvas"] = { setupPreloader, writeProgress };
}