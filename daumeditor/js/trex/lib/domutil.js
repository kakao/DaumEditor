/** @namespace */
var $tom = {};

(function() {
	var __TRANSLATIONS = {
		'%body': ['body'],
		'%text': ['#text', 'br'],
		'%element': ['#element'],
		'%control': ['img','object','hr','table','button','iframe'], //['input','select','textarea','label','br'],
		'%inline': ['span','font','u','i','b','em','strong','big','small','a','sub','sup','span'],//['tt','dfn','code','samp','kbd','var','cite','abbr','acronym','img','object','br','script','map','q','bdo','input','select','textarea','label','button'],
		'%block': ['p','div','ul','ol','h1','h2','h3','h4','h5','h6','pre','dl','hr','table','button'], //['noscript','blockquote','form','fieldset','address'], !button
		'%paragraph': ['p','li','dd','dt','h1','h2','h3','h4','h5','h6','td','th','div','caption'], //!button
		'%wrapper': ['div','ul','ol','dl','pre','xmp','table','button','blockquote'],// FTDUEDTR-1412
        '%innergroup': ['li','dd','dt','td', 'th'],
		'%outergroup': ['ul','ol','dl','tr','tbody','thead','tfoot','table'],
		'%tablegroup': ['td', 'th','tr','tbody','thead','tfoot','table'],
		'%listgroup': ['li','ul','ol'],
		'%datagroup': ['dd','dt','dl'],
		'%listhead': ['ul','ol']
	};
	
	var __TRANSLATIONS_MAP = {}; //for caching
	for(var _ptrn in __TRANSLATIONS) {
		__TRANSLATIONS_MAP[_ptrn] = {};
		if (__TRANSLATIONS[_ptrn]) {
			$A(__TRANSLATIONS[_ptrn]).each(function(tag){
				__TRANSLATIONS_MAP[_ptrn][tag] = _TRUE;
			});
		}
	}
	
	function createMap(patterns) {
		var _map = {};
		var _patterns = patterns.split(",");
		_patterns.each(function(pattern) {
			if(__TRANSLATIONS_MAP[pattern]) {
				for(var _part in __TRANSLATIONS_MAP[pattern]) {
					_map[_part] = _TRUE;
				}
			} else {
				_map[pattern] = _TRUE;
			}
		});
		return _map;
	}
	
	var Translator = Trex.Class.create({
		initialize: function(patterns) {
			this.patterns = patterns;
			this.map = createMap(patterns);
		},
		hasParts: function() {
			return (this.patterns.length > 0);
		},
		include: function(partPtrn) {
			var _partMap = createMap(partPtrn);
			for(var _part in _partMap) {
				if(this.map[_part]) {
					return _TRUE;
				}
			}
			return _FALSE;
		},
		memberOf: function(wholePtrn) {
			var _wholeMap = createMap(wholePtrn);
			for(var _part in this.map) {
				if(_wholeMap[_part]) {
					return _TRUE;
				}
			}
			return _FALSE;
		},
		extract: function(wholePtrn) {
			var _wholeMap = createMap(wholePtrn);
			var _matches = [];
			for(var _part in this.map) {
				if(_wholeMap[_part]) {
					_matches.push(_part);
				}
			}
			return $tom.translate(_matches.join(","));
		},
		getExpression: function() {
			if(!this.exprs) {
				var _exprs = [];
				for(var _part in this.map) {
					_exprs.push(_part);
				}
				this.exprs = _exprs.join(",");
			}
			return this.exprs;
		}
	});
	
	var __TRANSLATOR_CACHES = {}; //for caching	
	Object.extend($tom, {
		translate: function(pattern) {
			if(!__TRANSLATOR_CACHES[pattern]) {
				__TRANSLATOR_CACHES[pattern] = new Translator(pattern);
			}
			return __TRANSLATOR_CACHES[pattern];
		}
	});
	
})();

Object.extend($tom, {
	__POSITION: {
		__START_OF_TEXT: -1,
		__MIDDLE_OF_TEXT: 0,
		__END_OF_TEXT: 1,
		__EMPTY_TEXT: -2
	}
});

Object.extend($tom, /** @lends $tom */{
	/**
	 * node가 HTMLElement이면 true를 아니면 false를 반환한다.
	 * @function
	 */
	isElement: function(node) {
        return node && node.nodeType == 1;
	},
	/**
	 * node가 <body> 요소이면 true를 반환한다.
	 * @function
	 */
	isBody: function(node) {
        return $tom.isElement(node) && node.tagName == "BODY";
	},
	/**
	 * node가 아래에 나열된 block 요소이면 true 를 반환한다.
	 * 'p','div','ul','ol','h1','h2','h3','h4','h5','h6','pre','dl','hr','table','button'
	 * @function
	 */
	isBlock: function(node) {
		return $tom.kindOf(node, '%block');
	},
    /**
	 * node가 아래에 나열된 요소이면 true 를 반환한다.
	 * 'p','li','dd','dt','h1','h2','h3','h4','h5','h6','td','th','div','caption'
	 * @function
	 */
	isParagraph: function(node) {
        return $tom.kindOf(node, '%paragraph');
	},
	/**
	 * node가 텍스트이거나 <br> 요소이면 true 를 반환한다.
	 * @function
	 */
	isText: function(node) {
		return $tom.kindOf(node, '%text');
	},
	/**
	 * node가 아래에 나열된 요소이면 true를 반환한다.
	 * 'img','object','hr','table','button'
	 * @function
	 */
	isControl: function(node) {
		return $tom.kindOf(node, '%control');
	},
    /**
     * element가 tagName면 true를 반환한다.
     * @function
     */
    isTagName: function(element, tagName){
        tagName = tagName.toUpperCase();
        return element && element.tagName === tagName;

    },
    getOwnerDocument: function(node) {
        return node.ownerDocument || node.document;
    },
	/**
	 * node의 이름을 반환한다.
	 * @function
	 */
	getName: function(node) {
		return ((node && node.nodeType == 1)? node.nodeName.toLowerCase(): "");
	},
	/**
	 * node의 text content 를 반환한다.
	 * @function
	 */
	getText: function(node) {
		return node.textContent || node.text || node.innerText || "";
	},
	/**
	 * 요소의 nodeType 1이면 child 노드의 길이를, nodeType 3이면 nodeValue의 길이를 반환한다.  
	 * @function
	 */
	getLength: function(node) {
		if(!node) {
			return 0;
		}
		if(node.nodeType == 1) {
			return node.childNodes.length;
		} else if(node.nodeType == 3) {
			return node.nodeValue.length;
		}
		return 0; 
	},
	/**
	 * node가 같은 레벨의 요소 중 몇 번째인지 인덱스값을 반환한다.
	 * @function
	 */
	indexOf: function(node){
		if(!node) {
			return -1;
		}
		var _pNode = node.parentNode;
        for (var i = 0, len = _pNode.childNodes.length, childNodes = _pNode.childNodes; i < len; i++) {
            if (childNodes[i] == node) {
                return i;
            }
        }
        return -1;
	},
	/**
	 * node가 textNode이면 공백을 제거한 nodeValue의 내용이 존재하면 true를 반환한다.
	 * @function
	 */
	hasContent: function(node, ignoreZWNBS) {
		if(!node || node.nodeType != 3) {
			return _TRUE;
		}

		var _text = $tom.removeMeaninglessSpace( node.nodeValue );
		if(ignoreZWNBS) {
			_text = _text.replace(Trex.__WORD_JOINER_REGEXP, "");
		}
		return (_text != "");
	},
    removeEmptyTextNode: function(textNode) {
        if (textNode && textNode.nodeType == 3 && !textNode.nodeValue) {
            $tom.remove(textNode);
        }
    },
	hasUsefulChildren: function(node, ignoreZWNBS) {
		if(!node) {
			return _FALSE;
		}
		var _inner = $tom.removeMeaninglessSpace( node.innerHTML );
		if(ignoreZWNBS) {
			_inner = _inner.replace(Trex.__WORD_JOINER_REGEXP, "");
		}
		if(!_inner) {
			return _FALSE;
		}
		if(_inner.stripTags()) {
			return _TRUE;
		}
		if(_inner.search(/<(img|br|hr)\s?[^>]*>/i) > -1) {
			return _TRUE;
		}
		if(_inner.search(/<span\sid="?tx_(start|end)_marker"?><\/span>/i) > -1) {
			return _TRUE;
		}
		return _FALSE;
	},
	/**
	 * node에 의미있는 데이터가 있는지 확인한다.
	 * @function
	 */
	hasData: function(node, ignoreStuff) {
		if(!node) {
			return _FALSE;
		}
		
		var _inner = '';
		if(node.nodeType == 1) {
			_inner = node.innerHTML;
		} else {
			_inner = node.nodeValue;
		}
		_inner = $tom.removeMeaninglessSpace( _inner );
		if(_inner.trim() == '') {// #PCCAFEQA-11
			return _FALSE;
		}
		if(_inner.stripTags() != '') {
			return _TRUE;
		}
		if(ignoreStuff) {
			return _FALSE;
		}
		if(_inner.search(/<br\s?\/?>/i) > -1) {
			return _TRUE;
		}
		return _FALSE;
	},
	/**
	 * 주어진 스트링에서 의미없는 스페이스를 제거하는 함수.
	 * @function
	 */
	removeMeaninglessSpace: function(str){
		/* /\s/ == /[\f\n\r\t\v\u2028\u2029\u00a0]/ */
		return str.replace(/(^[\f\n\r\t\v\u2028\u2029]*)|([\f\n\r\t\v\u2028\u2029]*$)/g, "");
	}
});	

Object.extend($tom, /** @lends $tom */{
	/**
	 * $tom.find, $tom.collect, $tom.collectAll 에서 공통적으로 호출되는 함수.
	 * @function
	 * @example
	 *   var result1 = $tom.search(["td,th"], dFindy, _NULL);
	 *   var result2 = $tom.search([context, "td,th"], dFindy, _NULL);
	 *   var results = $tom.search([context, "td,th"], dGetties, []);
	 */
	search: function(args, searchFunction, defaultValue) {
		var context = (args.length == 1) ? _DOC : args[0];
		var pattern = args[args.length - 1];
		
		var invalidArgument = (!pattern ||
								!context ||
								!context.nodeType ||
								typeof pattern != "string");
		if (invalidArgument) {
			return defaultValue;
		}
		
		var translator = $tom.translate(pattern);
		return searchFunction(context, translator.getExpression());
	},
	/**
	 * css selector 로 요소를 찾아서 반환하는데 인자 node의 상위에 있는 요소를 찾는다.
	 * @function
	 * @example
	 *  var _elNode = $tom.find(node, "table.txc-layout-wz");
	 */
	find: function() {
		return this.search(arguments, dFindy, _NULL);
	},
	/**
	 * css selector 로 요소를 찾아서 반환하는데 인자 node의 하위에 있는 요소를 찾는다.
	 * @function
	 * @example
	 *  var _elInput = $tom.collect(this.elMenu, 'textarea');
	 */
	collect: function() {
		return this.search(arguments, dGetty, _NULL);
	},
	/**
	 * css selector로 요소를 찾아서 반환하는데 인자 node의 하위에 있는 요소를 찾고 모든 요소를 배열에 담아서 반환한다.
	 * @function
	 * @example
	 *  var _elItemList = $tom.collectAll(this.elMenu, "li a");  
	 */
	collectAll: function() {
		return this.search(arguments, dGetties, []);
	}
});	

(function() {
	function makeFilter(pattern) {
		if(pattern) {
			if(typeof(pattern) === 'function') {
				return pattern;
			} else {
				var _translator = $tom.translate(pattern);
				return function(node) {
					if(node.nodeType == 1) {
						if (_translator.include('#element')) {
							return _TRUE;
						} else {
							return dChecky(node, _translator.getExpression());
						}
					} else {
						return _translator.include('#text');
					}
				};
			}
		} else {
			return _NULL;
		}
	}

    var nodePatternCache = {};
    function findNodePattern(pattern) {
        pattern = pattern || "#element,#text";

        if (nodePatternCache[pattern]) {
            return nodePatternCache[pattern];
        }
        var filter = new NodePattern(pattern);
        nodePatternCache[pattern] = filter;
        return filter;
    }

    var NodePattern = Trex.Class.create({
        initialize: function(pattern) {
            this.pattern = pattern;
            this.translator = $tom.translate(pattern);
            // for better performance
            this.hasClassPattern = pattern.indexOf(".") >= 0;
            this.hasIdPattern = pattern.indexOf("#") >= 0;
            this.matchesText = this.translator.include("#text");
            this.matchesElement = this.translator.include("#element");
        },
        test: function(node) {
            var nodeType = node.nodeType;
            var translatorMap = this.translator.map;
            if (nodeType == 1) {
                if (this.matchesElement) {
                    return _TRUE;
                }
                var tagName = node.tagName.toLowerCase();

                // early matching for performance
                if (translatorMap[tagName]) {
                    return _TRUE;
                }

                var checkPattern = [];
                if (this.hasClassPattern && node.className) {
                    node.className.split(/\s/).each(function(className) {
                        checkPattern.push("." + className);
                        checkPattern.push(tagName + "." + className);
                    });
                }
                if (this.hasIdPattern && node.id) {
                    var id = node.id;
                    checkPattern.push("#" + id);
                    checkPattern.push(tagName + "#" + id);
                }
                for (var i = 0; i < checkPattern.length; i++) {
                    if (translatorMap[checkPattern[i]]) {
                        return _TRUE;
                    }
                }
                return _FALSE;
            } else if (nodeType == 3) {
                return this.matchesText;
            }
        }
    });

	Object.extend($tom, /** @lends $tom */{
        tagName: function(node, tagName) {
            if (!node) {
                return _NULL;
            }
            return node.tagName;
        },
		/**
		 * node가 pattern에 맞는 요소이면 true를 반환한다. 
		 * @function
		 * @param node
		 * @param pattern css selector rule
		 * @example
		 *  $tom.kindOf(node, "img.txc-image") // node가 txc-image라는 이름의 class속성을 가진 img 요소이면 true
		 */
        // 더 이상 사용하지 않는 dChecky를 없애자.
        kindOf: function(node, pattern) {
            if (!node || !pattern) {
                return _FALSE;
            }
            var filter = findNodePattern(pattern);
            return filter.test(node);
        },
		kindOf_old: function(node, pattern) {
			if(!node || !pattern) {
				return _FALSE;
			}
			return makeFilter(pattern)(node);
		},
		/* has filter */
		/**
		 * pattern에 맞는 descendant의 상위요소를 찾아서 반환한다.
		 * @function
		 */
		ancestor: function(descendant, pattern) {
			if(!descendant || !descendant.parentNode) {
				return _NULL;
			}
            var filter = findNodePattern(pattern);
			var _node = descendant.parentNode;
			while(_node) {
				if($tom.isBody(_node)) {
					return _NULL;
				}
                if (filter.test(_node)) {
                    break;
                }
				_node = _node.parentNode;
			}
			return _node;
        },
        findAncestor: function(node, matched, mustStop) {
            while (!mustStop(node)) {
                if (matched(node)) {
                    return node;
                }
                node = node.parentNode;
            }
            return _NULL;
        },
        /**
		 * pattern에 맞는 descendant의 하위요소를 찾아서 반환한다.
		 * @function
		 */
		descendant: function(ancestor, pattern) {
			var _nodes = $tom.descendants(ancestor, pattern, _TRUE);
			if(_nodes.length == 0) {
				return _NULL;
			}
			return _nodes[0];
		}, 
		/**
		 * pattern에 맞는 descendant의 모든 하위요소를 찾아서 반환한다.
		 * @function
		 */
		descendants: function(ancestor, pattern, single) {
			single = single || _FALSE;
			if(!ancestor || !ancestor.firstChild) {
				return [];
			}
			var _found = _FALSE;
            var filter = findNodePattern(pattern);
			var _nodes = [];
			var _gets = function(parent) {
				if(single && _found) {
					return;
				}
				if(!$tom.first(parent)) {
					return;
				}
				var _chilren = $tom.children(parent);
				for(var i=0,len=_chilren.length;i<len;i++) {
					if (filter.test(_chilren[i])) {
						_nodes.push(_chilren[i]);
						_found = _TRUE;
					} else {
						_gets(_chilren[i]);
					}
				}
			};
			_gets(ancestor);
			return _nodes;
		}, 
		/**
		 * node의 자식요소 중 pattern에 맞는 모든 요소를 찾아서 반환한다.
		 * @function
		 */
		children: function(node, pattern) {
			var _nodes = [];
			if(!node || !node.firstChild) {
				return _nodes;
			}
            var filter = findNodePattern(pattern);
			var _node = $tom.first(node);
			while(_node) {
                if (filter.test(_node)) {
					_nodes.push(_node);
				}
				_node = _node.nextSibling;
			}
			return _nodes;
		},
		/**
		 * node의 nextSibling 요소 중 pattern에 맞는 요소를 찾아서 반환한다.
		 * @function
		 */
		next: function(node, pattern) {
			if(!node || !node.nextSibling) {
				return _NULL;
			}
            var filter = findNodePattern(pattern);
			var _node = node.nextSibling;
			while(_node) {
				if($tom.hasContent(_node)) {
					if (filter.test(_node)) {
						break;
					}
				}
				_node = _node.nextSibling;
			}
			return _node;
		},
		/**
		 * node의 previousSibling 요소 중 pattern에 맞는 요소를 찾아서 반환한다.
		 * @function
		 */
		previous: function(node, pattern) {
			if(!node || !node.previousSibling) {
				return _NULL;
			}
            var filter = findNodePattern(pattern);
			var _node = node.previousSibling;
			while(_node) {
				if($tom.hasContent(_node)) {
					if (filter.test(_node)) {
						break;
					}
				}
				_node = _node.previousSibling;
			}
			return _node;
		},
		/**
		 * pattern에 맞는 node의 첫번째 자식요소를 찾아서 반환한다.
		 * @function
		 */
		first: function(node, pattern) {
			if(!node || !node.firstChild) {
				return _NULL;
			}
            var filter = findNodePattern(pattern);
			var _node = node.firstChild;
			while(_node) {
				if($tom.hasContent(_node)) {
                    if (filter.test(_node)) {
                        break;
                    }
				}
				_node = _node.nextSibling;
			}
			return _node;
		},
		/**
		 * pattern에 맞는 node의 마지막 자식요소를 찾아서 반환한다.
		 * @function
		 */
		last: function(node, pattern) {
			if(!node || !node.lastChild) {
				return _NULL;
			}
            var filter = findNodePattern(pattern);
			var _node = node.lastChild;
			while(_node) {
				if($tom.hasContent(_node)) {
                    if (filter.test(_node)) {
						break;
					}
				}
				_node = _node.previousSibling;
			}
			return _node;
		},
		/**
		 * 
		 * @function
		 */
		extract: function(parent, child, pattern) {
			var _nodes = [];
			if(!parent || !child ||!pattern) {
				return _nodes;
			}
            var filter = findNodePattern(pattern);
			var _found = _FALSE;
			var _node = parent.firstChild;
			while(_node) {
				if($tom.include(_node, child)) {
					_found = _TRUE;
				}
                if (filter.test(_node)) {
					_nodes.push(_node);
				} else {
					if(_found) {
						break;
					} else {
						_nodes = [];
					}
				}
				_node = _node.nextSibling;
			}
            return _found ? _nodes : [];
//			return _nodes;
		},
		/* has no filter */
		/**
		 * node의 parent node를 반환한다.
		 * @function
		 */
		parent: function(node) {
			if(!node || !node.parentNode) {
				return _NULL;
			}
			return node.parentNode;
		}, 
		/**
		 * node를 포함하고 있는 body 요소를 반환한다.
		 * @function
		 */
		body: function(node) {
			if(!node || !node.parentNode) {
				return _NULL;
			}
			var _node = node.parentNode;
			while(_node) {
				if($tom.isBody(_node)) {
					return _node;
				}
				_node = _node.parentNode;
			}
			return _NULL;
		}, 
		/**
		 * ancestor의 하위에서 처음 나오는 텍스트 노드를 찾아서 반환한다. 
		 * @function
		 */
		top: function(ancestor, all) {
			all = all || _FALSE;
			var _node = ancestor;
			
			while($tom.first(_node)) {
				_node = $tom.first(_node);
			}
			if(all) {
				return _node;
			} else {
				if ($tom.kindOf(_node, "#tx_start_marker,#tx_end_marker")) {
					_node = _node.nextSibling || _node.parentNode;
				} else if($tom.kindOf(_node, '%control')) {
					_node = _node.parentNode;
				}
				return _node;
			}
		}, 
		/**
		 * ancestor의 하위에서 마지막에 나오는 텍스트 노드를 찾아서 반환한다. 
		 * @function
		 */
		bottom: function(ancestor, all) {
			all = all || _FALSE;
			var _node = ancestor;
			while($tom.last(_node)) {
				_node = $tom.last(_node);
			}
			if (all) {
				return _node;
			} else {
				if ($tom.kindOf(_node, "#tx_start_marker,#tx_end_marker")) {
					_node = _node.previousSibling || _node.parentNode;
				} else if ($tom.kindOf(_node, '%control')) {
					_node = _node.parentNode;
				}
				return _node;
			}
		},
		/**
		 * child가 parent에 포함되어 있는 요소이면 true를 반환한다.
		 * @function
		 */
		include: function(parent, child) {
			if(!parent || !child) {
				return _FALSE;
			}
			if(parent == child) {
				return _TRUE;
			}
			var _node = child;
			while (_node) {
				if ($tom.isBody(_node)) {
					return _FALSE;
				} else if (_node == parent) {
					return _TRUE;
				}
				_node = _node.parentNode;
			}
			return _FALSE;
		},
        /**
         * node, offset 이전 커서의 위치를 반환한다.
         * @function
         */
        prevNodeUntilTagName: function(node, offset, tagName){
            tagName = tagName.toUpperCase();
            if(offset === 0)
                node = node.previousSibling;
            else {
                node = node.childNodes[offset-1];
            }
            while(node&&node.lastChild){
                if(node.tagName === tagName)
                    break;
                node = node.lastChild;
            }
            return node;
        },
        /**
         * node 다음 content를 반환한다.
         * @function
         */
        nextContent : function (node, filter){
            do{
                var _node = $tom.next(node, filter);
                if(_node)
                    return _node;
                node = $tom.parent(node);
            }while(node && !$tom.isBody(node));
            return null;
        }
	});
	
})();



Object.extend($tom, /** @lends $tom */{
	/**
	 * parent요소의 첫번째 자식노드로 child를 삽입한다.
	 * @function
	 */
	insertFirst: function(parent, child) {
		if(!parent || !child) {
			return;
		}
		if (parent.firstChild) {
			parent.insertBefore(child, parent.firstChild);
		} else {
			parent.appendChild(child);
		}
		return child;
	},
	/**
	 * target 요소 전 위치에 source 요소를 삽입한고 source 요소를 반환한다.
	 * @function
	 */
	insertAt: function(source, target) {
		if(!source || !target) {
			return;
		}
		target.parentNode.insertBefore(source, target);
		return source;
	},
	/**
	 * target 요소 다음 위치에 source 요소를 삽입한고 source 요소를 반환한다.
	 * @function
	 */
	insertNext: function(source, target) {
		if(!source || !target) {
			return;
		}
        var nextSibling = target.nextSibling;
		if (nextSibling) {
			nextSibling.parentNode.insertBefore(source, nextSibling);
		} else {
			target.parentNode.appendChild(source);
		}
		return source;
	},
	/**
	 * parent 요소에 child 요소를 붙인 후 child 요소를 반환한다.
	 * @function
	 */
	append: function(parent, child) {
		if(!parent || !child) {
			return;
		}
		parent.appendChild(child);
		return child;
	},
	/**
	 * node 를 제거한다.
	 * @function
	 */
	remove: function(node) {
		if(!node) {
			return;
		}
		if(node.parentNode) {
			node.parentNode.removeChild(node);
		}
		node = _NULL;
	},
	/**
	 * node의 innerHTML로 html를 넣고 node를 반환한다.
	 * @function
	 */
	html: function(node, html) {
		if(!node) {
			return;
		}
		node.innerHTML = html || "";
		return node;
	},
	/**
	 * node의 내용을 지운다.
	 * @function
	 */
	clean: function(node) {
		return $tom.html(node);
	},
	/**
	 * node안에 해당 html를 채워넣고 node를 반환한다.
	 * @function
	 */
	stuff: function(node, html) {
		if(!node) {
			return node;
		}
		if($tom.hasUsefulChildren(node, _TRUE)) {
			return node;
		}
		if(node.lastChild) {
			var _node = node;
			while (_node.lastChild) {
				_node = _node.lastChild;
			}
			$tom.insertNext(html, _node);
		} else {
			$tom.append(node, html);
		}
		return node;
	}
});

Object.extend($tom, /** @lends $tom */{
    /**
     * child가 없는 listhead라면 삭제한다
     * @param node
     */
    removeListIfEmpty: function(node) {
        while ($tom.kindOf(node, "%listhead") && node.childNodes.length == 1 && $tom.kindOf(node.firstChild, "%listhead")) {
            node = node.firstChild;
        }

        while ($tom.kindOf(node, "%listhead") && node.childNodes.length == 0) {
            var tempNode = node.parentNode;
            $tom.remove(node);
            node = tempNode;
        }
    }
});

Object.extend($tom, /** @lends $tom */{
	/**
	 * sNode의 자식노드들을 dNode의 child로 삽입 하는데 sInx, eInx는 자식노드의 시작, 끝 인덱스번호다.
	 * @function
	 * @param sNode
	 * @param dNode
	 * @param sInx
	 * @param eInx
	 */
	moveChild: function(sNode, dNode, sInx, eInx) {
		if(!sNode || !dNode) {
			return;
		}
		sInx = Math.min(Math.max(sInx || 0), sNode.childNodes.length);
		eInx = Math.min(Math.max(eInx || sNode.childNodes.length), sNode.childNodes.length);
		if(sInx >= eInx) {
			return;
		}
		
		var _inx = sInx;
		while (_inx++ < eInx && sInx < sNode.childNodes.length) {
			dNode.appendChild(sNode.childNodes[sInx]);
		}
	},
	/**
	 * node의 자식노드를 node의 부모노드에 붙인다.
	 * @function
	 */
	moveChildToParent: function(node) {
		if(!node) {
			return;
		}
        while (node.firstChild) {
            node.parentNode.insertBefore(node.firstChild, node);
        }
	}
});

/*
 * Create, Destroy, Change
 */
Object.extend($tom, /** @lends $tom */{
	/**
	 * source를 target로 교체하고 target를 반환한다.
	 * @function
	 */
    replace: function(source, target) {
        if (!source || !target) {
            return _NULL;
        }
        if ($tom.getName(source) == $tom.getName(target)) {
            $tom.remove(target);
            return source;
        } else {
            // FTDUEDTR-1248
            var children = [],
                childNodes = source.childNodes,
                len = childNodes.length;
            for (var i = 0; i < len; i++) {
                children.push(childNodes[i]);
            }
            for (i = 0; i < len; i++) {
                var child = children[i];
                if (child.lastChild === source) {
                    var cloneChild = $tom.clone(child);
                    $tom.moveChild(child, cloneChild);
                    child.innerHTML = "";
                    target.appendChild(cloneChild);
                } else {
                    target.appendChild(child);
                }
            }
            $tom.insertAt(target, source);
            $tom.remove(source);
            return target;
        }
    },
	/**
	 * node를 복사 후 반환한다.
	 * @function
	 */
	clone: function(node, deep) {
        var cloneNode = node.cloneNode(!!deep);
        if (node.nodeType == 1) {
            cloneNode.removeAttribute("id");
        }
        return cloneNode;
	}
});
	
/*
 * Wrap, Unwrap
 */
Object.extend($tom, /** @lends $tom */{
	/**
	 * wNode 아래에 pNodes를 붙여서 pNodes를 wNode로 감싼다.
	 * @function
	 * @return wNode
	 */
	wrap: function(wNode, pNodes) { //NOTE: quote, quotenodesign, textbox 등에서 사용됨, actually using 'div', 'blockquote'
		if (!wNode || !pNodes) {
			return _NULL;
		}
        if (pNodes instanceof Array == _FALSE) {
			pNodes = [].concat(pNodes);
		}

		$tom.insertAt(wNode, pNodes[0]);
		pNodes.each((function(pNode){
			$tom.append(wNode, pNode);
		}));
		return wNode;
	},
	/**
	 * node를 제거하고 node의 자식노드는 node의 상위에 붙인다.
	 * @function
	 */
	unwrap: function(node) { 
		if (!node) {
			return _NULL;
		}
        var _nNode = $tom.first(node);
        if ($tx.msie_nonstd) {
            node.removeNode();  // IE에서는 이게 더 빠름
        } else {
            $tom.moveChildToParent(node);
            $tom.remove(node);
        }
        return _nNode;
	}
});

	
Object.extend($tom, /** @lends $tom */{
	/**
	 * @private
	 * @function
	 */
	divideText: function(node, offset) {
		if(!$tom.isText(node)) {
			return node;
		}
		if(offset <= 0 || offset >= node.length) { //나눌필요가 있을까?
			return node;
		}
		var _newNode = node.cloneNode(_FALSE);
        node.deleteData(offset, node.length - offset);
		_newNode.deleteData(0, offset);
		$tom.insertNext(_newNode, node);
		return _newNode;
	},
	/**
     * node의 offset번째 child를 기준으로 두 개로 분리한다.
	 */
	divideNode: function(node, offset) {
		if(!$tom.isElement(node)) {
			return _NULL;
		}
		/*if(offset <= 0 || offset >= node.childNodes.length) { //나눌필요가 있을까?
			return node;
		}*/
		var _lastOffset = node.childNodes.length - offset;
		var _newNode = node.cloneNode(_FALSE);
		for(var i=0;i<_lastOffset;i++) {
			$tom.insertFirst(_newNode, node.lastChild);
		}
		$tom.insertNext(_newNode, node);
		return _newNode;
	},
    /**
     * divideNode와 비슷한데, node를 clone할 때에 style, attribute를 모두 복사하게 된다.
     * divideNode 사용에 대한 legacy 때문에 따로 만들었으며, 사용법이 확인된 이후에는 두 개가 합쳐질 필요가 있다.
     * 예를 들어 style을 복사하는 책임을 caller에게 넘기는 방식이나, 파라미터로 선택할 수 있도록 해서...
     */
    splitAt: function(node, index) {
        if (!$tom.isElement(node)) {
            return;
        }
        var clonedNode = $tom.clone(node);
        $tom.moveChild(node, clonedNode, index + 1, node.childNodes.length);
        $tom.insertNext(clonedNode, node);
        return clonedNode;
    },
    /**
     * stopAncestor은 dividedPoint의 ancestor 이어야 함
     * stopAncestor와 dividedPoint 사이에 table이 없어야 함
     */
    divideTree: function(stopAncestor, dividedPoint) {
        var currentNode = dividedPoint, offset, parent;
        do {
            parent = currentNode.parentNode;
            offset = $tom.indexOf(currentNode);
            currentNode = $tom.divideNode(parent, offset);
        } while (currentNode.previousSibling != stopAncestor);
        return currentNode;
    },
	/**
	 * @private
	 * @function
	 */
	divideParagraph: function(node) {
		var _node = node;
		var _offset = $tom.indexOf(node);
		
		var _divided = _node;
		while (_node) {
			if ($tom.isBody(_node)) {
				break;
			} else if ($tom.kindOf(_node, 'td,th,%wrapper,%outergroup')) {
				break;
			} else if ($tom.kindOf(_node, "#tx_start_marker,#tx_end_marker")) {
				_offset = $tom.indexOf(_node);
			} else if($tom.isControl(_node)) {
				_offset = $tom.indexOf(_node);
			} else if ($tom.isText(_node)) { //text
				_node = $tom.divideText(_node, _offset);
				_offset = $tom.indexOf(_node);
			} else { //%inline, %paragraph
				_node = $tom.divideNode(_node, _offset);
				_offset = $tom.indexOf(_node);
				_divided = _node;
				if ($tom.kindOf(_node, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6')) {
					break;
				}
			}
			_node = _node.parentNode;
		}
		return _divided;
	},
    wrapInlinesWithP: function(inline, ancestorBlock) {
        var ownerDocument = $tom.getOwnerDocument(inline);
        var inlineNodes = $tom.extract(ancestorBlock || ownerDocument.body, inline, '%text,%inline,%control');
        // caret은 곧 사라지기 때문에P로 감쌀 필요가 없다
        if (this.hasOnlySavedCaret(inlineNodes, inline)) {
            return _NULL;
        }
        var newParagraph = ownerDocument.createElement("p");
        $tom.wrap(newParagraph, inlineNodes);
        return newParagraph;
    },
    hasOnlySavedCaret: function(inlines, inline) {
        var validInlines = inlines.findAll(function(node) {
            return node.nodeType != 3 || node.nodeValue.trim() != "";
        });
        return this.isGoogRangeCaret(inline) && validInlines.length == 1 && validInlines[0] == inline;
    },
    isGoogRangeCaret: function(node) {
        return node && /goog_[0-9]+/.test(node.id);
    }
});

Object.extend($tom, /** @lends $tom */{
	/**
	 * name의 하위요소로 들어올 요소이름 반환
	 * @function
	 * @example
	 *  $tom.paragraphOf("table") // 'td'를 반환한다.
	 */
	paragraphOf: function(name) {
		if(!name) {
			return 'p';
		}
		var _translator = $tom.translate(name);
		if (_translator.memberOf('ul,ol')) {
			return 'li';
		} else if (_translator.memberOf('dl')) {
			return 'dd';
		} else if (_translator.memberOf('tr,tbody,thead,tfoot,table')) {
			return 'td';
		} else {
			return 'p';
		}
	},
	/**
	 * 'span' 을 반환한다.
	 * @function
	 */
	inlineOf: function() {
		return 'span';
	},
	/**
	 * 요소의 name을 받아서 상위요소가 되는 요소이름을 반환한다.
	 * @function
	 * @example
	 *  $tom.outerOf("td") // "table"을 반환한다.
	 */
	outerOf: function(name) {
		if(!name) {
			return 'span';
		}
		var _translator = $tom.translate(name);
		if (_translator.memberOf('li')) {
			return 'ol';
		} else if (_translator.memberOf('dd,dt')) {
			return 'dl';
		} else if (_translator.memberOf('td,th,tr')) {
			return 'table';
		} else {
			return 'p';
		}
	}
});
	
(function() {
	var __IGNORE_NAME_FLAG = 0;

	var UnitCalculate = Trex.Class.create({
		$const: {
			__FONT_SIZE_BASIS: 9,
			__REG_EXT_NUMBER: new RegExp("[0-9\.]+"),
			__REG_EXT_UNIT: new RegExp("px|pt|em")
		},
		initialize: function() {
			this.unitConverter = { //1em = 9pt
				"px2em": 1 / 12,
				"px2pt": 9 / 12,
				"em2px": 12, // 12 : 1
				"em2pt": 9,  // 9 : 1
				"pt2px": 12 / 9,
				"pt2em": 1 / 9
			};
		},
		calculate: function(strA, strB) {
			if (strA == _NULL || strA.length == 0) {
				strA = "0em";
			}
			if (strB == _NULL || strB.length == 0) {
				strB = "0em";
			}
	
			var _sign = this.extractSign(strB);
			
			var _unitA = this.extractUnit(strA);
			var _unitB = this.extractUnit(strB); //basis unit
			
			var _numA = this.extractNumber(strA).toNumber();
			var _numB = this.extractNumber(strB).toNumber();
			if(_unitA != _unitB) { //different unit
				if(this.unitConverter[_unitA+"2"+_unitB]) {
					_numA *= this.unitConverter[_unitA+"2"+_unitB];
				}
			}
			var _result = 0;
			if(_sign == "-") {
				_result = Math.max(_numA - _numB, 0);
			} else {
				_result = (_numA + _numB);
			} 
			_result = (Math.round(_result*10)/10);
			if (_result == 0) {
				return _NULL;
			} else {
				return _result + _unitB;
			}
		},
		needCalculation: function(str) {
			if(str == _NULL || typeof str != "string") {
				return _FALSE;
			} else {
				return (str.charAt(0) == '+' || str.charAt(0) == '-');
			}
		},
		extractSign: function(str) {
			var _sign = "+";
			if(str.charAt(0) == '+' || str.charAt(0) == '-') {
				_sign = str.charAt(0);
			}
			return _sign;
		},
		extractNumber: function(str) {
			var _num = 0;
			var _match;
			if((_match = str.match(UnitCalculate.__REG_EXT_NUMBER)) != _NULL) {
				_num = _match[0];
			}
			if(str.indexOf("%") > -1) { //%
				_num = _num / 100;
			}
			return _num;
		},
		extractUnit: function(str) {
			var _unit = "em";
			var _match;
			if((_match = str.match(UnitCalculate.__REG_EXT_UNIT)) != _NULL) {
				_unit = _match[0];
			}
			return _unit;
		}
	});
	var _unitCalculator = new UnitCalculate();
	
	var __ATTRIBUTE_TRANSLATIONS = {
	    colspan:   "colSpan",
	    rowspan:   "rowSpan",
	    valign:    "vAlign",
	    datetime:  "dateTime",
	    accesskey: "accessKey",
	    tabindex:  "tabIndex",
	    enctype:   "encType",
	    maxlength: "maxLength",
	    readonly:  "readOnly",
	    longdesc:  "longDesc",
	    cellPadding:  "cellPadding",
	    cellSpacing:  "cellSpacing",
	    more:  "more",
	    less:  "less",
        style: "style"
	};
	
	Object.extend($tom, /** @lends $tom */{ 
		/**
		 * node에 인자로 받은 attributes 속성을 세팅한다.
		 * @function
		 * @param {Element} node
		 * @param {JSON} attributes
		 * @example
		 *  $tom.applyAttributes(inNode, {
		 *		'style': { 'fontSize': null },
		 *		'size': null
		 *	});
		 */
		applyAttributes: function(node, attributes) {
			if(!$tom.isElement(node)) {
				return;
			}
			for(var _name in attributes) {
				if(_name == "style") {
					$tom.applyStyles(node, attributes[_name]);
				} else {
					$tom.setAttribute(node, _name, attributes[_name]);
				}
			}
		},
		/**
		 * node에 인자로 받은 attributes 속성을 제거한다.
		 * @function
		 */
		removeAttributes: function(node, attributes) {
			if(!$tom.isElement(node)) {
				return;
			}
			for(var _name in attributes) {
				if(_name == "style") {
					$tom.removeStyles(attributes[_name])
				} else {
					node.removeAttribute(_name, __IGNORE_NAME_FLAG);
				}
			}
		},
		/**
		 * node에서 attrName을 이름으로 갖는 속성의 값을 반환
		 * @function
		 * @example
		 *  $tx("tx_image").getAttribute("class") // class속성의 값 반환
		 */
		getAttribute: function(node, attrName) {
			if(!$tom.isElement(node)) {
				return _NULL;
			}
			if(node && node.getAttribute) {
				return node.getAttribute(__ATTRIBUTE_TRANSLATIONS[attrName] || attrName);
			} else {
				return _NULL;
			}
		},
		/**
		 * node에 attrName를 이름으로, attrValue를 값으로 갖는 속성을 세팅한다.
		 * @function
		 */
		setAttribute: function(node, attrName, attrValue) {
			if(!$tom.isElement(node)) {
				return;
			}
			if(attrValue == _NULL || attrValue.length == 0 || attrValue == 0) {
				node.removeAttribute(attrName, __IGNORE_NAME_FLAG);
			} else {
				if(__ATTRIBUTE_TRANSLATIONS[attrName]) {
					node.setAttribute(__ATTRIBUTE_TRANSLATIONS[attrName], attrValue);
				} else {
					try {
						node[attrName] = attrValue;
					} catch(e) {
                        console.log(e);
						node.setAttribute(__ATTRIBUTE_TRANSLATIONS[attrName] || attrName, attrValue);
					}
				}
			}
		},
        // TODO : refactoring 뭔가 복잡하다.
        setStyles: function(node, styles, overwrite) {
            var nodeCssText = node.style.cssText;
            var canSetStyle;
            var styleToSet = Object.extend({}, styles);
            if (styleToSet.font) {
                if (overwrite) {
                    node.style.font = styleToSet.font;  // 이 부분에서 chrome, opera는 font의 css 속성이 분해된 형태로 적용된다.
                } else if (node.style.cssText.indexOf("font:") == -1) {
                    node.style.cssText = 'font: ' + styleToSet.font + '; ' + node.style.cssText;
                }
                delete styleToSet.font;
            }
            for (var styleName in styleToSet) {
                var styleValue;
                if (_unitCalculator.needCalculation(styleToSet[styleName])) {
                    styleValue = _unitCalculator.calculate(node.style[styleName], styleToSet[styleName]);
                } else {
                    styleValue = styleToSet[styleName];
                }
                if (styleValue == _NULL) {
                    styleValue = "";
                }

                if (styleName == 'float') {
                    styleName = $tx.msie ? 'styleFloat' : 'cssFloat';
                }
                canSetStyle = (!node.style[styleName] && (styleName.indexOf("font") != 0 || nodeCssText.indexOf("font:") == -1)) || overwrite;
                var newTextDecoration = (styleName == "textDecoration") && !node.style[styleName].include(styleValue);
                if (canSetStyle) {
                    node.style[styleName] = styleValue;
                } else if (newTextDecoration) {
                    node.style[styleName] += " " + styleValue;
                }
            }
            $tom._clearUselessStyle(node);
        },
		/**
		 * node에 styles에서 지정한 스타일을 적용한다.
		 * @function
		 * @example
		 *  $tom.applyStyles(node, {
		 * 		'width': width
		 *  });
		 */
		applyStyles: function(node, styles) {
            this.setStyles(node, styles, _TRUE);
        },
        /**
         * node의 style 속성값을 적용하되, 이미 존재하는 속성은 유지된다.
         * @param node
         * @param styles
         */
        addStyles: function(node, styles) {
            this.setStyles(node, styles, _FALSE);
        },
		/**
		 * node에서 styles인자에서 지정한 스타일 속성값을 제거한다. 
		 * @function
		 */
		removeStyles: function(node, styles) {
            // FTDUEDTR-1166
            var cssText = node.style.cssText;
            var orignalCssText = cssText;
			for(var _name in styles) {
                _name = _name.replace(/([A-Z])/g, "-$1");
                cssText = cssText.replace(new RegExp("(^| )" + _name + "\\s*:[^;]+;? ?", "ig"), "");
			}
            if (orignalCssText != cssText) {
                node.style.cssText = cssText;
                $tom._clearUselessStyle(node);
            }
		},
        _clearUselessStyle: function(node) {
            var _attrValue = $tom.getAttribute(node, "style");
            if (!_attrValue) { //remove needless style
                node.removeAttribute("style", __IGNORE_NAME_FLAG);
            }
        },
		/**
		 * node에서 style 속성값 텍스트를 모두 반환한다.
		 * @function
		 */
		getStyleText: function(node) {
            return node.style.cssText;
		},
		/**
		 * node의 style 속성값을 value로 넣는다. 기존에 있는 값은 덮어쓰여진다.
		 * @function
		 * @param {Element} node
		 * @param {String} value style 속성에 바로 세팅할 텍스트 값을 넣어야 함
		 * @example
		 *  $tom.setStyleText($tx("tx_article_category"), "width:50px;height:10px")
		 */
		setStyleText: function(node, value) {
            node.style.cssText = value;
            !value && $tom._clearUselessStyle(node);
		}
	});
})();

Object.extend($tom, /** @lends $tom */{ 
	/**
	 * @private
	 * @function
	 */
	goInto: function(node, toTop) {
		if(!node || !node.scrollIntoView) {
			return;
		}
		node.scrollIntoView(toTop);
	},
	getWindow: function(doc) {
		return doc.defaultView || doc.parentWindow;
	},
	/**
	 * 수직 스크롤 위치값을 반환한다.
	 * @function
	 * @example
	 *  $tom.getScrollTop(document)
	 */
	getScrollTop: function(doc) {
		if (!doc) {
			return 0;
		}
		var win = this.getWindow(doc);
		var prop = 'pageYOffset';
		return (prop in win)? win[prop]:doc.documentElement.scrollTop;
	},
	/**
	 * 수직 스크롤 값을 셋팅한다.
	 * @function
	 * @param {Element} doc
	 * @param {Number} scrollTop 수직 스크롤 값
	 */
	setScrollTop: function(doc, scrollTop) {
		if(!doc) {
			return;
		}
		if(doc.documentElement.scrollTop) {
			doc.documentElement.scrollTop = scrollTop;
		} else {
			doc.body.scrollTop = scrollTop;
		}
	},
	/**
	 * 수평 스크롤 위치값을 반환한다.
	 * @function
	 */
	getScrollLeft: function(doc) {
		if(!doc) {
			return 0;
		}
		return (doc.documentElement.scrollLeft || doc.body.scrollLeft);
	},
	/**
	 * 수평 스크롤 값을 셋팅한다.
	 * @function
	 * @param {Element} doc
	 * @param {Number} scrollLeft 수평 스크롤 값
	 */
	setScrollLeft: function(doc, scrollLeft) {
		if(!doc) {
			return;
		}
		if(doc.documentElement.scrollLeft) {
			doc.documentElement.scrollLeft = scrollLeft;
		} else {
			doc.body.scrollLeft = scrollLeft;
		}
	},
	/**
	 * element요소의 left, top, width, height 값을 계산하여 반환한다.
	 * @function
	 * @return {
	 * 		x: 0,
	 * 		y: 0,
	 * 		width: 0,
	 * 		height: 0
	 * 	}
	 */
	getPosition: function(element, cumulative) {
		if(!element) {
			return {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
		}
		cumulative = !!cumulative;
		element = $tx(element);
		var pos = (cumulative)? $tx.cumulativeOffset(element): $tx.positionedOffset(element);
		var dim;
		var display = element.style.display;
		if (display != 'none' && display != _NULL) { //Safari bug
			dim = {
				width: element.offsetWidth,
				height: element.offsetHeight
			};
		} else {
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
			dim = {
				width: originalWidth,
				height: originalHeight
			};
		}
		return {
			x: pos[0],
			y: pos[1],
			width: dim.width,
			height: dim.height
		};
	},
	/**
	 * node 요소의 width값을 반환한다.
	 * inline style이 px값으로 유효하지 않으면 offset으로 대체한다.
	 * @function
	 */
	getWidth: function(node) {
		var width = node.style["width"];
		if( width.isPx() ){
			return width.parsePx();
		} 
		return node.offsetWidth;
	},
	/**
	 * node 요소 스타일속성의 width 값을 세팅한다.
	 * @function
	 */
	setWidth: function(node, width) {
		$tom.applyStyles(node, {
			'width': width
		});
	},
	/**
	 * node 요소의 height값을 반환한다.
	 * inline style이 px값으로 유효하지 않으면 offset으로 대체한다.
	 * @function
	 */
	getHeight: function(node) {
		var height = node.style["height"];
		if( height.isPx() ){
			return height.parsePx();
		} 
		return node.offsetHeight;
	},
	/**
	 * node 요소 스타일속성의 height 값을 세팅한다.
	 * @function
	 */
	setHeight: function(node, height) {
		$tom.applyStyles(node, {
			'height': height
		});
	},
	/**
	 * @private
	 * @function
	 */
	replacePngPath: function(node) {
		if ($tx.msie6) {
			if(_DOC.location.href.indexOf("http://") > -1) {
				return;
			}
			try {
				var _orgFilter = $tx.getStyle(node, 'filter');
				var _orgSrc = /src='([^']+)'/.exec(_orgFilter)[1];
				if(!_orgSrc || _orgSrc == 'none') {
					return;
				} else if(_orgSrc.indexOf("http://") > -1) {
					return;
				}
				
				var _docPathSlices = _DOC.location.href.split("/");
				_docPathSlices.push("css");
				_docPathSlices.pop();
				_orgSrc = _orgSrc.replace(/\.\.\//g, function() {
					_docPathSlices.pop();
					return "";
				});
				
				var _newSrc = _docPathSlices.join("/") + "/" + _orgSrc;
				node.style.filter = _orgFilter.replace(/src='([^']+)'/, "src='" + _newSrc + "'");
			} catch(e) {alert(e)}
		}
	}
});

Object.extend($tom, /** @lends $tom */{
    /**
     * 편집영역에서 기본 빈 문단에 해당하는 content
     * @constant
     */
    EMPTY_BOGUS: ($tx.msie_quirks || $tx.msie && $tx.msie_ver < 11 ? "&nbsp;" : "<br>")
});

Object.extend($tom, /** @lends $tom */{
    /**
	 * 편집영역에서 기본 빈 문단에 해당하는 HTML
	 * @constant
	 */
    EMPTY_PARAGRAPH_HTML: "<p>" + $tom.EMPTY_BOGUS + "</p>"
});

_WIN.$tom = $tom;