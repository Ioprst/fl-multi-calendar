module.exports = function (grunt) {

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
          'build/multi-calendar.min.js': ['src/multi-calendar.js'],
        },
      },
    },
    demo: {
      calendar: {},
    },
  });

  grunt.loadTasks('./tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['jshint', 'uglify']);
  grunt.registerTask('test', ['jasmine']);

};
