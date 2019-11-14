const env = process.env.NODE_ENV

const MYSQL_CONF = {
  host: 'localhost',
  user: 'root',
  password: 'Xiao1027',
  port: '3306',
  database: 'sheep'
}

// if (env === 'dev') {
//   MYSQL_CONF = {
//     host: 'localhost',
//     user: 'root',
//     password: 'Xiao1027',
//     port: '3306',
//     database: 'sheep'
//   }
// }

if (env === 'production') {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'Xiao1027',
    port: '3306',
    database: 'sheep'
  }
}

module.exports = {
  MYSQL_CONF
}