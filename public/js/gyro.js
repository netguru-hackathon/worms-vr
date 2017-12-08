window.addEventListener("deviceorientation", function(event) {
  var gyro_data = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  }
  socket.emit('gyro_data', gyro_data);
}, true);
