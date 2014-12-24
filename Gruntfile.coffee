module.exports = (grunt) ->
  require('load-grunt-tasks') grunt

  grunt.initConfig
    clean:
      dist: "dist"

    uglify:
      dist:
        src: ["dist/angular-side-by-side-select.js"]
        dest: "dist/angular-side-by-side-select.min.js"

    concat:
      dist:
        src: [
          "source/js/module.js"
          "source/**/*.js"
        ]
        dest: "dist/angular-side-by-side-select.js"

    less:
      dev:
        files:
          "source/css/styles.css": "source/less/styles.less"
      dist:
        options:
          compress: true
        files:
          "dist/angular-side-by-side-select.css": "source/less/styles.less"

    jshint:
      options:
        jshintrc: true
        reporter: require('jshint-stylish')
      main:
        files:
          src: ["source/**/*.js"]

    karma:
      watch:
        configFile: 'karma.conf.js'
      once:
        options:
          singleRun: true
        configFile: 'karma.conf.js'

    watch:
      scripts:
        files: ["source/**/*.js"]
        tasks: ["concat:dist", "uglify:dist"]
      less:
        files: ["source/**/*.less"]
        tasks: ["less:dev"]

  grunt.registerTask "build", [
    "jshint"
    "karma:once"
    "clean:dist"
    "concat:dist"
    "uglify:dist"
    "less:dist"
  ]
