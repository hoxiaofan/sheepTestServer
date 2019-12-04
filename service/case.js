const { saveCaseData } = require('../dao/case')

// 保存case
const saveCaseService = (caseData, createUser) => {
  return saveCaseData(caseData, createUser)
}

module.exports = {
  saveCaseService
}