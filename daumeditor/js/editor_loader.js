(function(document) {
	// TODO option parameter 문서 정리
	// TODO bookmarklet 작성
	var DEFAULT_UNKNOWN_OPTION_VALUE = "",
			PREFIX_COOKIE = "tx_",
			STATUS_UNINITIALIZED = "uninitialized",
			STATUS_LOADING = "loading",
			STATUS_COMPLETE = "complete",
			ENV_PRODUCTION = "production",
			ENV_DEVELOPMENT = "development",
			MILLISECOND = 1000,
			DEFAULT_TIMEOUT = 5;
	
	var REGX_MATCH_VERSION = /\/(\d+[a-z.]?\.[a-z0-9\-]+\.[\-\w]+)\//;

	var DEFAULT_OPTIONS = {
		environment: ENV_PRODUCTION,
        service: "core",
		version: "",
		host: ""
	};

	function getBasePath(url) {
		return url.replace(/[^\/]+\/?$/, '');
	}

	function findLoaderScriptElement(filename) {
		var scripts = document.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src.indexOf(filename) >= 0) {
				return scripts[i];
			}
		}
		throw "cannot find '" + filename + "' script element";
	}

	function readURLParam(filename) {
		var script = findLoaderScriptElement(filename);
		var url = script.src;
		return url.substring(url.indexOf("?") + 1);
	}
	
	function readCurrentURLVersion(filename) {
		var script = findLoaderScriptElement(filename);
		var urlMatch = script.src.match(REGX_MATCH_VERSION);
		if( urlMatch && urlMatch.length == 2 ){
			return urlMatch[1];
		}
		return "";
	}

	function getDefaultOption(name) {
		return DEFAULT_OPTIONS[name] || DEFAULT_UNKNOWN_OPTION_VALUE;
	}

	function getUserOption(name) {
		var userOptions = Options.parse(readURLParam(Loader.NAME), "&");
		return userOptions.findByName(name);
	}

	function getCookieOption(name) {
		var cookieOptions = Options.parse(document.cookie, /;[ ]*/);
		var value = cookieOptions.findByName(PREFIX_COOKIE + name);
		return value ? decodeURIComponent(value) : value;
	}


	var Options = function() {
		this.data = [];
	};

	Options.prototype = {
		add: function(name, value) {
			this.data.push({ "name": name, "value": value });
		},
		findByName: function(name) {
			var founded;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] && this.data[i].name === name) {
					founded = this.data[i].value;
					break;
				}
			}
			return founded;
		}
	};

	Options.parse = function(rawOptions, separator) {
		var options = new Options();
		var params = rawOptions.split(separator);
		for (var i = 0; i < params.length; i++) {
			var nameAndValue = params[i].split("=");
			options.add(nameAndValue[0], nameAndValue[1]);
		}
		return options;
	};
	
	
	function createScriptDOMElement(src) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		return script;
	}

	function absolutizeURL(url) {
		var location = document.location;
		if (url.match(/^(https?:|file:|)\/\//)) {
		} else if (url.indexOf("/") === 0) {
			url = "http://" + location.host + url;
		} else {
			var href = location.href;
			var cutPos = href.lastIndexOf("/");
			url = href.substring(0, cutPos + 1) + url;
		}
		return url;
	}

	function loadScriptDOMElement(src, callback) {
		var script = createScriptDOMElement(src);
		var head = document.getElementsByTagName("head")[0] || document.documentElement;
		
		addScriptLoadListener(script, head, callback);
		
		head.insertBefore(script, head.firstChild); // Use insertBefore instead of appendChild to circumvent an IE6 bug.
		return script;
	}
	
	function addScriptLoadListener(script, head, callback){
		if(callback){
			script.onload = script.onreadystatechange = function() {
				if ( !this.readyState ||
						this.readyState === "loaded" || 
						this.readyState === "complete") {
					
					callback();
					
					// Handle memory leak in IE
					if (/MSIE/i.test(navigator.userAgent)) {
						script.onload = script.onreadystatechange = null;
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}
					}
				}
			};
		}
	}

	function callEditorOnLoadHandler(fn) {
		if (typeof fn === "function") {
			fn(Editor);
		}
	}

	var AsyncLoader = function(config){
		this.TIMEOUT = DEFAULT_TIMEOUT * MILLISECOND;
		this.readyState = STATUS_UNINITIALIZED;
		this.url = config.url;
		this.callback = config.callback || function(){};
		this.id = config.id;
		this.load();
	};
	AsyncLoader.prototype = {
		load: function(){
			var url = this.url;
			var self = this;
			try {
				findLoaderScriptElement(url);
			} catch(e){
				self.readyState = STATUS_LOADING;
				var script = loadScriptDOMElement(url, function(){
					self.callback();
					self.readyState = STATUS_COMPLETE;
				});
				if( self.id ){
					script.id = self.id;
				}
			} 
			return this;
		},
		startErrorTimer: function() {
			var self = this;
			setTimeout(function() {
				if (self.readyState !== STATUS_COMPLETE) {
					self.onTimeout();
				}
			}, self.TIMEOUT);
		},
		onTimeout: function() {
			//NOTE: retry or error log?
		},
		onLoadComplete: function(){
		}
	};
	
	var onLoadHandlers = [], isRetry;

	//noinspection UnnecessaryLocalVariableJS
	var Loader = {
		NAME: "editor_loader.js",

		TIMEOUT: DEFAULT_TIMEOUT * MILLISECOND,

		readyState: STATUS_UNINITIALIZED,

		/**
		 * <p>개발 환경에서 페이지 로딩시 module 불러오기</p>
		 * @param moduleName {string} e.g. trex/header.js
		 */
		loadModule: function(moduleName) {
			function isModuleNameNotPath(name) {
				return !name.match(/^((https?:|file:|)\/\/|\.\.\/|\/)/);
			}
			
			var url = isModuleNameNotPath(moduleName) ? this.getJSBasePath() + moduleName : moduleName;
			if (DEFAULT_OPTIONS.environment === ENV_DEVELOPMENT) {
				url = url + '?dummy=' + new Date().getTime();				
			}
			document.write('<script type="text/javascript" src="' + url + '" charset="utf-8"></script>');
		},

		/**
		 * <p>페이지 로딩 완료 후 module 불러오기</p>
		 */
		asyncLoadModule: function(config) {
			return new AsyncLoader(config);
		},

		/**
		 * <p>editor javascript 파일이 로딩 완료되었을 때 호출될 함수를 등록한다.</p>
		 * @param fn {function} 실행될 함수
		 */
		ready: function(fn) {
			if (this.readyState === STATUS_COMPLETE) {
				callEditorOnLoadHandler(fn);
			} else {
				onLoadHandlers.push(fn);
			}
		},

		finish: function() {
			for (var i = 0; i < onLoadHandlers.length; i++) {
				callEditorOnLoadHandler(onLoadHandlers[i]);
			}
			onLoadHandlers = [];
		},

		getBasePath: function(filename) {
			var basePath = getCookieOption("base_path");
			if (!basePath) {
				var script = findLoaderScriptElement(filename || Loader.NAME);				
				basePath = getBasePath(getBasePath(script.src));
			}
			return absolutizeURL(basePath);
		},

		getJSBasePath: function(filename) {
			return this.getBasePath() + "js/";
		},

		getCSSBasePath: function() {
			return this.getBasePath() + "css/";
		},

		getPageBasePath: function() {
			return this.getBasePath() + "pages/";
		},

		getOption: function(name) {
			return getCookieOption(name) || getUserOption(name) || getDefaultOption(name);
		}
	};
	window.EditorJSLoader = Loader;

	function initialize() {
		var jsModuleName = "editor.js";
		
		DEFAULT_OPTIONS["version"] = readCurrentURLVersion(Loader.NAME);
		var envConfig = getUserOption("environment");
		if (envConfig) {
			DEFAULT_OPTIONS.environment = envConfig;
		}
		Loader.loadModule(jsModuleName);
	}

	initialize();
})(document);