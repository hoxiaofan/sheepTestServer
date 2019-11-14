const { MYSQL_CONF}  = require('../conf/db')
const mysql = require('mysql')

// 创建链接对象
const con = mysql.createConnection(MYSQL_CONF)
con.connect()

// 执行sql
function exec(sql) {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

module.exports = {
  exec,
  escape: mysql.escape
}
