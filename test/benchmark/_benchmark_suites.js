(function() {
    var benches = [
        "benchmark/regexp.js",
        "benchmark/access_cssText.js",
        "benchmark/array_each.js",
        "benchmark/cloneNode.js",
        "benchmark/function_call.js",
        "benchmark/kindOf.js",
        "benchmark/normalize_text.js",
        "benchmark/localStorage.js"
    ];

    function importScript(url, encoding, context, success) {
        if (url == _NULL && url != "") {
            return;
        }
        encoding = encoding || "utf-8";
        context = context || _DOC;
        try {
            var head = context.getElementsByTagName("head")[0] || context.documentElement;
            var script = context.createElement("script");
            script.type = "text/javascript";
            script.charset = encoding;
            script.src = url;

            var done = _FALSE;
            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState ||
                    this.readyState === "loaded" || this.readyState === "complete")) {
                    done = _TRUE;
                    if (success) {
                        success();
                    }

                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = _NULL;
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }
                }
            };
            head.insertBefore(script, head.firstChild);
        } catch(e) {
            console.log(e)
        }
    }

    for (var i = 0; i < benches.length; i++) {
        importScript(benches[i]);
    }
})();