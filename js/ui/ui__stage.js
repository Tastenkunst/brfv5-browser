import { log }                  from '../utils/utils__logging.js'

const __brfv5__stage            = document.createElement('div')

__brfv5__stage.id               = '__brfv5__stage'

const _name                     = 'BRFv5ExampleStage'

export const mountStage = (node) => {

  log(_name + ': mountStage')

  if(node && node.appendChild) {

    __brfv5__stage.className = 'bg-t rel mc fw fh'

    node.prepend(__brfv5__stage);
  }

  return __brfv5__stage
}

export default {
  mountStage
}
