var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var online_players = {};
var turns = [];
var current_turn = "";
var player_count = 0;

const G = 9.81;
const TIME_STEP = 0.1;

var isColision = function(position) {
  if (position.z < 0.0) {
    return { colision: true, reason: 'Hit ground' };
  }
  return { colision: false, reason: null };
};

var step = function(position, angle, velocity, t) {
  var { x, y, z } = position;
  x += velocity * t * Math.cos(angle.azymut);
  y += velocity * t * Math.sin(angle.azymut);
  z += velocity * t * Math.sin(angle.tilt) - 0.5 * G * t * t;

  return { x: x, y: y, z: z };
};

var ticks = function(latLong, angle, velocity, t = 0) {
  var steps = [];
  var position = { x: latLong.latitude, y: latLong.longitude, z: 0 };
  var colisionReason = isColision(position)

  while (!colisionReason.colision) {
    t += TIME_STEP;
    position = step(position, angle, velocity, t);
    steps[t] = position;

    colisionReason = isColision(position);
  }

  return { steps: steps, colision: colisionReason };
};

var add_player = function(online_players, query) {
  var player_hash = { nickname: query.nickname, unique_hash: query.unique_hash };
  turns.push(query.unique_hash);
  if (player_count == 0) {
    current_turn = query.unique_hash;
  }
  player_count = player_count + 1;
  online_players[query.unique_hash] = player_hash;
};

var remove_player = function(online_players, query) {
  delete online_players[query.unique_hash]
  var indexOf = turns.indexOf(query.unique_hash);
  turns.splice(indexOf, 1)
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

var actual_port = process.env.PORT || process.env.NODE_PORT;

http.listen(actual_port, function() {
  console.log('listening on *:'+ actual_port);
});

io.on('connection', function(socket){
  message =  'a user connected ' + socket.handshake.query.nickname;
  add_player(online_players, socket.handshake.query);
  console.log(message + ' ' + online_players);
  console.log(print_players(online_players));
  io.emit("debug", message);
  io.emit("server_info", { player_count: player_count, whos_online: print_players(online_players) });

  socket.on('disconnect', function(){
    message =  'a user disconnected ' + socket.handshake.query.nickname;
    remove_player(online_players, socket.handshake.query);
    player_count = player_count - 1;
    console.log(message + ', players left: ' +print_players(online_players));
    io.emit("debug", message);
    io.emit("server_info", { player_count: player_count, whos_online: print_players(online_players) });
  });

  socket.on('shoot', function(query) {
    update_player(online_players, query);
    if (query.unique_hash == current_turn ) {

      index_of = (turns.indexOf(current_turn) + 1) % player_count;
      current_turn = turns[index_of];
      current_turn_info = online_players[current_turn]['nickname'];

      io.emit("debug", "I just shoot!");

      var projectile = ticks(online_players[current_turn], { azymut: 0, tilt: 45 }, 50);

      io.emit('debug', projectile);

      io.emit("server_info", { current_turn: current_turn_info, player_count: player_count, whos_online: print_players(online_players) });
    } else {
      io.emit("debug", "You have to wait for your turn, broski");
    }

    console.log(query);
    io.emit("debug", query);
  });
});
