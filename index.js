var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'))

http.listen(3000, function() {
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  message =  'a user connected ' + socket.handshake.query.nickname;
  console.log(message);
  io.emit("debug", message);

  socket.on('disconnect', function(){
    message =  'a user disconnected ' + socket.handshake.query.nickname;
    console.log(message);
    io.emit("debug", message);
  });
});
