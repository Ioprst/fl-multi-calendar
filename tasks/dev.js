/*globals module, require, Buffer, process*/

module.exports = function (grunt) {
  'use strict';
  var Promise = require('promise');

  grunt.registerMultiTask('dev', 'Development setup', function () {
    //Make the task asynchronous
    var done = this.async();

    function runChild(proc, args) {
      //Start watch task
      var childProcess = require('child_process');
      var spawn = childProcess.spawn;
      var child = spawn(proc, args);
      var exitCode = 0;

      return new Promise(function (resolve, reject) {
        //On message
        child.stdout.on('data', function (data) {
          var buff = new Buffer(data);
          grunt.log.writeln(buff.toString('utf8'));
        });

        //On error
        child.stderr.on('data', function (data) {
          grunt.log.error(data);
          exitCode = 1;
        });

        //When leaving
        child.on('exit', function (code) {
          resolve(code);
        });

        process.on('uncaughtException', function () {
          child.kill('SIGTERM');
          reject(1);
        });

        process.on('SIGTERM', function () {
          child.kill('SIGTERM');
          resolve(exitCode);
        });
      });
    }

    runChild('grunt', ['watch']).then(function () {
      runChild('grunt', ['watch']).then(done);
    });

    runChild('grunt', ['demo']).then(done);
  });
};
