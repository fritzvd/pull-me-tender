var github = require('octonode')
var q = require('q')

var addRepositories = require('./addRepositories')
var removeRepositories = require('./removeRepositories')
var printPrs = require('./printPrs')
var cfg = require('./cfg').dict

function main (program) {
  var repos
  var pulls = {}

  if (program.addRepositories && program.removeRepositories) {
    throw new Error('You can\'t remove and add repositories in one command')
  }

  if (program.addRepositories) {
    repos = program.addRepositories.split(',')
    addRepositories(repos)
  }

  if (program.removeRepositories) {
    repos = program.removeRepositories.split(',')
    removeRepositories(repos)
  }

  var deferred = q.defer()
  var client = github.client(cfg.token)

  var promises = [deferred.promise]

  cfg.repos.forEach(function (repo, i) {
    var localDefer = q.defer()
    promises.push(localDefer.promise)

    pulls[repo] = []

    client.repo(repo).prs(function (err, result) {
      if (err) { throw err }
      if (result.length === 0) { localDefer.resolve() }
      result.forEach(function (pr) {
        pulls[repo].push(pr)
        localDefer.resolve()
      })
    })

    if (i === cfg.repos.length - 1) {
      deferred.resolve()
      q.all(promises).then(function () {
        printPrs(program, pulls)
      })
    }
  })
}

module.exports = main
