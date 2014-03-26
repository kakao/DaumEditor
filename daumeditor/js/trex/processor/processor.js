
(function() {
	var BlockRangeIterator = Trex.Class.create({
		initialize: function(processor, patterns, start, end) {
			this.processor = processor;
			this.start = start;
			this.end = end || this.start;
			this.current = this.start;
		
			this.wTranslator = $tom.translate(patterns).extract('%wrapper');
			this.pTranslator = $tom.translate(patterns).extract('%paragraph');
		},
		hasNext: function() {
			return !!this.current;
		},
		next: function() {
			var _current = this.current;
			_current = this.find(_current);

			var _next = _current;

			if ($tom.include(_current, this.end)) {
				_next = _NULL;
			} else {
				while(_next && !$tom.next(_next)) {
					_next = $tom.parent(_next);
					if($tom.isBody(_next)) {
						_next = _NULL;
					}
				}
				if(_next) {
					_next = $tom.next(_next);
				}
			}
			if (_next == this.end) {
				_next = _NULL;
			}
			this.current = _next;
			return _current;
		},
		find: function(node) {
			var _bNode;
			var _node = node;
			
			if(!$tom.hasContent(_node)) {
				return _node;
			}
			
			while(_node) {
				_bNode = _node;
				if($tom.isBody(_node)) {
					break;
				} 
				
				if($tom.kindOf(_node, this.wTranslator.getExpression())) {
					return _node;
				}
				
				if($tom.kindOf(_node, '%wrapper,%outergroup')) { 
					_node = $tom.descendant(_bNode, this.pTranslator.getExpression());
					if(_node) {
						return _node;
					}
					_node = $tom.descendant(_bNode, '%paragraph');
					if(_node) {
						_bNode = _node;
						break;
					}
				}

				if($tom.kindOf(_node, this.pTranslator.getExpression())) {
					return _node;
				}
                if(_node.nextSibling && _node.nodeType == 3) {
                    // BlockIterator 이니까 TextNode 는 찾는 대상이 아님.
                    _node = _node.nextSibling;
                } else {
                    _node = _node.parentNode;
                }
			}
			var _innerName = $tom.paragraphOf($tom.getName(_bNode));
			var _wNode = this.processor.newNode(_innerName);
			var _pNodes = $tom.extract(_bNode, node, '%text,%inline,img,object,embed,hr');
			$tom.wrap(_wNode, _pNodes);
			this.processor.stuffNode(_wNode);
			return _wNode;
		}
	});
	
	Object.extend(Trex.I.Processor.Standard, /** @lends Trex.Canvas.Processor.prototype */{
		/**
		 * @private
		 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 블럭 노드들을 리턴한다.
		 * @param {String} pattern - 수집할 노드 패턴 조건 
		 * @param {Element} start - 시작하는 노드(#tx_start_marker)
		 * @param {Element} end - 끝나는 노드(#tx_end_marker)
		 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
		 * @example
		 * 	processor.getBlockRangeIterator('div,p,li', node, node);
		 */
		getBlockRangeIterator: function(pattern, start, end) {
			return new BlockRangeIterator(this, pattern, start, end);
		}
	});
})();

(function() {
	var InlineRangeIterator = Trex.Class.create({
		initialize: function(processor, patterns, start, end) {
			this.processor = processor;
			this.start = start;
			this.end = end || this.start;
			this.current = this.start;
			
			this.iTranslator = $tom.translate(patterns).extract('%inline');
		},
		hasNext: function() {
			return !!this.current;
		},
		next: function() {
			var _current = this.current;
			_current = this.find(_current);
			
			var _next = _current;
			if (_current == this.end) {
				_next = _NULL;
			} else {
				while(_next && !$tom.next(_next)) {
					_next = $tom.parent(_next);
					if($tom.isBody(_next)) {
						_next = _NULL;
					}
				}
				if(_next) {
					_next = $tom.next(_next);
				}
			}
			if ($tom.include(_next, this.end)) {
				_next = $tom.top(_next, _TRUE);
			} 
			this.current = _next;
			return _current;
		},
		find: function(node) {
			var _node = node;
			if($tom.kindOf(_node, '%paragraph,%outergroup,%block') || $tom.isBody(_node)) {
				var _bNode = _node;
				_node = $tom.top(_bNode, _TRUE);
				if(!_node) {
					var _innerName = $tom.inlineOf();
					var _iNode = this.processor.create(_innerName);
					$tom.append(_bNode, _iNode);
					return _iNode;
				}
			}
			
			if($tom.kindOf(_node, 'br')) {
				return _node;
			} else if(!$tom.hasContent(_node)) {
				return _node;
			}
			
			if($tom.kindOf(_node, this.iTranslator.getExpression())) { 
				return _node;
			}
			
			var _innerName = $tom.inlineOf();
			var _iNode = this.processor.create(_innerName);
			$tom.insertAt(_iNode, _node);
			if(_node) {
				$tom.append(_iNode, _node);
			}
			return _iNode;
		}
	});
	
	Object.extend(Trex.I.Processor.Standard,  /** @lends Trex.Canvas.Processor.prototype */{
		/**
		 * @private
		 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 인라인 노드들을 리턴한다.
		 * @param {String} pattern - 수집할 노드 패턴 조건 
		 * @param {Element} start - 시작하는 노드(#tx_start_marker)
		 * @param {Element} end - 끝나는 노드(#tx_end_marker)
		 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
		 * @example
		 * 	processor.getInlineRangeIterator('span,font,a', node, node);
		 */
		getInlineRangeIterator: function(pattern, start, end) {
			return new InlineRangeIterator(this, pattern, start, end);
		}
	});
})();

(function() {
	var __CACHING_DOC = _NULL;
	var __CACHING_NODE = {};
	var __CACHING_PARAGRAPH = {};
	Object.extend(Trex.I.Processor.Standard, /** @lends Trex.Canvas.Processor.prototype */{
		/**
		 * 노드를 생성하여 리턴한다. 캐싱을 사용하여 이미 생성했던 노드는 복사한다. 
		 * @private
		 * @param {String} name - 노드명
		 * @example
		 * 	processor.newNode('div');
		 */
		newNode: function(name) {
			if(__CACHING_DOC != this.doc) {
				__CACHING_NODE = {};
				__CACHING_DOC = this.doc;
			}
			if(!__CACHING_NODE[name]) {
				__CACHING_NODE[name] = this.win[name]();
			}
			return $tom.clone(__CACHING_NODE[name], _FALSE);
		},
		/**
		 * 텍스트 노드를 생성한다.
	 	 * @private
	 	 * @param {String} text - 텍스트내용
		 */
		newText: function(text) {
			return this.doc.createTextNode(text);
		},
		/**
		 * 노드를 생성하여 리턴한다. 캐싱을 사용하여 이미 생성했던 노드는 복사한다. 
		 * @private
		 * @param {String} name - 노드명
		 * @example
		 * 	processor.newParagraph('p');
		 */
		newParagraph: function(name) {
			if(__CACHING_DOC != this.doc) {
				__CACHING_PARAGRAPH = {};
				__CACHING_DOC = this.doc;
			}
			if(!__CACHING_PARAGRAPH[name]) {
				__CACHING_PARAGRAPH[name] = this.stuffNode(this.newNode(name));
			}
			return $tom.clone(__CACHING_PARAGRAPH[name], _TRUE);
		}
	});
})();


(function() {
	var __CACHING_DOC = _NULL;
	var __CACHING_NODE = _NULL;
	var __HAS_DUMMY = _FALSE;
	var __TEXT_GC_LIST = [];

	Object.extend(Trex.I.Processor.Standard, /** @lends Trex.Canvas.Processor.prototype */{
		/**
		 * 빈 텍스트 노드를 생성한다.
	 	 * @private
	 	 * @param {Boolean} keep - 계속 유지할 것인지 여부 optional
		 */
		newDummy: function(keep) {
			if(__CACHING_DOC != this.doc) {
				__CACHING_NODE = _NULL;
				__TEXT_GC_LIST = [];
				__CACHING_DOC = this.doc;
			}
			if(!__CACHING_NODE) {
				__CACHING_NODE = this.doc.createTextNode(Trex.__WORD_JOINER);
			}
			var _dummy = $tom.clone(__CACHING_NODE);
			if(!keep) {
				__TEXT_GC_LIST.push(_dummy);
				__HAS_DUMMY = _TRUE;
			}
//            try {
//                throw new Error();
//            } catch (e) {
//                console.log((++newDummyCalled) + "\n" + e.stack);
//            }
			return _dummy;
		},
		/**
		 * 생성된 빈 텍스트 노드들을 삭제한다.
	 	 * @private
		 */
        /* TODO
         * Bug : __TEXT_GC_LIST에 저장된 dummy를 splitText를 하면, reference가 사라지는 효과가 발생한다.
         * dummy를 넣기 위한 splitText 부분을 수정할 필요가 있다.
         * startConatiner를 지우면 (현재까지 확인된 바에 따르면) Chrome에서는 커서가 사라지고 더 이상 range를 가져오지 못하게 된다.
         */
        clearDummy: function() {
            if (!__HAS_DUMMY) { 
                return;
            }
			var range, startNode;
            try {
				range = this.createGoogRange();
	            startNode = range && range.getStartNode();
            } catch (ignore4ie678) {}
			
			var remained = _NULL;
//            console.log(__TEXT_GC_LIST.length);
            for (var i = 0, len = __TEXT_GC_LIST.length-1; i < len; i++) {
                try {
                    var _dummy = __TEXT_GC_LIST.shift();
//                    console.log(!!(_dummy && _dummy.nodeValue))
                    if (_dummy && _dummy.nodeValue) {
                        if (_dummy.nodeValue == Trex.__WORD_JOINER) {
                            if (startNode != _dummy) {
//                                console.log('remove');
                                $tom.remove(_dummy);
                            } else {                                
                                remained = _dummy;
                            }
                        } else {
//                            console.log('replace');
                            _dummy.nodeValue = _dummy.nodeValue.replace(Trex.__WORD_JOINER_REGEXP, "");
                        }
                    } else {
//                        console.log("this's not dummy");
                    }
                } catch(e) {
                }
            }
            remained && __TEXT_GC_LIST.splice(0, 0, remained);
            __HAS_DUMMY = _FALSE;
        }
	});
})();

/**
 * Wysiwyg 영역의 컨텐츠를 조작하기 위해 사용되며,  <br/>
 * browser와 newlinepolicy에 따라 필요한 함수들을 mixin한다. <br/>
 * 이 객체를 통해서 Bookmark, txSelection, Marker 객체에 접근한다. <br/>
 * canvas.getProcessor()를 통해서 얻거나 <br/>
 * canvas.execute(), canvas.query()를 통해서 processor를 얻어서 사용한다. <br/>
 *
 * @abstract
 * @class
 * @param {Object} win - Wysiwyg 영역의 window 객체
 * @param {Object} doc - Wysiwyg 영역의 document 객체
 * 
 * @example
 *	canvas.execute(function(processor) {
 *		processor.pasteContent('<img />', _FALSE);
 *	});
 * 
 *	var value = canvas.query(function(processor) {
 *		return processor.getText();
 *	});
 * 
 *	var _processor = canvas.getProcessor();
 *	_processor.focusOnTop();
 */
Trex.Canvas.Processor = Trex.Class.draft({
	/** @ignore */
	$mixins: [
		Trex.I.Processor.Standard,
		(($tx.msie_nonstd)? Trex.I.Processor.Trident: {}),
        (($tx.msie_std)? Trex.I.Processor.TridentStandard: {}),
		(($tx.gecko)? Trex.I.Processor.Gecko: {}),
		(($tx.webkit)? Trex.I.Processor.Webkit: {}),
		(($tx.presto)? Trex.I.Processor.Presto: {})
	]
});

/**
 * newlinepolicy가 p인 Wysiwyg Processor
 * @class
 * @extends Trex.Canvas.Processor
 * @param {Object} win - Wysiwyg 영역의 window 객체
 * @param {Object} doc - Wysiwyg 영역의 document 객체
 */
Trex.Canvas.ProcessorP = Trex.Class.create({
	/** ignore */
	$extend: Trex.Canvas.Processor,
	/** @ignore */
	$mixins: [
		Trex.I.Processor.StandardP,
		(($tx.msie_nonstd)? Trex.I.Processor.TridentP: {}),
        (($tx.msie_std)? Trex.I.Processor.TridentStandardP: {}),
		(($tx.gecko)? Trex.I.Processor.GeckoP: {}),
		(($tx.webkit)? Trex.I.Processor.WebkitP: {}),
		(($tx.presto)? Trex.I.Processor.PrestoP: {})
	]
});
