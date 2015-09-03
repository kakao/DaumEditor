
/** @namespace */
var $tx = {}; 
(function() {
	/**
	 * @function
	 */
	Object.extend = function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	};
	
	_WIN.Class = {
		create: function() {
			return function() {
				this.initialize.apply(this, arguments);
			};
		}
	};
	/**
	 * @class
	 */
	_WIN.$break = {};
	/**
	 * 함수(=메소드) 소유자 객체로 미리 묶는 함수의 인스턴스를 반환. 반환된 함수는 원래의 것과 같은 인자를 가질 것이다.
	 * @function
	 */
	Function.prototype.bind = function() {
		var __method = this, args = $A(arguments), object = args.shift();
		return function() {
			return __method.apply(object, args.concat($A(arguments)));
		};
	};
	/**
	 * 유하는 객체 함수(=메소드) 소유자 객체로 미리 묶는 함수의 인스턴스를 반환. 반환된 함수는 이것의 인자로 현재 이벤트 객체를 가질것이다.
	 * @function
	 */
	Function.prototype.bindAsEventListener = function() {
		var __method = this, args = $A(arguments), object = args.shift();
		return function(event) {
			return __method.apply(object, [event || _WIN.event].concat(args));
		};
	};
	
	var txlib = function(element) {
		var args = arguments;
		if (args.length > 1) {
			for (var i = 0, elements = [], length = args.length; i < length; i++) 
				elements.push($tx(args[i]));
			return elements;
		}
		if (typeof element == 'string') {
			element = _DOC.getElementById(element);
		}
		return element;
	};
	$tx = txlib;
	
	var txua = navigator.userAgent.toLowerCase();
	var isExistAgentString = function(str){
		return txua.indexOf(str)!=-1;
	};
    var isExistAgentStringByRegx = function(regx){
        return regx.test(txua);
    };
	Object.extend($tx, /** @lends $tx */{
		/**
		 * Chrome browser 이면 true
		 * @field
		 */
		chrome: isExistAgentString("chrome"),
		/**
		 * safari browser 이면 true 
		 * @field
		 */
		safari: isExistAgentString("safari") && isExistAgentString("chrome") == _FALSE,
		/**
		 * Firefox browser 이면 true 
		 * @field
		 */
		gecko: isExistAgentString("firefox"),
		/**
		 * Firefox browser의 버전 
		 * @field
		 */
		gecko_ver: isExistAgentString("firefox")?parseFloat(txua.replace(/.*firefox\/([\d\.]+).*/g,"$1")):0,
		/**
		 * MS IE 이면 true
         * IE7 이하는 msie로 구분
         * IE8 이상은 trident로 구분
		 * @field
		 */
        msie: isExistAgentString("msie") || isExistAgentString("trident"),
		/**
		 * MS IE browser 버전 a.match(/rv:(\d+)\.\d+/)
         * IE7 이하는 msie로 구분
         * IE8 이상은 trident & rv:x로 구분
		 * @field
		 */
        msie_ver: isExistAgentString("msie") || isExistAgentString("trident")?(function(){
            return isExistAgentString("msie") ? parseFloat(txua.split("msie")[1]) : parseFloat(txua.split("rv:")[1]);
        })():0,
        /**
         * MS IE document mode 버전
         * @field
         */
        msie_docmode: _DOC.documentMode || 0,
		/**
		 * AppleWebKit browser 이면 true 
		 * @field
		 */
		webkit: isExistAgentString("applewebkit"),
		/**
		 * AppleWebKit 버전
		 * @field
		 */
		webkit_ver: isExistAgentString("applewebkit")?parseFloat(txua.replace(/.*safari\//g,"")):0,
		/**
		 * Opera 이면 true 
		 * @field
		 */
		opera: isExistAgentString("opera"),
		 /**  
 	      * Presto browser 이면 true   
		  * @field  
		  */
		presto: isExistAgentString("presto"),
		os_win: isExistAgentString("win"),
        os_win7: isExistAgentString('windows nt 6.1'),
        os_win8: isExistAgentString('windows nt 6.2'),
        os_win8_1: isExistAgentString('windows nt 6.3'),
		os_mac: isExistAgentString("mac"),
		/**
		 * iPhone 이면 true 
		 * @field
		 */
		iphone: isExistAgentString("iphone"),
		/**
		 * iPod 이면 true 
		 * @field
		 */
		ipod: isExistAgentString("ipod"),
		/**
		 * iPad 이면 true 
		 * @field
		 */
		ipad: isExistAgentString("ipad"),
		/**
		 * iPhone, iPod Touch, iPad 이면 true (애플 모바일 OS)
		 */
		ios: isExistAgentString("like mac os x") && isExistAgentString("mobile"),
		/**
		 * iPhone, iPod Touch, iPad 의 iOS 버전
		 */
		ios_ver: (isExistAgentString("like mac os x") && isExistAgentString("mobile")) ? parseFloat(txua.replace(/^.*os (\d+)([_\d]*) .*$/g, "$1.$2").replace(/_/g, "")) : 0,
		/**
		 * Android 이면 true
		 */
		android: isExistAgentString("android"),
		/**
		 * Android OS 버전
		 */
		android_ver: isExistAgentString("android") ? parseFloat(txua.replace(/.*android[\s]*([\d\.]+).*/g, "$1")) : 0,
		/**
		 *  BlackBerry 이면 true
		 */
		blackberry: isExistAgentString("blackberry"),
		/**
		 *  Windows Phone OS 이면 true
		 */
		winphone: isExistAgentString("windows phone os"),
		/**
		 *  Windows CE 이면 true
		 */
		wince: isExistAgentString("windows ce")
	});

    Object.extend($tx, /** @lends $tx */{
        //msie11above: (isExistAgentString("trident") && isExistAgentStringByRegx(/rv:\d+\.\d+/)),//@Deprecated $tx.msie11above
        msie_std: ($tx.msie && !_DOC.selection),
        msie_nonstd: ($tx.msie && !!_DOC.selection),
        msie6: ($tx.msie && 6 <= $tx.msie_ver && $tx.msie_ver < 7),
        msie_quirks: (function(){
            try {
                return $tx.msie && _WIN.top.document.compatMode !== 'CSS1Compat'
            } catch(e) {
                try {
                    return _DOC.compatMode !== 'CSS1Compat'
                } catch(e) {
                    return _FALSE;
                }
            }
        })()
    });

	Object.extend($tx, /** @lends $tx */{
		extend: Object.extend,
		/**
		 * browser의 이름 리턴
		 * @function
		 */
		browser: function() {
			if($tx.msie) {
				return 'msie';
			} else if($tx.gecko) {
				return 'firefox';
			} else if($tx.chrome) {
				return 'chrome';
			} else if($tx.webkit) {
				return 'safari';
			} else if($tx.opera) {
				return 'opera';
			} else {
				return "";
			}
		}()
	});
	
	/**
	 * @function
	 */
	_WIN.$must = function(id, className) {
		var _el = $tx(id);
		if (!_el) {
			throw new Error("[Exception] " + className + ": cannot find element: id='" + id + "'");
		}
		return _el;
	};
	
	//expose
	_WIN.txlib = txlib;
})();

(function() {
	/**
	 * template
	 * @deprecated
	(function() {
		window.Template = Class.create();
		Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\}|#%7B(.*?)%7D)/;
		Template.prototype = {
			initialize: function(template, pattern) {
				this.template = template.toString();
				this.pattern = pattern || Template.Pattern;
			},
			evaluate: function(object) {
				return this.template.gsub(this.pattern, function(match) {
					var before = match[1];
					if (before == '\\')
						return match[2];
					return before + String.interpret(object[match[3] || match[4]]);
				});
			}
		};
	})();
	*/

	$tx.extend($tx, /** @lends $tx */{
		/**
		 * 주어진 element와 관련된 CSS 클래스명을 표시하는 Element.ClassNames 객체를 반환
		 * @function
		 */
		classNames: function(el) {
			return el.className.split(' ');
		},
		/**
		 * 요소가 class명중에 하나로 주어진 class명을 가진다면 true를 반환
		 * @function
		 */
		hasClassName: function(el, className) {
            if (className && el.className) {
                var classNames = el.className.split(/\s+/);
                return classNames.contains(className);
            }
            return _FALSE;
        },
		/**
		 * 주어진 class명을 요소의 class명으로 추가
		 * @function
		 */
		addClassName: function(el, c) {
			if (!this.hasClassName(el, c)) {
				el.className += ' ' + c;
            }
		},
		/**
		 * 요소의 class명으로 부터 주어진 class명을 제거
		 * @function
		 */
		removeClassName: function(el, className) {
			var classNames = el.className.split(/\s+/);
            el.className = classNames.without(className)
                                     .compact()
                                     .join(' ');
		},
		/**
		 * 요소가 눈에 보이는지 표시하는 Boolean값을 반환
		 * @function
		 */
		visible: function(element) {
			//return $tx(element).style.display != 'none';
			return $tx.getStyle(element, "display" ) != 'none';
		},
		/**
		 * 각각의 전달된 요소의 가시성(visibility)을 토글(toggle)한다.
		 * @function
		 */
		toggle: function(element) {
			element = $tx(element);
			$tx[$tx.visible(element) ? 'hide' : 'show'](element);
			return element;
		},
		/**
		 * style.display를 'block'로 셋팅하여 각각의 요소를 보여준다.
		 * @function
		 */
		show: function(element) {
			$tx(element).style.display = 'block';
			return element;
		},
		/**
		 * style.display를 'none'로 셋팅하여 각각의 요소를 숨긴다.
		 * @function
		 */
		hide: function(element) {
			$tx(element).style.display = 'none';
			return element;
		}
	});
})();

$tx.extend($tx, /** @lends $tx */{
    /**
     * 인자로 넘겨 받은 Element의 style 속성값을 리턴한다.
     * @function
     * @param {HTMLElement} element
     * @param {string} style property name
     */
    getStyle: function(element, style) {
        element = $tx(element);
        style = style == 'float' ? 'cssFloat' : style.camelize();
        var value = element.style[style];
        if (!value) {
			var win = (_DOC.defaultView || _DOC.parentWindow);
            var css = win.getComputedStyle(element, _NULL);
            value = css ? css[style] : _NULL;
        }
        if (style == 'opacity')
            return value ? parseFloat(value) : 1.0;
        return value == 'auto' ? _NULL : value;
    },

    /**
     * 요소의 style 속성을 셋팅한다.
     * @function
     */
    setStyle: function(element, styles, camelized) {
        element = $tx(element);
        var elementStyle = element.style;
        for (var property in styles) {
            if (styles.hasOwnProperty(property)) {
                if (property === 'opacity') {
                    $tx.setOpacity(element, styles[property]);
                } else {
                    // TODO What the...
                    elementStyle[(property === 'float' || property === 'cssFloat') ? (elementStyle.styleFloat === _UNDEFINED ? 'cssFloat' : 'styleFloat') : (camelized ? property : property.camelize())] = styles[property];
                }
            }
        }
        // TODO is it necessary?
        return element;
    },

    setStyleProperty: function(element, styles) {
        var isCamelizedPropertyName = _TRUE;
        this.setStyle(element, styles, isCamelizedPropertyName);
    },

    /**
     * 요소의 style속성 중 opacity 값을 리턴한다.
     * @function
     */
    getOpacity: function(element) {
        return $tx(element).getStyle('opacity');
    },

    /**
     * 요소의 opacity style 속성을 셋팅한다.
     * @function
     */
    setOpacity: function(element, value) {
        element = $tx(element);
        element.style.opacity = (value == 1 || value === '') ? '' : (value < 0.00001) ? 0 : value;
        return element;
    },

    applyCSSText: function(targetDocument, cssText) {
        var styleElement = targetDocument.createElement('style');
        styleElement.setAttribute("type", "text/css");
        if (styleElement.styleSheet) { // IE
            styleElement.styleSheet.cssText = cssText;
        } else { // the other
            styleElement.textContent = cssText;
        }
        targetDocument.getElementsByTagName('head')[0].appendChild(styleElement);
    }

});
(function() {

	if ($tx.msie_nonstd) {
        $tx.getStyle = function (element, style) {
            element = $tx(element);
            style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
            var value = element.style[style];
            if (!value && element.currentStyle)
                value = element.currentStyle[style];
            if (style == 'opacity') {
                if (value = ($tx.getStyle(element, 'filter') || '').match(/alpha\(opacity=(.*)\)/))
                    if (value[1])
                        return parseFloat(value[1]) / 100;
                return 1.0;
            }
            if (value == 'auto') {
                if ((style == 'width' || style == 'height') && ($tx.getStyle(element, 'display') != 'none')) {
                    return element['offset' + style.capitalize()] + 'px';
                }
                return _NULL;
            }
            return value;
        };
    }

    if ($tx.msie_nonstd) {
        $tx.setOpacity = function (element, value) {
            element = $tx(element);
            var filter = $tx.getStyle(element, 'filter'), style = element.style;
            if (value == 1 || value === '') {
                style.filter = filter.replace(/alpha\([^\)]*\)/gi, '');
                return element;
            } else if (value < 0.00001)
                value = 0;
            style.filter = filter.replace(/alpha\([^\)]*\)/gi, '') +
                    'alpha(opacity=' +
                    (value * 100) +
                    ')';
            return element;
        };
    }

    if ($tx.gecko) {
		$tx.extend($tx, {
			setOpacity: function(element, value) {
				element = $tx(element);
				element.style.opacity = (value == 1) ? 0.999999 : (value === '') ? '' : (value < 0.00001) ? 0 : value;
				return element;
			}
		});
	}


    // json2.js helper functions
    $tx.JSONHelper = {
        /**
         * JSON.stringify 시에 문자열을 encodeURIComponent 처리 하여준다.
         * @example JSON.stringify(object, $tx.JSONHelper.encodeURIComponentReplacer);
         */
        encodeURIComponentReplacer: function (key, value) {
            if (typeof value === 'string') {
                if (!isStringifiedArray(value)) {
                    return encodeURIComponent(value);
                }
            }
            return value;
        },
        /**
         * JSON.parse 시에 문자열을 decodeURIComponent 처리 하여준다.
         * @example JSON.parse(object, $tx.JSONHelper.decodeURIComponentReviver);
         */
        decodeURIComponentReviver: function (key, value) {
            if (typeof value === 'string') {
                if (!isStringifiedArray(value)) {
                    return decodeURIComponent(value);
                } else {
                    // "{ \"string\": \"[1,2,3]\" }" 의 경우 => { "string": [1, 2, 3] } 으로 파싱된다.
                    // WHY???
                    try {
                        // "[말머리]" 와 같은 값은 파싱 중 오류가 발생한다. 이런 경우는 무시하고 value를 그대로 반환하도록 한다. #FTDUEDTR-1432
                        return JSON.parse(value, arguments.callee);
                    } catch(ignore) {}
                }
            }
            return value;
        }
    };

    // 이 문자열이 "[1, 3, 4]" 와 같이 배열을 Stringify 한 것인지 확인한다
    var isStringifiedArray = function (str) {
        if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
            try{
                JSON.parse(str);
                return true;
            }catch (ignore) {}
        }
        return false;
    };
})();

//position
(function() {
	$tx.extend($tx, /** @lends $tx */ {
		/**
		 * 요소의 최상위 요소까지의 offset position 을 더한 값을 리턴한다.
		 * @function
		 */
		cumulativeOffset: function(element) {
			var valueT = 0, valueL = 0;
			do {
				valueT += element.offsetTop || 0;
				valueL += element.offsetLeft || 0;
				element = element.offsetParent;
			} while (element);
			return [valueL, valueT];
		},
		/**
		 * 요소의 최상위 요소까지의 offset position 을 더한 값을 리턴한다.
		 * 상위 요소가 body이거나 position이 relative 또는 absolute 인 경우 계산을 중지한다.
		 * @function
		 */
		positionedOffset: function(element) {
			var valueT = 0, valueL = 0;
			do {
				valueT += element.offsetTop || 0;
				valueL += element.offsetLeft || 0;
				element = element.offsetParent;
				if (element) {
					if (element.tagName == 'BODY') 
						break;
					var p = $tx.getStyle(element, 'position');
					if (p == 'relative' || p == 'absolute') 
						break;
				}
			} while (element);
			return [valueL, valueT];
		},
		/**
		 * element의 면적(dimensions)을 반환. 반환된 값은 두개의 프라퍼티(height 와 width)를 가지는 객체이다. 
		 * @function
		 */
		getDimensions: function(element) {
		    var display = $tx.getStyle(element, 'display');
		    if (display != 'none' && display != _NULL) // Safari bug
		      return {width: element.offsetWidth, height: element.offsetHeight};
		
		    // All *Width and *Height properties give 0 on elements with display none,
		    // so enable the element temporarily
		    var els = element.style;
		    var originalVisibility = els.visibility;
		    var originalPosition = els.position;
		    var originalDisplay = els.display;
		    els.visibility = 'hidden';
		    els.position = 'absolute';
		    els.display = 'block';
		    var originalWidth = element.clientWidth;
		    var originalHeight = element.clientHeight;
		    els.display = originalDisplay;
		    els.position = originalPosition;
		    els.visibility = originalVisibility;
		    return {width: originalWidth, height: originalHeight};
		},
	 
	   /**
	   * 요소의 최상위 요소까지의 offset position 을 더한 값을 리턴한다.
	   * 상위 요소가 body이거나 position이 relative 또는 absolute 인 경우 계산을 중지한다.
	   * left, top, right, bottom 값을 리턴한다.
	   * @function
	   */ 
		getCoords : function(e, useOffset) {
			var uo = useOffset || false;
			var	w = e.offsetWidth;
			var	h = e.offsetHeight;
			var	coords = { "left": 0, "top": 0, "right": 0, "bottom": 0 };
			var	p;
			while(e){
				coords.left += e.offsetLeft || 0;
				coords.top += e.offsetTop || 0;
				e = e.offsetParent;
				if(uo){
					if(e){
						if(e.tagName == "BODY"){break;}
						p = $tx.getStyle(e, "position");
						if(p !== "static"){break;}
					}
				}
			}
			coords.right = coords.left + w;
			coords.bottom = coords.top + h;
			return coords;
		},
	 
		getCoordsTarget: function(element){
			return this.getCoords(element, _TRUE);
		}
	 
	});
	
	
	// Safari returns margins on body which is incorrect if the child is absolutely
	// positioned.  For performance reasons, redefine Position.cumulativeOffset for
	// KHTML/WebKit only.
	if ($tx.webkit) {
		$tx.cumulativeOffset = function(element) {
			var valueT = 0, valueL = 0;
			do {
				valueT += element.offsetTop || 0;
				valueL += element.offsetLeft || 0;
				if (element.offsetParent == _DOC.body) 
					if ($tx.getStyle(element, 'position') == 'absolute') 
						break;
				element = element.offsetParent;
			} while (element);
			return [valueL, valueT];
		};
	}
	
})();

//events
(function () /** @lends $tx */ {
	$tx.extend($tx, {
		/** @field backspace key */
		KEY_BACKSPACE: 8,
		/** @field tab key */
		KEY_TAB: 9,
		/** @field return key */
		KEY_RETURN: 13,
		/** @field esc key */
		KEY_ESC: 27,
		/** @field left key */
		KEY_LEFT: 37,
		/** @field up key */
		KEY_UP: 38,
		/** @field right key */
		KEY_RIGHT: 39,
		/** @field down key */
		KEY_DOWN: 40,
		/** @field delete key */
		KEY_DELETE: 46,
		/** @field home key */
		KEY_HOME: 36,
		/** @field end key */
		KEY_END: 35,
		/** @field pageup key */
		KEY_PAGEUP: 33,
		/** @field pagedown key */
		KEY_PAGEDOWN: 34,
		/**
		 * 이벤트의 target 또는 srcElement 를 반환
		 * @function
		 */
		element: function(event) {
			return $tx(event.target || event.srcElement);
		},
		/**
		 * 마우스 왼쪽 버튼을 클릭시 true값 반환
		 * @function
		 */
		isLeftClick: function(event) {
			return (((event.which) && (event.which == 1)) ||
			((event.button) && (event.button == 1)));
		},
		/**
		 * 페이지에서 마우스 포인터의 x측 좌표값 반환
		 * @function
		 */
		pointerX: function(event) {
			var eventDoc = $tx.element(event).ownerDocument||_DOC;
			var doc = eventDoc.documentElement;
			var body = eventDoc.body;
			return event.pageX || (event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 ));
		},
		/**
		 * 페이지에서 마우스 포인터의 y측 좌표값 반환
		 * @function
		 */
		pointerY: function(event) {
			var eventDoc = $tx.element(event).ownerDocument||_DOC;
			var doc = eventDoc.documentElement;
			var body = eventDoc.body;
			return event.pageY || (event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 ));
		},
		/**
		 * 이벤트의 디폴트 행위를 취소하고 위임을 연기하기 위해 이 함수를 사용
		 * @function
		 */
		stop: function(event) {
			if (event.preventDefault) {
				event.preventDefault();
				event.stopPropagation();
			} else {
				event.returnValue = _FALSE;
				event.cancelBubble = _TRUE;
			}
		},
		/**
		 * 이벤트가 시작된 노드로부터 상위로 순회하며 주어진 태그이름을 갖는 첫번째 노드를 찾는다.
		 * find the first node with the given tagName, starting from the
		 * node the event was triggered on; traverses the DOM upwards
		 * @function
		 */
		findElement: function(event, tagName) {
			var element = $tx.element(event);
			while (element.parentNode &&  
			(!element.tagName || !element.tagName.toUpperCase ||
			(element.tagName.toUpperCase() != tagName.toUpperCase()))) 
				element = element.parentNode;
			return element;
		},
		observers: _FALSE,
		_observeAndCache: function(element, name, observer, useCapture) {
			if (!this.observers) 
				this.observers = [];
			if (element.addEventListener) {
				this.observers.push([element, name, observer, useCapture]);
				element.addEventListener(name, observer, useCapture);
			} else if (element.attachEvent) {
				this.observers.push([element, name, observer, useCapture]);
				element.attachEvent('on' + name, observer);
			}
		},

        simulateEvent: function(elem, eventName, event) {
            var observers = $tx.observers;
            if (!observers) {
				return;
            }
			for (var i = 0, length = observers.length; i < length; i++) {
                var observer = observers[i];
                if (observer && observer[1] === eventName && observer[0] === elem) {
//                if (observer && observer[1] === eventName && $tom.include(observer[0], elem)) {
                    observer[2](event);
                }
			}
        },

		unloadCache: function() {
			if (!$tx.observers) 
				return;
			for (var i = 0, length = $tx.observers.length; i < length; i++) {
				$tx.stopObserving.apply(this, $tx.observers[i]);
				$tx.observers[i][0] = _NULL;
			}
			$tx.observers = _FALSE;
		},
		/**
		 * 이벤트를 위한 이벤트 핸들러 함수를 추가
		 * @function
		 * @param {Object} element 요소객체 또는 아이디
		 * @param {String} name 이벤트 명
		 * @param {Function} observer 이벤트를 다루는 함수
		 * @param {Boolean} useCapture true라면, capture내 이벤트를 다루고 false라면 bubbling 내 이벤트를 다룬다.
		 */
		observe: function(element, name, observer, useCapture) {
			element = $tx(element);
			useCapture = useCapture || _FALSE;
			if (name == 'keypress' /*&& ($tx.webkit || element.attachEvent)*/) {
				name = 'keydown';
			}
			$tx._observeAndCache(element, name, observer, useCapture);
		},
		/**
		 * 이벤트로부터 이벤트 핸들러를 제거
		 * @function
		 * @param {Object} element 요소객체 또는 아이디
		 * @param {String} name 이벤트 명
		 * @param {Function} observer 이벤트를 다루는 함수
		 * @param {Boolean} useCapture true라면, capture내 이벤트를 다루고 false라면 bubbling 내 이벤트를 다룬다.
		 */
		stopObserving: function(element, name, observer, useCapture) {
			element = $tx(element);
			useCapture = useCapture || _FALSE;
			if (name == 'keypress' /*&&
			($tx.webkit || element.attachEvent)*/)
				name = 'keydown';
			if (element.removeEventListener) {
				element.removeEventListener(name, observer, useCapture);
			} else if (element.detachEvent) {
				try {
					element.detachEvent('on' + name, observer);
				} catch (e) {
				}
			}
		}
	});
	//  prevent memory leaks in IE 
	if ($tx.msie) {
		$tx.observe(window, 'unload', $tx.unloadCache, _FALSE);
	}
})();

(function()  {
	$tx.extend(Object, /** @lends Object */ {
		/**
		 * object 를 복사
		 * @function
		 */
		clone: function(object) {
			return Object.extend({}, object);
		}
	});
	
	$tx.extend($tx, {
		isPrimitiveType: function(data) {
			var primitiveTypes = new $tx.Set("string", "number", "boolean", "date", "function");
			return primitiveTypes.contains(typeof data);
		},
		deepcopy: function(preset, service) {
			var _dest = preset;
			if(!service) {
				return _dest;
			}
			for(var _name in service) {
				switch(typeof(service[_name])) {
					case 'string':
					case 'number':
					case 'boolean': 
					case 'date':
					case 'function':
						_dest[_name] = service[_name];
						break;
					default:
						if (service[_name]) {
							if (service[_name].constructor == Array) {
								_dest[_name] = [].concat(service[_name]);
							} else {
								_dest[_name] = _dest[_name] || {};
								this.deepcopy(_dest[_name], service[_name]);
							}
						} else {
							_dest[_name] = _NULL;
						}
						break;
				}
			}
			return _dest;
		},
		defaults: function(dest, source){
			for(var name in source){
				if(dest[name] === _UNDEFINED){
					dest[name] = source[name];
				}
			}
		}
	});
})();

(function () {
	$tx.extend(String, /** @lends String */{
		/**
		 * value 를 문자열로 만들어 반환한다. value 가 null 이면 빈문자열을 반환한다.
		 * @function
		 */
		interpret: function(value) {
			return value == _NULL ? '' : String(value);
		},
		/**
		 * @field
		 */
		specialChar: {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'\\': '\\\\'
		}
	});
	$tx.extend(String.prototype, /** @lends String.prototype */{
		/**
		 * 현재 문자열에서 패턴 문자열을 찾은 결과의 문자열을 반환하고 대체 문자열이나 패턴에 일치하는 문자열을 가진 배열을 전달하는 대체함수를 호출한 결과로 대체한다. 
		 * 대체물이 문자열일때, #{n}과 같은 특별한 템플릿 형태의 토큰을 포함할수 있다. 
		 * 여기서 n이라는 값은 정규표현식 그룹의 인덱스이다.
		 * #{0}는 완전히 일치하면 대체될것이고 #{1}는 첫번째 그룹, #{2}는 두번째이다.
		 * @function
		 */
		gsub: function(pattern, replacement) {
			var result = '', source = this, match;
			replacement = arguments.callee.prepareReplacement(replacement);
			while (source.length > 0) {
				if (match = source.match(pattern)) {
					result += source.slice(0, match.index);
					result += String.interpret(replacement(match));
					source = source.slice(match.index + match[0].length);
				} else {
					result += source, source = '';
				}
			}
			return result;
		},
		/**
		 * 문자열 앞,뒤의 공백을 제거
		 * @function
		 */
		strip: function() {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		/**
		 * 문자열 중 태그 <tag> 를 삭제
		 * @function
		 */
		stripTags: function() {
			return this.replace(/<\/?[^>]+>/gi, '');
		},
		/**
		 * url query string 을 json 으로 만들어 반환한다. separator 를 & 대신 다른 값을 사용할 수 있다.
		 * @function
		 */
		toQueryParams: function(separator) {
			var match = this.strip().match(/([^?#]*)(#.*)?$/);
		    if (!match) return {};
		
			var _hash = {};
			var _lastkey = _NULL;
		    match[1].split(separator || '&').each(function(pair) {
				var _key = _NULL, _value = _NULL;
				var _matches = pair.match(/([\w_]+)=(.*)/);
				if(_matches) {
					_lastkey = _key = decodeURIComponent(_matches[1]);
					if(_matches[2]) {
						_value = decodeURIComponent(_matches[2]);
					}
				} else if(_lastkey) {
					_key = _lastkey;
					_value = _hash[_key];
					_value += '&' + decodeURIComponent(pair);
				} else {
					return;
				}
				if (_key in _hash) {
					if (_hash[_key].constructor != Array) 
						_hash[_key] = [_hash[_key]];
					_hash[_key].push(_value);
				} else {
					_hash[_key] = _value;
				}
			});
			return _hash;
		},
		/**
		 * 문자열을 배열로 반환한다.
		 * @function
		 */
		toArray: function() {
			return this.split('');
		},
		/**
		 * count 만큼 문자열을 반복하여 이어 붙인다.
		 * @function
		 */
		times: function(count) {
			var result = '';
			for (var i = 0; i < count; i++) 
				result += this;
			return result;
		},
		/**
		 * -(하이픈)으로 분리된 문자열을 camelCaseString으로 변환
		 * @function
		 */
		camelize: function() {
			var parts = this.split('-'), len = parts.length;
			if (len == 1) 
				return parts[0];
			var camelized = this.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
			for (var i = 1; i < len; i++) 
				camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
			return camelized;
		},
		/**
		 * 첫번째 글자를 대문자로 변환
		 * @function
		 */
		capitalize: function() {
			return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
		},
		/**
		 * 문자열이 주어진 패턴을 포함하면 true
		 * @function
		 */
		include: function(pattern) {
			return this.indexOf(pattern) > -1;
		},
		/**
		 * 빈문자열이면 true
		 * @function
		 */
		empty: function() {
			return this == '';
		},
		/**
		 * 공백문자열이면 true
		 * @function
		 */
		blank: function() {
			return /^\s*$/.test(this);
		}
	});
	String.prototype.gsub.prepareReplacement = function(replacement) {
		if (typeof replacement == 'function') 
			return replacement;
		var template = new Template(replacement);
		return function(match) {
			return template.evaluate(match);
		};
	};
	//////
	$tx.extend(String.prototype, /** @lends String.prototype */{
		/**
		 * 문자열 앞,뒤의 공백을 제거
		 * @function
		 */
		trim: function() {
			return this.replace(/(^\s*)|(\s*$)/g, "");
		},
		/**
		 * 정규표현식에서 사용되는 메타문자를 이스케이프해서 반환한다.
		 * @function
		 */
		getRegExp: function() {
			return this.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\//g, "\\/").replace(/\?/g, "\\?").replace(/\^/g, "\\^").replace(/\)/g, "\\)").replace(/\(/g, "\\(").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\$/g, "\\$").replace(/\+/g, "\\+").replace(/\|/g, "\\|").replace(/&/g, "(&|&amp;)");
		},
		/**
		 * 문자열을 정수형으로 반환한다. 숫자가 아닌 문자열은 0
		 * @function
		 */
		toNumber: function() {
			return (isNaN(this) ? 0 : parseInt(this, 10));
		},
		/**
		 * 문자열을 부동소수점 형태로 반환한다. 숫자가 아닌 문자열은 0
		 * @function
		 */
		toFloat: function() {
			return (isNaN(this) ? 0 : parseFloat(this));
		},
		/**
		 * 문자열의 길이를 반환
		 * @function
		 */
		getRealLength: function() {
			var str = this;
			var idx = 0;
			for (var i = 0; i < str.length; i++) {
				idx += (escape(str.charAt(i)).charAt(1) == "u") ? 2 : 1;
			}
			return idx;
		},
		/**
		 * 문자열이 주어진 길이보다 길면 자르고 마지막에 ... 를 붙인다.
		 * @function
		 */
		cutRealLength: function(length) {
			var str = this;
			var idx = 0;
			for (var i = 0; i < str.length; i++) {
				idx += (escape(str.charAt(i)).charAt(1) == "u") ? 2 : 1;
				if (idx > length) {
					return str.substring(0, i - 3).concat("...");
				}
			}
			return str;
		},
		/**
		 * @deprecated
		 */
		getCut: function(length) {
			return this.cutRealLength(length);
		},
		/**
		 * 문자열에 px 가 있으면 잘라내고 반환한다.
		 * @function
		 */
		parsePx: function() {
			if (this == _NULL || this.length == 0) 
				return 0;
			else if (this.indexOf("px") > -1) 
				return this.substring(0, this.indexOf("px")).toNumber();
			else 
				return this.toNumber();
		},
		/**
		 * 문자열에 px 를 붙여서 반환한다.
		 * @function
		 */
		toPx: function() {
			if (this.indexOf("px") > -1) {
				return this + "";
			} else {
				return this + "px";
			}
		},
		/**
		 * 픽셀값으로 사용 가능한 문자열인지 boolean 으로 반환 ( 공백 허용안함 )
		 * @function
		 */
		isPx: function(){
			var str = this;
			if ( str.trim() == "" ){
				return false;
			} else if( str.indexOf("px") != -1 ){
				str = this.parsePx();
			}  
			return !isNaN(str);
		},
        isPercent: function(){
            var str = this.trim();
            return parseInt(str, 10)+'%' === str;
        },
		/**
		 * 바이트를 계산하여 단위를(KB, MB) 붙여서 반환한다.
		 * @function
		 */
		toByteUnit: function() {
			return this.toNumber().toByteUnit();
		},
		/**
		 * 숫자로된 문자열을 천단위로 쉼표(,)를 붙인다.
		 * @function
		 */
		toCurrency: function() {
			var amount = this;
			for (var i = 0; i < Math.floor((amount.length - (1 + i)) / 3); i++) {
				amount = amount.substring(0, amount.length - (4 * i + 3)) + "," + amount.substring(amount.length - (4 * i + 3));
			}
			return amount;
		},
		/**
		 * source를 문자열 끝까지 찾아서 target으로 치환한다. 
		 * @function
		 */
		replaceAll: function(source, target) {
			source = source.replace(new RegExp("(\\W)", "g"), "\\$1");
			target = target.replace(new RegExp("\\$", "g"), "$$$$");
			return this.replace(new RegExp(source, "gm"), target);
		},
        underscore :function () {
        return this.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/-/g, '_')
            .toLowerCase();
        }
	});
})();

(function() {
	/**
	 * @name Number
	 * @class
	 */
	$tx.extend(Number.prototype, /** @lends Number.prototype */{
		/**
		 * 숫자로된 문자열이 주어진 길이보다 짧으면 앞부분에 0 으로 채워넣어서 반환한다.
		 * @function 
		 * @param {Number} length 반환되는 문자열의 최소 길이
		 * @param {Number} radix 표기될 진수. optional. 기본 10진수
		 */
		toPaddedString: function(length, radix) {
			var string = this.toString(radix || 10);
			return '0'.times(length - string.length) + string;
		},
		/**
		 * 
		 * @function
		 */
		toTime: function() {
			return Math.floor(this / 60).toString().toPaddedString(2) + ":" + (this % 60).toString().toPaddedString(2);
		},
		/**
		 * 바이트를 계산하여 단위를(KB, MB) 붙여서 반환한다.
		 * @function
		 */
		toByteUnit: function() {
			var number;
			var units = ['GB', 'MB', 'KB'];
			if (this == 0) {
				return "0" + units[2];
			}
			for (var i = 0; i < units.length; i++) {
				number = this / Math.pow(1024, 3 - i);
				if (number < 1) {
					continue;
				}
				return (Math.round(number * 10) / 10) + units[i];
			}
			return "1" + units[2];
		},
		/**
		 * px를 붙인다.
		 * @function
		 */
		toPx: function() {
			return this.toString() + "px";
		},
		/**
		 * 그대로 반환한다.
		 * @function
		 */
		parsePx: function() {
			return this + 0;
		},
		/**
		 * 숫자형은 무조건 px로 사용 가능하다.
		 */
		isPx: function(){
			return _TRUE;
		},
		/**
		 * 문자열을 정수형으로 반환한다. 숫자가 아닌 문자열은 0
		 * @function
		 */
		toNumber: function() {
			return this + 0;
		},
		/**
		 * 천단위로 쉼표(,)를 붙인다.
		 * @function
		 */
		toCurrency: function() {
			return this.toString().toCurrency();
		},
		/**
		 * 정규표현식에서 사용되는 메타문자를 이스케이프해서 반환한다.
		 * @function
		 */
		getRegExp: function() {
			return this.toString().getRegExp();
		}
	});
})();

(function() {
	$tx.extend(Array.prototype, /** @lends Array.prototype */{
		each: function(iterator) {
            if (_WIN['DEBUG']) {
                for (var i = 0, length = this.length; i < length; i++) {
                    iterator(this[i]);
                }
            } else {
                try {
                    for (var i = 0, length = this.length; i < length; i++) {
                        iterator(this[i]);
                    }
                } catch (e) {
                    if (e != $break) {
                        throw e;
                    }
                }
            }

			return this;
		},
        indexOf: function(value) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == value) {
                    return i;
                }
            }
            return -1;
        },
        map: function(f) {
            for (var b = [], i = 0, n = this.length; i < n; ++i) {
                b[i] = f(this[i]);
            }
            return b;
        },
		/**
		 * @deprecated use contains()
		 */
		include: function(object) {
            return this.contains(object);
		},
        contains: function(item) {
            return this.indexOf(item) >= 0;
        },
        /**
		 * 집합의 각각의 요소내 propertyName에 의해 명시된 프라퍼티에 값을 가져가고 Array객체로 결과를 반환한다.
		 * @function
		 */
		pluck: function(property) {
			var results = [];
			this.each(function(value) {
				results.push(value[property]);
			});
			return results;
		},
        /**
         * 배열 내에서 조건을 만족하는 첫번째 요소를 리턴한다.
         * @function
         * @param {function} filterFn 조건 함수. 조건에 만족하는 경우 true 리턴, 아닌 경우 false를 리턴한다.
         * @return {object}
         */
        find: function(filterFn) {
            for (var i = 0, len = this.length; i < len; i++) {
                var value = this[i];
                if (filterFn(value, i)) {
                    return value;
                }
            }
            return _NULL;
        },
        /**
		 * 배열 내에서 조건에 만족하는 요소들을 추출한다.
		 * @function
         * @param {function} filterFn 조건 함수. 조건에 만족하는 경우 true 리턴, 아닌 경우 false를 리턴한다.
         * @return {Array}
		 */
		findAll: function(filterFn) {
			var results = [];
            for (var i = 0, len = this.length; i < len; i++) {
                var value = this[i];
                if (filterFn(value, i)) {
                    results.push(value);
                }
            }
			return results;
		},
        /**
		 * iterator함수를 사용하여 집합의 모든 요소를 조합한다.
		 * 호출된 iterator는 accumulator인자에서 이전 반복의 결과를 전달한다.
		 * 첫번째 반복은 accumulator인자내 initialValue를 가진다. 마지막 결과는 마지막 반환값이다.
		 * @function
		 */
		inject: function(array, iterator) {
            for (var i = 0, len = this.length; i < len; i++) {
                var value = this[i];
                array = iterator(array, value, i);
            }
			return array;
		},
        /**
		 * 인자의 리스트에 포함된 요소를 제외한 배열을 반환. 이 메소드는 배열 자체를 변경하지는 않는다.
		 * @function
		 */
		without: function() {
			var values = $A(arguments);
			return this.findAll(function(value) {
				return !values.include(value);
			});
		},
        /**
		 * 배열의 마지막 요소를 반환한다.
		 * @function
		 */
		last: function() {
			return this[this.length - 1];
		},
        /**
		 * 기복이 없고, 1차원의 배열을 반환한다. 이 함수는 배열이고 반환된 배열내 요소를 포함하는 배열의 각 요소를 찾음으로써 수행된다.
		 * @function
		 */
		flatten: function() {
			return this.inject([], function(array, value) {
				return array.concat(value && value.constructor == Array ? value.flatten() : [value]);
			});
		},
		/**
		 * 배열의 요소가 null 이나 빈문자열이면 제거한다. 
		 * @function
		 */
		compact: function() {
			return this.findAll(function(value) {
				return (value != _NULL) && (value != '');
			});
		},
		/**
		 * 배열의 요소의 값 중 중복되는 값은 제거한다.
		 * @function
		 */
		uniq: function(sorted) {
		    return this.inject([], function(array, value, index) {
				if (0 == index || (sorted ? array.last() != value : !array.contains(value)))
					array.push(value);
				return array;
			});
		},
		/**
		 * 배열의 특정요소값을 추출하여 json객체(map)을 만든다.
		 * @function
		 */
		toMap: function(property) {
			var results = {};
			this.each(function(value) {
				results[value[property]] = value;
			});
			return results;
		}
	});
	/**
	 * @deprecated use Array.prototype.findAll
	 */
	Array.prototype.select = Array.prototype.findAll;
    /**
	 * @deprecated use Array.prototype.find
	 */
	Array.prototype.detect = Array.prototype.find;

	/** 
	 * array like object(length와 index를 이용한 요소 접근이 가능)를 Array object로 변환한다.
	 * @example
	 *  var arrayLikeObject = document.getElementsByTagName('img');
	 *  var arrayObject = $A(arrayLikeObject);
	 */
	_WIN.$A = function(arrayLikeObject) {
		if (!arrayLikeObject) {
            return [];
        }
        if (typeof arrayLikeObject.toArray === "function") {
			return arrayLikeObject.toArray();
		} else {
            var array = [];
            for (var i = 0, len = arrayLikeObject.length; i < len; i++) {
                array.push(arrayLikeObject[i]);
            }
            return array;
        }
    };

    $tx.Set = function (/* comma seperated elements */) {
    	var args = arguments;
        for (var i = 0, len = args.length; i < len; i++) {
            this[args[i]] = _TRUE;
        }
    };
    $tx.Set.prototype.contains = function (element) {
        return element in this;
    };

    $tx.objectToQueryString = function(obj) {
        var queryString = [];
        for (var key in obj) if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            if (value === _NULL || value === _UNDEFINED) { // 다른 falsy value 들은 값으로 출력되어야 한다.
                value = "";
            }
            queryString.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
        return queryString.join("&");
    };
})();

// crossbrowser
(function() {
	if (typeof(HTMLElement) != _UNDEFINED+'') {
//		HTMLElement.prototype.innerText;
		var hElementProto = HTMLElement.prototype;
		var hElementGrandProto = hElementProto.__proto__ = {
			__proto__: hElementProto.__proto__
		};
		if (HTMLElement.prototype.__defineSetter__) {
			hElementGrandProto.__defineSetter__("innerText", function(sText) {
				this.textContent = sText;
			});
		}
		if (HTMLElement.prototype.__defineGetter__) {
			hElementGrandProto.__defineGetter__("innerText", function() {
				return this.textContent;
			});
		}
	}
	
	if (typeof(XMLDocument) != _UNDEFINED+'') {
		var XMLDoc = XMLDocument;
		if (XMLDoc.prototype.__defineGetter__) {
			XMLDoc.prototype.__defineGetter__("xml", function() {
				return (new XMLSerializer()).serializeToString(this);
			});
		}
	}
	if (typeof(Node) != _UNDEFINED+'') {
		if (Node.prototype && Node.prototype.__defineGetter__) {
			Node.prototype.__defineGetter__("xml", function() {
				return (new XMLSerializer()).serializeToString(this);
			});
		}
	}
	//	Simple Implementation of 
	//		setProperty() and selectNodes() and selectSingleNode() 
	//		for FireFox [Mozilla]
	if (typeof(_DOC.implementation) != _UNDEFINED+'') {
		if (_DOC.implementation.hasFeature("XPath", "3.0")) {
			if (typeof(XMLDoc) != _UNDEFINED+'') {
				XMLDoc.prototype.selectNodes = function(cXPathString, xNode) {
					if (!xNode) {
						xNode = this;
					}
					var defaultNS = this.defaultNS;
					var aItems = this.evaluate(cXPathString, xNode, {
						normalResolver: this.createNSResolver(this.documentElement),
						lookupNamespaceURI: function(prefix) {
							switch (prefix) {
								case "dflt":
									return defaultNS;
								default:
									return this.normalResolver.lookupNamespaceURI(prefix);
							}
						}
					}, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, _NULL);
					var aResult = [];
					for (var i = 0; i < aItems.snapshotLength; i++) {
						aResult[i] = aItems.snapshotItem(i);
					}
					return aResult;
				};
				XMLDoc.prototype.setProperty = function(p, v) {
					if (p == "SelectionNamespaces" && v.indexOf("xmlns:dflt") == 0) {
						this.defaultNS = v.replace(/^.*=\'(.+)\'/, "$1");
					}
				};
				XMLDoc.prototype.defaultNS;
				// prototying the XMLDocument 
				XMLDoc.prototype.selectSingleNode = function(cXPathString, xNode) {
					if (!xNode) {
						xNode = this;
					}
					var xItems = this.selectNodes(cXPathString, xNode);
					if (xItems.length > 0) {
						return xItems[0];
					} else {
						return _NULL;
					}
				};
				XMLDoc.prototype.createNode = function(nNodeType, sNodeName, sNameSpace) {
					if (nNodeType == 1) 
						return this.createElementNS(sNameSpace, sNodeName);
					else //Etc Not Use
 
						return _NULL;
				};
			}
			if (typeof(Element) != _UNDEFINED+'') {
				Element.prototype.selectNodes = function(cXPathString) {
					if (this.ownerDocument.selectNodes) {
						return this.ownerDocument.selectNodes(cXPathString, this);
					} else {
						throw "For XML Elements Only";
					}
				};
				// prototying the Element 
				Element.prototype.selectSingleNode = function(cXPathString) {
					if (this.ownerDocument.selectSingleNode) {
						return this.ownerDocument.selectSingleNode(cXPathString, this);
					} else {
						throw "For XML Elements Only";
					}
				};
				Element.prototype.text;
				var elementProto = Element.prototype;
				var elementGrandProto = elementProto.__proto__ = {
					__proto__: elementProto.__proto__
				};
				if (Element.prototype.__defineSetter__) {
					elementGrandProto.__defineSetter__("text", function(text) {
						this.textContent = text;
					});
				}
				if (Element.prototype.__defineGetter__) {
					elementGrandProto.__defineGetter__("text", function() {
						return this.textContent;
					});
				}
				
				if ( _WIN.origElement ) {
					_WIN.origElement.prototype.selectNodes = Element.prototype.selectNodes;
					_WIN.origElement.prototype.selectSingleNode = Element.prototype.selectSingleNode;
				}
			}
		}
	}
})();


_WIN.$tx = $tx;