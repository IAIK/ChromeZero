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
            var _data;
            if (arguments.length > 1) {
                _data = new _a(arguments.length);
                for (var i = 0; i < arguments.length; i++) {
                    _data[i] = arguments[i];
                }
            } else {
                if (typeof(target) === "number") {
                    _data = new _a(target);
                    for (var i = 0; i < target; i++) {
                        _data[i] = target[i];
                    }
                } else if (target !== undefined) {
                    _data = new _a(target);
                } else {
                    _data = new _a();
                }
            }
            return _data;
        };

        copyFunctionPointer(window[arrays[arr]], _a);

    })();
}
