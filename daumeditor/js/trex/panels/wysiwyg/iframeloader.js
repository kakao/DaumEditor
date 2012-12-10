(function() {
    /**
     * WYSIWYG 편집 영역에 해당하는 <iframe> 을 초기화한다.
     * document.write 방식을 이용하여 iframe을 초기화 하며, 용
     * IE + document.domain 이 지정된 경우 document.domain 이 지정된 iframe(catalyst)을 먼저 로딩하여
     * iframe 에 접근가능하도록 처리 한 후, document.write 를 실행한다.
     * @private
     * @class
     */
    Trex.WysiwygIframeLoader = Trex.Class.create({
        initialize: function(iframe, iframeUrl) {
            this.iframe = iframe;
	        this.iframeUrl = iframeUrl;
        },

        load: function(callback) {
            try {
                this.loadLocalIframe(callback);
            } catch (e) {
                this.reloadUsingCatalyst(callback);
            }
        },

        loadLocalIframe: function(callback) {
            var doc = this.iframe.contentWindow.document;
            doc.open();
            doc.write(wysiwygHTML);
            doc.close();
            // 하위 호환을 위하여 delay 처리한다. 기존 iframe observer 들이 loading 이 비동기라 가정하고 작성되어있다.
            setTimeout(function() {
                callback(doc);
            }, 0);
        },

        reloadUsingCatalyst: function(callback) {
            console.log("retry with xss iframe catalyst");
            var self = this;
            _WIN.__tx_wysiwyg_iframe_load_complete = function() {
                self.loadLocalIframe(callback);
            };
	        if (!this.iframeUrl) {
		        try { // core dev mode, core production mode, dex dev mode
			        var basePath = EditorJSLoader.getPageBasePath('editor.js');
		        } catch (e) { // dex production mode
			        basePath = EditorJSLoader.getPageBasePath();
		        }
		        this.iframeUrl = basePath + "trex/iframe_loader_catalyst.html";
	        }
            this.iframe.src = this.iframeUrl + "?" + document.domain;
        },

        // 옛날 스타일
        loadRemoteIframe: function() {
            var iframe = this.el;
            iframe.setAttribute("src", this.canvasConfig.wysiwygUrl);
        }
    });


    function absolutizeURL(url) {
        var location = _DOC.location;
        if (/^(https?|file):\/\//.test(url)) {
        } else if (url.indexOf("/") === 0) {
            url = "//" + location.host + ":" + (location.port || "80") + url;
        } else {
            var href = location.href;
            var cutPos = href.lastIndexOf("/");
            url = href.substring(0, cutPos + 1) + url;
        }
        return url;
    }

    var cssBasePath = absolutizeURL(EditorJSLoader.getCSSBasePath());

    var wysiwygHTML =
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' +
            '<html lang="ko"><head>' +
            '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
            '<title>DaumEditor Wygiwyg Panel</title>' +
            '<script id="txScriptForEval"></script>' +
			'<link rel="stylesheet" href="' + cssBasePath + 'content_view.css" type="text/css"></link>' +
            '<link rel="stylesheet" href="' + cssBasePath + 'content_wysiwyg.css" type="text/css"></link>' +
            '<style id="txStyleForSetRule"></style>' +
			'</head>' +
            '<body class="tx-content-container">' +
            $tom.EMPTY_PARAGRAPH_HTML +
            '</body></html>';

})();