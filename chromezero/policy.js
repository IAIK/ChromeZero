function askLogic() {
    if (__res === -1) document.getElementById('__jsp_black').style.display = 'block';
    var _jsp_result = false;
    if (__res === -1) {
        debugger;
    }
    else _jsp_result = __res;
    __res = _jsp_result;
    document.getElementById('__jsp_black').style.display = 'none';
}

function injectPolicy(injects, name, script, ask_user) {
    if ((script instanceof Promise) || script !== "") {
        console.log(script);
        if (script instanceof Promise) {
            code_promise = script;
        } else {
            var code_promise = new Promise(function (resolve, reject) {
                resolve(toClosure(script));
            });
        }
        injects[name] = {code: code_promise, ask: ask_user};
    }
}

function parsePolicy(level, max_level, tabId, injects, done) {
    readFile("policies/level_" + level + ".json", function (e) {
        var policy = JSON.parse(this.result);
        var inject = "";
        if ("function" in policy) {
            console.log("-= Functions =-");
            for (var fnc in policy.function) {
                var func = policy.function[fnc];
                var context = getContext(fnc);

                // block, modify or ask?
                if (func.action === "block") {
                    inject = fnc + " = function() {  return " + func.return + "; };";
                } else if (func.action === "modify") {
                    if ("return" in func) {
                        // inline modification
                        inject = "var __orig = " + fnc + ";";
                        inject += fnc + " = function() {  return " + func.return.replace(fnc + "(", "__orig.call(" + context) + ";};";
                    } else {
                        // read from file
                        inject = codeFromFile(func.file);
                    }
                } else if (func.action === "ask") {
                    inject = "var __orig = " + fnc + "; var __res = -1;";
                    inject += fnc + " = function() { " +
                        functionBody(askLogic) +
                        "if (_jsp_result) {  " + fnc + " = __orig;  return __orig.apply(" + context + ", arguments); } else return " + func.return + "; };";
                }
                injectPolicy(injects, fnc, inject, func.action === "ask");
            }
        }
        if ("property" in policy) {
            for (var prop in policy.property) {
                console.log("-= Properties =-");
                var property = policy.property[prop];
                var context = getContext(prop);
                var name = getName(prop);

                if (property.action === "block") {
                    inject = "Object.defineProperty(" + context + ", \"" + name + "\", { configurable: true, value: " + property.return + "});";
                } else if (property.action === "modify") {
                    if ("return" in property) {
                        // inline modification
                        inject = "var __orig = " + prop + ";";
                        inject += "Object.defineProperty(" + context + ", \"" + name + "\", { configurable: true, get: function() { " + property.return.replace(prop, "__orig") + "}});";
                    } else {
                        // read from file
                        inject = codeFromFile(property.file);
                    }
                } else if (property.action === "ask") {
                    inject = "var __orig = " + prop + "; var __res = -1;";
                    inject += "Object.defineProperty(" + context + ", \"" + name + "\", { configurable: true, get: function() {  if(__res === -1) document.getElementById('__jsp_black').style.display = 'block'; " +
                        "function _" + prop.replace(/\./g, "_") + "(){" +
                        functionBody(askLogic) +
                        "if (_jsp_result) {  " + prop + " = __orig; return __orig; } else return " + prop.return + "; } return _" + prop.replace(/\./g, "_") + "();}}" +
                        ");";
                }
                injectPolicy(injects, prop, inject, property.action === "ask");
            }
        }
        if ("object" in policy) {
            console.log("-= Objects =-");
            for (var obj in policy.object) {
                var object = policy.object[obj];
                var context = getContext(obj);
                var name = getName(obj);
                console.log(object);

                if (object.action === "block") {
                    inject = "delete " + context + "[\"" + name + "\"];";
                } else if (object.action === "modify") {
                    if ("return" in object) {
                        // inline modification
                        inject = "var __orig = " + obj + ";";
                        inject += obj + " = " + object.return.replace(obj, "__orig") + ";";
                    } else {
                        // read file
                        inject = codeFromFile(object.file);
                    }
                } else if (object.action === "ask") {
                    inject = "var __orig = " + obj + "; var __res = -1;";
                    inject += obj + " = function() {   " +
                        functionBody(askLogic) +
                        "if (_jsp_result) {  " + obj + " = __orig; return __orig.prototype.constructor.apply(" + context + ", arguments); } else return " + object.return + " };";
                }
                injectPolicy(injects, obj, inject, object.action === "ask");
            }
        }


        if (level < max_level) {
            parsePolicy(level + 1, max_level, tabId, injects, done);
        } else {
            done(injects);
        }
    });
}
