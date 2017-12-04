function makeid() {
  var text = "";
  var possible = "ABCDEF0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setPosition);
  } else {
    alert('geolocation error');
  }
}

function setPosition(pos) {
  window.state["latitude"] = pos.coords.latitude;
  window.state["longitude"] = pos.coords.longitude;
}

function startGame() {
  socket = io({query: window.state});

  socket.on('debug', function(message) {
    el = $('<div/>');
    el.html(message);
    $('.js-debug').append(el);
  });
}

$('.js-play').on('click', function() {
  window.state["nickname"] = $('.js-nick-input').val();
  window.state["unique_hash"] = makeid();
  startGame();
  $('.js-nick-modal').hide();
  $('.js-shoot').show();
});

$('.js-shoot').on('click', function() {
  // fetch data from all sensors
});

getLocation();
window.state = {};
var socket;

