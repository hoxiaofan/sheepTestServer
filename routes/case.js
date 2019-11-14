let express = require('express')
let router = express.Router()
let { SuccessModel, ErrorModel } = require('../model/resModel')
let { runCase, saveCase, updateCase, delCase } = require('../controller/case')

// 用例执行
router.post('/runCase', (req, res, next) => {
  console.log('ok')
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
router.post('/saveCase', (req, res, next) => {
  console.log('req.body',req.body)
  saveCase(req.body)
})

// 更新用例
router.post('/updataCase', (req, res, next) => {

})

module.exports = router;