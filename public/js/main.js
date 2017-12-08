function makeid() {
  var text = "";
  var possible = "ABCDEF0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function startGame() {
  socket = io({query: window.state});

  socket.on('debug', function(message) {
    el = $('<div/>');
    el.html(JSON.stringify(message));
    $('.js-debug').append(el);
  });

  socket.on('server_info', function(message) {
    $('.js-players-online').html(message['player_count']);
    $('.js-current-turn').html(message['current_turn']);
    $('.js-whos-online').html(message['whos_online']);
  });
}

$('.js-play').on('click', function() {
  window.state["nickname"] = $('.js-nick-input').val();
  window.state["unique_hash"] = makeid();
  startGame();
  $('.js-nick-modal').hide();
  $('.js-shoot').show();
  $('.js-server-info').show();
  $('.js-video').show();
  $('.js-scene').show();
});

$('.js-shoot').on('click', function() {
  socket.emit('shoot', window.state);
  // fetch data from all sensors
});

getLocation();
window.state = {};
var socket;

animate();
