/*jslint nomen:false,onevar:false*/
/*global Trex,TrexMessage,$tx,$tom,$A,Editor*/
/*global showAttachBox,hideAttachBox,
	showFullScreen,showNormalScreen,resizeScreen*/
(function () {
	var _DOC = document, _WIN = window, _DOC_EL = _DOC.documentElement, 
		_FALSE = false, _TRUE = true, _NULL = null, _UNDEFINED;
	
	Trex.Class.overwrite(Trex.Tool.FullScreen, {
		oninitialized: function () {
			var _editor = this.editor, _config = this.config;
			
			var _wrapper = _editor.getWrapper();
			if (!_wrapper) {
				return;
			}
			
			var _fullscreen;
			var _toolHandler = function () {
				if (!_fullscreen) {
					_fullscreen = new Trex.FullScreen(_editor, _config);
				}
				_fullscreen.execute();
			};
			this.executeTool = _toolHandler;
			
			if (_config.switched) { //기본이 전체화면
				if (!_fullscreen) {
					_fullscreen = new Trex.FullScreen(_editor, _config);
				}
				_fullscreen.showFullScreen();
			}
			
			this.resetWeave();
			this.weave.bind(this)(new Trex.Button(this.buttonCfg), _NULL, _toolHandler);
			
			this.bindKeyboard({ // ctrl + m - 넓게쓰기
				ctrlKey: _TRUE,
				keyCode: 77
			}, _toolHandler);
			
			_editor.observeKey({ // ctrl + m - 넓게쓰기
				ctrlKey: _TRUE,
				altKey: _FALSE,
				shiftKey: _FALSE,
				keyCode: 77
			}, _toolHandler);
		}
	});


	TrexMessage.addMsg({
		'@fullscreen.attach.close.btn': "파일첨부박스",
		'@fullscreen.noti.btn': "일반 글쓰기로",
		'@fullscreen.noti.span': "넓게쓰기 버튼을 다시 누르시면 처음 글쓰기 창 크기로 돌아갑니다."
	});
	
	Trex.MarkupTemplate.add('fullscreen.notice', '<div class="tx-fullscreen-notice"><span>@fullscreen.noti.span</span><a href="#">@fullscreen.noti.btn</a></div>');
	Trex.MarkupTemplate.add('fullscreen.linebox', '<div class="tx-fullscreen-line">' +
	'<div class="tx-fullscreen-line-division">' +
	'<div class="tx-fullscreen-line-left">&nbsp;</div>' +
	'<div class="tx-fullscreen-line-right">&nbsp;</div>' +
	'</div>' +
	'<div class="tx-fullscreen-line-box">' +
	'<div class="tx-fullscreen-line-left">&nbsp;</div>' +
	'<div class="tx-fullscreen-line-right">&nbsp;</div>' +
	'<a href="#">@fullscreen.attach.close.btn</a>' +
	'</div>' +
	'</div>');
	Trex.FullScreen = Trex.Class.create({
		initialize: function (editor, config) {
			if (!editor) {
				return;
			}
			this.isInit = _FALSE;
			this.isFullScreen = _FALSE;
			
			this.editor = editor;
			this.rootConfig = this.editor.initialConfig;
			this.wrapper = editor.getWrapper();
			
			this.canvas = editor.getCanvas();
			this.toolbar = editor.getToolbar();
			this.attachBox = editor.getAttachBox();
			
			this.elSavedHiddens = [];
			this.minHeight = config.minHeight;
			this.minWidth = config.minWidth;
			
			this.useAttachBox = (!!this.attachBox.elBox);
			this.isAttachBoxDisplay = _FALSE;
			
			var self = this;
			this.resizeHandler = function () {
				if (self.isFullScreen) {
					self.resizeContainer();
				}
			};
			this.toolbar.observeJob(Trex.Ev.__CMD_ADVANCED_FOLD, this.resizeHandler);
			this.toolbar.observeJob(Trex.Ev.__CMD_ADVANCED_SPREAD, this.resizeHandler);
			if (typeof showAttachBox === "function") {
				this.showAttachBoxAtServiceForSave = showAttachBox; //NOTE: fullscreen 모드에서는 다른 모양의 첨부박스를 사용한다.
			}
			if (typeof hideAttachBox === "function") {
				this.hideAttachBoxAtServiceForSave = hideAttachBox; //NOTE: fullscreen 모드에서는 다른 모양의 첨부박스를 사용한다.
			}
		},
		execute: function () {
			if (this.isFullScreen) {
				this.showNormalScreen();
			} else {
				this.showFullScreen();
			}
		},
		onAttachClick: function () {
			this.attachClickHandler(!this.isAttachBoxDisplay);
			this.resizeContainer();
		},
		attachClickHandler: function (isAttachBoxDisplay) {
			if (isAttachBoxDisplay) {
				this.showAttachBox();
                this.attachBox.fireJobs(Trex.Ev.__ATTACHBOX_FULLSCREEN_SHOW);
			} else {
				this.hideAttachBox();
                this.attachBox.fireJobs(Trex.Ev.__ATTACHBOX_FULLSCREEN_HIDE);
			}
		},
		showNormalScreen: function () {
			if (!this.isFullScreen) {
				return;
			}

			this._showScrollbar();

			//Service Specific
			this.showNormalScreenAtService();

			var _wrapper = this.wrapper;
			if (!_wrapper) {
				return;
			}

			_wrapper.style.width = '';
			$tx.removeClassName(_wrapper, 'tx-editor-fullscreen');

			this.elSavedHiddens.each(function (el) {
				el.style.visibility = 'visible';
			});

			if (parent) {
				try {
					$tx.stopObserving(parent, 'resize', this.resizeHandler);
				} catch (e) {
				}
			} else {
				$tx.stopObserving(window, 'resize', this.resizeHandler);
			}

			this.canvas.setCanvasSize({
				height: this.panelNormalHeight.toPx()
			});

			//첨부파일박스
			if (this.useAttachBox) {
				this.attachClickHandler(this.attachBox.checkDisplay());
			}

			//NOTE: Service Specific
			if (this.showAttachBoxAtServiceForSave) {
				_WIN.showAttachBox = this.showAttachBoxAtServiceForSave;
			}
			if (this.hideAttachBoxAtServiceForSave) {
				_WIN.hideAttachBox = this.hideAttachBoxAtServiceForSave;
			}
			
			var length = this.relativeParents.length;
			for (var i = 0; i < length; i += 1) {
				var element = this.relativeParents.pop();
				var value = this.relativeValues.pop();
				$tx.setStyle(element, {
					position: value
				});
			}
			
			this.isFullScreen = _FALSE;
			if (!$tx.msie) {
				var btnElemId = "tx_fullscreen" + this.rootConfig.initializedId;
				setTimeout(function () {
					var _elIcon = $tom.collect($tx(btnElemId), "a");
					_elIcon.focus();
				}, 500);
			}

            this.canvas.fireJobs(Trex.Ev.__CANVAS_NORMAL_SCREEN_CHANGE);
		},
		showFullScreen: function () {
			var self = this;
			if (this.isFullScreen) {
				return;
			}
			
			if (!this.isInit) {
				this.generate();
			}
			
			this._hideScrollbar();
			
			//Service Specific
			this.showFullScreenAtService();
			if (this.showAttachBoxAtServiceForSave) {
				_WIN.showAttachBox = function () {
					self.showAttachBox();
					self.resizeContainer();
				};
			}
			if (this.hideAttachBoxAtServiceForSave) {
				_WIN.hideAttachBox = function () {
					self.hideAttachBox();
					self.resizeContainer();
				};
			}
			
			var _wrapper = this.wrapper;
			
			if (!_wrapper) {
				return;
			}
			$tx.addClassName(_wrapper, 'tx-editor-fullscreen');
			
			//Hide select,activeX 
			var _savedHiddens = [];
			["select", "embed", "object"].each(function (name) {
				var _elHdns = $A(_DOC.getElementsByTagName(name));
				_elHdns.each(function (el) {
					el.style.visibility = 'hidden';
					_savedHiddens.push(el);
				});
			});
			this.elSavedHiddens = _savedHiddens;
			
			//attach file box
			if (this.useAttachBox) {
				this.attachClickHandler(this.attachBox.checkDisplay());
			}
			
			var _panel = this.canvas.getCurrentPanel();
			this.panelNormalHeight = _panel.getPosition().height;
			
			if (window.parent) {
				$tx.observe(window.parent, 'resize', this.resizeHandler);
			} else {
				$tx.observe(window, 'resize', this.resizeHandler);
			}
			
			// make trace element and move container to body's direct child
			_WIN.wrapper = _wrapper;
			this.relativeParents = [];
			this.relativeValues = [];
			var parentOfWarpper = _wrapper.offsetParent;
			while (parentOfWarpper && parentOfWarpper.tagName && parentOfWarpper.tagName !== "HTML" && parentOfWarpper.tagName !== "BODY") {
				var position = $tx.getStyle(parentOfWarpper, "position");
				if (position.toLowerCase() === "relative") {
					this.relativeParents.push(parentOfWarpper);
					this.relativeValues.push(position);
					$tx.setStyle(parentOfWarpper, {
						position: "static"
					});
				}
				parentOfWarpper = parentOfWarpper.offsetParent;
			}
			
			this.isFullScreen = _TRUE;
			this.resizeContainer();

            this.canvas.fireJobs(Trex.Ev.__CANVAS_FULL_SCREEN_CHANGE);
		},
		_hideScrollbar: function () {
			if (_DOC_EL.scrollTop || _DOC_EL.scrollLeft) {
				_DOC_EL.scrollTop = 0;
				_DOC_EL.scrollLeft = 0;
			}
			if (_DOC.body.scrollTop || _DOC.body.scrollLeft) {
				_DOC.body.scrollTop = 0;
				_DOC.body.scrollLeft = 0;
			}
			_DOC_EL.style.overflow = 'hidden'; //Remove basic scrollbars
			_DOC.body.style.overflow = 'hidden';
		},
		_showScrollbar: function () {
            if ($tx.msie && $tx.msie_ver <= 8) {
                // FTDUEDTR-1453
                setTimeout(function(){
                    _DOC_EL.style.overflow = '';
                    _DOC.body.style.overflow = '';
                }, 50);
            } else {
                _DOC_EL.style.overflow = '';
                _DOC.body.style.overflow = '';
            }
		},
		generate: function () {
			if (this.isInit) {
				return;
			}
			if (!this.wrapper) {
				return;
			}
			this.generateNoti();
			this.generateLineBox();
			this.isInit = _TRUE;
		},
		generateNoti: function () {
			var self = this;
			var _elNoti = Trex.MarkupTemplate.get("fullscreen.notice").evaluateAsDom({});
			$tom.insertFirst(this.wrapper, _elNoti);
			
			var _elNotiBtn = $tom.collect(_elNoti, 'a');
			$tx.observe(_elNotiBtn, 'click', function () {
				if (self.isFullScreen) {
					self.showNormalScreen();
				} else {
					self.showFullScreen();
				}
			});
		},
		generateLineBox: function () {
			if (!this.useAttachBox) {
				return;
			}
			
			var _elCanvas = this.canvas.elContainer;
			
			var _elLine = Trex.MarkupTemplate.get("fullscreen.linebox").evaluateAsDom({});
			$tom.insertNext(_elLine, _elCanvas);
			
			var _attr = {
				className: "tx-fullscreen-line-box"
			};
			if ($tx.msie_ver <= '5.5') {
				_attr.align = "center";
			}
			
			var _elLineBox = $tom.collect(_elLine, 'div.tx-fullscreen-line-box');
			if ($tx.msie_ver <= '5.5') {
				_elLineBox.align = "center";
			}
			
			var _elLineBtn = $tom.collect(_elLineBox, "a");
			this.elLineBtn = _elLineBtn;
			$tx.observe(_elLineBtn, 'click', this.onAttachClick.bind(this));
		},
		getAttachBoxPosition: function () {
			if (this.isAttachBoxDisplay) {
				return $tom.getPosition(this.attachBox.elBox);
			} else {
				return {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				};
			}
		},
		getPostAreaBoxPosition: function () {
			var elem = $tx("tx_fullscreen_post_area");
			if (elem) {
				return $tx.getDimensions(elem);
			} else {
				return {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				};
			}
		},
		resizeContainer: function () {
			if (!this.isFullScreen) {
				return _FALSE;
			}
			this.resizeScreenAtService();
			
			var panelHeight, panelWidth;
			panelHeight = this.getPanelHeight();
			this.canvas.setCanvasSize({
				height: panelHeight.toPx()
			});
			if (this.wrapper) {
				panelWidth = this.getPanelWidth();
				this.wrapper.style.width = panelWidth.toPx();
			}
			return _TRUE;
		},
		getPanelHeight: function () {
			var _panelHeight = 0;
			
			var _panelPosY = this.canvas.getCanvasPos().y;
			var lineHeight = this.useAttachBox ? 17 : 0;
			if (_DOC_EL.clientHeight > 0) {
				_panelHeight = _DOC_EL.clientHeight - _panelPosY - lineHeight;
			} else {
				_panelHeight = _DOC_EL.offsetHeight - _panelPosY - lineHeight;
			}
			
			var _postArea = this.getPostAreaBoxPosition();
			_panelHeight -= _postArea.height;
			
			var _attachBoxPosition = this.getAttachBoxPosition();
			if (_attachBoxPosition.height > 0) {
				_panelHeight -= _attachBoxPosition.height + 20; //cuz margin
			}
			
			return Math.max(_panelHeight, this.minHeight);
		},
		getPanelWidth: function () {
			var _panelWidth = 0;
			if (_DOC_EL.clientWidth > 0) {
				_panelWidth = _DOC_EL.clientWidth;
			} else {
				_panelWidth = _DOC_EL.offsetWidth;
			}
			return Math.max(_panelWidth, this.minWidth);
		},
		showAttachBox: function () {
			if (this.attachBox.useBox) {
				$tx.addClassName(this.elLineBtn, "tx-attach-close");
				$tx.show(this.attachBox.elBox);
				this.isAttachBoxDisplay = _TRUE;
			}
		},
		hideAttachBox: function () {
			if (this.attachBox.useBox) {
				$tx.removeClassName(this.elLineBtn, "tx-attach-close");
				$tx.hide(this.attachBox.elBox);
				this.isAttachBoxDisplay = _FALSE;
			}
		},
		showFullScreenAtService: function () {
			if (typeof showFullScreen === "function") {
				showFullScreen();
			}
		},
		showNormalScreenAtService: function () {
			if (typeof showNormalScreen === "function") {
				showNormalScreen();
			}
		},
		resizeScreenAtService: function () {
			if (typeof resizeScreen === "function") {
				resizeScreen();
			}
		}
	});
	
	var thisToolName = 'fullscreen';
	Editor.forEachEditor(function (editor) {
		editor.getTool()[thisToolName].oninitialized();
	});
	Editor.editorForAsyncLoad.getTool()[thisToolName].executeTool();
}());
