function toClosure(code) {
    return "(function() {" + code + "})();";
}

function getContext(fnc) {
    var ctx = fnc.substring(0, fnc.lastIndexOf("."));
    if (ctx === "") ctx = "window";
    return ctx;
}

function getName(fnc) {
    return fnc.substring(fnc.lastIndexOf(".") + 1);
}

function injectScript(tabId, script) {
    chrome.tabs.sendMessage(tabId, {action: "inject", code: script});
}

function functionBody(fnc) {
    return fnc.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
}

function readFile(name, result) {
    chrome.runtime.getPackageDirectoryEntry(function (root) {
        root.getFile(name, {}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = result;
                reader.readAsText(file);
            });
        });
    });
}

function codeFromFile(name) {
    return new Promise(function (resolve, reject) {
        readFile("policies/" + name, function (c) {
            resolve(toClosure(this.result));
        });
    });
}
