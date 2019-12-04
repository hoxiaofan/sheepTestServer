const xss = require('xss')
const { exec, escape } = require('../db/mysql')

//保存 sql
const saveCaseData = (caseData, createUser) => {
  let name = xss(caseData.name)
  let url = xss(caseData.url)
  let header = xss(caseData.header)
  let body = xss(caseData.body)
  let description = xss(caseData.description)
  const sql = `
  insert into interface_info (name, url, method_type, header, body, create_user, expected, description) value ('${name}', '${url}', '${caseData.method_type}', '${header}', '${body}', '${createUser}', '${caseData.expected}', '${description}')`
  return exec(sql).then(saveCase => {
      return {
        caseId: saveCase.insertId
      }
    })
}

module.exports = {
  saveCaseData
}