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

var update_player = function(online_players, player) {
  online_players[player['unique_hash']] = player;
};

var print_players = function(online_players) {
  var nicknames = [];
  for(var key in online_players) {
    nicknames.push(online_players[key]['nickname']);
  };
  return nicknames.join(', ');
};

app.use(express.static('public'))

http.listen(process.env.NODE_PORT, function() {
  console.log('listening on *:'+ process.env.NODE_PORT);
});

io.on('connection', function(socket){
  message =  'a user connected ' + socket.handshake.query.nickname;
  add_player(online_players, socket.handshake.query);
  console.log(message + ' ' + online_players);
  console.log(print_players(online_players));
  io.emit("debug", message);
  online_count = Object.keys(online_players).length
  io.emit("server_info", { player_count: online_count, whos_online: print_players(online_players) });

  socket.on('disconnect', function(){
    message =  'a user disconnected ' + socket.handshake.query.nickname;
    remove_player(online_players, socket.handshake.query);
    console.log(message + ', players left: ' +print_players(online_players));
    io.emit("debug", message);
    io.emit("server_info", { player_count: online_count, whos_online: print_players(online_players) });
  });

  socket.on('shoot', function(query) {
    update_player(online_players, query);
    console.log(query);
    io.emit("debug", query);
  });
});
