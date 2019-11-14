const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const login = ({useremail, password}) => {
  useremail = escape(useremail)
  // 生成加密密码
  password = genPassword(password)
  password = escape(password)

  const sql = `select useremail from users where useremail=${useremail} and password=${password}`

  return exec(sql).then(rows => {
    return rows[0] || {}
  })
}
function isExistenceUser(useremail) {
  const sqlUserList = `select useremail from users where useremail=${useremail}`
  return new Promise((resolve, reject) => {
    exec(sqlUserList).then(userData => {
      // 用户已存在
      if (userData.length > 0) {
        return reject()
      }
      return resolve()
    })
  })
}
const register = ({useremail, password}) => {
  useremail = escape(useremail)
  password = genPassword(password)
  password = escape(password)
  const sql = `
  insert into users (useremail, password) value (${useremail}, ${password})`
  return isExistenceUser(useremail)
    .then(() => {
      return exec(sql).then(createUser => {
        return {
          userId: createUser.insertId
        }
      })
  })
  .catch(() => {
    return {
      errno: -1,
      msg: '用户已存在！'
    }
  })
}

module.exports = {
  login,
  register
}