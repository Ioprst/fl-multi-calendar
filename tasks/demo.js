'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('demo', 'Start demo file', function () {
    var open = require('open');
    var PORT = 4000;
    var index = 'http://localhost:' + PORT + '/demo/index.html';
    var exitCode = 0;

    //Make the task asynchronous
    var done = this.async();

    //Start API server on port 5000;
    var demoServer = require('../demo/demo-server');
    demoServer.start();

    //Start HTML server
    var childProcess = require('child_process');
    var spawn = childProcess.spawn;
    var server = spawn('httpserver', [PORT]);

    //On message
    server.stdout.on('data', function (data) {
      var buff = new Buffer(data);
      grunt.log.writeln(buff.toString('utf8'));
    });

    //On error
    server.stderr.on('data', function (data) {
      grunt.log.error(data);
    });

    //When leaving
    server.on('exit', function (code) {
      exitCode = code;
    });

    //Opend index page in the browser
    open(index);

    process.on('uncaughtException', function () {
      server.kill('SIGTERM');
      demoServer.stop();
      done(exitCode);
    });

    process.on('SIGTERM', function () {
      server.kill('SIGTERM');
      demoServer.stop();
      done(exitCode);
    });
  });
};
