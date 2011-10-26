/**
 * minified
javascript:(function(d){var g="EditorJSLoader";var c=(function b(){if(d[g]){return d}var h=frames;for(var j=0;j<h.length;j++){try{if(h[j]&&h[j][g]){return h[j]}}catch(k){}}})();try{c.toggleTxControlPanel()}catch(f){if(!c){alert("there's no EditorJSLoader");return}var a=c[g];a.asyncLoadModule({url:"http://uie.daum.net/daumeditor/js/editor_control_panel.js",callback:function(){c.toggleTxControlPanel()}})}})(window);
 */
(function(window) {
    var EditorLoaderName = "EditorJSLoader";
    var editorWindow = (function findEditorFrame() {
        if (window[EditorLoaderName]) {
            return window;
        }
        var _frames = frames;
        for (var i = 0; i < _frames.length; i++) {
            try {
                if (_frames[i] && _frames[i][EditorLoaderName]) {
                    return _frames[i];
                }
            } catch (e) {
            }
        }
    })();
    
    try {
        editorWindow.toggleTxControlPanel();
    } catch (e) {
        if (!editorWindow) {
            alert("there's no EditorJSLoader");
            return;
        }

        var EditorJSLoader = editorWindow[EditorLoaderName];
        EditorJSLoader.asyncLoadModule({
            url: "http://uie.daum.net/daumeditor/js/editor_control_panel.js",
            callback: function() {
                editorWindow.toggleTxControlPanel();
            }
        });
    }
})(window);