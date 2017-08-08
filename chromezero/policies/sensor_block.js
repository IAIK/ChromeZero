var _addEventListener = window.addEventListener;

function addEventListener(type, handler, useCapture) {
    _addEventListener(type, function(event) {
      switch (type) {
        case "deviceorientation":
        case "devicemotion":
        case "devicelight":
          break;
        default:
          handler(event);
      }
    }, useCapture);
}

window.addEventListener = addEventListener;
navigator.getBattery = function() { 
  new Promise(function(res, rej) { res({level: 0, charging: false, chargingTime: 0, dischargingTime: 0}); });
}
