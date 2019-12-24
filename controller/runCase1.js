const axios = require('../utils/axios')
const assert = require('assert').strict
const { exec, escape } = require('../db/mysql')
const _ = require('lodash')

/* 
  key为title类型时缓存用例request数据
  key为url类型时缓存接口response数据 
*/
let caseMap = {}

const runCase = async ({optionsCase, assertionsData}) => {
  caseMap = {}
  let reqParams = JSON.stringify(optionsCase)
  let resCaseData = await caseAnalyze(reqParams)
    .then((res) => {
      let resData = {
        resBody: res,
        assertionsResult: assertBodyJSON(res, assertionsData)
      }
      return resData
    })
  // console.log('resCaseData',resCaseData)
  return resCaseData
}

// 接收完整请求体 接收类型JSON.stringify，返回接口json数据
async function caseAnalyze(reqParams) {
  // 检查是否有依赖，执行bb()
  console.log('reqParamsreqParams',handleDepend(reqParams))
  if (handleDepend(reqParams).length) {
    reqParams = await processDepend(reqParams)
      .catch((error) => {
        console.error('caseAnalyze',error)
      })
  }
  // 执行请求
  let {url, headers, data, method} = JSON.parse(reqParams)
  url = encodeURI(url)
  let resData = {}
  if (_.has(caseMap, [`${url}`])) {
    resData = _.get(caseMap, [`${url}`])
  } else {
    !headers['Content-Type'] && (headers['Content-Type'] = 'application/json;charset=UTF-8')
    resData = await axios({
      url,
      headers, 
      data, 
      method
    })
    // 缓存用例res结果
    _.set(caseMap, [`${url}`], resData)
  }
  console.log('axiosData', resData)
  // 返回请求结果
  return resData
}
// 处理用例中所包含的所有引用
async function processDepend(str) {
  if (!_.isString(str)) {
    try {
      str = JSON.stringify(str)
    } catch (error) {
      console.error(error)
    }
  }
  // 获取依赖 数组循环
  let dependAry = handleDepend(str)
  for (let item of dependAry) {
    // 依赖完整请求体
    let itemKey = _.keys(item)[0]
    // 获取用例请求参数url/method/body...
    let caseReqBody = await getReqParams(item[itemKey].caseTit)
      .then(data => {
        return !_.isEmpty(data) && data
      })
      .catch((error) => {
        console.error('getReqParams',error)
      })
    _.set(caseMap, [item[itemKey].caseTit], caseReqBody)
    let dependDataType = item[itemKey].dependDataType
    // 依赖用例-请求数据
    
    // // 依赖用例-返回结果数据,执行caseAnalyze()
    // let resBody = caseReqBody && await caseAnalyze(JSON.stringify(caseReqBody))
    //   .catch((error) => {
    //     console.log('processDepend',error)
    //   })
    // 获取依赖结果值匹配返回值
    let dependVal = await dependResult(caseReqBody, dependDataType, item[itemKey].caseJsonPath)
    console.log('dependVal-caseReqBody',caseReqBody)
    console.log('dependVal-dependDataType',dependDataType)
    console.log('dependVal-caseJsonPath',item[itemKey].caseJsonPath)
    // 参数匹配失败/用例执行失败
    if (dependVal == null) {
      throw (`依赖用例 ${item[itemKey].caseTit} 执行错误！`)
    }
    let rpExec = `\$\{${item[itemKey].exec}\}`
    // caseAnalyze()结果替换依赖体
    str = str.replace(rpExec, dependVal)
  }
  
  console.log('str\n',str)
  // 返回处理后请求结构
  return str
}
// 返回依赖结果
async function dependResult(caseReqBody, dependDataType, caseJsonPath) {
  let dependVal
  let jsonPath = caseJsonPath.split('.')
  if (dependDataType === 'request') {
    let {headers, data} = caseReqBody
    if (jsonPath[0] === 'headers') {
      dependVal = _.result(headers, jsonPath[1])
    } else if (jsonPath[0] === 'body') {
      dependVal = _.result(data, jsonPath[1])
    }
  } else if (dependDataType === 'response' || dependDataType === 'data') {
    // 依赖用例-返回结果数据,执行caseAnalyze()
    let resBody = caseReqBody && await caseAnalyze(JSON.stringify(caseReqBody))
      .catch((error) => {
        console.log('caseAnalyze',error)
      })
    if (dependDataType === 'response') {
      if (jsonPath[0] === 'headers') {
        dependVal = _.result(resBody.headers, jsonPath[1])
      } else if (jsonPath[0] === 'body') {
        dependVal = _.result(resBody.data, jsonPath[1])
      }
    } else {
      dependVal = _.result(resBody.data, `${dependDataType}.${caseJsonPath}`)
    }
    
  }
  // 匹配失败返回 undefined
  return dependVal
}
// 返回依赖数组
function handleDepend(str) {
  if (!_.isString(str)) return
  const REG_DEPEND = /\$\{(.*?)\}/
  let dependAry = str.match(/\$\{(.*?)\}/gm)
  if (dependAry) {
    let dependData = []
    dependData = dependAry.map((item) => {
      let dp = {}
      let exec = REG_DEPEND.exec(item)[1]
      dp[item] = dependParams(exec)
      return dp
    })
    return dependData
  }
  return []
}
/* 组合依赖数据 
${telphone}/${北京-承德线路-预估价.data.rideEstimateResponse.scatteredPrice} */
function dependParams(dependVal) {
  let dependCase = dependVal.split('.')
  let dependType = {}
  if (dependCase.length > 1) {
    dependType = {
      type: 'depend',
      exec: dependVal,
      caseTit: dependCase[0],
      dependDataType: dependCase[1],
      caseJsonPath: dependCase.slice(2).join('.')
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

// 通过匹配出的caseTit获取数据库中case数据
async function getReqParams(caseTit) {
  let sql = `select * from interface_info where name="${caseTit}" and status != 0;`
  let reqParams = exec(sql).then((data) => {
    let caseData = ''
    if (data.length > 0) {
      caseData = data[0]
      let {url, header, method_type, body} = caseData
      return {
        url,
        headers: JSON.parse(header),
        data: JSON.parse(body),
        method: method_type
      }
    }
    return {}
  })
  
  return reqParams
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