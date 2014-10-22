# grunt-svn-tag

> Automate tagging svn working copies.

## Getting Started
This plugin requires Grunt `~0.4.0rc7`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out
the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains
how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process, you may
install this plugin with this command:

```shell
npm install grunt-svn-tag --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with
this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-svn-tag');
```

## The "svn_tag" task

### Overview
The `svn\_tag` task creates a new subversion tag for your working copy path
using the version listed in your project's `package.json` file.

In your project's Gruntfile, add a section named `svn_tag` to the data object
passed into `grunt.initConfig()`.

```javascript
grunt.initConfig({
  svn_tag: {
    options: {
      tag: 'v{%= version %}',
      commitMessage: 'admin: Tag for release ({%= version %})'
    }
  }
});
```

### Options

#### tag
Type: `String`
Default: 'v{%= version %}'

The name used to create your svn tag where `version` is the version specified
in your project's `package.json` file. Processed as a grunt template using
`'{%'` and `'%}'` as template delimiters. You may also use the `--tag` flag
from the command line.

#### commitMessage
Type: `String`
Default: `'admin: Tag for release ({%= version %})'`

The commit message used when creating your svn tag where `version` is the
version specified in your project's `package.json` file. Processed as a grunt
template using `'{%'` and `'%}'` as template delimiters. You may also use the
`--commit-message` flag from the command line.

#### projectRoot
Type: `String`
Default: ***inferred from `svn info` url && package.json***

Used to set the base project url where new tags should be created. Useful if you
have multiple projects in a single svn repository.

Tags will be copied into the `projectRoot + '/tags'` (remote) folder.

Project roots are determined by checking the following in order:

- The task options for a `'projectRoot'` property
- Your `package.json` file for `repository.url` (if `respository.type` ===
  'svn')
- The url returned by `svn info`

#### dryRun
Type: `Boolean`
Default: `false`

Mostly included for debugging purposes. When set to true svn commands while be
written to the console rather than executed.

#### username
Type: `String`

The username svn uses for authentication, a password must also be specified.

#### password
Type: `String`

The password svn uses for authentication, a username must also be specified.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code
using [Grunt](http://gruntjs.com/).

## Release History

- 03-21-2014 v0.7.0 Support tagging from trunk or a branch
- 03-21-2014 v0.5.0 Check package.json for repository url 
- 03-13-2014 v0.4.0 Make project root configurable.
- 01-01-2014 v0.3.0 Make tag name and commit message configurable.
