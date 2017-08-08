function protectFunction(name, ctx, default_return) {
    var actualCode = '(' + function (ctx, name, def) {
        if (window.protectedFunctions === undefined) {
            window.protectedFunctions = {};
        }

        window.protectedFunctions[name] = {state: "ask", fnc: eval(name)};
        eval(name + ' = ' + function () {
            if (window.protectedFunctions[name].state == "ask") {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.style.width = "100vw";
                div.style.height = "100vh";
                div.style.backgroundColor = "#000000";
                div.style.top = "0px";
                div.style.left = "0px";
                div.style.opacity = "0.5";
                div.id = "_jsp_black";
                div.zIndex = "2147483647";
                document.body.appendChild(div);
                var dummy = document.getElementById("_jsp_black");

                var _jsp_result = false;
                debugger;
                if (_jsp_result) {
                    window.protectedFunctions[name].state = "allow";
                } else
                    window.protectedFunctions[name].state = "block";

                document.body.removeChild(div);
            }
            if (window.protectedFunctions[name].state == "allow")
                return window.protectedFunctions[name].fnc.apply(ctx);
            else
                return def;
        });
    } + ')(' + ctx + ', "' + name + '", ' + default_return + ');';
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
};


function inject(code) {
    var script = document.createElement('script');
    script.textContent = code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

// init debugger
chrome.runtime.sendMessage({type: "init"}, function (resp) {
  if (resp !== undefined) {
    console.log(resp);
  }
});

// show background script debug messages
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "error") {
            console.log(request.message);
        } else if (request.action == "inject") {
            inject(request.code);
        }
    });

// add ask div
var div = document.createElement("div");
div.style.position = "fixed";
div.style.width = "100%";
div.style.height = "100%";
div.style.backgroundColor = "#000000";
div.style.top = "0px";
div.style.left = "0px";
div.style.opacity = "0.5";
div.style.overflowX = "hidden";
div.style.zIndex = "2147483647";
div.style.display = "none";
div.id = "__jsp_black";
document.body.appendChild(div);
