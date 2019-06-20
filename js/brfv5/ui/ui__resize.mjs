const _elements = [];

const onResize = () => {

  // fill the browser window completely

  const ww = window.innerWidth;
  const wh = window.innerHeight;

  for(let i = 0; i < _elements.length; i++) {

    const element = _elements[i];

    let s = wh / element.height;

    if(element.width * s < ww) {

      s = ww / element.width;
    }

    const iw = element.width  * s;
    const ih = element.height * s;
    const ix = (ww - iw) * 0.5;
    const iy = (wh - ih) * 0.5;

    element.style.transformOrigin = "0% 0%";
    element.style.transform = "matrix("+s+", 0, 0, "+s+", "+ix+", "+iy+")";
  }
};

window.addEventListener("resize", onResize, false);

export const resizeElement = (element) => {

  for(let i = 0; i < _elements.length; ++i) {

    if(element === _elements[i]) { return; }
  }

  _elements.push(element);

  onResize();
};
