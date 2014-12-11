module.exports = (grunt) ->
  require('load-grunt-tasks') grunt

  grunt.initConfig
    clean:
      dist: "dist"

    uglify:
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


    watch:
      scripts:
        files: ["source/**/*.js"]
        tasks: ["uglify:dist"]
      less:
        files: ["source/**/*.less"]
        tasks: ["less:dev"]

  grunt.registerTask "build", [
    "clean:dist"
    "uglify:dist",
    "less:dist"
  ]