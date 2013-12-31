/*
 * grunt-svn-tag
 * https://github.com/iVantage/grunt-svn-tag
 *
 * Copyright (c) 2013 jtrussell
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  var sh = require('shelljs')
    , findup = require('findup-sync');

  grunt.registerTask('svn_tag', 'Tag this svn repo!', function() {

    var info,
        options = this.options({
          'commitMessage': 'admin: Tag for release ({%= version %})',
          'dry-run': false
        });

    try {
      info = require('svn-info').sync();
    } catch(e) {
      grunt.fail.fatal(e);
    }

    var packageJsonLoc = findup('package.json', {cwd: process.cwd()});

    if(!packageJsonLoc) {
      return grunt.fail.fatal(this.name + ' could not find your package.json file.');
    }

    var packageJson =  grunt.file.readJSON(packageJsonLoc)
      , projectVersion = 'v' + packageJson.version
      , fromURL = info.url
      , toURL = info.repositoryRoot + '/tags/' + projectVersion
      , commitMessage = processTemplate(options.commitMessage, {
          version: projectVersion
        })
      , command = 'svn cp "' + fromURL + '" "' + toURL + '" -m "' + commitMessage + '"';

    if(run(command, options['dry-run']).code > 0) {
      return grunt.fail.fatal('Encountered an error while trying to svn tag repo');
    }

    grunt.log.ok('Tagged as version ' + projectVersion);
  });

  grunt.template.addDelimiters('svn_tag', '{%', '%}');
  function processTemplate(message, data) {
    return grunt.template.process(message, {
      delimiters: 'svn_tag',
      data: data
    });
  }

  function run(cmd, dryRun) {
    if(dryRun) {
      grunt.log.writeln('Not running: ' + cmd);
      return {
        code: 0,
        output: ''
      };
    }
    return sh.exec(cmd, {silent: true});
  }

};
