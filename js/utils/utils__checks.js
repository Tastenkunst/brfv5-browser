import  { error } from './utils__logging.js'

export const isVideo = (video, errorMsg) => {

  if(!video || !video.play) {

    error(errorMsg)

    return false
  }

  return true
}

export const isImage = (image, errorMsg) => {

  if(!image || !image.naturalWidth) {

    error(errorMsg)

    return false
  }

  return true
}

export const isCanvas = (canvas, errorMsg) => {

  if (!canvas || !canvas.getContext) {

    error(errorMsg)

    return false
  }

  return true
}

export default { isVideo, isImage, isCanvas }
