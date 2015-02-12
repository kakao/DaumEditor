(function() {
	/**
	 * wysiwyg 영역의 컨텐츠를 수정, 관리하기 위한 클래스로,
	 * 편집 영역에 해당하는 iframe 객체에 접근하여 이벤트를 부여하거나 속성 값들을 읽거나 변경한다.
	 *
	 * @class
	 * @extends Trex.Canvas.BasedPanel
	 * @param {Object} canvas
	 * @param {Object} config - canvas의 config
	 */
	Trex.Canvas.WysiwygPanel = Trex.Class.create(/** @lends Trex.Canvas.WysiwygPanel.prototype */{
		/** @ignore */
		$extend: Trex.Canvas.BasedPanel,


		/** @ignore */
		$const: {
			/** @name Trex.Canvas.WysiwygPanel.__MODE */
			__MODE: Trex.Canvas.__WYSIWYG_MODE,
			EVENT_BINDING_DELAY: 500
		},


		initialize: function(canvas, canvasConfig) {
			this.$super.initialize(canvas, canvasConfig);

			this.canvasConfig = canvasConfig;
			this.iframe = this.el;
			this.wysiwygWindow = this.iframe.contentWindow;
			this.onceWysiwygFocused = false;

			var self = this;
			var iframeLoader = new Trex.WysiwygIframeLoader(this.iframe, canvasConfig.wysiwygCatalystUrl, canvasConfig.doctype);
			iframeLoader.load(function(doc) {
				self.wysiwygDoc = doc;

				self.initializeSubModules(doc);
				installHyperscript(self.wysiwygWindow, self.wysiwygDoc);
				self.makeEditable();
				self.applyBodyStyles(self.canvasConfig.styles);
				self.applyCustomCssText(self.canvasConfig.customCssText);
				self.clearContent();
				self.bindEvents(canvas);
				Editor.__PANEL_LOADED = _TRUE;

				$tx.observe(self.wysiwygWindow, 'focus', function onWysiwygFocused() {
					if (!self.onceWysiwygFocused) {
						self.onceWysiwygFocused = true;
					}
				});
                if ($tx.msie_nonstd) {
                    var htmlEl = self.wysiwygDoc.getElementsByTagName('html');
                    if (htmlEl && htmlEl[0]) {
                        $tx.observe(htmlEl[0], 'click', function (event) {
                            var target = $tx.element(event);
                            if (canvas.canHTML() && htmlEl[0] == target) {
                                self.focus();
                            }
                        });
                    }
                }
				canvas.fireJobs(Trex.Ev.__IFRAME_LOAD_COMPLETE, doc);
			});

		},
        _bodyHeight : 0,
        _bodyContentHeight : 0,

		initializeSubModules: function(doc) {
			var win = this.wysiwygWindow;
			this.processor = new Trex.Canvas.ProcessorP(win, doc);
			this.webfontLoader = new Trex.WebfontLoader(doc, this.canvasConfig);
		},


		/**
		 * WYSIWYG 영역 iframe을 편집 가능한 상태로 변경한다.
		 */
		makeEditable: function () {
			if (this.canvasConfig.readonly) {
				return;
			}

			if (this.wysiwygDoc.body.contentEditable) {
				this.wysiwygDoc.body.contentEditable = _TRUE;
			} else {
				var self = this;
				setTimeout(function () {
					try {
						self.wysiwygDoc.designMode = "On";
						if ($tx.gecko) {
							self.wysiwygDoc.execCommand("enableInlineTableEditing", _FALSE, _FALSE);
						}
					} catch (e) {
						self.designModeActivated = _FALSE;
					}
				}, 10);
			}
		},

		/**
		 * panel의 이름을 리턴한다.
		 * @function
		 * @returns {String} 'html'
		 */
		getName: function() {
			return this.constructor.__MODE;
		},


		/**
		 * wysiwyg 영역의 window 객체를 넘겨준다.
		 * @function
		 * @returns {Element} wysiwyg 영역의 window 객체
		 */
		getWindow: function() {
			return this.wysiwygWindow;
		},


		/**
		 * wysiwyg 영역의 document 객체를 넘겨준다.
		 * @function
		 * @returns {Element} wysiwyg 영역의 document 객체
		 */
		getDocument: function() {
			return this.wysiwygDoc;
		},


		/**
		 * wysiwyg 영역에 쓰여진 컨텐츠를 얻어온다.
		 * @function
		 * @returns {String} 컨텐츠 문자열
		 */
		getContent: function() {
			return this.wysiwygDoc.body.innerHTML;
		},


		/**
		 * wysiwyg 영역의 컨텐츠를 주어진 문자열로 수정한다.
		 * @function
		 * @param {String} contentHTML - 컨텐츠
		 */
		setContent: function(contentHTML) {
			contentHTML = this.doPreFilter(contentHTML);
			this.setBodyHTML(contentHTML);
			this.doPostFilter(this.wysiwygDoc.body);
		},

		doPreFilter: function(contentHTML) {
			if (contentHTML) {
				contentHTML = removeWordJoiner(contentHTML);
				contentHTML = preventRemovingNoScopeElementInIE(contentHTML);
			}
			return contentHTML;
		},

		setBodyHTML: function(content) {
			this.wysiwygDoc.body.innerHTML = content || $tom.EMPTY_PARAGRAPH_HTML;
		},

		doPostFilter: function(body) {
			makeEmptyParagraphVisibleInIE(body);
		},


		/**
		 * 편집 문서 body의 HTML을 모두 지우고 기본 마크업을 세팅한다.
		 */
		clearContent: function() {
			this.setContent("");
		},


		/**
		 * 현재 wysiwyg 영역의 수직 스크롤 값을 얻어온다.
		 * @function
		 * @returns {Number} 수직 스크롤 값
		 */
		getScrollTop: function() {
			return $tom.getScrollTop(this.wysiwygDoc);
		},


		/**
		 * wysiwyg 영역의 수직 스크롤 값을 셋팅한다.
		 * @function
		 * @param {Number} scrollTop - 수직 스크롤 값
		 */
		setScrollTop: function(scrollTop) {
			$tom.setScrollTop(this.wysiwygDoc, scrollTop);
		},


		/**
		 * 현재 wysiwyg 영역의 수평 스크롤 값을 얻어온다.
		 * @function
		 * @returns {Number} 수평 스크롤 값
		 */
		getScrollLeft: function() {
			return $tom.getScrollLeft(this.wysiwygDoc);
		},


		/**
		 * 생성된 Processor 객체를 리턴한다.
		 * @function
		 * @returns {Object} Processor 객체
		 */
		getProcessor: function() {
			return this.processor;
		},


		/**
		 * 만약 processor 객체가 준비되었다면 processor 객체를 argument로 넘기며 주어진 함수를 수행한다.
		 * @param fn {function} processor 객체를 argument로 받아 실행할 함수
		 */
		ifProcessorReady: function(fn) {
			if (this.processor) {
				fn(this.processor);
			}
		},


		/**
		 * 스타일명으로 wysiwyg 영역의 스타일 값을 얻어온다.
		 * @function
		 * @param {String} name - 스타일명
		 * @returns {String} 해당 스타일 값
		 */
		getStyle: function(name) {
			return $tx.getStyle(this.wysiwygDoc.body, name);
		},


		/**
		 * wysiwyg 영역에 스타일을 적용한다.
		 * @function
		 * @param {Object} styles - 적용할 스타일
		 */
		addStyle: function(styles) {
			$tx.setStyleProperty(this.wysiwygDoc.body, styles);
		},


		/**
		 * 주어진 문서의 body element 에 CSS 속성을 지정한다. 단 폰트 관련 속성은 제외한다.
		 * @param doc {HTMLDocument}
		 * @param styles {Object} key: value 형태의 CSS property 모음
		 */
		setBodyStyle: function(doc, styles) {
			var excluded = excludeNotAllowed(styles);
			$tx.setStyleProperty(doc.body, excluded);
		},


		/**
		 * 주어진 문서에 폰트 관련 CSS 속성을 지정한다
		 * @param doc {HTMLDocument}
		 * @param styles {Object} key: value 형태의 CSS property 모음
		 */
		setFontStyle: function(doc, styles) {
			var extendedStyles = Object.extend(styles, {
				'browser': $tx.browser,
				'pMarginZero': this.canvasConfig.pMarginZero ? "true" : "false"
			});
			var cssText = new Template([
				"#{if:pMarginZero=='true'}p { margin:0; padding:0; }#{/if:pMarginZero}",
				"body, td, button { color:#{color}; font-size:#{fontSize}; font-family:#{fontFamily}; line-height:#{lineHeight}; }",
				"a, a:hover, a:link, a:active, a:visited { color:#{color}; }",
				"div.txc-search-border { border-color:#{color}; }",
				"div.txc-search-opborder { border-color:#{color}; }",
				"img.tx-unresizable { width: auto !important; height: auto !important; }",
				"button a { text-decoration:none #{if:browser=='firefox'}!important#{/if:browser}; color:#{color} #{if:browser=='firefox'}!important#{/if:browser}; }"
			].join("\n")).evaluate(extendedStyles);
			$tx.applyCSSText(doc, cssText);
		},


		applyBodyStyles: function(styles) {
			var doc = this.wysiwygDoc;
			try {
				this.setFontStyle(doc, styles);
				this.setBodyStyle(doc, styles);
			} catch(e) {
			}
		},
		
		applyCustomCssText: function (cssText) {
			if (!cssText) {
				return;
			}
			var doc = this.wysiwygDoc;
			try {
				$tx.applyCSSText(doc, cssText);
			} catch (ignore) {}
		},
		
		setRule: function (selector, value) {
			var styleElem, sheet, rules;
			try {
				styleElem = this.wysiwygDoc.getElementById("txStyleForSetRule");
				sheet = styleElem.sheet ? styleElem.sheet : styleElem.styleSheet;
				rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
				if (sheet.insertRule) { // all browsers, except IE before version 9
					if (0 < rules.length) {
						sheet.deleteRule(0);
					}
					if (selector) {
						sheet.insertRule(selector + "{" + value + "}", 0);
					}
				} else { // Internet Explorer before version 9
					if (sheet.addRule) {
						if (0 < rules.length) {
							sheet.removeRule(0);
						}
						if (selector) {
							sheet.addRule(selector, value, 0);
						}
					}
				}
			} catch (ignore) {}
		},

		/**
		 * iframe에서 발생하는 각종 event 들을 observing 하기 시작한다.
		 */
		bindEvents: function(canvas) {
			var eventBinder = new Trex.WysiwygEventBinder(this.wysiwygWindow, this.wysiwygDoc, canvas, this.processor);
			setTimeout(function() {
				eventBinder.bindEvents();
			}, this.constructor.EVENT_BINDING_DELAY); // why delay 500ms?
		},


		/**
		 * panel 엘리먼트를 가지고 온다.
		 * @function
		 */
		getPanel: function(config) {
			var id = config.initializedId || "";
			return $must("tx_canvas_wysiwyg" + id, "Trex.Canvas.WysiwygPanel");
		},
        //#1454
        setHeightBody: function(height){
            var body = this.wysiwygWindow.document.body;
            var marginPaddingTop = parseInt($tx.getStyle(body, 'margin-top')) + parseInt($tx.getStyle(body, 'padding-top'));
            var marginPaddingBottom = parseInt($tx.getStyle(body, 'margin-bottom')) + parseInt($tx.getStyle(body, 'padding-bottom'));
            height = parseInt(height) - marginPaddingTop - marginPaddingBottom;
            body.style.height = height.toPx();
            this._bodyHeight = height;
        },

        setPanelHeight: function(height) {
            var self = this;
            function timesTry(n){
                if(n === 0) return;
                try{
                    self.setHeightBody(height);
                }catch(e){
                    setTimeout(timesTry.bind(this, n-1), 30);
                }
            }
            //초기화 중에 body가 초기화 되지 않았기 때문에 body가 오류날 확률이 있음. 10번 시도 하는 로직 추가
            timesTry(10);
            self.$super.setPanelHeight(height);
        },


		/**
		 * panel 엘리먼트를 감싸고 있는 wrapper 엘리먼트를 가지고 온다.
		 * @function
		 */
		getHolder: function(config) {
			var id = config.initializedId || "";
			return $must("tx_canvas_wysiwyg_holder" + id, "Trex.Canvas.WysiwygPanel");
		},


		/**
		 * wysiwyg 영역에 포커스를 준다.
		 * @function
		 */
		focus: function() {
			this.ifProcessorReady(function(processor) {
				processor.focus();
			});
		},

		ensureFocused: function () {
			if (!this.onceWysiwygFocused) {
				this.onceWysiwygFocused = true;
				this.focus();
			}
		},

		/**
		 * wysiwyg panel을 보이게한다.
		 * @function
		 */
		show: function() {
			this.$super.show();
			this.ifProcessorReady(function(processor) {
				setTimeout(function() {
					try {
						processor.focusOnTop(); //한메일에서 모드 변경시 focus 제일 위로 가게함.. (주의: 현재 다른 서비스는 Bottom 으로 되어있음)
					} catch(e) {
					}
				}, 100);
			});
		},


		/**
		 * wysiwyg panel을 감춘다.
		 * @function
		 */
		hide: function() {
			this.ifProcessorReady(function(processor) {
				processor.blur();
			});
			this.$super.hide();
		},


		/**
		 * 컨텐츠를 파싱하여 사용되고 있는 웹폰트가 있으면, 웹폰트 css를 로딩한다.<br/>
		 * 로딩속도를 향상시키기 위해 본문을 파싱하여 웹폰트를 사용할 경우에만 동적으로 웹폰트 CSS를 호출한다.
		 * @function
		 * @param {String} content - 컨텐츠
		 */
		includeWebfontCss: function(content) {
			this.webfontLoader.load(content);
		},


		/**
		 * 본문에 사용된 웹폰트명 목록을 리턴한다.
		 * @function
		 * @returns {Array} 사용하고 있는 웹폰트명 목록
		 */
		getUsedWebfont: function() {
			return this.webfontLoader.getUsed();
		},


		/**
		 * 특정 노드의 wysiwyg 영역에서의 상대 위치를 얻어온다.
		 * @function
		 * @param {Element} node - 특정 노드
		 * @returns {Object} position 객체 { x: number, y: number, width: number, height: number }
		 */
		getPositionByNode: function(node) {
			var wysiwygRelative = new Trex.WysiwygRelative(this.iframe);
			return wysiwygRelative.getRelative(node);
		}
	});

	function excludeNotAllowed(style) {
		var notAllowed = ["color", "fontSize", "fontFamily", "lineHeight"];
		var excluded = Object.clone(style);
		for (var i = 0; i < notAllowed.length; i++) {
			delete excluded[notAllowed[i]];
		}
		return excluded;
	}

	function removeWordJoiner(content) {
		return content.replace(Trex.__WORD_JOINER_REGEXP, "");
	}

	/*
	 * NOTE: FTDUEDTR-900
	 */
	function preventRemovingNoScopeElementInIE(markup) {
		if ($tx.msie) {
			markup = markup.replace(/(<script|<style)/i, Trex.__WORD_JOINER + "$1");
		}
		return markup;
	}

	/*
	 * IE에서 빈 p 엘리먼트는 높이를 갖지 않고 화면에 표시되지 않는다. 따라 빈 문단 표시를 위하여 <P>&nbsp;</P> 를
	 * 사용하는 데, 편집시에는 &nbsp;가 빈칸 한칸으로서 자리를 차지하여 걸리적 거리므로 이를 제거하여 준다.
	 * 이와 같이 contentEditable 환경에서 &nbsp; 를 주었다가 빼면 빈 엘리먼트임에도 불구하고 문단으로서 높이를 유지한다.
	 *
	 * 의문 1.
	 *  그런데 LI는 왜 하는 걸까 -_-^
	 * 의문 2.
	 *	<P></P> 를 하나의 문단으로 여기고 높이를 잡아주는 게 맞을까? 글 조회시에는 표시 되지 않을텐데...
	 *	편집시와 조회시 불일치 발생한다.
	 *	참고 이슈 #FTDUEDTR-1121
	 * 의문 3.
	 *	저장시 빈 문단에 &nbsp;를 다시 넣어주는 듯 한데, 어디서 해주는 걸까
	 * @param body
	 */
	function makeEmptyParagraphVisibleInIE(body) {
		if ($tx.msie_nonstd) {
			var pNodes = $tom.collectAll(body, 'p,li');
			for (var i = 0, len = pNodes.length; i < len; i++) {
				var node = pNodes[i];
				if ($tom.getLength(node) === 0 && node.tagName.toLowerCase() !== 'p') { //#FTDUEDTR-1121
					try {
						node.innerHTML = '&nbsp;';
					} catch(ignore) {
					}
				}
				if ($tom.getLength(node) === 1 && node.innerHTML === '&nbsp;') {
					node.innerHTML = '';
				}
			}
		}
	}
})();

Trex.module("canvas set focus on mousedown event. only IE.",
    function(editor, toolbar, sidebar, canvas, config) {
        if (!$tx.msie_std) {
            return;
        }

        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(ev){
            if ($tx.isLeftClick(ev)) {
                var tagName = $tx.element(ev).tagName;
                if (tagName.toLocaleLowerCase() == 'html') {
                    canvas.focusOnBottom();
                }
            }
        });
});

Trex.module("auto body resize",
    function(editor, toolbar, sidebar, canvas, config){
        canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
            var beforeHTML = '';
            var bodyHeight = 0;
            var _panel = canvas.getPanel('html');
            bodyHeight = _panel._bodyHeight;
            canvas.observeJob('canvas.height.change', function(h){
                bodyHeight = parseInt(_panel._bodyHeight);
            });

            function _resize(){
                if(!canvas.isWYSIWYG()) return;
                var _doc = _panel.getDocument();
                var _body = _doc.body;
                var _html = _body.innerHTML;
                if(beforeHTML === _html) return;
                beforeHTML = _html;
                _body.style.height = '';
                var _h = $tx.getDimensions(_body).height;
                _panel._bodyContentHeight = _h;
                if(_h<bodyHeight) {
                    _body.style.height = bodyHeight.toPx();
                }
            }
            setInterval(_resize, 200);
        });
    }
);


