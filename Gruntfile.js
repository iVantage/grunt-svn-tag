/*
 * grunt-svn-tag
 * https://github.com/iVantage/grunt-svn-tag
 *
 * Copyright (c) 2013 Justin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    svn_tag: {
      test: {
        options: {
          'dryRun': true,
          'commitMessage': 'Tag project-v{%= version %}',
          'tag': 'project-v{%= version %}'
        }
      }
    },
    bump: {
      options: {
        commitMessage: 'chore: Bump for release (v%VERSION%)',
        files: ['package.json'],
        commitFiles: ['*'],
        push: false
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-bump');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'svn_tag:test']);

};
