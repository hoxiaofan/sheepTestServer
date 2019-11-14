const isJSONString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
const tryParseJSON = (jsonString) => {
  try {
    let o = JSON.parse(jsonString)
    if (o && typeof o === 'object') {
      return o
    }
  }
  catch (e) {
    return false
  }
}

module.exports = {
  isJSONString,
  tryParseJSON
}