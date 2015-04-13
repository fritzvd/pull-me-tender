#!/usr/bin/env node

var github = require('octonode');
var colors = require('colors');
var q = require('q');
var program  = require('commander');
var prompt = require('prompt');
var fs = require('fs');

prompt.start();

/**
 * setup command line parsing
 */
program
  .version('1.0.0')
  .option('-a, --add-repositories [type]', 'add repositories comma seperated without spaces[fritzvd/pull-me-tender,fritzvd/harmonize]')
  .option('-m, --minimal', 'Give only urls')
  .option('-t, --titles', 'Show titles')
  .option('-s, --story', 'Add descriptions to output')
  .option('-v, --verbose', 'Give more information')
  .parse(process.argv);

try {
  var cfg = require('./config');
} catch (e) {
  console.log("We don't have information on you yet");
  prompt.get(["username", "token", "repos"], function (err, result) {
   fs.writeFileSync('./config.json', JSON.stringify({
      username: result.username,
      token: result.token,
      repos: result.repos.split(',')
    }), null, 4);
  });
}

if (program.addRepositories) {
  cfg.repos = cfg.repos.concat(program.addRepositories.split(','));
  fs.writeFileSync('./config.json', JSON.stringify(cfg, null, 4));
}

var deferred = q.defer(),
    client = github.client(cfg.token),
    pulls = {};

var promises = [deferred.promise];

cfg.repos.forEach(function (repo, i) {
  var localDefer = q.defer();
  promises.push(localDefer.promise);

  pulls[repo] = [];

  client.repo(repo).prs(function(err, result) {
    if (result.length == 0) { localDefer.resolve() }
    result.forEach(function (pr) {
      pulls[repo].push(pr);
      localDefer.resolve();
    });
  });
  
  if (i == cfg.repos.length - 1) {
    deferred.resolve();
    q.all(promises).then(printPrs);
  }
})

function printPrs () {
  Object.keys(pulls).forEach(function (repo) {
    console.log('\n' + repo.underline.red);
    pulls[repo].forEach(function (pull) {
    var message = '';
    if (program.minimal) {
      message += pull.html_url;
    } else {
      message += pull.updated_at + ' - ' + pull.html_url;
    }

    if (program.titles) { 
      message += ' - ' + pull.title;
    }

    if (program.story) {
      message += '\n' + pull.body + '\n';
    }

    // print all da tings
    console.log(message.green);
    
    });
  });
};

