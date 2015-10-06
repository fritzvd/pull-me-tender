var cfg = require('./cfg')
var fs = require('fs')

function removeFromList (repo) {
  var idx = cfg.dict.repos.indexOf(repo)
  if (repo !== -1) {
    cfg.dict.repos.pop(idx)
    fs.writeFileSync(cfg.location, JSON.stringify(cfg.dict, null, 4))
  }
}

function removeRepositories (repos) {
  repos.map(removeFromList)
}

module.exports = removeRepositories
