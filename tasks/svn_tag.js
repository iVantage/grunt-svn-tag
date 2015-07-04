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
    , svnProjectRoot = require('svn-project-root')
    , svnInfo = require('svn-info');

  grunt.template.addDelimiters('svn_tag', '{%', '%}');

  var processTemplate = function (message, data) {
    return grunt.template.process(message, {
      delimiters: 'svn_tag',
      data: data
    });
  };

  var run = function(cmd, dryRun) {
    if(dryRun) {
      grunt.log.writeln('Not running: ' + cmd);
      return {
        code: 0,
        output: ''
      };
    }
    return sh.exec(cmd, {silent: true});
  };

  grunt.registerMultiTask('svn_tag', 'Tag this svn repo!', function () {

    var options = this.options({
          'commitMessage': 'admin: Tag for release ({%= version %})',
          'tag': 'v{%= version %}',
          'dryRun': false,
          'projectRoot': null,
          'username': null,
          'password': null,
          'overwrite': false
        });

    options.commitMessage = grunt.option('commit-message') ? grunt.option('commit-message') : options.commitMessage;
    options.tag = grunt.option('tag') ? grunt.option('tag') : options.tag;
    options.dryRun = grunt.option('dry-run') ? grunt.option('dry-run') : options.dryRun;
    if (grunt.option('username')) {
      options.username = grunt.option('username');
    }
    if (grunt.option('password')) {
      options.password = grunt.option('password');
    }

    var packageJsonLoc = findup('package.json', {cwd: process.cwd()});

    if(!packageJsonLoc) {
      return grunt.fail.fatal(this.name + ' could not find your package.json file.');
    }

    var packageJson = grunt.file.readJSON(packageJsonLoc)
      , projectRoot;

    if(grunt.option('projectRoot') || options.projectRoot) {
      projectRoot = grunt.option('projectRoot') ? grunt.option('projectRoot') : options.projectRoot;
    } else {
      try {
        projectRoot = svnProjectRoot.sync();
      } catch(e) {
        grunt.fail.fatal(e);
      }
    }

    projectRoot = projectRoot.replace(/\/$/, '');

    // We support tagging either the trunk or a branch. Are we on trunk or a
    // branch? If a branch figure out which we're on.
    var fromPath;
    try {
      var _svnInfo = svnInfo.sync()
        , path = _svnInfo.relativeUrl ? _svnInfo.relativeUrl : _svnInfo.url;
      path.split('/').every(function(part, ix, arr) {
        part = part.toLowerCase();
        if(part === 'trunk') {
          fromPath = '/trunk/';
          return false;
        }

        if(part === 'branches' && arr.length > ix + 1) {
          fromPath = '/branches/' + arr[ix+1] + '/';
          return false;
        }
        return true;
      });

      if(!fromPath) {
        throw new Error('svn_tag task must be run from trunk or a branch');
      }
    } catch(e) {
      grunt.fail.fatal(e);
    }

    var projectVersion = packageJson.version
      , fromURL = projectRoot + fromPath
      , tagName = processTemplate(options.tag, {
            version: projectVersion
        })
      , toURL = projectRoot + '/tags/' + tagName
      , commitMessage = processTemplate(options.commitMessage, {
          version: projectVersion
        })
      , command = 'svn cp "' + fromURL + '" "' + toURL + '" -m "' + commitMessage + '"';

    if(options.username && options.password) {
      command += ' --username '+ options.username + ' --password ' + options.password;
    }

    if (options.overwrite) {
      deleteToUrlFirst();
    }

    if (run(command, options['dryRun']).code > 0) {
      return grunt.fail.fatal('Encountered an error while trying to svn tag repo');
    }

    grunt.log.ok('Tagged as "' + tagName + '"');

    function deleteToUrlFirst() {
      var command = 'svn delete "' + toURL + '" -m "deleting destination folder"';
      var result = run(command, options.dryRun);
      // if the folder doesn't exist, then deleting will fail, but we can ignore that: E160013
      if (result.code > 0 && result.output.indexOf('E160013') === -1) {
        grunt.fail.fatal(result.output);
      }
    }
  });

};
