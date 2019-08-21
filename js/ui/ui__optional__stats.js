import { log }              from '../utils/utils__logging.js'

import Stats                from './stats.module.js'

const __brfv5__stats        = new Stats()

__brfv5__stats.id           = '__brfv5__stats'

const _name                 = 'BRFv5Stats'

export const mountStats = (node) => {

  log(_name + ': mountStats')

  if(node && node.appendChild) {

    __brfv5__stats.dom.className = 'abs tl10'

    node.appendChild(__brfv5__stats.dom);
  }
}

export const showStats = () => {

  log(_name + ': showStats')

  __brfv5__stats.dom.classList.remove('vh')
}

export const hideStats = () => {

  log(_name + ': hideStats')

  __brfv5__stats.dom.classList.add('vh')
}

export const updateStats = (time, info) => {

  // log(_name + ': updateStats:', time, info)

  if(time > 0)

  __brfv5__stats.setMS(time)
}

export default {
  mountStats,
  showStats,
  hideStats,
  updateStats
}
