/**
 * @fileoverview
 * DaumEitor의 Entrypoint역할을 하는 source로 Trex.Editor, Editor 를 포함
 */

/**
 * 실제 Editor Implementation, 하지만 Editor 생성 시에는 Class Editor를 사용한다
 *
 * {@link Editor}
 * @class
 * @param {Object} config
 */
Trex.Editor = Trex.Class.create( /** @lends Trex.Editor.prototype */{
	/** @ignore */
	$mixins: [Trex.I.JobObservable, Trex.I.KeyObservable],
	toolbar: _NULL,
	sidebar: _NULL,
	canvas: _NULL,
	config: _NULL,
    initialConfig: _NULL,
	initialize: function(config) {
        this.initialConfig = config;
		var _editor = this, _config = this.config = TrexConfig.setup(config);
		var _canvas = this.canvas = new Trex.Canvas(_editor, _config);
		var _toolbar = this.toolbar = new Trex.Toolbar(_editor, _config);
		var _sidebar = this.sidebar = new Trex.Sidebar(_editor, _config);
		Trex.invokeInstallation(_editor, _toolbar, _sidebar, _canvas, _config);
		
		/* common key event */
		var _evConfig = _config.events;
		var _keyDownHandler = function(ev) {
			if (_evConfig.useHotKey) {
				_editor.fireKeys(ev);
			}
		};
		$tx.observe(_DOC, "keydown", _keyDownHandler.bindAsEventListener(this), _FALSE);

		_canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
			//for hanmail iframe load log.
			var iframeLoadCompleteTime = new Date().getTime();
			var secTime = Math.round((iframeLoadCompleteTime - Editor.initStartTime) / 100) / 10;
			_editor.fireJobs(Trex.Ev.__IFRAME_LOADING_TIME, secTime);//TODO unresolved
			
			var _initializedId = _editor.getInitializedId();
			var _elLoading = $tx("tx_loading" + _initializedId);
			if (!_elLoading) {
				return;
			}
			if (_canvas.mode != Trex.Canvas.__WYSIWYG_MODE) {
				_canvas.fireJobs(Trex.Ev.__CANVAS_MODE_INITIALIZE, Trex.Canvas.__WYSIWYG_MODE, _canvas.mode);
			}
			$tx.hide(_elLoading);
		});
		Trex.invokeRegisters(_editor, _toolbar, _sidebar, _canvas, _config);
		Trex.invokeModules(_editor, _toolbar, _sidebar, _canvas, _config);
	},
	/**
	 * Get toolbar instance
	 * @see Trex.Toolbar
	 */
	getToolbar: function() {
		return this.toolbar;
	},
	/**
	 * Get sidebar instance
	 * @see Trex.Sidebar
	 */
	getSidebar: function() {
		return this.sidebar;
	},
	/**
	 * Get canvas instance
	 * @see Trex.Canvas
	 */
	getCanvas: function() {
		return this.canvas;
	},
	getUsedWebfont: function() {
		return this.canvas.getUsedWebfont();
	},
	/**
	 * Get config instance
	 */
	getConfig: function() {
		return this.config;
	},
    getInitialConfig: function () {
        return this.initialConfig;
    },
	getParam: function(name) {
		var _params = {}, _config = this.config;
		_config.params.each(function(name) {
			if (_config[name]) {
				_params[name] = _config[name];
			}
		});
		return _params[name];
	},
	getWrapper: function() {
        if (!this.initialConfig.wrapper) {
            throw new Error('`wrapper` config variable should be provided');
        }
		return $must(this.initialConfig.wrapper);
	},
	getInitializedId: function() {
		return this.initialConfig.initializedId || "";
	},
	saveEditor: function() {
		this.setDisableUnloadHandler();
		this.getSaver().submit();
	},
	loadEditor: function(data) {
		this.getSaver().load(data);
	},
	/**
	 * Editor에서 작성된 저장하기 위해 parsing된 글의 내용을  가져온다.
	 * @see Trex.Canvas#getContent
	 */
	getContent: function() {
		return this.getSaver().getContent();
	},
	/**
	 * Editor에 첨부된 첨부데이터 리스트를 가져온다.
	 * * @see Trex.Sidebar#getAttachments
	 */
	getAttachments: function(type, all) {
		return this.getSaver().getAttachments(type, all);
	},
	/**
	 * Editor에 삽입된 Embed데이터 리스트를 가져온다.
	 * * @see Trex.Sidebar#getEmbeddedData
	 */
	getEmbeddedData: function(type) {
		return this.getSaver().getEmbeddedData(type);
	},
	/**
	 * Editor에 첨부된 정보첨부 리스트를 가져온다.
	 * * @see Trex.Sidebar#getResults
	 */
	getResults: function(type) {
		return this.getSaver().getResults(type);
	},
	/**
	 * autosaver의 현재 사용중인 key를 가져온다.
	 * * @see Trex.Autosaver#getCurSeq
	 */
	getAutosaveSeq: function(){
		return (this.getAutoSaver && this.getAutoSaver()) ? this.getAutoSaver().getCurSeq() : "0";
	}
});
// Binds helper functions for Editor
(function() {
	/**
	 * Editor
	 *
	 * @example
	 *  new Editor({
	 *  	txService: 'sampleService',
	 *  	txHost: 'sample.daum.net',
	 *  	txPath: 'sampleService',
	 *  	initializedId: 'stringValue',
	 *  	form: 'tx_editor_form'+"$!initializedId"
	 *  });
	 *
	 * @extends Trex.Editor
	 * @class
	 * @param {Object} config
	 */
	_WIN.Editor = Trex.Class.create({
		/** @ignore */
		$const: {
			__ACTIVE: _FALSE,
			__PANEL_LOADED: _FALSE,
			__EDITOR_LOADED: _FALSE,
			__MULTI_LIST: [],
			__SELECTED_INDEX: 0
		},
        _initEditor: function (_editor, config) {
            Editor.__EDITOR_LOADED = _FALSE;
            Editor.__PANEL_LOADED = _FALSE;
            _editor = new Trex.Editor(config);
            var _initializedId = _editor.getInitializedId();
            if (_initializedId != _NULL) {
                var idx = _initializedId == "" ? 0 : _initializedId;
                Editor.__MULTI_LIST[idx] = _editor;
                Editor.__SELECTED_INDEX = idx;
            }
            Object.extend(Editor, _editor);
            Editor.__EDITOR_LOADED = _TRUE;
            Editor.__ACTIVE = _TRUE;
        },
        initialize: function(config) {
			//for hanmail iframe load log.
			if (Trex.hmailLogging) {
				Trex.hmailLogging(config);
			}
			Editor.initStartTime = new Date().getTime();
			
			var _editor = null;

            if (_WIN['DEBUG']) {
                this._initEditor(_editor, config);
            } else {
                try {
                    this._initEditor(_editor, config);
                } catch (e) {
                    if (_editor) {
                        _editor.fireJobs(Trex.Ev.__RUNTIME_EXCEPTION, e);
                    } else {
                        throw 'failed to initialize editor. caused by ' + e;
                    }
                    throw e;
                }
            }
		}
	});
	/**
	 * 글을 수정할 때 저장된 글을 불러온다.
	 * @param {Object} data - 에디트에 로드할 내용/첨부파일 값
	 * @example
	 *  Editor.modify({
	 *  	content:'&lt;p&gt;content example&lt;/p&gt;' or $tx('tx_content')
	 *  	attachments: [
	 *  		{attacher: 'image', 
	 *				data: {
	 *					thumburl: "http://cfile163.uf.daum.net/P150x100/0126A20248BFAFF72D2229",
	 *					imageurl: "http://cfile163.uf.daum.net/image/0126A20248BFAFF72D2229",
	 *					originalurl: "http://cfile163.uf.daum.net/original/0126A20248BFAFF72D2229",
	 *					exifurl: "http://cfile163.uf.daum.net/info/0126A20248BFAFF72D2229",
	 *					attachurl: "http://cfile163.uf.daum.net/attach/0126A20248BFAFF72D2229",
	 *					filename: "Tree.jpg",
	 *					filesize: "155833"
	 *				}
	 *			}]
	 *  });
	 */
	Editor.modify = function(data) {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			if (this.loadEditor) {
				this.loadEditor(data);
			}
		} else {
			setTimeout(this.modify.bind(this, data), 10);
		}
	};
	/**
	 * Editor 생성 후 자동저장된 Content를 불러올 경우 사용한다.
	 * @param {Object} data
	 * @example
	 *  Editor.restore(
	 *  	{content: 'string', 
	 *  	attachments: [{Object}]});
	 */
	Editor.restore = function(data) {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			if(this.getAutoSaver && this.getAutoSaver()) {
				this.getAutoSaver().load(data);
			}
		} else {
			setTimeout(this.restore.bind(this, data), 10);
		}
	};
	/**
	 * 글 저장시 사용한다.
	 * @example
	 *  &lt;a onclick="Editor.save();return _FALSE;" href="#"&gt;save&lt;/a&gt;
	 */
	Editor.save = function() {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			if (this.saveEditor) {
				this.saveEditor();
			}
		} else {
			setTimeout(this.saveEditor.bind(this), 10);
		}
		return _FALSE;
	};
	/**
	 * Canvas의 최근 focus가 있던 영역에  focus를 준다.
	 * 예를들어, 이미지를 첨부하는 팝업창에서 작업을 완료 후 팝업창을 닫고 에디터에 최근의 focus를 준다.
	 */
	Editor.focus = function() {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			var _canvas = this.getCanvas();
			if (_canvas) {
				_canvas.focus();
			}
		} else {
			setTimeout(this.focus.bind(this), 10);
		}
		return _FALSE;
	}; 
	/**
	 * Canvas의 맨 위에 focus를 준다.
	 * @see Canvas#focusOnTop
	 */
	Editor.focusOnTop = function() {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			var _canvas = this.getCanvas();
			if (_canvas) {
				_canvas.focusOnTop();
			}
		} else {
			setTimeout(this.focusOnTop.bind(this), 10);
		}
		return _FALSE;
	};
	/**
	 * Canvas의 맨 아래에 focus를 준다.
	 * @see Canvas#focusOnBottom
	 */
	Editor.focusOnBottom = function() {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			var _canvas = this.getCanvas();
			if (_canvas) {
				_canvas.focusOnBottom();
			}
		} else {
			setTimeout(this.focusOnBottom.bind(this), 10);
		}
		return _FALSE;
	};
	/**
	 * Editor가 있는 page를 나갈 경우 beforeunload eventlistener를 실행 시키지 도록 설정한다.
	 * 예를들면, Editor에서 글을 작성 중에 새로고침했을 경우 경고창을 안뜨게 한다.
	 */
	Editor.permitUnload = function() {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			this.setDisableUnloadHandler();
		} else {
			setTimeout(this.permitUnload.bind(this), 500);
		}
	};
	/**
	 * Editor와 Iframe이 정상적으로 생성 된후 argument로 지정된 function을 실행 시킨다.
	 * @param {Function} fn
	 * @example
	 * 	Editor.onPanelLoadComplete(function(){
	 * 		Editor.focus();
	 * 	});
	 */
	Editor.onPanelLoadComplete = function(fn) {
		if (Editor.__PANEL_LOADED == _TRUE && Editor.__EDITOR_LOADED == _TRUE) {
			if (fn) {
				fn();
			}
		} else {
			setTimeout(Editor.onPanelLoadComplete.bind(Editor, fn), 500);
		}
	};
	/**
	 * 동일한 Page에 Editor가 여러개 생성됬을 경우, 다른 Editor를 지정한다.
	 * @param {Object} toIndex
	 */
	Editor.switchEditor = function (toIndex) {
		Editor.__SELECTED_INDEX = toIndex;
		Object.extend(Editor, Editor.__MULTI_LIST[toIndex]);
	};
	/* 에디터가 여러개 있을 때 async로 불러오는 모듈에서 호출하는 에디터를 찾기 위함. */
	Editor.editorForAsyncLoad = Editor;
	/* 에디터가 여러개 있을 때 모든 에디터에 적용하기 위함 */
	Editor.forEachEditor = function (fn) {
		var indexName, list= Editor.__MULTI_LIST;
		for (indexName in list) {
			if (list.hasOwnProperty(indexName)) {
				fn(list[indexName]);
			}
		}
	};
	/**
	 * focus on form
	 * @param {String} name - focus를 줄 form의 name 속성 값
	 * @example
	 * 	Editor.focusOnForm("tx_article_title");
	 */
	Editor.focusOnForm = function(name) {
		if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
			_WIN.focus();
			var _form = Editor.getForm();
			if (_form.getElementByName(name)) {
				_form.getElementByName(name).focus();
			}
		} else {
			setTimeout(Editor.focusOnForm.bind(Editor, name), 500);
		}
		return _FALSE;
	};
	/**
	 * 파일함에서 export된 데이터를 에디터에 삽입한다. attachment만 삽입된다.
	 * @param {Object} data - 에디트에 로드할 내용/첨부파일 값
	 * @example
	 *  Editor.fromHdrive(
					[{attacher: 'image', 
		 *				data: {
		 *					thumburl: "http://cfile163.uf.daum.net/P150x100/0126A20248BFAFF72D2229",
		 *					imageurl: "http://cfile163.uf.daum.net/image/0126A20248BFAFF72D2229",
		 *					originalurl: "http://cfile163.uf.daum.net/original/0126A20248BFAFF72D2229",
		 *					exifurl: "http://cfile163.uf.daum.net/info/0126A20248BFAFF72D2229",
		 *					attachurl: "http://cfile163.uf.daum.net/attach/0126A20248BFAFF72D2229",
		 *					filename: "Tree.jpg",
		 *					filesize: "155833"
		 *				}
		 *			}]
	 */
    Editor.fromHdrive = function(data) {
        var attachments = [];
        for (var i = 0; i < data.length; i++) {
            attachments.push(data[i]);
        }
        var modifyData = {
            content: "",
            attachments: attachments
        };

        if (Editor.__PANEL_LOADED && Editor.__EDITOR_LOADED) {
            if (this.loadEditor) {
                this.loadEditor(modifyData);
                var _entries = Editor.getAttachBox().datalist;
                for (var j = 0; j < _entries.length; j++) {
                    _entries[j].execAppend();
                }
            }
        } else {
            setTimeout(this.fromHdrive.bind(this, data), 10);
        }
    };
	Editor.refreshSize = function () {
		this.canvas.fireJobs(Trex.Ev.__CANVAS_WRAP_WIDTH_CHANGE);
		//TODO.azki height..???
	};
	/**
	 * <b>deprecated</b> - use Editor.switchEditor, 동일한 Page에 Editor가 여러개 생성됬을 경우, 다른 Editor를 지정한다.
	 * @function
	 * @deprecated since ver 1.2, use Editor.switchEditor
	 */
	Editor.prototype.switchEditor = Editor.switchEditor;
	/**
	 * <b>deprecated</b> - use Editor.focusOnForm, focus on form
	 * @function
	 * @deprecated since ver 1.2, Use Editor.focusOnForm
	 */
	Editor.prototype.focusOnForm = Editor.focusOnForm;
})();
