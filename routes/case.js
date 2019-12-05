const express = require('express')
const router = express.Router()
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { runCase, saveCase, getCaseList, updateCase, getCase, delCase, updateDesc } = require('../controller/case')
const loginCheck = require('../middleware/loginCheck')


// 用例执行
router.post('/runCase', (req, res, next) => {
  runCase(req.body)
  .then(data => {
    // if (data.status == 200) {
      res.json(new SuccessModel(data))
    // } else {
    //   res.json(new ErrorModel('sorry'))
    // }
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})

// 保存用例
router.post('/saveCase', loginCheck, (req, res, next) => {
  let createUser = req.session.useremail
  saveCase(req.body, createUser)
  .then(data => {
    res.json(new SuccessModel(data))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})
// 更新描述
router.post('/updateDesc', loginCheck, (req, res, next) => {
  Console.log('kao')
  let updateUser = req.session.useremail
  if (req.body.caseId == null){
    res.json(new ErrorModel({
      error:'id is null',
      error_description: 'id 不能为空'
    }))
    return
  }
  updateDesc(req.body, updateUser)
  .then(data => {
    res.json(new SuccessModel(data))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})

// 更新用例
router.post('/updateCase', loginCheck, (req, res, next) => {
  let updateUser = req.session.useremail
  if (req.body.caseId == null) {
    res.json(new ErrorModel({
      error: 'id is null',
      error_description: 'id不能为空'
    }))
    return
  }
  updateCase(req.body, updateUser)
  .then(data => {
    res.json(new SuccessModel(data))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})

// getCase
router.get('/getCase', loginCheck, (req, res, next) => {
  if (req.query.caseId == null) {
    res.json(new ErrorModel({
      error: 'id is null',
      error_description: 'id不能为空'
    }))
    return
  }
  let caseId = req.query.caseId
  getCase(caseId)
  .then(data => {
    res.json(new SuccessModel(data))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})

// caselist
router.get('/caseList', loginCheck, (req, res, next) => {
  let user = req.query.user || ''
  let keyword = req.query.keyword || ''
  getCaseList(user, keyword)
  .then(listData => {
    res.json(new SuccessModel(listData))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})

module.exports = router;

//删除用例
router.post('/delCase', loginCheck, (req, res, next) => {
  
  if (req.body.caseId == null) {
    res.json(new ErrorModel({
      error: 'id is null',
      error_description: 'id不能为空'
    }))
    return
  }
  delCase(req.body)
  .then(data => {
    res.json(new SuccessModel(data))
  })
  .catch(e => {
    res.json(new ErrorModel(e))
  })
})