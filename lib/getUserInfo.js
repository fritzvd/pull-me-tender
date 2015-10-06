var fs = require('fs')
var prompt = require('prompt')
var cfg = require('./cfg')

function getUserInfo (cb) {
  prompt.start()
  prompt.get(['token', 'repos'], function (err, result) {
    if (err) { throw err }
    cfg.dict = {
      token: result.token.replace(/(^[ '\^\$\*#&]+)|([ '\^\$\*#&]+$)/g, ''),
      repos: result.repos.split(',')
    }
    fs.writeFileSync(cfg.location, JSON.stringify(cfg), null, 4)
    cb()
  })
}

module.exports = getUserInfo
