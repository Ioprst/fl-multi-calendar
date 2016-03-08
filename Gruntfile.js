module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {},
      },
    },
    uglify: {
      calendar: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/multi-calendar.map',
        },
        files: {
          'build/multi-calendar.min.js': ['build/multi-calendar.js'],
        },
      },
    },
    concat: {
      options: {
        separator: ';',
      },
      js: {
        src: ['src/debounce.js', 'src/multi-calendar.js', 'src/controller.js'],
        dest: 'build/multi-calendar.js',
      },
    },
    demo: {
      calendar: {},
    },
  });

  grunt.loadTasks('./tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('test', ['jasmine']);

};
