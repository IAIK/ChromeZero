function setBlockState(settings, state) {
    // set block variable to true
    chrome.debugger.sendCommand({tabId: settings.source}, 'Debugger.setVariableValue', {
        scopeNumber: 0,
        variableName: "_jsp_result",
        newValue: {value: !state},
        callFrameId: settings.callFrameId
    }, function () {
    });
    chrome.debugger.sendCommand({tabId: settings.source}, 'Debugger.resume', {}, function () {
    });
}


function init(request, sender, sendResponse) {
    // get current tab
    chrome.tabs.query({
        active: true,
        currentWindow: true,
        status: "complete",
        windowType: "normal"
    }, function (tabs) {
        var debuggee = {
            tabId: tabs[0].id
        };
        // attach and enable debugger
        chrome.debugger.attach(debuggee, "1.0", function () {
            chrome.tabs.sendMessage(tabs[0].id, {action: "error", message: chrome.runtime.lastError});
            chrome.debugger.sendCommand(debuggee, 'Debugger.enable', {}, function () {
            });
        });
    });

    // handle debugger events
    chrome.debugger.onEvent.addListener(function (source, method, params) {
        // script stopped due to "debugger;"
        if (method == "Debugger.paused") {
            var settings = {
                source: source.tabId,
                callFrameId: ""
            };
            // get calltrace
            var fnc = "";
            if ("callFrames" in params) {
                if (params.callFrames.length > 0) {
                    fnc = params.callFrames[0].functionName;
                    settings.callFrameId = params.callFrames[0].callFrameId;
                }
            }
            // weird... abort!
            if (fnc == "") {
                chrome.debugger.sendCommand(source, 'Debugger.resume', {}, function () {
                });
                return;
            }

            if (fnc[0] == "_") fnc = fnc.replace(/_/g, ".").substring(1);

            // craft notification
            var opt = {
                type: "basic",
                title: "Permission request",
                message: "Page wants to call " + fnc,
                iconUrl: "notification.svg",
                requireInteraction: true,
                buttons: [
                    {title: "Allow"},
                    {title: "Block"}
                ]
            };
            // show notification
            chrome.notifications.create(JSON.stringify(settings), opt, function () {
                alert(chrome.runtime.lastError.message);
            });
        }
    });

    // close notification -> block permission
    chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
        var settings = JSON.parse(notificationId);
        setBlockState(settings, true);
        chrome.notifications.clear(notificationId);
    });

    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
        var settings = JSON.parse(notificationId);
        if (buttonIndex == 0) {
            setBlockState(settings, false);
        } else {
            setBlockState(settings, true);
        }
        chrome.notifications.clear(notificationId);
    });


    sendResponse(true);
}

function updateBadge(level) {
    if(level !== undefined) {
        chrome.browserAction.setBadgeText({text: "" + level});
    }
    else {
        chrome.storage.sync.get("level", function (val) {
            if (val.level !== undefined) {
              chrome.browserAction.setBadgeText({text: "" + val.level});
            }
        });
    }
}

function setLevel(request, sender, sendResponse) {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
        status: "complete",
        windowType: "normal"
    }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
        updateBadge(request.level);
    });
}

// messages from popup
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "level") {
            setLevel(request, sender, sendResponse);
        }

    });


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        var start = performance.now();
        chrome.storage.sync.get("level", function (val) {
            parsePolicy(0, val.level, tabId, {}, function (inject) {
                var ask = false;
                for (var fnc in inject) {
                    inject[fnc].code.then(function(script) {
                        injectScript(tabId, script);
                    });
                    ask = ask || inject[fnc].ask;
                }
                if (ask) {
                    init(null, null, function () {
                    });
                }
                var end = performance.now();
                console.log("Parsing took " + (end - start) + "ms");
            });
        });
    }
});

// on tab change, update badge
chrome.tabs.onActivated.addListener(function(tabinfo) {
    updateBadge();
});
