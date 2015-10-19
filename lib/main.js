var github = require('octonode')
var q = require('q')
var addRepositories = require('./addRepositories')
var removeRepositories = require('./removeRepositories')
var printPrs = require('./printPrs')
var getUserInfo = require('./getUserInfo')

function main (program) {
  var repos
  var pulls = {}

  if (program.configure) {
    // make it not come past here again
    program.configure = null
    return getUserInfo(function () {
      main(program)
    })
  }

  if (program.addRepositories && program.removeRepositories) {
    throw new Error("You can't remove and add repositories in one command")
  }

  var cfg = require('./cfg').dict

  if (!cfg.repos || !cfg.token) {
    console.log(JSON.stringify(cfg))
    throw new Error('Something went wrong with reading out your user details')
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
      if (err) {
        switch (err.message) {
          case 'Bad credentials':
            console.log(err.message)
            localDefer.reject()
            return getUserInfo(function () {
              main(program)
            })
          case 'Not Found':
            console.log('The repos you entered do not exist or are protected')
            console.log('Try entering new ones')
            localDefer.reject()
            return getUserInfo(function () {
              main(program)
            }, {
              token: cfg.token
            })
          default:
            throw err
        }
        if (err.message === 'Bad credentials') {
        } else if (err.message) {
        } else {
          throw err
        }
      }

      if (result === undefined) {
        localDefer.reject()
        console.error('Are you sure you configured me correctly?\n' +
          'Run pull-me-tender -c to reconfigure')
        return
      }

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
