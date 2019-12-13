const axios = require('../utils/axios')
const assert = require('assert').strict
const _ = require('lodash')

const runCase = ({optionsCase, assertionsData}) => {
  let {url, headers, data, method} = optionsCase
  url = encodeURI(url)
  !headers['Content-Type'] && (headers['Content-Type'] = 'application/json;charset=UTF-8')
  return axios({
    url,
    headers, 
    data, 
    method
  }).then((res) => {
    let resData = {
      resBody: res,
      assertionsResult: assertBodyJSON(res, assertionsData)
    }
    return resData
  }).catch((e) => {
    return e
  })
}

// 处理case依赖 '${}'
function handleDepend(str) {
  if (!_.isString(str)) return
  const reg = /\$\{(.*?)\}/
  // console.log(reg.exec(str))
  // console.log(str.match(/\$\{(.*?)\}/gm))
  let dependAry = str.match(/\$\{(.*?)\}/gm)
  if (dependAry) {
    let caseDepend = []
    let dependData = []
    let dp = {}
    dependAry.forEach((item, index) => {
      let exec = reg.exec(item)[1]
      dp[item] = dependParams(exec)
      // dependData.push(dp)
    })
    console.log('===',dp)
  }
}
// 检查匹配值是变量还是依赖${北京-天津新线路-创建包车单.data.orderNo}|${Time} 返回相关值
function dependParams(dependVal) {
  let dependCase = dependVal.split('.')
  let dependType = {}
  if (dependCase.length > 1) {
    dependType = {
      type: 'depend',
      exec: dependVal,
      caseTit: dependCase[0],
      caseData: dependCase[1]
    }
  } else { // 变量依赖
    dependType = {
      type: 'param',
      exec: dependVal,
      paramData: dependCase[0]
    }
  }
  return dependType
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

module.exports = {
  runCase
}