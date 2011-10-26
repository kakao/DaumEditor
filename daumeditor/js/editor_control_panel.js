function toggleTxControlPanel() {
    var EditorLoaderName = "EditorJSLoader",
        txControlPanel = 'txControlPanel',
        tx_base_path = 'tx_base_path',
        tx_version = 'tx_version',
        tx_environment = 'tx_environment';

    var editorWindow = findEditorFrame();
    if (!editorWindow) {
        alert("there's no EditorJSLoader");
        return;
    }

    var editorDocument = editorWindow.document,
        EditorJSLoader = editorWindow[EditorLoaderName],
        localStorage = editorWindow['localStorage'],
        elem = editorDocument.getElementById(txControlPanel);

    if (elem) {
        elem.parentNode.removeChild(elem);
        return;
    }

    var div = editorDocument.createElement('div');
    div.style.cssText = "position:fixed;right:0;top:0;width:400px;background:#fff;font:11px Courier;z-index:999999;";
    editorDocument.body.appendChild(div);
    div.innerHTML = '' +
            '<form id="' + txControlPanel + '" name="' + txControlPanel + '" style="-webkit-box-shadow: -2px 2px 5px rgba(128,128,128,.7);text-align:left;">' +
            '<fieldset><label for="txEnvDev">DEV' +
            '<input type="radio" id="txEnvDev" name="' + tx_environment + '" value="development">' +
            'BasePath ' +
            '<input name="' + tx_base_path + '" style="width:250px;"></label></fieldset>' +
            '<fieldset><label for="txEnvProd">PROD' +
            '<input type="radio" id="txEnvProd" name="' + tx_environment + '" value="production">' +
            'Version ' +
            '<input name="' + tx_version + '"></label></fieldset>' +
            '<button onclick="txSetEditor();return false;">APPLY</button>' +
            '<button onclick="txResetEditor();return false;">RESET</button>' +
            '</form>';
    var form = div.firstChild,
        txEnvDevField = form[tx_environment][0],
        txEnvProdField = form[tx_environment][1],
        txVersionField = form[tx_version],
        txBasePathField = form[tx_base_path],
        reload = function() {
            editorDocument.location.reload();
        };

    (EditorJSLoader.getOption('environment') === 'development') ? txEnvDevField.click() : txEnvProdField.click();
    txVersionField.value = EditorJSLoader.getOption('version');
    txBasePathField.value = (localStorage && localStorage.getItem(tx_base_path)) || EditorJSLoader.getBasePath();

    editorWindow.txSetEditor = function() {
        var basePath = txBasePathField.value;
        localStorage && localStorage.setItem(tx_base_path, basePath);
        setCookie(tx_base_path, encodeURIComponent(basePath));
        setCookie(tx_version, txVersionField.value);
        setCookie(tx_environment, (txEnvDevField.checked ? txEnvDevField : txEnvProdField).value);
        reload();
    };
    editorWindow.txResetEditor = function() {
        removeCookie(tx_base_path);
        removeCookie(tx_version);
        removeCookie(tx_environment);
        reload();
    };

    function setCookie(name, value) {
        editorDocument.cookie = name + "=" + value;
    }

    function removeCookie(name) {
        editorDocument.cookie = name + "='';expires=" + new Date(0).toUTCString(); // Thu, 1 Jan 1970 00:00:00 UTC
    }

    function findEditorFrame() {
        if (window[EditorLoaderName]) {
            return window;
        }
        for (var i = 0; i < frames.length; i++) {
            if (frames[i] && frames[i][EditorLoaderName]) {
                return frames[i];
            }
        }
    }
}
