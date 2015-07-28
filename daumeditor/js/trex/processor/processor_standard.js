/**
 * @fileOverview
 * Wysiwyg 영역의 컨텐츠를 조작하기 위해 사용되는 공통되는 Processor 정의
 */
Trex.I.Processor = {};
Trex.I.Processor.Standard = /** @lends Trex.Canvas.Processor.prototype */{
	txSelection: _NULL,
    isRangeInsideWysiwyg: _FALSE,
    lastRange: _NULL,
	initialize: function(win, doc) {
		this.win = win;
		this.doc = doc;

		this.txSelection = new Trex.Canvas.Selection(this);
		this.bookmark = new Trex.Canvas.Bookmark(this);
	},
	/**
	 * Trex.Canvas.Selection 객체를 리턴한다.
	 * @returns {Object} - Trex.Canvas.Selection 객체
	 * @example
	 * 	processor.getTxSel();
	 */
	getTxSel: function() {
		return this.txSelection;
	},
	/**
	 * native selection object를 리턴한다.
	 * @returns {Object} - native selection 객체
	 * @example
	 * 	processor.getSel();
	 */
	getSel: function(){
		return this.txSelection.getSel();
	},
	/**
	 * native range object를 리턴한다.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	processor.getRange();
	 */
	getRange: function() {
		return this.txSelection.getRange();
	},
	/**
	 * Trex.Canvas.Bookmark 객체를 리턴한다.
	 * @returns {Object} - Trex.Canvas.Bookmark 객체
	 * @example
	 * 	processor.getBookmark();
	 */
	getBookmark: function() {
		return this.bookmark;
	},
	/**
	 * 선택된 영역의 collapse 여부(선택된 영역이 있는지 여부)를 리턴한다.
	 * @returns {Boolean} - collapse 여부
	 * @see Trex.Canvas.Selection#isCollapsed
	 * @example
	 * 	processor.isCollapsed();
	 */
	isCollapsed: function() {
		return this.txSelection.isCollapsed();
	},
	/**
	 * 선택된 영역의 노드를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @see Trex.Canvas.Selection#getNode
	 * @example
	 * 	processor.getNode();
	 */
	getNode: function() {
		return this.txSelection.getNode();
	},
	/**
	 * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @see Trex.Canvas.Selection#getControl
	 * @example
	 * 	processor.getControl();
	 */
	getControl: function(){
		return this.txSelection.getControl();
	},
	/**
	 * 선택된 영역이 컨트롤 노드인지 여부를 리턴한다.
	 * @returns {Boolean} - 컨트롤 노드인지 여부
	 * @see Trex.Canvas.Selection#hasControl
	 * @example
	 * 	processor.hasControl();
	 */
	hasControl: function(){
		return this.txSelection.hasControl();
	},
	/**
	 * 컨트롤 노드를 선택한다.
	 * @param {Element} node - 컨트롤 노트
	 * @example
	 * 	txSelection.selectControl(node);
	 */
	selectControl: function(node){
		return this.txSelection.selectControl(node);
	},
	/**
	 * 선택된 영역의 텍스트 데이터를 리턴한다.
	 * @returns {String} - 선택된 영역의 텍스트 데이터
	 * @see Trex.Canvas.Selection#getText
	 * @example
	 * 	processor.getText();
	 */
	getText: function(){
		return this.txSelection.getText();
	},
	/**
	 * 선택된 영역이 텍스트 데이터 영역의 어떤 위치인지를 리턴한다.
	 * @returns {Number} - 텍스트 데이터 영역의 어떤 위치인지 <br/>
	 * 					텍스트의 처음 : $tom.__POSITION.__START_OF_TEXT : -1<br/>
	 * 					텍스트의 중간 : $tom.__POSITION.__MIDDLE_OF_TEXT : 0<br/>
	 * 					텍스트의 마지막 : $tom.__POSITION.__END_OF_TEXT : 1
	 * @see Trex.Canvas.Selection#compareTextPos
	 * @example
	 * 	processor.compareTextPos();
	 */
	compareTextPos: function() {
		return this.txSelection.compareTextPos();
	},
	/**
	 * 현재 선택된 영역에서 조건에 맞는 노드를 리턴한다.
	 * @param {Function, String} filter - 조건을 나타내는 함수 또는 문자열
	 * @returns {Element} - 조건에 맞는 노드
	 * @example
	 * 	processor.findNode(function() { return 'p,div'; });
	 * 	processor.findNode('%paragraph');
	 */
	findNode: function(filter) {
		try {
			return $tom.find(this.getNode(), filter);
		} catch(e) {
			return _NULL;
		}
	},
	/*-------- processor - query style start --------*/
	/**
	 * 특정한 노드의 특정한 스타일 값을 얻어온다.
	 * @param {Element} node - 특정 노드
	 * @param {String} styleName - 스타일 명
	 * @returns {String} - 스타일 값
	 * @example
	 * 	processor.queryStyle(node, 'textAlign');
	 */
	queryStyle: function(node, styleName) {
		if(!node) {
			return _NULL;
		}
		styleName = ((styleName == 'float')? ((node.style.styleFloat === _UNDEFINED)? 'cssFloat': 'styleFloat'): styleName);
		if(node.style && node.style[styleName]) {
			return node.style[styleName];
		} else if(node.currentStyle && node.currentStyle[styleName]) {
			return node.currentStyle[styleName];
		} else if(_WIN.getComputedStyle) {
            var targetNode = node;
            while($tom.isText(targetNode)){
                targetNode = targetNode.parentNode;
            }
			var win = $tom.getWindow(this.doc);
			var _cssStyle = win.getComputedStyle(targetNode, _NULL);
			return ((_cssStyle)? _cssStyle[styleName] : _NULL);
		}
		return _NULL;
	},
	/**
	 * 특정한 노드의 특정한 속성 값을 얻어온다.
	 * @param {Element} node - 특정 노드
	 * @param {String} attrName - 속성 명
	 * @returns {String} - 속성 값
	 * @example
	 * 	processor.queryAttr(node, 'align');
	 */
	queryAttr: function(node, attrName) {
		if(!node) {
			return _NULL;
		}
		return $tom.getAttribute(node, attrName);
	},
	/**
	 * 선택된 영역의 native queryCommandState 값을 얻어온다.
	 * @param {String} command - 커맨드 명
	 * @returns {Boolean} - 해당 영역이 커맨드 상태인지 여부
	 * @example
	 * 	processor.queryCommandState('bold');
	 */
	queryCommandState: function(command) {
		try {
			return this.doc.queryCommandState(command);
		} catch(e) { return _FALSE; }
	},
	/**
	 * 선택된 영역의 native queryCommandValue 값을 얻어온다.
	 */
	queryCommandValue: function(command) {
		try {
			return this.doc.queryCommandValue(command);
		} catch(e) {
			return "";
		}
	},
	/*-------- processor - query style end --------*/
	/**
	 * 선택된 영역에 native execCommand를 실행시킨다.
	 * @param {String} command - 커맨드 명
	 * @param {String} data - 데이터 값
	 * @example
	 * 	processor.execCommand('forecolor', '#333');
	 */
	execCommand: function(command, data) {
		if ($tx.gecko) {
			// Firefox는 styleWithCSS 기본값이 true
			try {
				this.doc.execCommand('styleWithCSS', _FALSE, _FALSE);
			} catch(e) {}
		}
		try {
			this.doc.execCommand(command, _FALSE, data);
		} catch(e) {}
	},
	/*-------- processor - marker start --------*/
	/**
	 * 선택된 영역에 주어진 handler를 실행시킨다.
	 * 주로 외부에서 processor를 이용해 DOM조작을 할 경우에 사용된다.
	 * @param {Funtion} handler - 해당 영역에 실행할 함수
	 * @example
	 * 	processor.execWithMarker(function(marker) {
	 *		$tom.insertAt(node, marker.endMarker);
	 *  });
	 */
	execWithMarker: function(handler) {
		var _marker = new Trex.Canvas.Marker(this);
		this.bookmarkTo();
		try {
			_marker.paste();
			_marker.backup();
			handler(_marker);
		} catch(e) {
			console.log(e, e.stack)
		} finally {
			_marker.remove();
		}
	},
	/*-------- processor - marker end --------*/
	/*--------------------- focus, movecaret ----------------------*/
	/**
	 * wysiwyg 영역에 포커스를 준다.
	 * @example
	 * 	processor.focus();
	 */
	focus: function() {
		this.doc.body.focus();
	},
	/**
	 * wysiwyg 영역에 포커스를 뺀다.
	 * @example
	 * 	processor.blur();
	 */
	blur: function() {
		_WIN.focus(); //NOTE: by focused on parent window, editor will be blured
	},
	/**
	 * 본문의 처음으로 캐럿을 옮긴다.
	 * @example
	 * 	processor.focusOnTop();
	 */
	focusOnTop: function() {
		this.focus();
		this.selectFirstText(this.doc.body);
		this.doc.body.scrollTop = 0; //NOTE: only html, not xhtml
	},
	selectFirstText: function(node) {
		var firstNode = $tom.top(node);
		var range = this.createGoogRangeFromNodes(firstNode, 0, firstNode, 0);
		range.select();
	},
	/**
	 * 본문의 마지막으로 캐럿을 옮긴다.
	 * @example
	 * 	processor.focusOnBottom();
	 */
	focusOnBottom: function() {
		this.focus();
		this.moveCaretTo(this.doc.body, _FALSE);
		this.doc.body.scrollTop = this.doc.body.scrollHeight; //NOTE: only html, not xhtml
	},
	/**
	 * 특정 노드로 캐럿을 옮긴다.
	 * @param {Element} node - 특정 노드
	 * @param {Boolean} toStart - 위치, 시작 = true
	 * @example
	 * 	processor.moveCaretTo(node, true);
	 */
	moveCaretTo: function(node, toStart) {
		if(!node) {
			return;
		}
        this.focus();
		this.bookmarkInto(node, toStart);
		this.bookmark.select(this.txSelection);
	},
	/**
	 * 특정 노드의 바깥으로 캐럿을 옮긴다.
	 * @param {String} scope - 특정 노드 패턴
	 * @example
	 * 	processor.moveCaretWith(scope);
	 */
	moveCaretWith: function(scope) {
		if(!scope) { return; }
		var _elOuter = this.findNode(scope);
		if(_elOuter) {
            this.focus();
			this.bookmark.saveNextTo(_elOuter);
			this.bookmark.select(this.txSelection);
		}
	},
	/**
	 * 특정 노드를 감싸 선택한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.selectAround(node);
	 */
	selectAround: function(node) {
		if(!node) {
			return;
		}
        this.focus();
		this.bookmark.saveAroundNode(node);
		this.bookmark.select(this.txSelection);
	},
	/**
	 * 특정 노드의 안으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkInto(node);
	 */
	bookmarkInto: function(node, toStart) {
		if(!node) {
			return;
		}
		toStart = (toStart == _NULL)? _TRUE: toStart;
		if(toStart) {
			this.bookmark.saveIntoFirst(node);
		} else {
			this.bookmark.saveIntoLast(node);
		}
	},
	/**
	 * 특정 노드의 이전으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkToPrevious(node);
	 */
	bookmarkToPrevious: function(node) {
		if(!node) {
			return;
		}
		this.bookmark.savePreviousTo(node);
	},
	/**
	 * 특정 노드의 다음으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkToNext(node);
	 */
	bookmarkToNext: function(node) {
		if(!node) {
			return;
		}
		this.bookmark.saveNextTo(node);
	},
	/**
	 * execute하기 전 range를 북마크한다.
	 * @example
	 * 	processor.bookmark();
	 */
	bookmarkTo: function(rng) {
		rng = rng || this.txSelection.getRange();
		this.bookmark.save({
			startContainer: rng.startContainer,
			startOffset: rng.startOffset,
			endContainer: rng.endContainer,
			endOffset: rng.endOffset
		});
	},
	/**
	 * marker에 따라 북마크를 수정한다.
	 * @example
	 * 	processor.bookmarkWithMarker(marker);
	 */
	bookmarkWithMarker: function(marker) {
		this.bookmark.saveWithMarker(marker);
	},
	/**
	 * 저장한 range를 선택한다.
	 * @example
	 * 	processor.restore();
	 */
	restore: function() {
		this.bookmark.select(this.txSelection);
	},
	/*------------ execute action ------------*/
	/**
	 * 인자에 따라 노드를 생성한다.
	 * @param {String, Object, Element} argument - 가변 arguments<br/>
	 * 			{String} name : 1st String은 노드명  <br/>
	 * 			{Object} attributes : 적용할 속성들  <br/>
	 * 			{Element, String, Number} children : 자식 노드
	 * @example
	 * 	processor.create('div', { 'className': 'txc-textbox' });
	 */
	create: function() {
		var name = arguments[0];
		var _node = this.newNode(name);
		for (var i = 1; i < arguments.length; i++) {
			var arg = arguments[i];
			if (arg.nodeType) {
				$tom.append(_node, arg);
			} else if (typeof(arg) == 'string' || typeof(arg) == 'number') {
				_node.innerHTML += arg;
			} else if (typeof(arg) == 'array') {
				for (var j = 0; j < arg.length; j++) {
					$tom.append(_node, arg[j]);
				}
			} else {
				$tom.applyAttributes(_node, arg);
			}
		}
		return _node;
	},
	/**
	 * 선택한 영역에 노드를 삽입한다.
	 * @param {Array,Element} nodes - 삽입하고자 하는 노드 배열 또는 노드
	 * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부
	 * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
	 * 					newline이 true 일 경우에만 의미를 갖는다.
	 * @example
	 * 	processor.pasteNode([node, node], true, { 'style': { 'textAlign': 'center' } });
	 */
	pasteNode: function(nodes, newline, wrapStyle) {
		if(!nodes) {
			return;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}

		this.txSelection.collapse(_FALSE);
		if(newline) {
			/* order
			 * (curNode) > wpNode > dvNode
			 */
			var _curNode, _wpNode, _dvNode;

			var _processor = this;
			this.execWithMarker(function(marker) {
				_dvNode = $tom.divideParagraph(marker.endMarker);
				var _detected = $tom.kindOf(_dvNode, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6');
				if(_detected) {
					_curNode = $tom.previous(_dvNode);
					_wpNode = $tom.clone(_dvNode);
				} else {
					_dvNode = _processor.newNode('p');
					$tom.insertAt(_dvNode, marker.endMarker);
					_wpNode = _processor.newNode('p');
				}
				$tom.insertAt(_wpNode, _dvNode);
				nodes.each(function(node) {
					$tom.append(_wpNode, node);
				});
				if(wrapStyle) {
					$tom.applyAttributes(_wpNode, wrapStyle);
				}
                // #FTDUEDTR-1442
                if (nodes.length == 1) {
                    var firstChildNode = nodes[0];
                    var disableBlockTag = $tom.kindOf(firstChildNode, 'table,hr,blockquote,pre,h1,h2,h3,h4,h5,h6,div');
                    var isParagraphTag = $tom.isTagName(_wpNode, 'p');
                    if (disableBlockTag && isParagraphTag) {
                        $tom.unwrap(_wpNode);
                    }
                }
			});
			if(_curNode) {
				if(!$tom.hasData(_curNode)) {
					this.stuffNode(_curNode);
				}
			}
			this.stuffNode(_dvNode);
			this.bookmark.saveIntoFirst(_dvNode);
		} else {
            var self = this;
            this.executeUsingCaret(function(range, savedCaret) {
                var startCaret = savedCaret.getCaret(_FALSE),
                    endCaret = savedCaret.getCaret(_FALSE);
                var targetNode = $tx.msie_nonstd ? startCaret : _NULL;
                nodes.each(function(node) {
                    range.insertNode(node, targetNode);
                });
                if (endCaret && endCaret.nextSibling) {
                    self.moveCaretTo(endCaret.nextSibling, 0);
                }
            });
		}
		return nodes[0];
	},
	/**
	 * 선택한 영역에 HTML 컨텐츠를 삽입한다.
	 * @param {String} html - 삽입하고자 하는 HTML 컨텐츠
	 * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부 true/false
	 * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
	 * 					newline이 true 일 경우에만 의미를 갖는다.
	 * @example
	 * 	processor.pasteNode('<img src="이미지경로"/>', true, { 'style': { 'textAlign': 'center' } });
	 */
	pasteContent: function(html, newline, wrapStyle) {
		var _tmpNode = this.create('div');
		_tmpNode.innerHTML = html;
		var _dataNodes = $tom.children(_tmpNode);
		return this.pasteNode(_dataNodes, newline, wrapStyle);
	},
	/**
	 * 주어진 노드를 새로운 노드로 교체한다.
	 * @param {Element} node - 기존 노드
	 * @param {String} tag - 새로운 노드 명
	 * @param {Object} attributes - 새로운 노드에 적용할 속성들
	 * @returns {Element} - 생성한 노드
	 * @example
	 * 	processor.replace(p, 'li');
	 */
	replace: function(node, tag, attributes) {
		this.bookmark.saveAroundNode(node);
		return $tom.replace(node, this.create(tag, attributes));
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 블럭 노드들을 리턴한다.
	 * @param {Array} filter - 수집할 노드 패턴 조건
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.blocks(function() {
			return '%paragraph';
		});
	 */
	blocks: function(filter) {
		var _nodes = [];
		var _patterns = filter();
		if (this.hasControl()) {
			var _control = this.getControl();
			if ($tom.kindOf(_control.parentNode, _patterns)) {
				_nodes.push(_control.parentNode);
			}
		} else {
			var _processor = this;
			this.execWithMarker(function(marker) {
				var _itr = _processor.getBlockRangeIterator(_patterns, marker.startMarker, marker.endMarker);
				var _node;
				while (_itr.hasNext()) {
					_node = _itr.next();
					if ($tom.kindOf(_node, '#tx_start_marker,#tx_end_marker')) {
						//ignore
					} else {
						_nodes.push(_node);
					}
				}
			});
		}
		return _nodes;
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 인라인 노드들을 리턴한다.
	 * @param {Array} filter - 수집할 노드 패턴 조건
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.inlines(function(type) {
			if(type === 'control') {
				return 'hr,table';
			}
			return '%inline';
		});
	 */
	inlines: function(filter) {
		var _nodes = [];
		var _patterns = filter();

		var _processor = this;
		var _createInline = function() {
			return _processor.create($tom.inlineOf());
		};

		if (this.hasControl()) {
			var _control = this.getControl();
			if ($tom.kindOf(_control, _patterns)) {
				_nodes.push(_control);
			} else {
				var _iNode = _createInline();
				$tom.insertNext(_iNode, _control);
				$tom.append(_iNode, _control);
			}
		} else {
			this.execWithMarker(function(marker) {
				if (marker.checkCollapsed()) { //collapsed
					var _iNode = _createInline();
					$tom.append(_iNode, _processor.newDummy());
					$tom.insertNext(_iNode, marker.startMarker);
					_processor.bookmarkTo({
						startContainer: _iNode,
						startOffset: 1,
						endContainer: _iNode,
						endOffset: 1
					});
					_nodes.push(_iNode);
				} else {
					var _itr = _processor.getInlineRangeIterator(_patterns, marker.startMarker, marker.endMarker);
					var _node;
					while (_itr.hasNext()) {
						_node = _itr.next();
						if ($tom.kindOf(_node, '#tx_start_marker,#tx_end_marker')) {
							//ignore
						} else if ($tom.kindOf(_node, 'br')) {
							//ignore
						} else {
							_nodes.push(_node);
						}
					}
				}
			});
		}
		return _nodes;
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 컨트롤 노드(img,object,hr,table,button)들을 리턴한다.
	 * @param {Array} filter - 수집할 노드 패턴 조건
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.controls(function() {
			return 'hr,table';
		});
	 */
	controls: function(filter) {
		var _nodes = [];
		if (this.hasControl()) {
			if ($tom.kindOf(this.getControl(), filter())) {
				_nodes.push(this.getControl());
			}
		}
		return _nodes;
	},
	/**
	 * 더미용 nbsp를 넣는 함수.
	 * webkit 용에 구현되어있습니다.
	 * Safari 에서 apply 시
	 * 폰트에 대한 속성을 잃어버리기 때문에 필요.
	 */
	addDummyNbsp: function () {},
	/**
	 * 배열 내의 모든 노드에게 지정한 속성을 적용한다.
	 * @param {Array} nodes - 속성을 적용할 노드 배열
	 * @param {Object} attributes - 노드에 적용할 속성들
	 * @returns {Array} - 입력 노드들
	 * @example
	 * 	processor.apply([p,p,p], { style: { textAlign: 'center'}});
	 */
	apply: function(nodes, attributes) {
		if(!nodes) {
			return _NULL;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}
		nodes.each(function(node) {
			$tom.applyAttributes(node, attributes);
		});
		return nodes;
	},
	/**
	 * 배열 내의 모든 노드를 주어진 블럭으로 감싼다.
	 * @param {Array} nodes - 블럭으로 감쌀 노드 배열
	 * @param {String} tag - 블럭 노드 명
	 * @param {Object} attributes - 블럭에 적용할 속성
	 * @returns {Element} - 생성한 블럭노드
	 * @example
	 * 	processor.wrap([p,p,p], 'div', { style: { backgroundColor: 'black'}});
	 */
	wrap: function(nodes, tag, attributes) {
		if(!nodes) {
			return _NULL;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}
		attributes = attributes || {};
		var res = $tom.wrap(this.create(tag, attributes), nodes);
        if($tx.msie && !$tom.nextContent(res)){
            var e = this.doc.createElement('p');
            e.innerHTML = $tom.EMPTY_BOGUS;
            this.doc.body.appendChild(e);
        }
        return res;
	},
	/**
	 * 블럭으로 감싸진 노드들을 빼내고 블럭을 삭제한다.
	 * @param {Element} node - 블럭 노드
	 * @returns {Element} - 블럭의 첫번째 노드 또는 블럭의 다음 노드
	 * @example
	 * 	processor.unwrap(node);
	 */
	unwrap: function(node) {
		if (!node) {
			return _NULL;
		}
		this.bookmark.saveAroundNode(node);
		return $tom.unwrap(node);
	},
	createGoogRange: function() {
		return goog.dom.Range.createFromWindow(this.win)
	},
	createGoogRangeFromNodes: function(startNode, startOffset, endNode, endOffset) {
		return goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset);
	},
	executeUsingCaret: function(handler) {
		try {
			var range = this.createGoogRange();
			var savedCaret = range.saveUsingCarets();
			return handler(range, savedCaret);
		} finally {
			if (!savedCaret.isDisposed()) {
				savedCaret.restore();
			}
		}
	}
};

Trex.module("observe that @when control elements are focused at",
	function(editor, toolbar, sidebar, canvas) {
		if($tx.webkit || $tx.presto) {
			canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(ev) {
				var _processor = canvas.getProcessor();
				var _node = $tx.element(ev);
				if ($tom.kindOf(_node, "img,hr,iframe,table")) {
					var _button = $tom.find(_node, 'button');
					if(_button) {
						_processor.selectControl(_button);
					} else {
						_processor.selectControl(_node);
					}
				} else if ($tom.kindOf(_node, "button")) {
					_processor.selectControl(_node);
				}
			});
		}
	}
);

Trex.module("bind iframe activate or deactivate event",
    function(editor, toolbar, sidebar, canvas) {
//        if ($tx.msie_nonstd) {
            canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(panelDoc) {
                var _processor = canvas.getProcessor(Trex.Canvas.__WYSIWYG_MODE);

                $tx.observe(panelDoc, 'beforedeactivate', function(ev) {
                    _processor.isRangeInsideWysiwyg = true;
                    _processor.lastRange = _processor.getRange();
                });

                $tx.observe(panelDoc, 'deactivate', function (ev) {
                    if (_processor.hasControl()) {
                        return;
                    }
                    _processor.isRangeInsideWysiwyg = false;
                });

                $tx.observe(panelDoc, 'activate', function() {
                    _processor.isRangeInsideWysiwyg = true;
                    _processor.lastRange = _NULL;
                });
            });
//        }
    }
);
