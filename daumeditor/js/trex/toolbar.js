/**
 * @fileoverview
 * - Trex.Toolbar
 */

/**
 * Trex.Toolbar Class
 * @class
 * @param {Object} editor
 * @param {Object} config
 */
Trex.Toolbar = Trex.Class.create(/** @lends Trex.Toolbar.prototype */{
	/** @ignore */
	$mixins: [
		Trex.I.JobObservable
	],
	/**
	 * Toolbar Dom Element
	 */
	el: _NULL,
	/**
	 * Tools List
	 */
	tools: _NULL,
	initialize: function(editor, rootConfig) {
		this.canvas = editor.getCanvas();
		
		var _initializedId =  rootConfig.initializedId || "";
		this.el = $must("tx_toolbar_basic" + _initializedId, "Trex.Toolbar");
	},
	/**
	 * Toolbar의 tool을 비활성화 시킨다. 
	 * @function
	 * @example
	 * 	Editor.getToolbar().disableToolbar();
	 */
	disableToolbar: function(){
		var _tools = this.tools;
		for (var _name in _tools) {
			if (_tools[_name].button) {
				_tools[_name].button.disable();
			}
		}
	},
	/**
	 * 현재 toolbar의 상태를 serializing한다. 
	 * @function
	 * @returns {object}
	 */
	serializeToolValues : function(){
		var _tools = this.tools;
		var result = {};
		for(var name in _tools){
			var _tool = _tools[name];
			result[name] = _tool.button.lastValue;
		}
		return result;
	},
	widgetSeq:0,
	makeWidget: function(button, menu, handler) {
		var _toolbar = this;
		var _canvas = this.canvas;
		var _dummyToolClass = new (function() {
			this.identity = 'widget' + (++_toolbar.widgetSeq);
			this.wysiwygonly = _TRUE;
			this.menuFoldAuto = _TRUE;
			this.canvas = _canvas;
			this.toolbar = _toolbar;
		})();
		
		Trex.Tool.prototype.weave.bind(_dummyToolClass)(
			button, 
			menu, 
			handler
		);
		
		this.tools[_dummyToolClass.identity] = _dummyToolClass;
		return _dummyToolClass;
	}
});

Trex.install("editor.getTool",
	function(editor, toolbar) {
		var _tools = toolbar.tools = {};
		
		/**
		 * memberOf Editor.prototype
		 * @param {Object} name
		 */
		editor.getTool = function(name) {
			if(_tools[name] != _NULL) {
				return _tools[name];
			} else if(arguments.length == 0){
				return _tools;
			}else{
				return _NULL;
			}
		};
	}
);

Trex.register("new tools",
	function(editor, toolbar, sidebar, canvas, config) {
		var _tools = toolbar.tools;
		
		var _initializedId = config.initializedId || ""; 
		for(var item in Trex.Tool) {
			var _name = Trex.Tool[item]['__Identity'];
			if(_name){
				var cfg = TrexConfig.getTool(_name, config);
				cfg.initializedId = _initializedId;
				if (Trex.available(cfg, _name + _initializedId)) {
					_tools[_name] = new Trex.Tool[item](editor, toolbar, cfg);
				}
			}
		}
		if(!!canvas.config.readonly) {
			toolbar.disableToolbar();
		}
	}
);

Trex.module("bind events with tools",
	function(editor, toolbar, sidebar, canvas) {
		var _tools = toolbar.tools;
		
		var disableToolOnMobile = function () {
			var isMobile, name, tool, btn;
			isMobile = $tx.ios || $tx.android;
			if (!isMobile) {
				return;
			}
			for (name in _tools) {
				tool = _tools[name];
				if (tool.disabledonmobile) {
					btn = tool.button;
					btn.disable();
				}
			}
		};
		disableToolOnMobile();
		
		var _changeMode = function(from, to){
			if (from == to) {
				return;
			}
			for (var _name in _tools) {
				var _tool = _tools[_name];
				var _btn = _tool.button;
				if (Trex.Canvas.__WYSIWYG_MODE == to) {
					_btn.enable();
				} else if (Trex.Canvas.__WYSIWYG_MODE == from) {
					if (_tool.wysiwygonly) {
						_btn.disable();
					} else {
						_btn.enable();
					}
				}
			}
			disableToolOnMobile();
		};
		canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, _changeMode);
		canvas.observeJob(Trex.Ev.__CANVAS_MODE_INITIALIZE, _changeMode);
		
		var _releaseTools = function(identity) {
			for(var _name in _tools) {
				var _tool = _tools[_name];
				if(identity != _tool.identity) {
					if (_tool.button) {
						_tool.button.release();
						_tool.button.decreaseZindex();
					}
					if(_tool.menu && _tool.menuFoldAuto) {
						_tool.menu.release();
					}
				}
			}
		};
		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_CLICK, _releaseTools);
		canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_CLICK, _releaseTools);
		canvas.observeJob(Trex.Ev.__CANVAS_TEXT_PANEL_CLICK, _releaseTools);
		
		toolbar.observeJob(Trex.Ev.__TOOL_CLICK, _releaseTools);

		canvas.observeKey({ // Esc
			ctrlKey: _FALSE,
			altKey: _FALSE,
			shiftKey: _FALSE,
			keyCode: 27
		}, _releaseTools);

		editor.observeKey({ // Esc
			ctrlKey: _FALSE,
			altKey: _FALSE,
			shiftKey: _FALSE,
			keyCode: 27
		}, _releaseTools);
		
		$tx.observe(_DOC, 'click', 
			function(e){
				var _el = $tx.element(e);
				var _class = [	'tx-sidebar', 'tx-toolbar-basic' ,'tx-toolbar-advanced', 
					'tx-sidebar-boundary', 'tx-toolbar-boundary', 'tx-toolbar-boundary'];
				if (Trex.Util.getMatchedClassName(_el, _class)) {
					_releaseTools("-");
				}	
			}
		, _FALSE);

        var _shouldCloseMenus = function () {
            editor.fireJobs(Trex.Ev.__SHOULD_CLOSE_MENUS);
        };
        toolbar.observeJob(Trex.Ev.__TOOL_CLICK, _shouldCloseMenus);
	}
);

/**
 * Tool 클래스의 추상 부모클래스로 각각의 tool들은 이 클래스를 상속받아야 하고, 
 * 'oninitialized' 함수를 구현해야한다.
 * 
 * @abstract
 * @class
 * @param {Object} editor
 * @param {Object} toolbar
 * @param {Object} config
 * 
 * @example
 *	Trex.Tool.Example = Trex.Class.create({
 *		$const: {
 *			__Identity: 'example'
 *		},
 *		$extend: Trex.Tool,
 *		oninitialized: function(config) {
 *			var _tool = this;
 *			
 *			this.weave.bind(this)(
 *				new Trex.Button(this.buttonCfg),
 *				new Trex.Menu(this.menuCfg),
 *				function(data) {
 *					//TODO
 *				}
 *			);
 *		}
 *	});
 */
Trex.Tool = Trex.Class.draft(/** @lends Trex.Tool.prototype */{
	/**
	 * tool identifier. 유일해야한다.
	 * @private
	 */
	identity: _NULL,
	/**
	 * button 객체
	 */
	button: _NULL,
	/**
	 * menu 객체
	 */
	menu: _NULL,
	initialize: function(editor, toolbar, config) {
		if(!this.constructor.__Identity) {
			throw new Error("[Exception]Trex.Tool : not implement const(__Identity)");
		}
		this.identity = this.constructor.__Identity;

		if(!editor) {
			throw new Error("[Exception]Trex.Tool : not exist argument(editor)");
		}
		/** 
		 * editor 객체 
		 * @private
		 */
		this.editor = editor;
		/** 
		 * toolbar 객체 
		 * @private
		 */
		this.toolbar = toolbar;
		/** 
		 * canvas 객체
		 * @private 
		 */
		this.canvas = editor.getCanvas();
		/** 
		 * 해당 tool 설정값 
		 * @private
		 */
		this.config = config;
		this.wysiwygonly = ((config.wysiwygonly != _NULL)? config.wysiwygonly: _TRUE);
		this.menuFoldAuto = ((config.menuFoldAuto != _NULL)? config.menuFoldAuto: _TRUE);
		if (config.disabledonmobile != _NULL) {
			this.disabledonmobile = config.disabledonmobile;
		}
		
		/** 
		 * 버튼을 생성할 때 필요한 설정값
		 * @private 
		 */
		this.buttonCfg = TrexConfig.merge({
			id: "tx_" + this.identity
		}, config);
		
		/** 
		 * 메뉴를 생성할 때 필요한 설정값
		 * @private 
		 */
		this.menuCfg = TrexConfig.merge({
			id: "tx_" + this.identity + "_menu"
		}, config);
		
		this.oninitialized.bind(this)(config);
	},
	/**
	 * tool 객체를 초기화하는 마지막 단계에서 호출되는 함수로,
	 * tool 클래스를 상속받는 tool에서 반드시 구현해야 한다.
	 * 
	 * @abstract
	 * @private
	 * @function
	 */ 
	oninitialized: function() {
		throw new Error("[Exception]Trex.Tool : not implements function(oninitialized)");
	},
	/**
	 * 보통 tool은 버튼과 메뉴로 구성되는데, 이 함수에서 그 둘 사이의 연결을 해준다.<br/>
	 * menu가 없으면 버튼을 클릭할 때 execHandler가 실행되고,
	 * menu가 있으면 버튼을 클릭할 때 menu가 보이며, 
	 * menu에서 특정 값을 선택하면 그 값을 가지고 execHandler가 실행된다.
	 * 
	 * @function
	 * @private
	 * @param {Object} button - 버튼 객체
	 * @param {Object} menu - 메뉴 객체 optional
	 * @param {Function} execHandler
	 * @param {Function} initHandler - optional
	 * 
	 * @example
	 *	this.weave.bind(this)(
	 *		new Trex.Button(this.buttonCfg),
 	 *		new Trex.Menu(this.menuCfg),
	 *		function(data) {
	 *			//TODO
	 *		});
	 *	}
	 */
	weave: function(button, menu, execHandler, initHandler) {
		var _tool = this;
		var _identity = this.identity;
		var _toolbar = this.toolbar;
		var _canvas = this.canvas;
		
		this.button = button;
		button.tool = this;
		var cmd = _NULL;
		if(!menu){
			button.setCommand(
				cmd = function(){
					_toolbar.fireJobs(Trex.Ev.__TOOL_CLICK, _identity);
                    return execHandler.apply(_tool, arguments);
				}
			);
		}else{
			this.menu = menu;
			menu.tool = this;
			
			menu.initHandler = initHandler || function(){};
			menu.cancelHandler = function(){ button.setState(_FALSE); };
		
			menu.setCommand(
				cmd = function() { 
					var args = arguments;
					var success = execHandler.apply(_tool, args);
					//handler에서 $stop 을 반환하면 버튼 값을 메뉴에서 선택한 값으로 안바꿈..
					if (success === $stop) {
						button.normalState.apply(button, args);
					} else {
						button.updateAfterCommand.apply(button, args);
					}
					return success;
				}
			);
			button.setCommand(
				function(ev) {
					_toolbar.fireJobs(Trex.Ev.__TOOL_CLICK, _identity, ev);
					if(!button.isPushed()) {
						var _lastvalue = button.getValue();
						button.increaseZindex();
						menu.show(_lastvalue);
					} else {
						menu.hide();
						if ($tx.msie) {
							var _processor = _canvas.getProcessor();
							if (_processor.restoreRange) {
								setTimeout(function () {
									_processor.restoreRange();
								}, 0);
							}
						}
					}
					return _TRUE;
				}
			);

            menu.observeJob(Trex.Ev.__MENU_LAYER_SHOW, function(ev){
                _toolbar.fireJobs(Trex.Ev.__MENU_LAYER_SHOW, ev);
            });
            menu.observeJob(Trex.Ev.__MENU_LAYER_HIDE, function(ev){
                _toolbar.fireJobs(Trex.Ev.__MENU_LAYER_HIDE, ev);
            });
            menu.observeJob(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, function(ev){
                _toolbar.fireJobs(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, ev);
            });
		}
		this.execute = cmd;
	},
	/**
	 * 연결된 버튼과 메뉴 레이어와의 관계를 모두 해제한다.
	 * 일반적은 경우에는 필요하지 않고 async를 위한 tool에만 weave 구문 상위에 추가한다.
	 * @function
	 */
	resetWeave: function(){
		this.button.removeHandler();
		this.button.normalState();
		this.button = _NULL;
		this.menu = _NULL;
		this.execute = _NULL;
	},
	/**
	 * 활성화 상태를 강제한다. 
	 * async tool 에서 클릭후 자동 활성화를 위함.
	 * @function
	 */
	forceActivate: function(){
		if( this.button && this.menu ){
			this.button.pushedState();
			this.button.increaseZindex();
			this.menu.show();
		}
	},
    bindKeyboard: function(keys, execHandler) {
        var toolbar = this.toolbar;
        var identity = this.identity;
        this.canvas.observeKey(keys, function(ev) {
            execHandler(ev);
            toolbar.fireJobs(Trex.Ev.__TOOL_SHORTCUT_KEY, identity);
        });
    }
});

Trex.AsyncTool = Trex.Class.draft(/** @lends Trex.Tool.prototype */{
	$extend: Trex.Tool,
	oninitialized: function() {
		this.loaded = false;
		throw new Error("[Exception]Trex.AsyncTool : not implements function(oninitialized)");
	},
	onLoadModule: function() {
		var self = this;
        var url = this.config.asyncUrl;
		if (/^(?:\/\/)|(?:\w+:\/\/)/.test(url) === false) {
			url = this.getJSBasePath() + url;
		}
        if (EditorJSLoader.getOption('environment') == 'development') {
            var d = (new Date()).getTime();
            if (url.indexOf('?') === -1) {
                url += '?dummy=' + d;
            } else {
                url += '&dummy=' + d;
            }
        }
		Editor.editorForAsyncLoad = this.editor;
		EditorJSLoader.asyncLoadModule({
    		url: TrexConfig.getUrl(url),
    		callback: function(){
    			self.loaded = true;
    		}
    	});
	},
    getJSBasePath: function() {
        var basePath;
        try {
            basePath = EditorJSLoader.getJSBasePath("editor.js");
        } catch (e) {
            basePath = EditorJSLoader.getJSBasePath();
        }
        return basePath;
    }
});


Trex.I.Tool = {};
Trex.I.Tool.QueryStyle = {};
Trex.I.Tool.QueryStyle.Standard = Trex.Mixin.create({
    queryNodeStyle: function(currentNode, cssPropertyName, queryCommandName, matchTagName) {
        return $tx.getStyle(currentNode, cssPropertyName).include(queryCommandName);
    }
});

Trex.I.Tool.QueryStyle.Gecko = Trex.Mixin.create({
    queryNodeStyle: function(currentNode, cssPropertyName, queryCommandName, matchTagName) {
        var tempNode = currentNode;
        var isInclude = _FALSE;
        while(tempNode && !$tom.isBody(tempNode) && !isInclude) {
            if ($tom.isTagName(tempNode, matchTagName)) {
                isInclude = _TRUE;
            } else {
                isInclude = $tx.getStyle(currentNode, cssPropertyName).include(queryCommandName);
            }

            // move to parent
            tempNode = tempNode.parentNode;
        }
        return isInclude;
    }
});
