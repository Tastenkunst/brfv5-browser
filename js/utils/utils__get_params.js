export const getURLParameter = (url, param) => {

  if(url.includes('?')) {

    const splitURL    = url.split("?")
    const splitParams = splitURL[1].split("&")

    for(let i = 0; i < splitParams.length; i++) {

      const splitParam = splitParams[i].split("=")

      if(splitParam[0] === param) {

        return splitParam[1]
      }
    }
  }

  return null
}

export default { getURLParameter }
