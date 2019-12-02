const { saveCaseData } = require('../dao/case')

// 保存case
const saveCaseService =  () => {
  return saveCaseData()
}

module.exports = {
  saveCaseService
}