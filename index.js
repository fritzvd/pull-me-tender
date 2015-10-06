#!/usr/bin/env node

var program = require('commander')

var version = require('./package.json').version
var getUserInfo = require('./lib/getUserInfo')
var main = require('./lib/main')

/**
 * setup command line parsing
 */
program
  .version(version)
  .option('-a, --add-repositories [type]', 'add repositories comma seperated without spaces[fritzvd/pull-me-tender,fritzvd/harmonize]')
  .option('-r, --remove-repositories [type]', 'remove repositories comma seperated')
  .option('-m, --minimal', 'Give only urls')
  .option('-t, --titles', 'Show titles')
  .option('-s, --story', 'Add descriptions to output')
  .option('-w, --which-repos', 'Shows you which repos you are tracking')
  .parse(process.argv)

try {
  var cfg = require('./lib/cfg').dict
  if (!cfg.token || !cfg.repos) {
    throw new Error('FILL STUFF in dude')
  }
} catch (e) {
  console.log('We don\'t have information on you yet')
  console.log('(Create an access token on https://github.com/settings/applications)')
  getUserInfo()
} finally {
  main(program)
}

