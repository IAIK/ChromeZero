var w = Worker;
window.Worker = function(file) {
    window._policy = true;
    var ret = new w(file);
    var wpm = ret.postMessage;
    ret.postMessage = function(msg) {
        for(var i = 0; i < Math.floor(Math.random() * 10000000000); i++) {}
        return wpm.call(ret, msg);
    };
    return ret;
};
