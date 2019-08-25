import { log }              from '../utils/utils__logging.js'

const __brfv5__logo         = document.createElement('a')
const __brfv5__img          = document.createElement('img')

__brfv5__logo.id            = '__brfv5__logo'

const _name                 = 'BRFv5Logo'

export const mountLogo = (node) => {

  log(_name + ': mountLogo')

  if(node && node.appendChild) {

    __brfv5__logo.className  = 'abs img bl10 ontop br50'
    __brfv5__img.className   = 'abs fw fh'

    __brfv5__logo.href       = 'https://www.beyond-reality-face.com'
    __brfv5__logo.target     = '_blank'

    __brfv5__img.src         = './assets/ui/brfv5_logo.png'
    __brfv5__img.alt         = 'brfv5 logo'

    __brfv5__logo.appendChild(__brfv5__img)

    node.appendChild(__brfv5__logo);
  }
}

export default {
  mountLogo
}
