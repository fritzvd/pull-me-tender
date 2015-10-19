var fs = require('fs')
var prompt = require('prompt')
var cfg = require('./cfg')

function getUserInfo (cb, options) {
  var promptItems = ['token', 'repos']

  if (options) {
    if (options.token) {
      promptItems.splice(promptItems.indexOf('token'), 1)
    }
  }

  prompt.start()
  prompt.get(promptItems, function (err, result) {
    if (err) { throw err }
    var token
    if (result.token) {
      token = result.token.replace(/(^[ '\^\$\*#&]+)|([ '\^\$\*#&]+$)/g, '')
    } else {
      token = options.token
    }
    cfg.dict = {
      token: token,
      repos: result.repos.split(',')
    }
    fs.writeFileSync(cfg.location, JSON.stringify(cfg.dict), null, 4)
    cb()
  })
}

module.exports = getUserInfo
