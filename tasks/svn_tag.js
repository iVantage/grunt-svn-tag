/*
 * grunt-svn-tag
 * https://github.com/iVantage/grunt-svn-tag
 *
 * Copyright (c) 2013 Justin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  var shell = require('shelljs')
    , findup = require('findup-sync');

  grunt.registerTask('svn_tag', 'Tag this svn repo!', function() {

    var packageJsonLoc = findup('package.json', {cwd: process.cwd()});
    
    if(!packageJsonLoc) {
      return grunt.fail.fatal(this.name + ' could not find your package.json file.');
    }

    var packageJson =  grunt.file.readJSON(packageJsonLoc)
      , projectVersion = 'v' + packageJson.version;

    var commitMessage = 'admin: Tag for release (' + projectVersion + ')'
      , command = 'svn cp "^/trunk" "^/tags/' + projectVersion + '" -m "' + commitMessage + '"';

    if(shell(command) > 0) {
      return grunt.fail.fatal('Encountered an error while trying to svn tag your working copy');
    }

    grunt.log.ok('Working copy tagged as version ' + projectVersion);
  });

};
