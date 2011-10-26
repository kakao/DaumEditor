(function() {
    /**
     * 웹폰트를 로딩하기 위한 클래스로 WysiwygPanel 내부에서만 사용된다.
     * @private
     * @class
     */
    Trex.WebfontLoader = Trex.Class.create({
        initialize: function(doc, config) {
            this.doc = doc;
            this.styleCnt = 0;
            this.defWebfont = config.styles.fontFamily;
            this.useWebfont = (config.webfont && config.webfont.use);
            this.webfontCfg = config.webfont || [];
            this.elStyleSheet = this.getStyleSheet();
        },

        load: function(content) {
            if (!$tx.msie) {
                return;
            }
            if (!content) {
                return;
            }
            if (!this.useWebfont) {
                return;
            }

            var _matchs = [];
            content += " // font-family:" + this.defWebfont;
            content.replace(/font-family\s*:\s*(\w*)/gi, function(full, name) {
                _matchs.push(name);
                return full;
            });
            if (_matchs.length == 0) {
                return;
            }

            var _loader = this;
            setTimeout(function() {
                var _matchedSource = _matchs.uniq().join("||");
                _loader.webfontCfg.options.each(function(item) {
                    if (item.url && _matchedSource.indexOf(item.data) > -1) {
                        _loader.imports(item);
                    }
                });
            }, 10);
        },

        getUsed: function() {
            if (!$tx.msie) {
                return [];
            }
            var _result = [];
            if (!this.useWebfont) {
                return _result;
            }
            this.webfontCfg.options.each(function(item) {
                if (!item.url) {
                    _result.push(item.data);
                }
            });
            return _result;
        },

        getStyleSheet: function() {
            return this.doc.styleSheets[this.styleCnt++];
        },

        imports: function(item) {
            try {
                this.elStyleSheet.addImport(item.url, 2);
            } catch(e) {
                this.elStyleSheet = this.getStyleSheet();
                this.elStyleSheet.addImport(item.url, 2);
            }
            item.url = _NULL;
        }
    });
})();