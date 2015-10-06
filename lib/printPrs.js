function printPrs (program, pulls) {
  Object.keys(pulls).forEach(function (repo) {
    if (pulls[repo].length >= 1 || program.whichRepos) {
      console.log('\n', repo.underline.red, ' - https://github.com/' + repo)
    }

    if (program.whichRepos) {
      return
    }

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

module.exports = printPrs
