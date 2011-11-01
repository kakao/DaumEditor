(function() {

    function _importScript(filename) {
        if (filename) {
            EditorJSLoader.loadModule(filename);
        }
    }

    // 1. import header
    _importScript("trex/header.js");

    // 2. import trex
    for (i = 0; i < CORE_FILES.length; i++) {
        _importScript(CORE_FILES[i]);
    }

    // 3. import footer
    _importScript("trex/footer.js");
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