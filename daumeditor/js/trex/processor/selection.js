/**
 * @fileOverview
 * native selection, range 객체를 wrapping 한 객체로 Processor 에서 주로 사용된다. 
 */
Trex.I.Selection = {};
Trex.I.Selection.Standard = /** @lends Trex.Canvas.Selection.prototype */{
	/**
	 * native selection object를 리턴한다.
	 * @returns {Object} - native selection object
	 * @example
	 * 	txSelection.getSel();
	 */
	getSel: function(){
		return this.win.getSelection();
	},
	/**
	 * 선택된 영역의 텍스트 데이터를 리턴한다.
	 * @returns {String} - 선택된 영역의 텍스트 데이터
	 * @example
	 * 	txSelection.getText();
	 */
	getText: function() {
		return this.getSel().toString();
	},
	/**
	 * 선택된 영역의 노드를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @example
	 * 	txSelection.getNode();
	 */
	getNode: function() {
		var _rng = this.getRange();
		if (_rng) {
			var _startContainer = _rng.startContainer;
			if (_startContainer.nodeType == 1) {
				if ($tom.isBody(_startContainer)) {
					return (_startContainer);
				} else {
					return (_startContainer.childNodes[_rng.startOffset]);
				}
			} else {
				return (_startContainer.parentNode);
			}
		} else {
			return _NULL;
		}
	},
	/**
	 * native range 를 생성한다.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	txSelection.createRange();
	 */
	createRange: function() {
		return this.doc.createRange();
	},
	/**
	 * native text range 를 생성한다.
	 * @returns {Object} - native text range 객체
	 * @example
	 * 	txSelection.createTextRange();
	 */
	createTextRange: function() {
		return this.doc.createRange();
	},
	/**
	 * native range object를 리턴한다.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	txSelection.getRange();
	 */
	getRange: function(collapse) {
		var _sel = this.getSel();
		if (_sel && _sel.rangeCount > 0) {
			if (collapse == _NULL) {
				if (_sel.rangeCount == 1) { //단일 Range = 일반적인 경우
					return _sel.getRangeAt(0);
				} else { //복수 Range -> 단일 Range로 변환
					return this.mergeRange(_sel);
				}
			} else { //Range를 collapse할 경우
				var _rng = _sel.getRangeAt(0);
				_rng.collapse(collapse);
				return _rng;
			}
		} else { //Range가 없을 경우
			return this.doc.createRange();
		}
	},
	/**
	 * 선택된 영역의 collapse 여부(선택된 영역이 있는지 여부)를 리턴한다.
	 * @returns {Boolean} - collapse 여부
	 * @example
	 * 	txSelection.isCollapsed();
	 */
	isCollapsed: function() {
		var _sel = this.getSel();
		return (_sel && _sel.isCollapsed);
	},
	/**
	 * 선택된 영역을 collapse 시킨다.
	 * @param {Boolean} toStart - 위치, 시작 = true
	 * @example
	 * 	txSelection.collapse(true);
	 */
	collapse: function(toStart) {
		var _sel = this.getSel();
		if (_sel && _sel.rangeCount > 0) {
			var _rng = _sel.getRangeAt(0);
			_rng.collapse(toStart);
		}
	},
	/**
	 * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @example
	 * 	txSelection.getControl();
	 */
	getControl: function() {
		var _sel = this.getSel();
		var _node;
		if ($tx.opera) {
			/* @opera IMG 선택시 isCollapsed 가 true 되는 문제가 있음. */
			_node = _sel.anchorNode.childNodes[_sel.anchorOffset];
			if (_node == _NULL) {
				return _NULL;
			}
			if(_sel.isCollapsed && _node.tagName != "IMG") {
				return _NULL;	
			}
		}
		else {
			if(_sel.isCollapsed) {
				return _NULL;	
			}
			_node = _sel.anchorNode.childNodes[_sel.anchorOffset];
		}
		if($tom.kindOf(_node, '%control')) {
			return _node;
		} else {
			return _NULL;
		}
	},
	/**
	 * 선택된 영역이 컨트롤 노드인지 여부를 리턴한다.
	 * @returns {Boolean} - 컨트롤 노드인지 여부
	 * @example
	 * 	txSelection.hasControl();
	 */
	hasControl: function() {
		return (this.getControl() != _NULL);
	},
	/**
	 * 컨트롤 노드를 선택한다.
	 * @param {Element} node - 컨트롤 노트 
	 * @example
	 * 	txSelection.selectControl(node);
	 */
	selectControl: function(node) {
		var _rng = this.createRange();
		_rng.selectNode(node);
		var _sel = this.getSel();
		_sel.removeAllRanges();
		_sel.addRange(_rng);
	},
	/**
	 * 선택된 영역이 텍스트 데이터 영역의 어떤 위치인지를 리턴한다.
	 * @returns {Number} - 텍스트 데이터 영역의 어떤 위치인지 <br/>
	 * 					빈 텍스트일 경우 : $tom.__POSITION.__EMPTY_TEXT : -2<br/>
	 * 					텍스트의 처음 : $tom.__POSITION.__START_OF_TEXT : -1<br/>
	 * 					텍스트의 중간 : $tom.__POSITION.__MIDDLE_OF_TEXT : 0<br/>
	 * 					텍스트의 마지막 : $tom.__POSITION.__END_OF_TEXT : 1
	 * @example
	 * 	txSelection.compareTextPos();
	 */
	compareTextPos: function() {
		var _rng = this.getRange();
		if (_rng) {
			var _startContainer = _rng.startContainer;
			if (_startContainer.nodeType == 3) {
				if ( _startContainer.textContent.trim().length == 0 ){
					return $tom.__POSITION.__EMPTY_TEXT;
				}else if(_rng.startOffset == 0 ) {
					return $tom.__POSITION.__START_OF_TEXT;
				} else if(_rng.startOffset == _startContainer.textContent.length) {
					return $tom.__POSITION.__END_OF_TEXT;
				} else {
					return $tom.__POSITION.__MIDDLE_OF_TEXT;
				}
			}
		}
		return $tom.__POSITION.__END_OF_TEXT;
	},
	/**
	 * @private
	 * selection에 복수의 range가 있을 경우 range를 합친디ㅏ.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	txSelection.mergeRange(sel);
	 */
	mergeRange: function(sel) {
		try {
			var _ranges = [];
			for(var i=0,_length=sel.rangeCount; i<_length; i++) {
				_ranges.push(sel.getRangeAt(i));
			}
			sel.removeAllRanges();
			
			var _startNode = _ranges[0].startContainer.childNodes[_ranges[0].startOffset];
			var _endNode = _ranges[_length - 1].endContainer.childNodes[_ranges[_length - 1].endOffset - 1];
			
			var _rng = this.doc.createRange();
			try {
				_rng.setStart(_startNode, 0);
			} catch (e) {
				_rng.collapse(_TRUE);
			}
			try {
				_rng.setEnd(_endNode, _endNode.childNodes.length);
			} catch (e) {}
			
			sel.addRange(_rng);
			return sel.getRangeAt(0);
		} catch(e) {
			return sel.getRangeAt(0);
		}
	},
	/**
	 * @private
	 * 특정 위치로 range의 시작위치를 지정한다.
	 * @param {Object} rng - native range 객체
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	txSelection.setStart(range, node, 1);
	 */
	setStart: function(rng, node, offset) {
		try {
			rng.setStart(node, offset);
		} catch (e) {
			rng.collapse(_TRUE);
			rng.setStart(node, offset);
		}
	},
	/**
	 * @private
	 * 특정 위치로 range의 끝위치를 지정한다.
	 * @param {Object} rng - native range 객체
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	txSelection.setEnd(range, node, 1);
	 */
	setEnd: function(rng, node, offset) {
		try {
			rng.setEnd(node, offset);
		} catch (e) {
			rng.collapse(_FALSE);
			rng.setEnd(node, offset);
		}
	},
	/**
	 * 주어진 range를 선택한다.
	 * @returns {Object} - native selection 객체
	 * @example
	 * 	txSelection.selectRange(range);
	 */
	selectRange: function(rng) {
		var _sel = this.getSel();
		_sel.removeAllRanges(); 
		_sel.addRange(rng); 
	}
};

	
Trex.I.Selection.Trident = /** @lends Trex.Canvas.Selection.prototype */{
	/**
	 * native selection object를 리턴한다.
	 * @returns {Object} - native selection object
	 * @example
	 * 	txSelection.getSel();
	 */
	getSel: function(){
		return this.doc.selection;
	},
	/**
	 * 선택된 영역의 텍스트 데이터를 리턴한다.
	 * @returns {String} - 선택된 영역의 텍스트 데이터
	 * @example
	 * 	txSelection.getText();
	 */
	getText: function() {
		return this.getSel().createRange().text;
	},
	/**
	 * 선택된 영역의 노드를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @example
	 * 	txSelection.getNode();
	 */
	getNode: function() {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if (_type === "control") {
			return (_sel.createRange().item(0));
		} else {
			return (_sel.createRange().parentElement());
		}
	},
	/**
	 * native range 를 생성한다.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	txSelection.createRange();
	 */
	createRange: function() {
		var _sel = this.getSel();
		return _sel.createRange();
	},
	/**
	 * native text range 를 생성한다.
	 * @returns {Object} - native text range 객체
	 * @example
	 * 	txSelection.createTextRange();
	 */
	createTextRange: function() {
		return this.doc.body.createTextRange();
	},
	/**
	 * native range object를 리턴한다.
	 * @returns {Object} - native range 객체
	 * @example
	 * 	txSelection.getRange();
	 */
	getRange: function(collapse){
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if (_type == "none") {
			return _sel.createRange() ? _sel.createRange() : function(){
				var _rng = this.doc.body.createTextRange();
				_rng.collapse(_TRUE);
				_rng.select();
				return _rng;
			}();
		}
		if (collapse == _NULL) {
			return _sel.createRange();
		} else {
			if (_type === "text") {
				var _rng = _sel.createRange();
				_rng.collapse(collapse);
				_rng.select();
				return _sel.createRange();
			} else {
				if (_type === "control") {
					_sel.empty();
				}
				return _sel.createRange();
			}
		}
	},
	/**
	 * 선택된 영역의 collapse 여부(선택된 영역이 있는지 여부)를 리턴한다.
	 * @returns {Boolean} - collapse 여부
	 * @example
	 * 	txSelection.isCollapsed();
	 */
	isCollapsed: function() {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if(_type === "none") {
			return _TRUE;
		} else if(_type === "control") {
			return _TRUE;
		} else if(_type === "text") {
			var _rng = _sel.createRange();
            return _rng.compareEndPoints('StartToEnd', _rng) == 0;
		} else {
			return _TRUE;
		}
	},
	/**
	 * 선택된 영역을 collapse 시킨다.
	 * @param {Boolean} toStart - 위치, 시작 = true
	 * @example
	 * 	txSelection.collapse(true);
	 */
	collapse: function(toStart) {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if(_type === "text") {
			var _rng = _sel.createRange();
			_rng.collapse(toStart);
			_rng.select();
			return _sel.createRange();
		} else {
			if(_type === "control") {
				_sel.empty();
			}
			return _sel.createRange();
		}
	},
	/**
	 * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @example
	 * 	txSelection.hasControl();
	 */
	getControl: function() {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if (_type === "control") {
			var _node = _sel.createRange().item(0);
			if($tom.kindOf(_node, '%control')) {
				return _node;
			} else {
				return _NULL;
			}
		} else {
			return _NULL;
		}
	},
	/**
	 * 선택된 영역이 컨트롤 노드인지 여부를 리턴한다.
	 * @returns {Boolean} - 컨트롤 노드인지 여부
	 * @example
	 * 	txSelection.hasControl();
	 */
	hasControl: function() {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if (_type === "control") {
			return _TRUE;
		} else {
			return _FALSE;
		}
	},
	/**
	 * 컨트롤 노드를 선택한다.
	 * @param {Element} node - 컨트롤 노트 
	 * @example
	 * 	txSelection.selectControl(node);
	 */
	selectControl: function(node) {
		var _rng = this.doc.body.createControlRange();
		_rng.add(node);
		_rng.select();
	},
	/**
	 * 선택된 영역이 텍스트 데이터 영역의 어떤 위치인지를 리턴한다.
	 * @returns {Number} - 텍스트 데이터 영역의 어떤 위치인지 <br/>
	 * 					텍스트의 처음 : $tom.__POSITION.__START_OF_TEXT : -1<br/>
	 * 					텍스트의 중간 : $tom.__POSITION.__MIDDLE_OF_TEXT : 0<br/>
	 * 					텍스트의 마지막 : $tom.__POSITION.__END_OF_TEXT : 1
	 * @example
	 * 	txSelection.compareTextPos();
	 */
	compareTextPos: function() {
		var _sel = this.getSel();
		var _type = _sel.type.toLowerCase();
		if(_type === "none") {
			var _rng = _sel.createRange();
			var _rng2 = _rng.duplicate();
			_rng2.moveToElementText(_rng.parentElement());
			if ( _rng2.text.trim().replace(Trex.__WORD_JOINER_REGEXP, "").length == 0 ){
				return $tom.__POSITION.__EMPTY_TEXT;
			} else if(_rng.compareEndPoints('StartToStart', _rng2) == 0) {
				return $tom.__POSITION.__START_OF_TEXT;
			} else if(_rng.compareEndPoints('EndToEnd', _rng2) == 0) {
				return $tom.__POSITION.__END_OF_TEXT;
			} else {
				return $tom.__POSITION.__MIDDLE_OF_TEXT;
			}
		}
		return $tom.__POSITION.__END_OF_TEXT;
	},
	/**
	 * @private
	 * @reference http://msdn.microsoft.com/en-us/library/ms536745(VS.85).aspx
		StartToEnd - Move the start of the TextRange object to the end of the specified oTextRange parameter.
		StartToStart - Move the start of the TextRange object to the start of the specified oTextRange parameter.
		EndToStart - Move the end of the TextRange object to the start of the specified oTextRange parameter.
		EndToEnd - Move the end of the TextRange object to the end of the specified oTextRange parameter.
	 */
	transTextRange: function(rng, node, offset, toStart) {
		var _pntRng = this.createTextRange();
		
		var _pntNode = this.win.span(Trex.__WORD_JOINER);
		$tom.insertAt(_pntNode, node);
		_pntRng.moveToElementText(_pntNode);
		$tom.remove(_pntNode);
		
		_pntRng.collapse(_TRUE);
		_pntRng.moveStart('character', offset);
			
		if (toStart) {
			rng.setEndPoint('StartToStart', _pntRng);
		} else {
			rng.setEndPoint('EndToEnd', _pntRng);
		}
		
		return rng;
	},
	/**
	 * @private
	 * 특정 위치로 range의 시작위치를 지정한다.
	 * @param {Object} rng - native range 객체
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	txSelection.setStart(range, node, 1);
	 */
	setStart: function(rng, node, offset) {
		try {
			this.transTextRange(rng, node, offset, _TRUE);
		} catch (e) {
			console.log(e)
		}
		return rng;
	},
	/**
	 * @private
	 * 특정 위치로 range의 끝위치를 지정한다.
	 * @param {Object} rng - native range 객체
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	txSelection.setEnd(range, node, 1);
	 */
	setEnd: function(rng, node, offset) {
		try {
			this.transTextRange(rng, node, offset, _FALSE);
		} catch (e) {
			console.log(e)
		}
		return rng;
	},
	/**
	 * 주어진 range를 선택한다.
	 * @returns {Object} - native selection 객체
	 * @example
	 * 	txSelection.selectRange(range);
	 */
	selectRange: function(rng) {
		rng.select();
	}
};

Trex.I.Selection.TridentStandard = {
    /**
     * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
     * @returns {Element} - 선택된 영역의 노드
     * @example
     * 	txSelection.getControl();
     */
    getControl: function() {
        var _sel = this.getSel();
        if(_sel.isCollapsed) {
            return null;
        }
        if ($tom.isElement(_sel.anchorNode)) {
            var _node = _sel.anchorNode.childNodes[_sel.anchorOffset];
            if ($tom.kindOf(_node, '%control')) {
                return _node;
            } else {
                return null;
            }
        }
        //button
        var _prevNode = $tom.previous(_sel.focusNode);
        var _nextNode = $tom.next(_sel.anchorNode);
        if(_prevNode == _nextNode) {
            return $tom.first(_prevNode, '%control');
        } else {
            return null;
        }
    },
    /**
     * 컨트롤 노드를 선택한다.
     * @param {Element} node - 컨트롤 노트
     * @example
     * 	txSelection.selectControl(node);
     */
    selectControl: function(node) {
        var _rng = this.createRange();
        _rng.selectNode(node);
        var _sel = this.getSel();
        _sel.removeAllRanges();
        _sel.addRange(_rng);
    }
};


Trex.I.Selection.Gecko = {
	
};

Trex.I.Selection.Webkit = {
	/**
	 * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @example
	 * 	txSelection.getControl();
	 */
	getControl: function() {
		var _sel = this.getSel();
		if(_sel.isCollapsed) {
			return _NULL;	
		}
		if ($tom.isElement(_sel.anchorNode)) {
			var _node = _sel.anchorNode.childNodes[_sel.anchorOffset];
			if ($tom.kindOf(_node, '%control')) {
				return _node;
			} else {
				return _NULL;
			}
		}
		//button
		var _prevNode = $tom.previous(_sel.focusNode);
		var _nextNode = $tom.next(_sel.anchorNode);
		if(_prevNode == _nextNode) {
			return $tom.first(_prevNode, '%control');
		} else {
			return _NULL;
		}
	},
	/**
	 * 컨트롤 노드를 선택한다.
	 * @param {Element} node - 컨트롤 노트 
	 * @example
	 * 	txSelection.selectControl(node);
	 */
	selectControl: function(node) {
		var _rng = this.createRange();
		_rng.selectNode(node);
		var _sel = this.getSel();
		_sel.removeAllRanges();
		_sel.addRange(_rng);
	}
};

Trex.I.Selection.Presto = {
	
};

/**
 * native selection, range 객체를 wrapping 한 객체로 <br/>
 * browser에 따라 필요한 함수들을 mixin한다. <br/>
 * 주로 Processor와 연관된 객체에서 호출하며, <br/>
 * processor.getTxSel()를 통해서 txSelection를 얻어서 사용한다. <br/>
 * native selection 과 구분짓기 위해서 txSelection로 명명한다.
 *
 * @class
 * @param {Object} processor - Processor 객체
 */
Trex.Canvas.Selection = Trex.Class.create(/** @lends Trex.Canvas.Selection.prototype */{
	/** @ignore */
	$mixins: [
		Trex.I.Selection.Standard,
		(($tx.msie_nonstd)? Trex.I.Selection.Trident: {}),
        (($tx.msie_std)? Trex.I.Selection.TridentStandard: {}),
		(($tx.gecko)? Trex.I.Selection.Gecko: {}),
		(($tx.webkit)? Trex.I.Selection.Webkit: {}),
		(($tx.presto)? Trex.I.Selection.Presto: {})
	],
	initialize: function(processor) {
		this.processor = processor;
		this.win = processor.win;
		this.doc = processor.doc;
	}
});

