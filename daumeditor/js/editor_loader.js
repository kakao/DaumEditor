(function() {
    // TODO option parameter 문서 정리
    var DEFAULT_UNKNOWN_OPTION_VALUE = "",
            PREFIX_COOKIE = "tx_",
            DOC = document,
            STATUS_UNINITIALIZED = "uninitialized",
            STATUS_LOADING = "loading",
            STATUS_COMPLETE = "complete",
            ENV_PRODUCTION = "production",
            EDITOR_STATUS_COOKIE_NAME = "EDR_ST",
            MILLISECOND = 1000,
            DEFAULT_TIMEOUT = 5;
    
    var REGX_MATCH_VERSION = /\/([6-9][a-z.]?\.[a-z0-9\-]+\.[\-\w]+)\//,
    	REGX_TEST_CSS = /\/css\/editor(_[a-z]+)?\.css/;

    var DEFAULT_OPTIONS = {
        "environment" : ENV_PRODUCTION,
        "service": "",
        "version": "",
        "host" : "http://s1.daumcdn.net/editor/"
    };

    function getBasePath(url) {
        var cutPos = url.lastIndexOf("/");
        return url.substring(0, cutPos + 1);
    }

    function findLoaderScriptElement(filename) {
        var scripts = DOC.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(filename) >= 0) {
                return scripts[i];
            }
        }
        throw "cannot find '" + filename + "' script element";
    }

    function getProductionURL(moduleName) {
        return Loader.getOption("host") + "releases/" + Loader.getOption("version") + "/js/" +
                moduleName + (isRetry ? "?dummy=" + (new Date().toString()) : "");
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
        var cookieOptions = Options.parse(DOC.cookie, /;[ ]*/);
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
    	var script = DOC.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        return script;
    }


    function loadScriptDOMElement(src, callback) {
        var script = createScriptDOMElement(src);
        var head = DOC.getElementsByTagName("head")[0] || DOC.documentElement;
        
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



    function errorLog(str) {
        var loggingImage = new Image();
        var service = Loader.getOption("service");
        loggingImage.src = "http://rialog.daum-img.net:8080/editor_error/?service=" + service + "&" + str;
    }


    function findCSSElement() {
        var links = DOC.getElementsByTagName("link");
        var found;
        for (var i = 0; i < links.length; i++) {
            if (REGX_TEST_CSS.test(links[i].href)) {
                found = links[i];
                break;
            }
        }
        return found;
    }

    function getCSSDevelopmentURL() {
        var cssBasePath = Loader.getCSSBasePath();
        return cssBasePath + "editor" + Loader.getServicePostfix() + ".css";
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
//    			this.startErrorTimer();
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
//            if (isRetry) {
//                errorLog("message=loading_error&detail=retry_timeout");
//                if (typeof this.onError === "function") {
//                    this.onError();
//                }
//            } else {
//                isRetry = 1;
//                errorLog("message=loading_error&detail=timeout");
//                document.cookie = EDITOR_STATUS_COOKIE_NAME + "=e";
//                initialize();
//            }
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
            var url = this.getBasePath() + moduleName + '?dummy=' + new Date().getTime();
            DOC.write('<script type="text/javascript" src="' + url + '" charset="utf-8"></script>');
        },
        
        /**
         * <p>페이지 로딩 완료 후 module 불러오기</p>
         */
        asyncLoadModule: function(config) {
        	return new AsyncLoader(config);
        },

        /**
         * <p>실서비스 환경에서의 module 불러오기</p>
         * <p>static farm에 배포된 파일을 대상으로 한다.</p>
         * @param moduleName {string} e.g. editor_basic.js
         */
        loadPackage: function(moduleName) {
        	return new AsyncLoader({
        		url: getProductionURL(moduleName)
        	});
//            Loader.readyState = STATUS_UNINITIALIZED;
//            loadScriptDOMElement(getProductionURL(moduleName));
//            Loader.startErrorTimer();
        },
        
        /**
         * <p>CSS를 개발 환경 CSS 로 다시 불러온다.</p>
         */
        reloadDevelopmentCSS: function() {
            var link = findCSSElement();
            if (link) {
                link.href = getCSSDevelopmentURL();
            } else {
                console.log("Editor CSS was not replaced for development. production CSS doesn't exists.");
            }
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
            if (isRetry) {
                errorLog("message=loading_error&detail=retry_success");
            } else if (document.cookie.indexOf(EDITOR_STATUS_COOKIE_NAME + "=e") > -1) {
                errorLog("message=loading_error&detail=recovered");
            }
            document.cookie = EDITOR_STATUS_COOKIE_NAME + "=; expires=Mon, 1 Jan 1970 00:00:00 GMT";
            
            for (var i = 0; i < onLoadHandlers.length; i++) {
                callEditorOnLoadHandler(onLoadHandlers[i]);
            }
            onLoadHandlers = [];
        },

//        startErrorTimer: function() {
//            var self = this;
//            setTimeout(function() {
//                if (self.readyState !== STATUS_COMPLETE) {
//                    self.onTimeout();
//                }
//            }, self.TIMEOUT);
//        },
//
//        onTimeout: function() {
//            if (isRetry) {
//                errorLog("message=loading_error&detail=retry_timeout");
//                if (typeof this.onError === "function") {
//                    this.onError();
//                }
//            } else {
//                isRetry = 1;
//                errorLog("message=loading_error&detail=timeout");
//                document.cookie = EDITOR_STATUS_COOKIE_NAME + "=e";
//                initialize();
//            }
//        },

        getBasePath: function() {
            var basePath = getCookieOption("base_path");
            if (!basePath) {
                var script = findLoaderScriptElement(Loader.NAME);
                basePath = getBasePath(script.src);
            }
            return basePath;
        },
        
        getJSBasePath: function() {
        	if (Loader.getOption("environment") === ENV_PRODUCTION) {
                return Loader.getOption("host") + "releases/" + Loader.getOption("version") + "/js/";
            } else {
                return this.getBasePath();
            }
        },

        getCSSBasePath: function() {
            var jsBasePath = this.getBasePath();
            return jsBasePath.replace(/\/js\//g, "/css/");
        },

        getPageBasePath: function() {
            if (Loader.getOption("environment") === ENV_PRODUCTION) {
                return "http://editor.daum.net/releases/" + Loader.getOption("version") + "/pages/daumx/";
            } else {
                var jsBasePath = this.getBasePath();
                return jsBasePath.replace(/\/js\//g, "/pages/") + "daumx/";
            }
        },

        getOption: function(name) {
            return getCookieOption(name) || getUserOption(name) || getDefaultOption(name);
        },

        getServicePostfix: function() {
            var service = Loader.getOption("service");
            return service ? '_' + service : '';
        }
    };
    window.EditorJSLoader = Loader;

    function initialize() {
        var env = Loader.getOption("environment");
        var jsModuleName = "editor" + Loader.getServicePostfix() + ".js";
        
        DEFAULT_OPTIONS["version"] = readCurrentURLVersion(Loader.NAME);
        
        if (env === ENV_PRODUCTION) {
            Loader.loadPackage(jsModuleName);
        } else {
            Loader.loadModule(jsModuleName);
            Loader.reloadDevelopmentCSS();
        }
    }

    initialize();
})();