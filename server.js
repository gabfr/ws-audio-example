var express = require('express');
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(8080);
var wss = new WebSocketServer({server: app, path: '/data'});

var MAX_BUFFER = 32 * 1024;

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    ws.send('pong');
  });

  var fileCount = 243;
  var currentFile = 0;

  var buffer = new Buffer(MAX_BUFFER * 1.5);
  var bufferSize = 0;

  function fileHandler(error, data) {
    if (error) {
      console.log('failed to load mp3 file');
    } else {
      console.log('Buffering ' + data.length + ' bytes MP3 data.');
      
      data.copy(buffer, bufferSize, 0);
      bufferSize += data.length;

      // Check whether we are ready to send the buffer.
      if (bufferSize + data.length > MAX_BUFFER) {
        console.log('Sending ' + bufferSize + ' bytes MP3 data.');

        // Create a new buffer to send the data.
        var temp = Buffer(bufferSize);
        buffer.copy(temp, 0, 0, bufferSize);
        ws.send(temp, {binary: true});
        
        bufferSize = 0;

        // Add the trailing data to the beginning of the the 'new' buffer.
        data.copy(buffer, bufferSize, 0);
        bufferSize += data.length;
      }

      currentFile += 1;
      if (currentFile < fileCount) {
        fs.readFile(__dirname + '/frames/frame' + currentFile + '.mp3', fileHandler);
      } else {
        // Out of files! Check if we have some data left in our buffer!
        if (bufferSize > 0) {
          console.log('Sending ' + bufferSize + ' bytes MP3 data.');
          ws.send(buffer.slice(0, bufferSize), {binary: true});
          bufferSize = 0;          
        }        
      }
    }
  }

  fs.readFile(__dirname + '/frames/frame' + currentFile + '.mp3', fileHandler);
});
