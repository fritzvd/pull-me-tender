var github = require('octonode');
var colors = require('colors');
var q = require('q')
var cfg = require('./config');

var deferred = q.defer(),
    client = github.client(cfg.token),
    pulls = [];

var promises = [deferred.promise];

cfg.repos.forEach(function (repo, i) {
  var localDefer = q.defer();
  promises.push(localDefer.promise);

  client.repo(repo).prs(function(err, result) {
    if (result.length == 0) { localDefer.resolve() }
    result.forEach(function (pr) {
      pulls.push(pr);
      localDefer.resolve();
    });
  });
  
  if (i == cfg.repos.length - 1) {
    deferred.resolve();
    q.all(promises).then(printPrs);
  }
})

function printPrs () {
  pulls.forEach(function (pull) {
    var message = pull.title + ' - ' + pull.html_url + ' - ' + pull.updated_at;
    console.log(message.green);
  });
};

