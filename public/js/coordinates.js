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

setTimeout(function() {
  getLocation();
}, 3000);
