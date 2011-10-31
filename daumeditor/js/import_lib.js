(function() {
    function indexOf(a, _find) {
        for (var i = 0; i < a.length; i += 1) {
            if (a[i] === _find) {
                return i;
            }
        }
        return -1;
    }

    function _importScript(filename) {
        if (filename) {
            EditorJSLoader.loadModule(filename);
        }
    }

    if (typeof PROJECTLIBS === "object") {
        DEVELLIBS = DEVELLIBS.concat(PROJECTLIBS);
    }

    var i = 0;
    if (typeof EXCLUDE_LIBS === "object") {
        for (i = 0; i < EXCLUDE_LIBS.length; i++) {
            var filename = EXCLUDE_LIBS[i];
            var index = indexOf(DEVELLIBS, filename);
            if (index >= 0) {
                DEVELLIBS.splice(index, 1);
            }
        }
    }

    DEVELLIBS.splice(0, 0, "trex/header.js");
    DEVELLIBS.push("trex/footer.js");
    for (i = 0; i < DEVELLIBS.length; i++) {
        _importScript(DEVELLIBS[i]);
    }
})();

(function() {
    if (typeof window !== "object") {
        return;
    }

    function addEditorEnvIndicator() {
        if (window.Editor && Editor.__EDITOR_LOADED) {
            var canvas = Editor.getCanvas().elContainer; //$tx("tx_canvas");
            var indicator = document.createElement("span");
            indicator.innerHTML = "developer editor";
            $tx.setStyle(indicator, {
                position: "absolute",
                fontSize: "12px",
                color: "#ee82ee",
                fontWeight: "bold",
                right: "10px",
                bottom : "10px"
            });
            canvas.appendChild(indicator);
        } else {
            setTimeout(arguments.callee, 1000);
        }
    }

    if (window.addEventListener) {
        window.addEventListener("load", addEditorEnvIndicator, false);
    } else {
        window.attachEvent("onload", addEditorEnvIndicator);
    }
})();