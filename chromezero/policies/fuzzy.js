var wpn = window.performance.now, last = 0;

window.performance.now = function() {
    window._policy = true;
    var now = Math.floor(wpn.call(window.performance) * 1000);
    var fuzz = Math.floor(Math.random() * 1000); 
    var t = now - now % fuzz; // now is the current time
    if(t > last) last = t;
    return last / 1000.0;
};
 
