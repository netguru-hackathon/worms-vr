var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var online_players = {};

var add_player = function(online_players, query) {
  var player_hash = { nickname: query.nickname, unique_hash: query.unique_hash };
  online_players[query.unique_hash] = player_hash;
};

var remove_player = function(online_players, query) {
  delete online_players[query.unique_hash]
};

var print_players = function(online_players) {
  var nicknames = [];
  for(var key in online_players) {
    nicknames.push(online_players[key]['nickname']);
  };
  return nicknames;
};

app.use(express.static('public'))

http.listen(3000, function() {
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  message =  'a user connected ' + socket.handshake.query.nickname;
  add_player(online_players, socket.handshake.query);
  console.log(message + ' ' + online_players);
  console.log(print_players(online_players));
  io.emit("debug", message);

  socket.on('disconnect', function(){
    message =  'a user disconnected ' + socket.handshake.query.nickname;
    remove_player(online_players, socket.handshake.query);
    console.log(message + ', players left: ' +print_players(online_players));
    io.emit("debug", message);
  });
});
