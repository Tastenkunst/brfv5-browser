export const SystemOS = {
  ANDROID:                    'Android',
  IOS:                        'iOS',
  UNKNOWN:                    'unknown',
  WINDOWS_PHONE:              'Windows Phone'
}

const getMobileOperatingSystem = () => {

  let userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Windows Phone must come first because its UA also contains 'Android'
  if (/windows phone/i.test(userAgent)) {
    return SystemOS.WINDOWS_PHONE
  }

  if (/android/i.test(userAgent)) {
    return SystemOS.ANDROID
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {

    return SystemOS.IOS
  }

  return SystemOS.UNKNOWN
}

const isWebAssemblySupported = () => {

  try {

    if(typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {

      const bin = new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11])
      const mod = new WebAssembly.Module(bin)

      if(mod instanceof WebAssembly.Module) {

        // test storing to and loading from a non-zero location via a parameter.
        // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations

        const inst = new WebAssembly.Instance(mod, {})

        return (inst instanceof WebAssembly.Instance) && (inst.exports.test(4) !== 0)
      }
    }
  } catch (e) { }

  return false
}

const isWebGLSupported = () => {

  try {

    const c = document.createElement('canvas')

    return !!window.WebGLRenderingContext &&
      (!!c.getContext('experimental-webgl') || !!c.getContext('webgl'))

  } catch (e) {

    return false
  }
}

export const SystemUtils  = {
  mobileOS:               getMobileOperatingSystem(),
  isMobileOS:             getMobileOperatingSystem() !== SystemOS.UNKNOWN,
  isWebAssemblySupported: isWebAssemblySupported(),
  isWebGLSupported:       isWebGLSupported()
}

export default { SystemUtils, SystemOS }

