/**
 * XmlHttpRequest객체를 생성하고 이 객체를 이용해 ajax request를 수행한다.
 * @class
 */
Trex.I.XHRequester = Trex.Faculty.create(/** @lends Trex.I.XHRequester */{ 
	/**
	 * 브라우져에 맞는 XmlHttpRequest 객체를 생성해서 리턴한다.
	 * @private
	 * @return {Object} XmlHttpRequest object
	 */
	createXMLHttp: function() {
		var _xmlHttp = _NULL;
		try{
			if(_WIN.XMLHttpRequest) {
				_xmlHttp = new XMLHttpRequest();
			} else if (_WIN.ActiveXObject) {
				_xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
				if(!_xmlHttp) {
					_xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
				}
			}
			return _xmlHttp;
		}catch(e){
			return _NULL;
		}
	},
	/**
	 * ajax call를 수행한다
	 * @param {String} method - http request의 방식, "get" 또는 "post" 
	 * @param {String} url - request를 날릴 url 
	 * @param {Boolean} async - synchronous 여부 
	 * @param {Function} successHandler - ajax의 성공시의 핸들러 
	 * @param {Function} failHandler - ajax 실패시이의 핸들러  
	 * @example
	 * this.sendRequest("get","http://www.daum.net/api",true,function(value){alert(value)}, function(){alert('fail');} 
	 */
	sendRequest: function(method, url, param, async, successHandler, failHandler) { 
		if (url == _NULL && url != "") {
			return _NULL;
		}
		
		var _response = _NULL;
		var _xmlHttp = this.createXMLHttp();
		if(_xmlHttp == _NULL) {
			return _NULL;
		}
		
		var handler = function(){
			if (_xmlHttp.status == 200) {
				if (method.toUpperCase() == "HEAD") {
					_response = successHandler(_xmlHttp.getAllResponseHeaders());
				} else {
					_response = successHandler(_xmlHttp.responseText);
				}
			} else {
				_response = failHandler(_xmlHttp.status);
			}
			_xmlHttp = _NULL;
		};
		try{
			if (async) {
				_xmlHttp.onreadystatechange = function(){
					if (_xmlHttp.readyState == 4) {
						handler();			
					}
				};
			}
			if(method.toUpperCase() == "POST") {
				_xmlHttp.open("POST", url, async);
				_xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
				_xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                //webkit 오류발생
//				_xmlHttp.setRequestHeader("Content-Length", param.length);
//				_xmlHttp.setRequestHeader("Connetion","close");
				_xmlHttp.send(param);
			} else {
				if(param && param.length > 0) {
					url = url + ((url.indexOf("?") > -1)? "&": "?") + param;
				}
				_xmlHttp.open(method.toUpperCase(), url, async);
				_xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				_xmlHttp.send(_NULL);
			}
			
			if (!async) {
				handler();
			}
			return _response;
		}catch(e){
			return _NULL; 
		}
	}
});

Trex.Responder = { 
	callbacks: {},
	process: function(/*bytesLoaded, bytesTotal*/) {
		//if(bytesLoaded < 0) {
			// fail
		//} else {
			// progress
		//}
	},
	newKey: function() {
		var _key = "exe_" + Math.floor(Math.random() * 100000);
		if(this[_key]) {
			return this.newKey();
		} else {
			return _key;
		}
	},
	register: function(handler) {
		var _key = this.newKey();
		this.callbacks[_key] = function(response) {
			handler.apply(this, Array.prototype.slice.call(arguments,0));
			this.callbacks[_key] = _NULL;
		}.bind(this);
		return _key;
	}
};

/**
 * 동적으로 외부의 javascript파일을 include한다. 
 * @class
 */
Trex.I.JSRequester = Trex.Faculty.create(/** @lends Trex.I.JSRequester */{ 
	/**
	 * 특정위치의 스크립트 파일을 include 한다.
	 * @param {String} url - http request의 방식, "get" 또는 "post" 
	 * @param {String} encoding - inlcude할 javascript의 encoding 타입
	 * @param {Element} context - 로딩된 스크립트가 표시될 dom element
	 * @param {Function} success - ajax의 성공시의 핸들러
	 * @example
	 * this.importScript("http://www.daum.net/api/movie.js?apikey=1234","utf-8", document, function(){alert("hello");} ) 
	 */
	importScript: function(url, encoding, context, success) { 
		if (url == _NULL && url != "") {
			return _NULL;
		}
		encoding = encoding || "utf-8";
		context = context || _DOC;
		try{
			var head = context.getElementsByTagName("head")[0] || context.documentElement;
			var script = context.createElement("script");
			script.type = "text/javascript";
			script.charset = encoding;
			script.src= url;
						
			var done = _FALSE;
			script.onload = script.onreadystatechange = function() {
				if ( !done && (!this.readyState ||
						this.readyState === "loaded" || this.readyState === "complete") ) {
					done = _TRUE;
					if (success) {
						success();
					}

					// Handle memory leak in IE
					script.onload = script.onreadystatechange = _NULL;
					if ( head && script.parentNode ) {
						head.removeChild( script );
					}
				}
			};
			head.insertBefore( script, head.firstChild );
		}catch(e){
			console.log(e)
		}
	}
});