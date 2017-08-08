function activate(id, reload) {
    for (var i = 0; i < 5; i++) document.getElementById("l" + i).className = "";
    document.getElementById(id).className = "lactive";

    if (reload) {
        chrome.runtime.sendMessage({type: "level", level: parseInt(id[1])}, function (resp) {
            console.log(resp);
        });
    }

    chrome.storage.sync.set({'level': parseInt(id[1])}, function () {
    });

}

document.getElementById("l0").addEventListener("click", function () {
    activate("l0", true);
});
document.getElementById("l1").addEventListener("click", function () {
    activate("l1", true);
});
document.getElementById("l2").addEventListener("click", function () {
    activate("l2", true);
});
document.getElementById("l3").addEventListener("click", function () {
    activate("l3", true);
});
document.getElementById("l4").addEventListener("click", function () {
    activate("l4", true);
});

chrome.storage.sync.get("level", function (val) {
    activate("l" + val.level, false);
});
