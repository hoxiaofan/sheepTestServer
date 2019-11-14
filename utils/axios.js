let axios = require('axios')

const instance = axios.create({})
instance.interceptors.request.use((config) => {
  // if(config.method.toLowerCase() === 'post' && config.headers['Content-Type'] !== 'multipart/form-data') {
  //   config.data = Qs.stringify(config.data);
  // }
  return config

},(error) => {
    console.log(error)
});
instance.interceptors.response.use(({data, status, statusText, headers}) => {
  return {
    data,
    status,
    statusText,
    headers
  };
});

module.exports = instance;
