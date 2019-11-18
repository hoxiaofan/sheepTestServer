const express = require('express')
const router = express.Router()
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { runCase, saveCase, getCaseList, updateCase, delCase } = require('../controller/case')
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

// caselist
router.get('/caseList', loginCheck, (req, res, next) => {
  console.log(req.session)
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

// 更新用例
router.post('/updataCase', (req, res, next) => {

})

module.exports = router;