var pwuid = require('pwuid')
var configFileLocation = pwuid().dir + '/.pull-me-config.json'

try {
  var cfg = require(configFileLocation)
} catch (e) {
  console.log('Config file is not ready yet')
  cfg = null
}

module.exports = {
  dict: cfg,
  location: configFileLocation
}
