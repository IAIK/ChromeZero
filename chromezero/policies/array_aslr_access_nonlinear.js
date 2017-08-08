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


function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {
        var temp = a;
        a = b;
        b = temp;
    }
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}


var arrays = ["Array", "Uint8Array", "Int8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
var arrsize = [1, 1, 1, 1, 2, 2, 4, 4, 4, 8];

for (var arr in arrays) {
    if (!arrays.hasOwnProperty(arr)) continue;
    (function () {
        var _a = window[arrays[arr]];

        window[arrays[arr]] = function (target) {
            window._policy = true;
            var offset = Math.floor(Math.random() * 4096);
            var _data;
            var _init = 0;
            var len = 0;
            if (arguments.length > 1) {
                _data = new _a(arguments.length + offset);
                _init = 1;

            } else {
                if (typeof(target) === "number") {
                    _data = new _a(target + offset);
                    // preload
                    for (var i = 0; i < target; i++) {
                        _data[i + offset] = null;
                    }
                } else if (target !== undefined) {
                    len = (target.length !== undefined ? target.length : Math.floor(target.byteLength / arrsize[arr]));
                    _data = new _a(len + offset);
                    _init = 2;
                } else {
                    _data = new _a();
                    _init = 0;
                }
            }
            var _target = target;

            var n = Math.floor(_data.length - offset);
            var _mul = 1;
            var _shift = Math.floor(Math.random() * n);
            if (n >= 3) {
                do {
                    _mul = Math.floor(Math.random() * n);
                } while (gcd(_mul, n) > 1 || _mul == 0 || _mul == 1);
            }

            if (_init == 1) {
                for (var i = 0; i < arguments.length; i++) {
                    _data[(i * _mul + _shift) % n + offset] = arguments[i];
                }
            } else if (_init == 2) {
                for (var i = 0; i < len; i++) {
                    _data[(i * _mul + _shift) % n + offset] = target[i];
                }
            }

            return new Proxy(_data, {
                get: function (target, name) {
                    if (name === "length" && isNumeric(_data["length"]) && parseInt(_data["length"]) >= offset) return parseInt(_data["length"]) - offset;
                    if (isNumeric(name)) name = ((parseInt(name) * _mul + _shift) % n) + offset;
                    var dummy = _data[Math.floor(Math.random() * _target.length)];
                    return _data[name];
                },
                set: function (target, name, value, receiver) {
                    if (name === "length") {
                        _data["length"] = parseInt(value) + offset;
                    } else {
                        if (isNumeric(name)) name = ((parseInt(name) * _mul + _shift) % n) + offset;
                        var r = Math.floor(Math.random() * _target.length);
                        _data[r] = _data[r];
                        _data[name] = value;
                    }
                    return true;
                }
            });
        };

        copyFunctionPointer(window[arrays[arr]], _a);


    })();
}
