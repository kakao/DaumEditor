!function(){
    // config.canvas.autolink 값을 true로 설정한다.
    var canvasConfig = TrexConfig.get('canvas');
    canvasConfig.autolink = _TRUE;
}();

Trex.module('paste anchor controller', function(editor, toolbar, sidebar, canvas, config) {
    Trex.Paste.AutolinkConverter = Trex.Class.create({
        initialize: function(){
            this.patternSpace = /\s/;
            this.patternUrl = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/i;
            this.patternLikeIP = /^[\d\.]+$/;
            this.patternIPv4 = /^(\d{2,3})\.(\d{2,3})\.(\d{1,3})\.(\d{1,3})$/;
            this.patternAnchor = /^<a\s+[^>]*>(.+)<\/a>$/i;
        },
        isContainSpace: function(str) {
            return this.patternSpace.test(str.trim());
        },
        isValidUrl: function(str) {
            return !!this.checkValidUrl(str);
        },
        checkValidUrl: function(str) {
            var trimString = str.trim();
            var result = this.parseUrl(trimString);
            var host = (result && result.host) || '';
            var hostSplitDot = host.split('.');
            var hostSplitDotLength = hostSplitDot.length;
            var mayBeIpHost = this.patternLikeIP.test(host);

            if (mayBeIpHost) {
                // IP형식으로 숫자로만 구성된 host는 scheme의 유무와 상관없이 사용하도록 한다.
                var ipHost = this.patternIPv4.exec(host);
                if (ipHost && ipHost.length == 5 && ipHost[1] < 256 && ipHost[2] < 256 && ipHost[3] < 256 && ipHost[4] < 256) {
                    return result;
                }
            } else {
                if (result.scheme && hostSplitDotLength >= 2) {
                    // scheme 이 있으면 host는 1차만 정의되어도 사용 가능하다.
                    return result;
                } else if (!result.scheme && hostSplitDotLength > 2) {
                    // scheme 이 없다면 host는 2차이상 정의되어야 사용 가능하다.
                    return result;
                }
            }

            return _FALSE;
        },
        isAnchorTag: function(str) {
            return this.patternAnchor.test(str.trim());
        },
        parseAnchor: function(anchorStr) {
            var matched = anchorStr.match(this.patternAnchor);
            if (matched && matched.length == 2) {
                return matched[1];
            }
            return _NULL;
        },
        parseUrl: function(str) {
            var parseResult = this.patternUrl.exec(str.trim());
            var result = {};
            if (parseResult) {
                result = {
                    'url': parseResult[0],
                    'scheme': parseResult[1],
                    'slash': parseResult[2],
                    'host': parseResult[3],
                    'port': parseResult[4],
                    'path': parseResult[5],
                    'query': parseResult[6],
                    'hash': parseResult[7]
                };
            }
            return result;
        }
    });

    var cleaner = editor.getPasteCleaner();
    var paster = editor.getPaster();
    var autolinkConverter = new Trex.Paste.AutolinkConverter();

    cleaner.addFilter('autolink.control', function(html) {
        var mode = paster.getMode();
        // paste HTML 모드인 경우에만 동작한다.
        if (mode != Trex.Paste.MODE_HTML) {
            return html;
        }

        $tx.msie && (html = html.replace(/<meta[^>]*>/gi, ''));// IE에서 간혹 불필요한 meta값을 포함하기도 한다.
        html = html.trim();

        if (config.toolbar.paste.autolink === _TRUE) {
            // 문자열 내 공백이 없어야만 한다.
            if (autolinkConverter.isContainSpace(html) == _FALSE) {
                var result = autolinkConverter.checkValidUrl(html);
                if (result) {
                    var linkUrl = html;
                    if (!result.scheme) {
                        linkUrl = 'http://' + html;
                    }
                    html = ['<a target="_blank" href="', linkUrl, '" class="tx-link">', decodeURIComponent(html), '</a>'].join('');
                }
            }
        } else if (config.toolbar.paste.autolink === _FALSE) {
            if (autolinkConverter.isAnchorTag(html)) {
                var urlText = autolinkConverter.parseAnchor(html);
                if (urlText) {
                    html = urlText;
                }
            }
        } else {
            // null, undefined는 브라우저 기본 모드로 동작하게 된다.
        }
        return html;
    });
});