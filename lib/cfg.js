var pwuid = require('pwuid')
var configFileLocation = pwuid().dir + '/.pull-me-config.json'

module.exports = {
  dict: require(configFileLocation),
  location: configFileLocation
}
