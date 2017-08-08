function isNumeric(n) {
    if(typeof(n) === "string" || typeof(n) === "number") {
        return !isNaN(parseFloat(n)) && isFinite(n);
    } else {
        return false;
    }
}

function copyFunctionPointer(target, source) {
    if (source === null || target === null || target === source) {
      return;
    }

    if (source === undefined || target === undefined) {
      return;
    }

    var keys = Reflect.ownKeys(source);
    for (var k in keys) {
        if (!keys.hasOwnProperty(k)) continue;
        var name = keys[k];
        if (typeof(source[name]) === "function") {
            target[name] = source[name];
        } else if (typeof(source[name]) === "object") {
            target[name] = source[name];
            copyFunctionPointer(target[name], source[name]);
        }
    }
}

var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
var arrsize = [1, 1, 1, 1, 2, 2, 4, 4, 4, 8];

for (var arr in arrays) {
    // FIXME: Possible Chrome bug to play youtube videos
    if (window.location.host === "www.youtube.com" && arrays[arr] === "Uint8Array") {
      continue;
    }
    if (window.location.host.substring(0,11) === 'www.google.' &&
        window.location.pathname.substring(0,5) === '/maps') {
      continue;
    }
    if (!arrays.hasOwnProperty(arr)) continue;
    (function () {
        var _a = window[arrays[arr]];

        window[arrays[arr]] = function (target) {
            //window.opener.postMessage('use', '*');
            var offset = Math.floor(Math.random() * 4096);
            var _data;
            if(arguments.length > 1) {
                _data = new _a(arguments.length + offset);
                for(var i = 0; i < arguments.length; i++) {
                    _data[i + offset] = arguments[i];
                }
            } else {
                if (typeof(target) === "number") {
                    _data = new _a(target + offset);
                    // preload
                    for(var i = 0; i < target; i++) {
                        _data[i + offset] = null;
                    }
                } else if (target instanceof ArrayBuffer) {
                    offset = 0;
                    _data = new _a(target);
                } else if (target !== undefined) {
                    var len = (target.length !== undefined ? target.length : Math.floor(target.byteLength / arrsize[arr]));
                    _data = new _a(len + offset);
                    for (var i = 0; i < len; i++) {
                        _data[i + offset] = target[i];
                    }
                } else {
                    offset = 0;
                    _data = new _a();
                }
            }
            var _target = target;

            var proxy = new Proxy(_data, {
                get: function (target, name) {
                    if (isNumeric(name)) {
                      name = parseInt(name) + offset;
                    }
                    if (name === "length" && isNumeric(_data["length"]) && parseInt(_data["length"]) >= offset) {
                      return parseInt(_data["length"]) - offset;
                    }
                    if (typeof(_target) === 'object' && 'length' in _target) {
                      var dummy = _data[Math.floor(Math.random() * _target.length)];
                      var r = Math.floor(Math.random() * 10000);
                      for(var wait = 0; wait < r; wait++) {};
                    }

                    return _data[name];
                },
                set: function (target, name, value, receiver) {
                    if (isNumeric(name)) name = parseInt(name) + offset;
                    if (name === "length") {
                        _data["length"] = parseInt(value) + offset;
                    } else {
                        if (typeof(_target) === 'object' && 'length' in _target) {
                          var r = Math.floor(Math.random() * _target.length);
                          _data[r] = _data[r];
                          r = Math.floor(Math.random() * 10000);
                          for(var wait = 0; wait < r; wait++) {};
                        }

                        _data[name] = value;
                    }
                    return true;
                },
            });
            copyFunctionPointer(proxy, _a);

            proxy.subarray = function(start, end) {
              if (start === undefined) {
                start = 0;
              } else if (start < 0) {
                start = 0;
              } else if (start > _data.length) {
                start = _data.length;
              }

              if (end === undefined) {
                end = _data.length;
              } else if (end < 0) {
                end = _data.length + end;
              } else if (end > _data.length) {
                end = _data.length;
              }

              var length = end - start;
              var sa = new _a(length);
              for (var i = start; i < end; i++) {
                sa[i] = _data[i];
              }

              return sa;
            }

            return proxy;
        };

        copyFunctionPointer(window[arrays[arr]], _a);

    })();
}
