
module.exports = (function demoServer() {
  //Lets require/import the HTTP module
  var http = require('http');
  var fs = require('fs');

  //Lets define a port we want to listen to
  var PORT = 5000;

  //We need a function which handles requests and send response
  function handleRequest(request, response) {
    var content = fs.readFileSync('demo/demo-content.json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    response.setHeader('Content-Type', 'application/json');
    response.end(content);
  }

  //Create a server
  var server = http.createServer(handleRequest);

  return {
    start: function () {
      //Lets start our server
      server.listen(PORT, function () {
        //Callback triggered when server is successfully listening. Hurray!
        console.log("Server listening on: http://localhost:%s", PORT);
      });
    },
    stop: function () {
      server.close();
    }
  };
}());
