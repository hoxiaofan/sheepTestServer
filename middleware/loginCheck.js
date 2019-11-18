const { ErrorModel } = require('../model/resModel')

module.exports = (req, res, next) => {
  if (req.session.useremail) {
    next()
    return
  }
  res.json(
    new ErrorModel({
      error: 'access_denied',
      error_description: '请登录'
    })
  )
}