var uniq = require('lodash/array').uniq
var cfg = require('./cfg')
var fs = require('fs')

function addRepositories (repos) {
  // concat and dedupe repos
  cfg.dict.repos = cfg.dict.repos.concat(repos)
  cfg.dict.repos = uniq(cfg.dict.repos)

  // write to cfg file
  fs.writeFileSync(cfg.location, JSON.stringify(cfg.dict, null, 4))
}

module.exports = addRepositories

