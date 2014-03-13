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

  grunt.registerTask('svn_tag', 'Tag this svn repo!', function() {

    var info,
        options = this.options({
          'commitMessage': 'admin: Tag for release ({%= version %})',
          'tag': 'v{%= version %}',
          'dryRun': false,
          'projectRoot': null
        });

    options.commitMessage = grunt.option('commit-message') ? grunt.option('commit-message') : options.commitMessage;
    options.tag = grunt.option('tag') ? grunt.option('tag') : options.tag;
    options.dryRun = grunt.option('dry-run') ? grunt.option('dry-run') : options.dryRun;

    try {
      info = require('svn-info').sync();
    } catch(e) {
      grunt.fail.fatal(e);
    }

    var packageJsonLoc = findup('package.json', {cwd: process.cwd()});

    if(!packageJsonLoc) {
      return grunt.fail.fatal(this.name + ' could not find your package.json file.');
    }

    var projectRoot = info.repositoryRoot;
    if(grunt.option('projectRoot') || options.projectRoot) {
      projectRoot = grunt.option('projectRoot') ? grunt.option('projectRoot') : options.projectRoot;
      projectRoot = projectRoot.replace('/\/$/', '');
    }

    var packageJson =  grunt.file.readJSON(packageJsonLoc)
      , projectVersion = packageJson.version
      , fromURL = info.url
      , tagName = processTemplate(options.tag, {
            version: projectVersion
        })
      , toURL = projectRoot + '/tags/' + tagName
      , commitMessage = processTemplate(options.commitMessage, {
          version: projectVersion
        })
      , command = 'svn cp "' + fromURL + '" "' + toURL + '" -m "' + commitMessage + '"';

    if(run(command, options['dryRun']).code > 0) {
      return grunt.fail.fatal('Encountered an error while trying to svn tag repo');
    }

    grunt.log.ok('Tagged as version ' + projectVersion);
  });

};
