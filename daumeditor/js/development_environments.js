/* load editor js files as development environments */
(function() {
    var DE_PREFIX = EditorJSLoader.getJSBasePath("editor.js");

    function _importScript(filename) {
        if (filename) {
            EditorJSLoader.loadModule(filename);
        }
    }

    EXCLUDE_FILES = (typeof EXCLUDE_FILES == "object") ? EXCLUDE_FILES : [];
    var isExcludeFile = function(filepath) {
        for (var i = 0; i < EXCLUDE_FILES.length; i++) {
            if (EXCLUDE_FILES[i] == filepath) {
                return true;
            }
        }
        return false;
    };

    // 1. import header
    _importScript(DE_PREFIX + "trex/header.js");

    // 2. import trex
    for (var i = 0; i < CORE_FILES.length; i++) {
        if (!isExcludeFile(CORE_FILES[i])) {
            _importScript(DE_PREFIX + CORE_FILES[i]);
        }
    }

    // 3. import EXT_FILES
    if (typeof EXT_FILES == "object") {
        for (i = 0; i < EXT_FILES.length; i++) {
            if (!isExcludeFile(EXT_FILES[i])) {
                _importScript(EXT_FILES[i]);
            }
        }
    }

    // 4. import projectlib
    if (typeof SERVICE_FILES == "object") {
        for (i = 0; i < SERVICE_FILES.length; i++) {
            if (!isExcludeFile(SERVICE_FILES[i])) {
                _importScript(SERVICE_FILES[i]);
            }
        }
    }

    // 5. import footer
    _importScript(DE_PREFIX + "trex/footer.js");
})();

/* show development environments indicator */
(function() {
    function addEditorEnvIndicator() {
        if (window.Editor && Editor.__EDITOR_LOADED) {
            var indicator = document.createElement("span");
            indicator.innerHTML = "DEVELOPMENT MODE";
            $tx.setStyle(indicator, {
                position: "absolute",
                fontSize: "13px",
                color: "green",
                fontFamily: "courier,serif",
                right: "10px",
                bottom : "10px"
            });
            var canvas = Editor.getCanvas().elContainer; //$tx("tx_canvas");
            canvas.appendChild(indicator);
        } else {
            setTimeout(arguments.callee, 500);
        }
    }

    EditorJSLoader.ready(addEditorEnvIndicator);
})();