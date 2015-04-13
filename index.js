#!/usr/bin/env node

var github = require('octonode');
var colors = require('colors');
var q = require('q');
var program  = require('commander');

/**
 * setup command line parsing
 */
program
  .version('1.0.0')
  .option('-v, --verbose', 'Give more information')
  .option('-t, --titles', 'Show titles')
  .option('-s --story', 'Add descriptions to output')
  .option('-m, --minimal', 'Give only urls')
  .parse(process.argv);

var cfg = require('./config');
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

