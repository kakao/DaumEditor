/**
 * @fileOverview
 * 컨텐츠를 가지고 있는 편집 영역을 수정, 관리하는 Trex.Canvas 관련 Source로
 * 대부분 각 panel들에게 행동들을 위임한다.
 * 편집 영역 = panel = TextPanel, HtmlPanel, WysiwygPanel
 */
(function(Trex) {
    var QUERY_TRIGGER_KEYCODES = new $tx.Set(13, 8, 32, 33, 34, 37, 38, 39, 40, 46);
    var shouldTriggerQuery = function(keyCode) {
        return QUERY_TRIGGER_KEYCODES.contains(keyCode);
    };

    TrexConfig.add({
        "canvas": {
            doctype: "auto", // edge
            mode: ["text", "html", "source"],
            styles: {
                color: "#333333",
                fontFamily: "돋움",
                fontSize: "9pt",
                backgroundColor: "#ffffff",
                lineHeight: "1.5",
                padding: "8px"
            },
			pMarginZero: true,
            selectedMode: "html",
            readonly: _FALSE,
            initHeight: 400,
            minHeight: 200,
            ext: 'html',
            param: "",
            newlinepolicy: "p",
            showGuideArea: _TRUE,
            convertingText: _TRUE,
			escapeTextModeContents: _TRUE,
			removeTextModeBr: _FALSE,
            respectVisibilityInDesign: _TRUE
        }
    }, function(root) {
        var _config = TrexConfig.get('canvas', root);
        var _evConfig = root.events;
        _config.initializedId = root.initializedId || '';
        _config.useHotKey = _evConfig.useHotKey;
        var _switcher = TrexConfig.getTool('switcher', root);
        if (Trex.available(_switcher, "switcher" + _config.initializedId)) {
            _config.mode = _switcher.options.pluck("data");
        }
        var _fontfamily = TrexConfig.getTool('fontfamily', root);
        if (Trex.available(_fontfamily, "fontfamily" + _config.initializedId)) {
            if(_fontfamily.webfont && _fontfamily.webfont.use) {
                _config.webfont = _fontfamily.webfont;
                _config.webfont.options.each(function(element) {
                    element.url = TrexConfig.getUrl(element.url);
                });
            }
        }
        var _resizer = TrexConfig.get('resizer', root);
        if (_resizer) {
            _config.minHeight = _resizer.minHeight;
        }
        /**
         * 에디터통합 버전으로 한메일 배포시에는
         * 윗줄 주석해제, 아랫줄 삭제
         */
        //_config.wysiwygUrl = TrexConfig.getUrl(["#host#path/pages/daumx/", "wysiwyg_", (_config.serviceWysiwyg || "" ), ((_config.doctype == "html") ? "html" : "xhtml"), ".", (_config.ext ? _config.ext : "html"), "?prefix=" + root.initializedId, "&", _config.param].join(""));
        _config.wysiwygUrl = TrexConfig.getUrl([(_config.wysiwygPath || "#host#path/pages/daumx/"), "wysiwyg_", (_config.serviceWysiwyg || "" ), ((_config.doctype == "html") ? "html" : "xhtml"), ".", (_config.ext ? _config.ext : "html"), "?prefix=" + root.initializedId, "&", _config.param].join(""));

        /**
         * doctype 결정기준
         */
        if (_config.doctype == 'auto') {
            if ($tx.msie && $tx.msie_quirks) {
                _config.doctype = 'quirks';
            } else {
                _config.doctype = 'edge';
            }
        }

    });

    TrexConfig.add({
        "size": {

        }
    });
    /**
     * 컨텐츠를 가지고 있는 편집 영역을 수정, 관리하는 Trex.Canvas 객체로 <br/>
     * 대부분 각 panel들에게 행동들을 위임한다. <br/>
     * 각각의 panel들은 해당 Processor들을 포함한다. <br/>
     * 편집 영역 = panel = TextPanel, HtmlPanel, WysiwygPanel
     *
     * @class
     * @extends Trex.I.JobObservable Trex.I.KeyObservable
     * @param {Object} editor
     * @param {Object} config
     */
    Trex.Canvas = Trex.Class.create( /** @lends Trex.Canvas.prototype */{
        /** @ignore */
        $const: {
            /** @name Trex.Canvas.__TEXT_MODE */
            __TEXT_MODE: "text",
            /** @name Trex.Canvas.__HTML_MODE */
            __HTML_MODE: "source",
            /** @name Trex.Canvas.__WYSIWYG_MODE */
            __WYSIWYG_MODE: "html",
            __WYSIWYG_PADDING: 8,
            __IMAGE_PADDING: 5
        },
        /** @ignore */
        $mixins: [Trex.I.JobObservable, Trex.I.KeyObservable, Trex.I.ElementObservable, Trex.I.MouseoverObservable],
        /** Editor instance */
        editor: _NULL,
        /** Canvas Dom element, Generally $tx('tx_canvas') */
        elContainer: _NULL,
        /** Canvas Config */
        config: _NULL,
        /** History Instance for redo/undo */
        history: _NULL,
        /**
         * Panels 객체
         * @private
         * @example
         * 	canvas.panels['html']
         * 	canvas.panels['source']
         * 	canvas.panels['text']
         */
        panels: _NULL,
        initialize: function(editor, rootConfig) {

            this.editor = editor;
            var _config = this.config = TrexConfig.get('canvas', rootConfig);
            var _initializedId = ((rootConfig.initializedId) ? rootConfig.initializedId : "");

            this.elContainer = $tx("tx_canvas" + _initializedId);
            this.wysiwygEl = $tx("tx_canvas_wysiwyg_holder" + _initializedId);
            this.sourceEl = $tx("tx_canvas_source_holder" + _initializedId);
            this.textEl = $tx("tx_canvas_text_holder" + _initializedId);

            this.initConfig(rootConfig);
            this.createPanel();
            this.history = new Trex.History(this, _config);
            this.setCanvasSize({
                height: _config.initHeight
            });
        },
        initConfig: function(rootConfig) {
            var _config = this.config;
            /**
             * root config를 얻어온다.
             * @private
             * @returns {Object} root config
             */
            this.getRootConfig = function() {
                return rootConfig;
            };

            /**
             * Canvas의 config를 가져온다.
             * @returns {Object} config
             */
            this.getConfig = function() {
                return _config;
            };

            /**
             * wysiwyg panel의 스타일 config를 가져온다.
             * @param {String} name - 스타일명 optional
             * @returns {Object} 스타일 config
             * @example
             *  canvas.getStyleConfig();
             */
            this.getStyleConfig = function(name) {
                if(name) {
                    return _config.styles[name];
                } else {
                    return _config.styles;
                }
            };
			
			var _sizeConfig = TrexConfig.get('size', rootConfig);
			this.measureWrapWidth = function() {
                _sizeConfig.wrapWidth = this.getContainerWidth(); // TODO FTDUEDTR-1214
            };
			this.measureWrapWidth();
	        if(!_sizeConfig.contentWidth) {
                _sizeConfig.contentWidth = _sizeConfig.wrapWidth;
            }
            _sizeConfig.contentPadding = _config.styles.padding.parsePx(); //15

            /**
             * canvas size 관련 config를 얻어온다.
             * @returns {Object} size config
             */
            this.getSizeConfig = function() {
                return _sizeConfig;
            };
        },
        getContainerWidth: function() {
            return $tx.getDimensions(this.elContainer).width;
        },
        /**
         * Panels 객체들을 초기화한다.
         * @private
         */
        createPanel: function() {
            var _canvas = this;
            var _config = this.config;
            this.panels = {};
            this.mode = _config.selectedMode || Trex.Canvas.__WYSIWYG_MODE;
            if (this._isForceTextMode()) {
                this.mode = Trex.Canvas.__TEXT_MODE;
            }
            var _panelCreater = {
                "text": function(_config) {
                    return new Trex.Canvas.TextPanel(_canvas, _config);
                },
                "source": function(_config) {
                    return new Trex.Canvas.HtmlPanel(_canvas, _config);
                },
                "html": function(_config) {
                    return new Trex.Canvas.WysiwygPanel(_canvas, _config);
                }
            };
            _config.mode.each(function(name) {
                if (_panelCreater[name]) {
                    _canvas.panels[name] = _panelCreater[name](_config);
                }
            });
            for(var _p in _canvas.panels) {
                if (this.mode == _p) {
                    _canvas.panels[_p].show();
                } else {
                    _canvas.panels[_p].hide();
                }
            }
            _canvas.observeJob('canvas.panel.iframe.load', function(panelDoc) {
                _canvas.fireJobs(Trex.Ev.__IFRAME_LOAD_COMPLETE, panelDoc);
            });
        },
        _isForceTextMode: function() {
            // 기존에는 아래의 조건이었으나 모바일에서의 호환은 아직 문제가 많아 제한함. 20140430
            // ($tx.ios && $tx.ios_ver < 5) || ($tx.android && $tx.android_ver < 3)
            return $tx.ios || $tx.android;
        },
        /**
         * Canvas의 mode를 바꾸는것으로, 현재 활성화되어있는 panel을 변경한다.
         * @param {String} newMode - 변경 할 mode에 해당하는 문자열
         * @example
         *  editor.getCanvas().changeMode('html');
         *  editor.getCanvas().changeMode('source');
         *  editor.getCanvas().changeMode('text');
         */
        changeMode: function(newMode) {
            var _editor = this.editor;
            var oldMode = this.mode;
            if (oldMode == newMode) {
                return;
            }
            if (this._isForceTextMode() && oldMode == Trex.Canvas.__TEXT_MODE) {
                return;
            }
            var _oldPanel = this.panels[oldMode];
            var _newPanel = this.panels[newMode];
            if (!_oldPanel || !_newPanel) {
                throw new Error("[Exception]Trex.Canvas : not suppored mode");
            }
            var _oldContent = _oldPanel.getContent();
            var _content = _editor.getDocParser().getContentsAtChangingMode(_oldContent, oldMode, newMode);
            if (oldMode == Trex.Canvas.__WYSIWYG_MODE) { //NOTE: #FTDUEDTR-366
				if ($tx.msie_ver === 8) {
					_oldPanel.hide();
				} //prevent black screen from youtube iframe. #FTDUEDTR-1272
				_oldPanel.setContent("");
                try {
                    this.focusOnTop();
                }catch(e){}
            }
			try { //#FTDUEDTR-1111
            	_newPanel.setContent(_content);
			} catch (error) {
				alert(' - Error: ' + error.message + '\n에디터 타입 변경에 실패하였습니다.\n잘못된 HTML이 있는지 확인해주세요.');
				_oldPanel.setContent(_oldContent);
				_oldPanel.show();
				return;
			}
            this.mode = newMode;
            this.fireJobs(Trex.Ev.__CANVAS_MODE_CHANGE, oldMode, newMode);
            _newPanel.setPanelHeight(_oldPanel.getPanelHeight());
            _newPanel.show();
            _oldPanel.hide();
            // FF2 bug:: When display is none,  designMode can't be set to on
            try {
                if (newMode == "html" && !this.getPanel("html").designModeActivated && $tx.gecko) {
                    this.getPanel("html").el.contentDocument.designMode = "on";
                    this.getPanel("html").designModeActivated = _TRUE;
                }
            } catch (e) {
                throw e;
            }
        },
        /**
         * 현재 panel에 포커스를 준다.
         */
        focus: function() {
            this.panels[this.mode].focus();
        },
        /**
         * 본문의 처음으로 캐럿을 옮긴다. - Only Wysiwyg
         */
        focusOnTop: function() {
            this.getProcessor().focusOnTop();
        },
        /**
         * 본문의 마지막으로 캐럿을 옮긴다. - Only Wysiwyg
         */
        focusOnBottom: function() {
            this.getProcessor().focusOnBottom();
        },
        /**
         * canvas의 position을 가져온다.
         * @returns {Object} position = { x: number, y:number }
         */
        getCanvasPos: function() {
            var _position = $tx.cumulativeOffset(this.elContainer);
            return {
                'x': _position[0],
                'y': _position[1]
            };
        },
        /**
         * canvas의 height를 변경한다.
         * @param {String} size (px)
         * @example
         *  canvas.setCanvasSize({
         *  	height: "500px"
         *  });
         */
        setCanvasSize: function(size) {
            if (this.panels[this.mode] && size.height) {
                this.panels[this.mode].setPanelHeight(size.height);
            } else {
                throw new Error("[Exception]Trex.Canvas : argument has no property - size.height ");
            }
        },
        /**
         * @Deprecated use isWYSIWYG()
         */
        canHTML: function() {
            return this.isWYSIWYG();
        },
        isWYSIWYG: function () {
            return this.mode === Trex.Canvas.__WYSIWYG_MODE;
        },
        /**
         * panel 객체를 가져온다.
         * @param {String} mode - 가져올 panel 모드명
         * @returns {Object} - parameter에 해당하는 Panel
         * @example
         * 	this.getPanel('html').designModeActivated = true;
         */
        getPanel: function(mode) {
            if (this.panels[mode]) {
                return this.panels[mode];
            } else {
                return _NULL;
            }
        },
        /**
         * 현재 활성화되어있는 panel 객체를 가져온다.
         * @returns {Object} - 활성화되어있는 panel 객체
         */
        getCurrentPanel: function() {
            if (this.panels[this.mode]) {
                return this.panels[this.mode];
            } else {
                return _NULL;
            }
        },
        /**
         * 현재 활성화되어있는 panel의 processor을 가져온다.
         * @returns {Object} - 활성화되어있는 panel의 processor 객체
         */
        getProcessor: function(mode) {
            if ( !mode ){
                return this.panels[this.mode].getProcessor();
            }else{
                return this.panels[mode].getProcessor();
            }
        },
        /**
         * 본문의 내용을 가져온다
         * @returns {String}
         */
        getContent: function() {
            var _content = this.panels[this.mode].getContent();
            if(_content) {
                _content = _content.replace(Trex.__WORD_JOINER_REGEXP, ""); //NOTE: 서비스의 DB charset이 euc-kr 계열일 경우 문제가 있음.
            }
            return _content;
        },
        /**
         * 현재 Wysiwyg 영역의 수직 스크롤 값을 얻어온다. - Only Wysiwyg
         * @function
         * @returns {Number} 수직 스크롤 값
         * @see Trex.Canvas.WysiwygPanel#getScrollTop
         */
        getScrollTop: function() {
            if(!this.isWYSIWYG()) {
                return 0;
            }
            return this.panels[this.mode].getScrollTop();
        },
        /**
         * Wysiwyg 영역의 수직 스크롤 값을 셋팅한다. - Only Wysiwyg
         * @function
         * @param {Number} scrollTop - 수직 스크롤 값
         * @see Trex.Canvas.WysiwygPanel#setScrollTop
         */
        setScrollTop: function(scrollTop) {
            if(!this.isWYSIWYG()) {
                return;
            }
            this.panels[this.mode].setScrollTop(scrollTop);
        },
        /**
         * 현재 활성화된 panel에 컨텐츠를 주어진 문자열로 수정한다.
         * @param {String} content - 컨텐츠
         */
        setContent: function(content) {
            this.panels[this.mode].setContent(content);
            this.includeWebfontCss(content);
        },
        /**
         * panel에 컨텐츠를 주어진 문자열로 초기화한다.
         * @param {String} content - 컨텐츠
         */
        initContent: function(content) {
            this.history.initHistory({
                'content': content
            });
            this.panels[this.mode].setContent(content);
            this.includeWebfontCss(content);
            this.fireJobs(Trex.Ev.__CANVAS_DATA_INITIALIZE, Trex.Canvas.__WYSIWYG_MODE, _NULL);
			/* //NOTE: 메일은 수정이 없음. 답장 전달의 경우에는 본문 상단에 포커싱이 가도록.
            if ( $tx.gecko ){
                var me = this;
                setTimeout( function(){
                    me.focusOnBottom();
                },500)
            }else{
                this.focusOnBottom();
            }
			*/
        },
        /**
         * 컨텐츠를 파싱하여 사용되고 있는 웹폰트가 있으면, 웹폰트 css를 로딩한다. - Only Wysiwyg
         * @param {string} content
         * @see Trex.Canvas.WysiwygPanel#includeWebfontCss
         */
        includeWebfontCss: function(content) {
            if(!this.isWYSIWYG()) {
                return;
            }
            return this.panels[this.mode].includeWebfontCss(content);
        },
        /**
         * 본문에 사용된 웹폰트명 목록을 리턴한다. - Only Wysiwyg
         * @function
         * @returns {Array} 사용하고 있는 웹폰트명 목록
         * @see Trex.Canvas.WysiwygPanel#getUsedWebfont
         */
        getUsedWebfont: function() {
            if(!this.isWYSIWYG()) {
                return [];
            }
            return this.panels[this.mode].getUsedWebfont();
        },
        /**
         * 자바스크립트를 동적으로 실행한다 - Only Wysiwyg
         * @param {String} scripts - 자바스크립트 문자열
         */
        runScript: function(scripts) {
            if(!this.isWYSIWYG()) {
                return [];
            }
            this.panels[this.mode].runScript(scripts);
        },
        /**
         * 자바스크립트 소스를 로딩하여 동적으로 실행한다 - Only Wysiwyg
         * @param {String} url - 자바스크립트 url
         */
        importScript: function(url, callback) {
            if(!this.isWYSIWYG()) {
                return [];
            }
            this.panels[this.mode].importScript(url, callback);
        },
        /**
         * 선택된 영역의 상태 값을 알기위해 주어진 함수를 실행시킨다. - Only Wysiwyg
         * @param {Function} handler - 주어진 함수
         * @example
         * 		var _data = canvas.query(function(processor) {
         *			return processor.queryCommandState('bold');
         *		});
         */
        query: function(handler) {
            if(!this.isWYSIWYG()) {
                return _NULL;
            }
            var _processor = this.getProcessor();
            /* Block Scrolling
             if($tx.msie) {
             _processor.focus();
             }
             */
            return handler(_processor);
        },
        /**
         * 선택된 영역에 주어진 handler를 실행시킨다.
         * @param {Function} handler - 주어진 함수
         * @example
         * 		canvas.execute(function(processor) {
         *			processor.execCommand('bold', _NULL);
         *		});
         */
        execute: function(handler) {
	        var _history = this.history;
	        var _processor = this.getProcessor();
	        if (this.isWYSIWYG()) {
		        this.getPanel('html').ensureFocused();
		        if (_processor.restoreRange) {
			        setTimeout(function () { //NOTE: #FTDUEDTR-435
				        _processor.restoreRange();
				        handler(_processor);
			            _history.saveHistory();
				        _processor.restore();
			        }, 0);
		        } else {
                    _processor.focus();
			        handler(_processor);
			        _history.saveHistory();
			        _processor.restore();
		        }
	        } else {
		        handler(_processor);
	        }
        },
        /**
         * caret을 주어진 위치로 이동한다. - Only Wysiwyg <br/>
         * aaa.bbb - bbb라는 클래스를 가진 aaa 노드의 다음에 커서를 이동한다.
         * @param {String} scope
         */
        moveCaret: function(scope) {
            if(!scope) {
                return;
            }
            if(!this.isWYSIWYG()) {
                return;
            }
            this.getProcessor().moveCaretWith(scope);
        },
        /**
         * 선택한 영역에 HTML 컨텐츠를 삽입한다.
         * @param {String} content - 삽입하고자 하는 HTML 컨텐츠
         * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부 true/_FALSE
         * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
         * 					newline이 true 일 경우에만 의미를 갖는다.
         */
        pasteContent: function(content, newline, wrapStyle) {
            newline = newline || _FALSE;
            this.execute(function(processor) {
                processor.pasteContent(content, newline, wrapStyle);
            });
        },
        /**
         * 선택한 영역에 노드를 삽입한다. - Only Wysiwyg
         * @param {Array|Element} node - 삽입하고자 하는 노드 배열 또는 노드
         * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부 true/_FALSE
         * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
         * 					newline이 true 일 경우에만 의미를 갖는다.
         */
        pasteNode: function(node, newline, wrapStyle) {
            if (!this.isWYSIWYG()) {
                return;
            }
            newline = newline || _FALSE;
            this.execute(function(processor) {
                processor.pasteNode(node, newline, wrapStyle);
            });
        },
        /**
         * 현재 활성화된 panel에 스타일을 적용한다.
         * @param {Object} styles - 적용할 스타일
         */
        addStyle: function(styles) {
            this.panels[this.mode].addStyle(styles);
        },
        /**
         * 스타일명으로 현재 활성화된 panel의 스타일 값을 얻어온다.
         * @param {String} name - 스타일명
         * @returns {String} 해당 스타일 값
         */
        getStyle: function(name) {
            return this.panels[this.mode].getStyle(name);
        },
        /**
         * 특정 노드의 Wysiwyg 영역에서의 상대 위치를 얻어온다. - Only Wysiwyg
         * @function
         * @param {Element} node - 특정 노드
         * @returns {Object} position 객체 = {
         *								x: number,
         *								y: number,
         *								width: number,
         *								height: number
         *						}
         */
        getPositionByNode: function(node) {
            if(!this.isWYSIWYG()) {
                return {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }
            return this.panels[this.mode].getPositionByNode(node);
        },



        onKeyDown: function(event) {
            var p = this.getProcessor();
            var doc = this.getCurrentPanel().getDocument();
            function getNodeAndOffsetAtSel(){
                var rng = goog.dom.Range.createFromBrowserSelection(doc.getSelection? doc.getSelection():p.getSel());
                var node = rng.getStartNode();
                var offset = rng.getStartOffset();
                return {node: node,
                    offset: offset}
            }
            var where = getNodeAndOffsetAtSel();
            this.fireJobs(Trex.Ev.__CANVAS_PANEL_KEYDOWN, event);
            var prev = null;
            if(event.keyCode == Trex.__KEY.BACKSPACE && p.isCollapsed() && (prev = $tom.prevNodeUntilTagName(where.node, where.offset, 'table')) && $tom.isTagName(prev, 'table')){
                $tx.stop(event);
                this.fireJobs(Trex.Ev.__CANVAS_PANEL_BACKSPACE_TABLE, prev);
            }
            if (this.config.useHotKey) {
                this.fireKeys(event);
            }
            if($tx.msie&&$tx.msie_ver==11&&event.keyCode == Trex.__KEY.ENTER){
                setTimeout(this._ie11Enterbug.bind(this), 20);
            }
        },

        _ie11Enterbug: function(){
            var p = this.getProcessor();
            if(p.isCollapsed()){
                var doc = this.getCurrentPanel().getDocument();
                var rng = goog.dom.Range.createFromBrowserSelection(doc.getSelection? doc.getSelection():p.getSel());
                var node = rng.getStartNode();
                //node.textContents
                //ie9+
                if(node&&node.nodeType===1&&(node.textContent.replace(/[ \f\n\r\t\v]/g,'')==='')){
                    var dummy = p.newDummy(false);
                    rng.insertNode(dummy, true);
                    rng.select();
                }

            }
        },

        onKeyUp: function(event) {
            var keyCode = event.keyCode+'';

            if (shouldTriggerQuery(keyCode)) {
                this.getProcessor().clearDummy();
            }

            this.history.saveHistoryByKeyEvent(event);

            try {
                this.mayAttachmentChanged = _TRUE;
                this.fireJobs(Trex.Ev.__CANVAS_PANEL_KEYUP, event);
                if (this.isWYSIWYG() && shouldTriggerQuery(keyCode)) {
                    this.triggerQueryStatus();
                }
                if (keyCode === Trex.__KEY.DELETE || keyCode === Trex.__KEY.BACKSPACE) { //NOTE: (Del/Backspace) keys를 눌러 본문에서 무엇인가가 삭제되었다고 생각될 경우 첨부들의 싱크를 확인한다.
                    this.fireJobs(Trex.Ev.__CANVAS_PANEL_DELETE_SOMETHING);
                }
            } catch(ignore) {
            }
        },

        onMouseOver: function(event) {
            try {
                this.fireMouseover($tx.element(event));
                this.fireJobs(Trex.Ev.__CANVAS_PANEL_MOUSEOVER, event);
            } catch (ignore) {
            }
        },

        onMouseMove: function(event) {
            try {
                this.fireJobs(Trex.Ev.__CANVAS_PANEL_MOUSEMOVE, event);
            } catch (ignore) {
            }
        },

        onMouseOut: function(event) {
            try {
                this.fireJobs(Trex.Ev.__CANVAS_PANEL_MOUSEOUT, event);
            } catch (ignore) {
            }
        },

        onMouseDown: function(event) {
            this.getProcessor().clearDummy();
            try {
                this.fireElements($tx.element(event));
            } catch(ignore) {
            }
            this.fireJobs(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, event);
            var history = this.history;
            history.saveHistoryIfEdited();
        },

        onMouseUp: function(event) {
            try {
                var self = this;
                self.fireJobs(Trex.Ev.__CANVAS_PANEL_MOUSEUP, event);
                setTimeout(function() {
                    var googRange = self.getProcessor().createGoogRange();
                    if (googRange) {
                        self.fireJobs(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, googRange);
                    }
                }, 20);
            } catch(ignore) {
            }
        },

        mayAttachmentChanged: _FALSE,

        onClick: function(event) {
            this.fireJobs(Trex.Ev.__CANVAS_PANEL_CLICK, event);
        },

        onDoubleClick: function(event) {
            this.fireJobs(Trex.Ev.__CANVAS_PANEL_DBLCLICK, event);
        },

        onScroll: function(event) {
            this.fireJobs(Trex.Ev.__CANVAS_PANEL_SCROLLING, event);
        },
		
		onPaste: function(event) {
			this.fireJobs(Trex.Ev.__CANVAS_PANEL_PASTE, event);
		},

        // TODO rename query status 라는 말 말고 다른 말 없을까?
        triggerQueryStatus: function() {
            this.cancelReservedQueryStatusTrigger();
            this.reserveQueryStatusTrigger();
        },

        reserveQueryStatusTrigger: function() {
            var self = this;
            this.reservedQueryStatusTrigger = setTimeout(function() {
                var googRange = self.getProcessor().createGoogRange();
                if (googRange) {
                    self.fireJobs(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, googRange);
                    self.fireElements(self.getProcessor().getNode());
                }
            }, 20); // IE의 경우 canvas.execute 에서 setTimeout 처리 하기 때문에, execute 뒤에 부르는 syncProperty가 그 뒤에 실행되게 하려고 20ms 딜레이 준다....
        },

        cancelReservedQueryStatusTrigger: function() {
            if (this.reservedQueryStatusTrigger) {
                clearTimeout(this.reservedQueryStatusTrigger);
            }
        },

        /**
         * @depreacated use canvas.triggerQueryStatus();
         */
        syncProperty: function() {
            this.triggerQueryStatus();
        }
    });

})(Trex);

Trex.module("bind canvas events for close external menus",
	function(editor, toolbar, sidebar, canvas/*, config*/) {
		var _shouldCloseMenus = function () {
			editor.fireJobs(Trex.Ev.__SHOULD_CLOSE_MENUS);
		};
		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_CLICK, _shouldCloseMenus);
		canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_CLICK, _shouldCloseMenus);
		canvas.observeJob(Trex.Ev.__CANVAS_TEXT_PANEL_CLICK, _shouldCloseMenus);
	}
);

Trex.module("make getter for 'iframeheight' and 'iframetop' size",
    function(editor, toolbar, sidebar, canvas/*, config*/) {
        var _iframeHeight = 0;
        var _iframeTop = 0;

        function resetIframeAttributes() {
            var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
            _iframeHeight = _wysiwygPanel.getPanelHeight().parsePx();
            var _position = $tom.getPosition(_wysiwygPanel.el);
            _iframeTop = _position.y;
        }

        // canvas resize
        canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(height) {
            resetIframeAttributes();
        });
        canvas.observeJob(Trex.Ev.__CANVAS_FULL_SCREEN_CHANGE, function() {
            resetIframeAttributes();
        });
        canvas.observeJob(Trex.Ev.__CANVAS_NORMAL_SCREEN_CHANGE, function() {
            resetIframeAttributes();
        });
        canvas.observeJob('canvas.apply.background', function() {
            resetIframeAttributes();
        });
        canvas.observeJob('canvas.apply.letterpaper', function() {
            resetIframeAttributes();
        });
        canvas.reserveJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
            resetIframeAttributes();
        },300);

        // attachbox change ui
        var attachbox = editor.getAttachBox();
        attachbox.observeJob(Trex.Ev.__ATTACHBOX_FULLSCREEN_SHOW, function() {
            resetIframeAttributes();
        });
        attachbox.observeJob(Trex.Ev.__ATTACHBOX_FULLSCREEN_HIDE, function() {
            resetIframeAttributes();
        });

        // window resize
        $tx.observe(_WIN, 'resize', function(){
            resetIframeAttributes();
        });

        // create interface
        canvas.getIframeHeight = function(){
            return _iframeHeight;
        };
        canvas.getIframeTop = function(){
            return _iframeTop;
        };
    }
);

Trex.module("sync attachment data periodically", function(editor, toolbar, sidebar, canvas/*, config*/) {
    setTimeout(function() {
        setInterval(function() {
            if (canvas.mayAttachmentChanged) {
                // TODO 굳이 event 를 이용할 필요없이 바로 호출해줘도 될 것 같다.
                canvas.fireJobs(Trex.Ev.__CANVAS_PANEL_DELETE_SOMETHING);
                canvas.mayAttachmentChanged = _FALSE;
            }
        }, 3000);
    }, 10000);
});

Trex.module("synchronize the font style when caret is in end of paragraph", function(editor, toolbar, sidebar, canvas/*, config*/) {
    // only gecko #FTDUEDTR-1415
    $tx.gecko && canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(ev){
        if (canvas.isWYSIWYG()) {
            var clickEl = ev.target;
            var isParagraph = clickEl instanceof HTMLParagraphElement;
            var isHtml = clickEl instanceof HTMLHtmlElement;
            if (!isParagraph && !isHtml) {
                return;
            }

            var processor = canvas.getProcessor();
            var x = ev.pageX,
                y = ev.pageY;

            var caret = processor.doc.caretPositionFromPoint(x, y);
            var node = caret && caret.offsetNode;
            var des = node && $tom.descendants(node, '#text');
            if (!des || !des.length) {
                return;
            }

            var lastTextNode = des[des.length-1];
            if (lastTextNode) {
                var newRange = processor.createGoogRangeFromNodes(lastTextNode, lastTextNode.length, lastTextNode, lastTextNode.length);
                newRange.select();
            }
        }
    });
});

// FTDUEDTR-1431
Trex.module("apply respectVisibilityInDesign for old IE", function(editor, toolbar, sidebar, canvas, config) {
    var isOldIE = ($tx.msie && ($tx.msie_docmode < 9));
    isOldIE && canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function(oldMode, newMode){
        changeVisibilityValue();
    });
    isOldIE && canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(ev){
        changeVisibilityValue();
    });

    var COMMAND_API = 'RespectVisibilityInDesign';
    function changeVisibilityValue() {
        if (canvas.isWYSIWYG()) {
            var processor = canvas.getProcessor();
            var state = processor.doc.queryCommandState(COMMAND_API);
            var configFlag = canvas.config.respectVisibilityInDesign;

            if (state != configFlag) {
                processor.doc.execCommand(COMMAND_API, false, configFlag);
                console.log('RespectVisibilityInDesign ', configFlag);
            }
        }
    }
});