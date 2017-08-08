function isNumeric(n) {
    if (typeof(n) === "string" || typeof(n) === "number") {
        return !isNaN(parseFloat(n)) && isFinite(n);
    } else {
        return false;
    }
}

function copyFunctionPointer(target, source) {
    var keys = Reflect.ownKeys(source);
    for (var k in keys) {
        if (!keys.hasOwnProperty(k)) continue;
        var name = keys[k];
        if (typeof(source[name]) === "function") {
            target[name] = source[name];
        } else if (typeof(source[name]) === "object" && source[name] !== null) {
            target[name] = source[name];
            copyFunctionPointer(target[name], source[name]);
        }
    }

}


var arrays = ["Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
var arrsize = [1, 1, 1, 1, 2, 2, 4, 4, 4, 8];

for (var arr in arrays) {
    if (!arrays.hasOwnProperty(arr)) continue;
    // FIXME: Possible Chrome bug to play youtube videos
    if (window.location.host === "www.youtube.com" && arrays[arr] === "Uint8Array") {
      continue;
    }

    (function () {
        var _a = window[arrays[arr]];

        window[arrays[arr]] = function (target) {
            window._policy = true;
            var offset = Math.floor(Math.random() * 4096);
            var _data;
            if (arguments.length > 1) {
                _data = new _a(arguments.length + offset);
                for (var i = 0; i < arguments.length; i++) {
                    _data[i + offset] = arguments[i];
                }
            } else {
                if (typeof(target) === "number") {
                    _data = new _a(target + offset);
                    // preload
                    for (var i = 0; i < target; i++) {
                        _data[i + offset] = null;
                    }
                } else if (target !== undefined) {
                    var len = (target.length !== undefined ? target.length : Math.floor(target.byteLength / arrsize[arr]));
                    _data = new _a(len + offset);
                    for (var i = 0; i < len; i++) {
                        _data[i + offset] = target[i];
                    }
                } else {
                  _data = new _a();
                }
            }
            var _target = target;

            return new Proxy(_data, {
                get: function (target, name) {
                    if (isNumeric(name)) name = parseInt(name) + offset;
                    if (name === "length" && isNumeric(_data["length"]) && parseInt(_data["length"]) >= offset) return parseInt(_data["length"]) - offset;
                    return _data[name];
                },
                set: function (target, name, value, receiver) {
                    if (isNumeric(name)) name = parseInt(name) + offset;
                    if (name === "length") {
                        _data["length"] = parseInt(value) + offset;
                    } else {
                        _data[name] = value;
                    }
                    return true;
                }
            });
        };

        copyFunctionPointer(window[arrays[arr]], _a);


    })();
}
