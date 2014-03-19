var textboxOption = function( data, padding, bgcolor, border ){
	return { 
		data: data, 
		style: { 
			padding:padding, backgroundColor:bgcolor, border:border 
		} 
	};
};
Trex.__CONFIG_COMMON = {
	thumbs: {
		options:[
			{color:"#FF0000"}, {color:"#FF5E00"}, {color:"#FFBB00"}, {color:"#FFE400"}, {color:"#ABF200"}, {color:"#1FDA11"}, {color:"#00D8FF"}, {color:"#0055FF"}, {color:"#0900FF"}, {color:"#6600FF"}, {color:"#FF00DD"}, {color:"#FF007F"}, {color:"#000000"}, {color:"#FFFFFF"},
			{color:"#FFD8D8"}, {color:"#FAE0D4"}, {color:"#FAECC5"}, {color:"#FAF4C0"}, {color:"#E4F7BA"}, {color:"#CEFBC9"}, {color:"#D4F4FA"}, {color:"#D9E5FF"}, {color:"#DAD9FF"}, {color:"#E8D9FF"}, {color:"#FFD9FA"}, {color:"#FFD9EC"}, {color:"#F6F6F6"}, {color:"#EAEAEA"},
			{color:"#FFA7A7"}, {color:"#FFC19E"}, {color:"#FFE08C"}, {color:"#FAED7D"}, {color:"#CEF279"}, {color:"#B7F0B1"}, {color:"#B2EBF4"}, {color:"#B2CCFF"}, {color:"#B5B2FF"}, {color:"#D1B2FF"}, {color:"#FFB2F5"}, {color:"#FFB2D9"}, {color:"#D5D5D5"}, {color:"#BDBDBD"},
			{color:"#F15F5F"}, {color:"#F29661"}, {color:"#F2CB61"}, {color:"#E5D85C"}, {color:"#BCE55C"}, {color:"#86E57F"}, {color:"#5CD1E5"}, {color:"#6699FF"}, {color:"#6B66FF"}, {color:"#A366FF"}, {color:"#F261DF"}, {color:"#F261AA"}, {color:"#A6A6A6"}, {color:"#8C8C8C"},
			{color:"#CC3D3D"}, {color:"#CC723D"}, {color:"#CCA63D"}, {color:"#C4B73B"}, {color:"#9FC93C"}, {color:"#47C83E"}, {color:"#3DB7CC"}, {color:"#4174D9"}, {color:"#4641D9"}, {color:"#7E41D9"}, {color:"#D941C5"}, {color:"#D9418D"}, {color:"#747474"}, {color:"#5D5D5D"},
			{color:"#980000"}, {color:"#993800"}, {color:"#997000"}, {color:"#998A00"}, {color:"#6B9900"}, {color:"#2F9D27"}, {color:"#008299"}, {color:"#003399"}, {color:"#050099"}, {color:"#3D0099"}, {color:"#990085"}, {color:"#99004C"}, {color:"#4C4C4C"}, {color:"#353535"},
			{color:"#670000"}, {color:"#662500"}, {color:"#664B00"}, {color:"#665C00"}, {color:"#476600"}, {color:"#22741C"}, {color:"#005766"}, {color:"#002266"}, {color:"#030066"}, {color:"#290066"}, {color:"#660058"}, {color:"#660033"}, {color:"#212121"}, {color:"#000000"}
		],
		transparent: { 
			color: "transparent", 
			border: "#999999", 
			image: "#iconpath/ic_transparent4.gif?v=2",
			thumb: "#iconpath/txt_transparent.gif?v=2",
			thumbImage:"#iconpath/color_transparent_prev.gif?v=2"
		}
	},
	textbox: {
		 options: [
			textboxOption('txc-textbox1', '10px', '#ffffff', '1px solid #f7f7f7'),
			textboxOption('txc-textbox2', '10px', '#eeeeee', '1px solid #eeeeee'),
			textboxOption('txc-textbox3', '10px', '#fefeb8', '1px solid #fefeb8'),
			textboxOption('txc-textbox4', '10px', '#fedec7', '1px solid #fedec7'),
			textboxOption('txc-textbox5', '10px', '#e7fdb5', '1px solid #e7fdb5'),
			textboxOption('txc-textbox6', '10px', '#dbe8fb', '1px solid #dbe8fb'),
			
			textboxOption('txc-textbox7', '10px', '#ffffff', '1px dashed #cbcbcb'),
			textboxOption('txc-textbox8', '10px', '#eeeeee', '1px dashed #c1c1c1'),
			textboxOption('txc-textbox9', '10px', '#fefeb8', '1px dashed #f3c534'),
			textboxOption('txc-textbox10', '10px', '#fedec7', '1px dashed #fe8943'),
			textboxOption('txc-textbox11', '10px', '#e7fdb5', '1px dashed #9fd331'),
			textboxOption('txc-textbox12', '10px', '#dbe8fb', '1px dashed #79a5e4'),
			
			textboxOption('txc-textbox13', '10px', '#ffffff', '1px solid #cbcbcb'),
			textboxOption('txc-textbox14', '10px', '#eeeeee', '1px solid #c1c1c1'),
			textboxOption('txc-textbox15', '10px', '#fefeb8', '1px solid #f3c534'),
			textboxOption('txc-textbox16', '10px', '#fedec7', '1px solid #fe8943'),
			textboxOption('txc-textbox17', '10px', '#e7fdb5', '1px solid #9fd331'),
			textboxOption('txc-textbox18', '10px', '#dbe8fb', '1px solid #79a5e4'),
			
			textboxOption('txc-textbox19', '10px', '#ffffff', '3px double #cbcbcb'),
			textboxOption('txc-textbox20', '10px', '#eeeeee', '3px double #c1c1c1'),
			textboxOption('txc-textbox21', '10px', '#fefeb8', '3px double #f3c534'),
			textboxOption('txc-textbox22', '10px', '#fedec7', '3px double #fe8943'),
			textboxOption('txc-textbox23', '10px', '#e7fdb5', '3px double #9fd331'),
			textboxOption('txc-textbox24', '10px', '#dbe8fb', '3px double #79a5e4')
		]
	}
};

/**
 * 에디터 전반적인 설정을 관리하는 클래스로 각 함수를 static 하게 접근할 수 있다.
 *
 * @class
 */
var TrexConfig = function() {
	//preset < daumx < project < page
	var __IS_SETUP = _FALSE;
	var __POST_PROCESSOR = [];
	var __TREX_PARAM = {};
	var __TREX_CONFIGURE = {
		cdnHost: "//s1.daumcdn.net/editor",
		cmnHost: "http://editor.daum.net",
		wrapper: "tx_trex_container", 
		form: 'tx_editor_form',
        txIconPath: "images/icon/editor/",
        txDecoPath: "images/deco/contents/",
		params: [],
		events: {
			preventUnload: _TRUE,
			useHotKey: _TRUE
		},
		save: { },	
		adaptor: { },
		toolbar: { },
		sidebar: {
			attachbox: { },
			embeder: { },
			attacher: { },
			searcher: { }
		},
		plugin: { }
	};
	
    var _createAnchors = function() {
        return {
            "Tool": __TREX_CONFIGURE.toolbar,
            "Sidebar": __TREX_CONFIGURE.sidebar,
            "Plugin": __TREX_CONFIGURE.plugin,
            "Adaptor": __TREX_CONFIGURE.adaptor,
            "Save": __TREX_CONFIGURE.save,
            "Attacher": __TREX_CONFIGURE.sidebar.attacher,
            "Embeder": __TREX_CONFIGURE.sidebar.embeder,
            "Searcher": __TREX_CONFIGURE.sidebar.searcher
        };
    };

	var _addParameter = function(tname, pname) {
		if (__IS_SETUP) {
			throw new Error("configure is already setup (addParameter)")
		}
		__TREX_PARAM[tname] = pname;
	};
	
	var _trexConfig = /** @lends TrexConfig */{
		/**
		 * url을 에디터 설정값과 주어진 파라미터 값으로 변환하여 넘겨준다.
		 * @function
		 * @param {String} url - url 
		 * @param {Object} params - 키,값 쌍으로 이루어진 데이터 
		 * @returns {String} 변환된 url
		 * @example 
		 * 		TrexConfig.getUrl("#host#path/pages/trex/image.html?username=#username", {
		 * 			'username': 'daumeditor'
		 * 		});
		 */
		getUrl: function(url, params) {
			if(typeof url !== 'string') { return url; };
            var loader = _WIN['EditorJSLoader'] || opener && opener['EditorJSLoader'] || (PopupUtil && PopupUtil.getOpener()['EditorJSLoader']);
			url = url.replace(/#host#path\/pages\//g, loader.getPageBasePath());
			url = url.replace(/#host/g, __TREX_CONFIGURE["txHost"]);
			url = url.replace(/#path\/?/g, __TREX_CONFIGURE["txPath"]);
			url = url.replace(/#cdnhost/g, __TREX_CONFIGURE["cdnHost"]);
			url = url.replace(/#cmnhost/g, __TREX_CONFIGURE["cmnHost"]);

			for(var _name in __TREX_PARAM) {
				url = url.replace(new RegExp("#".concat(_name), "g"), __TREX_CONFIGURE[__TREX_PARAM[_name]]);
			}

			if(params) {
				for(var name in params) {
					url = url.replace(new RegExp("#".concat(name), "g"), params[name]);
				}
			}
			
			return url;
		},
		/**
		 * 팝업창을 띄울때 옵션을 문자열로 만들어 넘겨준다.
		 * @function
		 * @param {Object} features - 키,값 쌍으로 이루어진 데이터 
		 * @returns {String} 옵션 문자열
		 * @example 
		 * 		TrexConfig.getPopFeatures({ left:250, top:65, width:797, height:644 });
		 */
		getPopFeatures: function(features) {
			if(features == _NULL) return _NULL;
			if(typeof(features) === "string") { //redefine
				return features;
			}
			var popFeatures = [];
			["toolbar", "location", "directories", "menubar"].each(function(name) {
				popFeatures.push(name + "=" + (features[name] || "no"));	
			});
			["scrollbars", "resizable"].each(function(name) {
				popFeatures.push(name + "=" + (features[name] || "yes"));	
			});
			["width", "height"].each(function(name) {
				popFeatures.push(name + "=" + (features[name] || "500"));	
			});
			["left", "top"].each(function(name) {
				popFeatures.push(name + "=" + (features[name] || "100"));	
			});
			return popFeatures.join(",");
		},
		/**
		 * 컨텐츠 삽입용 이미지의 상위 url을 넘겨준다. <br/>
		 * txDecoPath 값이 셋팅된 경우는 해당 url을 넘겨준다.
		 * @function
		 * @param {String} url - url 
		 * @param {String} subpath - 하위 디렉터리 (optional)
		 * @returns {String} 변환된 컨텐츠 삽입용 이미지url
		 */
		getDecoPath: function(url) {
			return url.replace(/#decopath\/?/, this.getUrl(__TREX_CONFIGURE["txDecoPath"]));
		},
		/**
		 * 에디터에서 사용되는 이미지의 상위 url을 넘겨준다. <br/>
		 * txIconPath 값이 셋팅된 경우는 해당 url을 넘겨준다.
		 * @function
		 * @param {String} url - url 
		 * @param {String} subpath - 하위 디렉터리 (optional)
		 * @returns {String} 에디터에서 사용되는 이미지url
		 */
		getIconPath: function(url) {
			return url.replace(/#iconpath\/?/, this.getUrl(__TREX_CONFIGURE["txIconPath"]));
		},
		/**
		 * 에디터 로딩이 완료되면 설정값을 셋업시키는 함수로
		 * postprocessing로 등록된 함수들을 실행하며
		 * 이후에는 설정값을 추가할 수 없다.
		 * @private
		 * @function
		 * @param {Object} config - new Editor() 할 때 입력한 설정값
		 * @returns {Object} 셋업된 설정값
		 */
		setup: function(config) { 
			$tx.deepcopy(__TREX_CONFIGURE, config);
			
			__TREX_CONFIGURE.params.each(function(name) {
				_addParameter(name, name);
			});
			__POST_PROCESSOR.each(function(fn) {
				fn(__TREX_CONFIGURE);
			});
	
			__IS_SETUP = _TRUE;
			
			this.setupVersion();
			return __TREX_CONFIGURE;
		},
		setupVersion: function() {
			// 다른 곳에서 txVersion 을 사용할 수도 있기에 호환을 위해 txVersion 추가
			__TREX_CONFIGURE.txVersion = Editor.version;
		},
		/**
		 * 파라미터를 추가한다.<br/> 
		 * 파라미터란 getUrl 할 때 기본으로 변환할 키,값들을 정의해놓은 데이터
		 * @function
		 * @param {String} tname - url에 포함될 id 
		 * @param {String} pname - 설정값에 존재하는 id
		 * @example
		 * 		TrexConfig.addParameter('host', 'txHost');
		 */
		addParameter: function(tname, pname) {
			_addParameter(tname, pname);
		},
		/**
		 * 주어진 설정값을 deep copy로 복사한다.
		 * @function
		 * @param {Object} config - 주어진 설정값
		 */
		clone: function(config) {
			return $tx.deepcopy({}, config);
		},
		/**
		 * 주어진 설정값에 새로운 설정값들을 deep copy로 복사한다. 
		 * @function
		 * @param {Object} config - 첫번째 인자는 주어진 설정값, 그 이후는 새로운 설정값들
		 * @example 
		 * 		TrexConfig.merge(config, { 'id': 'tx_happy' }, { 'options': [1,2,3] });
		 */
		merge: function() {
			var _config = {};
			$A(arguments).each(function(source) {
				$tx.deepcopy(_config, source);
			});
			return _config;
		}
	};
	
	/**
	 * 주어진 설정값을 root 설정값에 추가한다.
	 * @name add
	 * @memberOf TrexConfig
	 * @function
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	_trexConfig["add"] = function(config, postprocessing) {
		if (__IS_SETUP) {
			throw new Error("configure is already setup (mergeConfig)")
		}
		$tx.deepcopy(__TREX_CONFIGURE, config);
		if(postprocessing) {
			__POST_PROCESSOR.push(postprocessing);
		}
	};
	/**
	 * 주어진 키로 설정값을 리턴한다.
	 * @name get
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키
	 */
	_trexConfig["get"] = function(key) {
		return __TREX_CONFIGURE[key];
	};
	
	/**
	 * 주어진 키로 주어진 설정값을 root/toolbar 아래에 추가한다.
	 * @name addTool
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/sidebar 아래에 추가한다.
	 * @name addSidebar
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/plugin 아래에 추가한다.
	 * @name addPlugin
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/adaptor 아래에 추가한다.
	 * @name addAdaptor
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/save 아래에 추가한다.
	 * @name addSave
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/sidebar/attacher 아래에 추가한다.
	 * @name addAttacher
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/sidebar/embeder 아래에 추가한다.
	 * @name addEmbeder
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	/**
	 * 주어진 키로 주어진 설정값을 root/sidebar/searcher 아래에 추가한다.
	 * @name addSearcher
	 * @memberOf TrexConfig
	 * @function
	 * @param {String} key - 주어진 키값 
	 * @param {Object} config - 주어진 설정값
	 * @param {Function} postprocessing - 에디터가 로딩된 후 처리할 함수 (optional)
	 */
	var _addConfig = function(key, config, postprocessing) {
		if (__IS_SETUP) {
			throw new Error("configure is already setup (mergeConfig)")
		}
		this[key] = this[key] || {};
		$tx.deepcopy(this[key], config);
		if(postprocessing) {
			__POST_PROCESSOR.push(postprocessing);
		}
	};
	
	/**
	 * 주어진 키로 root/toolbar[key]의 설정값을 리턴한다.
	 * @name getTool
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/sidebar[key]의 설정값을 리턴한다.
	 * @name getSidebar
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/adaptor[key]의 설정값을 리턴한다.
	 * @name getAdaptor
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/save[key]의 설정값을 리턴한다.
	 * @name getSave
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/sidebar/attacher[key]의 설정값을 리턴한다.
	 * @name getAttacher
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/sidebar/embeder[key]의 설정값을 리턴한다.
	 * @name getEmbeder
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	/**
	 * 주어진 키로 root/sidebar/searcher[key]의 설정값을 리턴한다.
	 * @name getSearcher
	 * @memberOf TrexConfig
	 * @function
	 * @param {String,Object} key - 주어진 키
	 */
	var _getConfig = function(key) {
		return this[key];
	};
	
	var _anchors = _createAnchors();
	for(var _name in _anchors) {
		_trexConfig["add" + _name] = _addConfig.bind(_anchors[_name]);
		_trexConfig["get" + _name] = _getConfig.bind(_anchors[_name]);
	}
	
	return _trexConfig;
	
}();

_WIN.TrexConfig = TrexConfig;