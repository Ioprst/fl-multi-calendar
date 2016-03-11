module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {},
        ignores: ['src/controller*.js'],
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
        options: {
          banner: '(function () { \n ',
          footer:' }());\n',
        },
        src: [
          'bower_components/fullcalendar/dist/fullcalendar.js',
          'src/controller-head.js', //Module start
          'src/utils/**/*.js',
          'src/loading.js',
          'src/autoReload.js',
          'src/eventLoader.js',
          'src/dateController.js',
          'src/multi-calendar.js',
          'src/controller-tail.js', //Module end
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
      source: {
        files: ['src/*.*', 'Gruntfile.js'],
        tasks: ['build'],
        options: {
          spawn: false,
        },
      },
    },
    dev: {
      doDev: {}
    },
    phantomTester: {
      all: ['tests/**/*.html'],
    },
    jasmine: {
      customTemplate: {
        src: 'build/multi-calendar.js',
        options: {
          specs: 'tests/**/*spec.js',
          vendor: [
            'tests/phantomjs-polyfills/**/*.js',
            'node_modules/jasmine-ajax/lib/mock-ajax.js',
            'tests/functional/x-div-tester.js',
            'bower_components/moment/moment.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/jquery.cookie/jquery.cookie.js',
            'bower_components/df-visible/jquery.visible.js'
          ]
        }
      }
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
  grunt.registerTask('test', ['jshint', 'jasmine']);
};
