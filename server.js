var express = require('express');
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var app = express.createServer();

app.use(express.static(__dirname + '/public'));
app.listen(8080);
var wss = new WebSocketServer({server: app, path: '/data'});

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    ws.send('pong');
  });
  fs.readFile(__dirname + '/test.mp3', function (error, data) {
    if (error) {
      console.log('failed to load mp3 file');
    } else {
      ws.send(data, {binary: true});
    }
  });
});
