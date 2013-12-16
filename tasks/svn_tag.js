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
    , findup = require('findup-sync')
    , run;

  grunt.registerTask('svn_tag', 'Tag this svn repo!', function() {

    if(!sh.test('-d', '.svn')) {
      grunt.fail.fatal('Task "svn_tag" must be run from an svn project root');
    }

    // Make sure we're on trunk or a branch
    var info = require('svn-info').sync()
      , urlParts = info.url.split('/')
      , isTrunk = urlParts.pop() === 'trunk'
      , isBranch = urlParts.pop() === 'branches';

    if(!isTrunk && !isBranch) {
      grunt.fail.fatal('Task "svn_tag" must be run from trunk or a branch');
    }

    var packageJsonLoc = findup('package.json', {cwd: process.cwd()});
    
    if(!packageJsonLoc) {
      return grunt.fail.fatal(this.name + ' could not find your package.json file.');
    }

    var packageJson =  grunt.file.readJSON(packageJsonLoc)
      , projectVersion = 'v' + packageJson.version;

    var commitMessage = 'admin: Tag for release (' + projectVersion + ')'
      , command = 'svn cp "' + info.url + '" "^/tags/' + projectVersion + '" -m "' + commitMessage + '"';

    if(run(command).code > 0) {
      return grunt.fail.fatal('Encountered an error while trying to svn tag repo');
    }

    grunt.log.ok('Tagged as version ' + projectVersion);
  });

  run = function(cmd) {
    if(grunt.option('dry-run')) {
      console.log('Not running: ' + cmd);
      return {
        code: 0,
        output: ''
      };
    }
    return sh.exec(cmd, {silent: true});
  };

};
