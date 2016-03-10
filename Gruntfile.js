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
        src: [
          'bower_components/fullcalendar/dist/fullcalendar.js',
          'src/throttle.js',
          'src/debounce.js',
          'src/loading.js',
          'src/autoReload.js',
          'src/eventLoader.js',
          'src/dateController.js',
          'src/multi-calendar.js',
          'src/controller.js',
        ],
        dest: 'build/multi-calendar.js',
      },
      css: {
        src: ['src/*.css', 'bower_components/fullcalendar/dist/fullcalendar.css'],
        dest: 'build/multi-calendar.css',
      },
    },
    demo: {
      calendar: {},
    },
    watch: {
      scripts: {
        files: ['src/*.js'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      },
      styles: {
        files: ['src/multi-calendar.css'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      }
    },
    dev: {
      doDev: {}
    },
    phantomTester: {
      functional: {
        src: ['tests/**/*.html'],
      },
    }
  });

  grunt.loadTasks('./tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-phantom-batch-tester');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('test', ['phantomTester']);

};
