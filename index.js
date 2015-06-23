#!/usr/bin/env node

var github = require('octonode')
var q = require('q')
var program = require('commander')
var prompt = require('prompt')
var pwuid = require('pwuid')
var fs = require('fs')
var version = require('./package.json').version

var pulls = {}
var configFileLocation = pwuid().dir + '/.pull-me-config.json'

/**
 * setup command line parsing
 */
program
  .version(version)
  .option('-a, --add-repositories [type]', 'add repositories comma seperated without spaces[fritzvd/pull-me-tender,fritzvd/harmonize]')
  .option('-m, --minimal', 'Give only urls')
  .option('-t, --titles', 'Show titles')
  .option('-s, --story', 'Add descriptions to output')
  .parse(process.argv)

try {
  var cfg = require(configFileLocation)
  if (!cfg.token || !cfg.repos) {
    throw new Error('FILL STUFF in dude')
  } else {
    startGithubPulls()
  }
} catch (e) {
  console.log("We don't have information on you yet")
  getUsernameEtc()
}

function getUsernameEtc () {
  prompt.start()
  prompt.get(['token', 'repos'], function (err, result) {
    if (err) { throw err }
    cfg = {
      token: result.token.replace(/(^[ '\^\$\*#&]+)|([ '\^\$\*#&]+$)/g, ''),
  repos: result.repos.split(',')
    }
    fs.writeFileSync(configFileLocation, JSON.stringify(cfg), null, 4)
    startGithubPulls()
  })
}

function startGithubPulls () {
  if (program.addRepositories) {
    cfg.repos = cfg.repos.concat(program.addRepositories.split(','))
    fs.writeFileSync(configFileLocation, JSON.stringify(cfg, null, 4))
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
      q.all(promises).then(printPrs)
    }
  })
}

function printPrs () {
  Object.keys(pulls).forEach(function (repo) {
    console.log('\n' + repo.underline.red)
    pulls[repo].forEach(function (pull) {
      var message = ''
      if (program.minimal) {
        message += pull.html_url
      } else {
        message += pull.updated_at + ' - ' + pull.html_url
      }

      if (program.titles) {
        message += ' - ' + pull.title
      }

      if (program.story) {
        message += '\n' + pull.body + '\n'
      }

      // print all da tings
      console.log(message.green)

    })
  })
}

