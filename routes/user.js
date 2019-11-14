let express = require('express')
let router = express.Router()
let { SuccessModel, ErrorModel } = require('../model/resModel')
let { login, register } = require('../controller/user')

router.post('/login', (req, res) => {
  login(req.body)
  .then(data => {
    if (data.useremail) {
      // 保存session
      req.session.useremail = data.useremail
      res.json(new SuccessModel(data))
      return
    }
    res.json(new ErrorModel('登录失败'))
  })
  .catch(e => {
    res.json(new ErrorModel(e,'服务错误'))
  })
})

router.post('/register', (req, res) => {
  register(req.body)
  .then(data => {
    if (data.errno === -1) {
      res.json(new ErrorModel(data.msg))
      return
    }
    res.json(new SuccessModel(data))
    
  })
  .catch(e => {
    res.json(new ErrorModel(e,'服务错误'))
  })
})

router.get('/login-test', (req, res) => {
  if (req.session.useremail) {
    res.json({
      errno: 0,
      msg: 'success'
    })
    return
  }
  res.json({
    errno: -1,
    msg: 'login error'
  })
})

router.get('/session-test', (req, res, next) => {
    const session = req.session
    if (session.viewNum == null) {
      session.viewNum = 0
    } 
    session.viewNum++
    res.json({
      session: session.viewNum
    })
})

module.exports = router;