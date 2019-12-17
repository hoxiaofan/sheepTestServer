const utils = require('../utils/utils')
const xss = require('xss')
const { exec, escape } = require('../db/mysql')
const { runCase } = require('./runCase1')

//title重复校验
const checkTName = (name) => {
  let sql = `select name from interface_info where name="${name}";`
  return exec(sql).then(data => {
    let checkStatus = false
    if(data.length > 0){
      checkStatus = true
    }
    return {
      checkStatus: checkStatus
    }

  })
}
//保存
const saveCase = (caseData = {}, createUser) => {
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
  // return saveCaseService(caseData, createUser)
}

const getCaseList = (user, keyword) => {
  // let sql = `select id, name, url, method_type, header, body, expected, description from interface_info where 1=1 `
  let sql = `select id, name from interface_info where status=1 `
  if (user) {
      sql += `and create_user='${user}' `
  }
  if (keyword) {
      sql += `and title like '%${keyword}%' `
  }
  sql += `order by create_time desc;`
  return exec(sql).then(listData => {
    return {
      caseList: listData
    }
  })
}
// case详情
const getCase = (caseId) => {
  let sql = `
  select id, name, url, method_type, header, 
  body, expected, description from 
  interface_info where status != 0 `
  if (caseId) {
    sql += `and id='${caseId}'; `
  }
  
  return exec(sql).then(data => {
    let caseData = {}
    if (data.length > 0) {
      caseData.case = data[0]
      return caseData
    } else {
      throw('用例不存在')
    }
    
  })
}
//更新描述
const updateDesc = (caseData = {}, updateUser) => {
  let description = xss(caseData.event)
  const sql = `
  update interface_info set description = '${description}' , update_user = '${updateUser}' where id = ${caseData.caseId};`
  return exec(sql).then(updateDesc =>{
    return{
      changedDesc:updateDesc.changedDesc
    }
  })
}

//更新
const updateCase = (caseData = {}, updateUser) => {
  let id = xss(caseData.caseId)
  let name = xss(caseData.name)
  let url = xss(caseData.url)
  let header = xss(caseData.header)
  let body = xss(caseData.body)
  let description = xss(caseData.description)
  const sql = `
  update interface_info set name = '${name}', url = '${url}', 
  method_type = '${caseData.method_type}', header = '${header}', 
  body = '${body}', update_user = '${updateUser}', expected = '${caseData.expected}', 
  description = '${description}' where id = ${id};`
  return exec(sql).then(updateCase => {
    return {
      changedRows: updateCase.changedRows
    }
  })
}

//删除
const delCase = (caseData = {}) => {
  let caseId = xss(caseData.caseId)
  const sql = `
  update interface_info set status = 0 where id = ${caseId};`
  return exec(sql).then(delCase => {
      return {
        status:"删除成功！" 
      }
    })
}

module.exports = {
  runCase,
  saveCase,
  getCaseList,
  updateCase,
  getCase,
  delCase,
  updateDesc,
  checkTName
}