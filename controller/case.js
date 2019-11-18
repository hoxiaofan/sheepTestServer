const axios = require('../utils/axios')
const utils = require('../utils/utils')
const xss = require('xss')
const { exec, escape } = require('../db/mysql')
const assert = require('assert').strict

const runCase = ({optionsCase, assertionsData}) => {
  let {url, headers, data, method} = optionsCase
  // console.log(assertionsData)
  url = encodeURI(url)
  !headers['Content-Type'] && (headers['Content-Type'] = 'application/json;charset=UTF-8')
  return axios({
    url,
    headers, 
    data, 
    method
  }).then((res) => {
    console.log(res)
    let resData = {
      resBody: res,
      assertionsResult: assertBodyJSON(res, assertionsData)
    }
    return resData
  }).catch((e) => {
    return e
  })
}

// 断言
function assertBodyJSON(res, assertionsData) {
  let assertionsResult = []
  assertionsResult = assertionsData.map((item) => {
    let ast = {
      check: false,
      result: true
    }
    if (item.check && item.key !== '' && item.value !== '') {
      let jsonVal
      ast.check = true
      switch (item.assertType) {
        case '1':
          try {
            jsonVal = res[item.key]
            if (typeof jsonVal === 'number') {
              jsonVal = jsonVal.toString()
            }
          } catch (e) {
            jsonVal = null
            ast.err = `${e}`
          }
          break;
        case '2':
          jsonVal = getJsonValue(res.headers, item.key)
          break;
        case '3':
          jsonVal = getJsonValue(res.data, item.key)
          break;
        default:
          break;
      }
      // 严格相等
      try {
        assert.strictEqual(jsonVal, item.value, `${item.key} !== ${item.value} >>> ${jsonVal}`)
      } catch (e) {
        ast.msg = `${e.message}`
        ast.result = false
      }
      
    }
    return ast
  })
  return assertionsResult
}
// 匹配key对应value值
function getJsonValue(json, key) {
  let reg = new RegExp(`"${key}":\"?(.+?)[\,\"\}]`,'g')
  // let reg = new RegExp(`"${key}":[[\{](.+?)[\}]|[\[](.+?)[\]]]`,'g')
  let result = []
  try {
    let jsonString = JSON.stringify(json)
    result = reg.exec(jsonString)
    return result && result[1] || null
  } catch (e) {
    return false
  }
}
// 匹配字符串中包含值(例：success&&true success||true))
function getKeyword(string, condition) {
  try {
    if (string && typeof string === 'object') {
      string = JSON.stringify(string)
    }
  } catch (e) {
    console.log(e)
  }
  condition = condition.replace(/\s/ig,'')
  if (condition.indexOf('&&')) {
    return condition.split('&&').every((key) => {
      return string.indexOf(key) > -1
    })
  } else if (condition.indexOf('||')) {
    return condition.split('||').some((key) => {
      return string.indexOf(key) > -1
    })
  } else {
    return string.indexOf(key) > -1
  }
}


const saveCase = (caseData = {}) => {
  let name = xss(caseData.name)
  let url = xss(caseData.url)
  let header = xss(caseData.header)
  let body = xss(caseData.body)
  let description = xss(caseData.description)
  const sql = `
  insert into interface_info (name, url, method_type, header, body, expected, description) value ("${name}", "${url}", "${caseData.method_type}", '${header}', '${body}', '${caseData.expected}', "${description}")`
  return exec(sql).then(saveCase => {
      return {
        caseId: saveCase.insertId
      }
    })
}

const getCaseList = (user, keyword) => {
  let sql = `select id, name, url, method_type, header, body, expected, description from interface_info where 1=1 `
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

const updateCase = (id, caseData = {}) => {

}

const delCase = (id) => {

}

module.exports = {
  runCase,
  saveCase,
  getCaseList,
  updateCase,
  delCase
}