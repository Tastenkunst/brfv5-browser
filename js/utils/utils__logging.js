let _debug = true

export const setLogLevel  = (showDebug) => { _debug = showDebug }
export const log          = (...args)   => { if(_debug) { console.log.apply(null, args) } }
export const warn         = (...args)   => { if(_debug) { console.warn.apply(null, args) } }
export const error        = (...args)   => { console.error.apply(null, args) }

export default { log, warn, error, setLogLevel }
