/**
 * @fileOverview
 * Wysiwyg 영역의 DOM 조작을 하기전에 선택된 영역의 시작과 끝에 marker를 삽입하여 
 * DOM 조작을 보다 용이하게 하는 객체로 Processor#execWithMarker 에서 사용된다. 
 */
Trex.I.Marker = {};

Trex.I.Marker.Standard = /** @lends Trex.Canvas.Marker.prototype */{
	/**
	 * 선택된 영역의 시작과 끝에 marker를 삽입한다.
	 * @example
	 * 	marker.paste();
	 */
	paste: function() {
		var _rng = this.processor.getRange();
		
		var _endContainer = _rng.endContainer;
		var _startContainer = _rng.startContainer; 
		if (_endContainer.nodeType == 9) { //NOTE: #FTDUEDTR-919
			_endContainer = this.processor.doc.body;
			_startContainer = this.processor.doc.body;
		}
		
		var _endMarker = this.endMarker = this.processor.create('span', { id: "tx_end_marker" });
		var _endOffset = _rng.endOffset;
		
		if (_endContainer.nodeType == 3) {
			_endContainer.splitText(_endOffset);
			_endContainer.parentNode.insertBefore(_endMarker, _endContainer.nextSibling);
		} else {
			_endContainer.insertBefore(_endMarker, _endContainer.childNodes[_endOffset]);
		}
		
		var _startMarker = this.startMarker = this.processor.create('span', { id: "tx_start_marker" });
		var _startOffset = _rng.startOffset; 
		
		if(_startContainer.nodeType == 3) {
			_startContainer.splitText(_startOffset); 
			_startContainer.parentNode.insertBefore(_startMarker, _startContainer.nextSibling);
		} else {
			_startContainer.insertBefore(_startMarker, _startContainer.childNodes[_startOffset]);
		}
	},
	/**
	 * 삽입된 마커를 제거한다.
	 * @example
	 * 	marker.remove();
	 */
	remove: function() {
		$tom.remove(this.startMarker);
		$tom.remove(this.endMarker);
	}
};


Trex.I.Marker.Trident = /** @lends Trex.Canvas.Marker.prototype */{
	/**
	 * 선택된 영역의 시작과 끝에 marker를 삽입한다.
	 * @example
	 * 	marker.paste();
	 */
	paste: function() {
		this.clear();
		
		var _rng = this.processor.getRange();
		var _cnxt = this.processor.doc.body;
		
		var _rng1 = _rng.duplicate();
		_rng1.collapse(_TRUE);
		_rng1.pasteHTML('<span id="tx_start_marker"></span>');
		this.startMarker = $tom.collect(_cnxt, '#tx_start_marker');
		
		var _rng2 = _rng.duplicate();
		_rng2.collapse(_FALSE); 
		_rng2.pasteHTML('<span id="tx_end_marker"></span>');
		this.endMarker = $tom.collect(_cnxt, '#tx_end_marker');
	},
	/**
	 * @private
	 * 기존에 삽입된 마커를 모두 제거한다.
	 * @example
	 * 	marker.remove();
	 */
	clear: function() {
		var _cnxt = this.processor.doc.body;
		$tom.remove($tom.collect(_cnxt, '#tx_start_marker'));
		$tom.remove($tom.collect(_cnxt, '#tx_end_marker'));
	},
	/**
	 * 삽입된 마커를 제거한다.
	 * @example
	 * 	marker.remove();
	 */
	remove: function() {
		$tom.remove(this.startMarker);
		$tom.remove(this.endMarker);
	}
};

/**
 * Wysiwyg 영역의 DOM 조작을 하기전에 선택된 영역의 시작과 끝에 marker를 삽입하여  <br/>
 * DOM 조작을 보다 용이하게 하는 객체로  <br/>
 * browser에 따라 필요한 함수들을 mixin한다. <br/>
 * Processor#execWithMarker 에서만 사용된다.<br/>
 * 
 * @example
 * 		var _marker = new Trex.Canvas.Marker(processor);
 *		processor.bookmarkTo();
 *		try {
 *			_marker.paste();
 *			_marker.backup();
 *			handler(_marker);
 *		} catch(e) {
 *		} finally {
 *			_marker.remove();
 *		}	
 * @class
 * @param {Object} processor - Processor 객체
 */
Trex.Canvas.Marker = Trex.Class.create(/** @lends Trex.Canvas.Marker.prototype */{
	/** @ignore */
	$mixins: [
		(($tx.msie_nonstd)? Trex.I.Marker.Trident: Trex.I.Marker.Standard)
	],
	initialize: function(processor) {
		this.processor = processor;
	},
	/**
	 * 마커를 삽입한 후 북마크를 수정한다.
	 * @example
	 * 	marker.backup();
	 */
	backup: function() {
		this.processor.bookmarkWithMarker(this);
	},
	/**
	 * @private
	 * 선택된 영역이 collapse인지 여부를 리턴한다.
	 * @returns {Boolean} - 선택된 영역이 collapse인지 여부
	 * @example
	 * 	marker.checkCollapsed();
	 */
	checkCollapsed: function() {
		return ($tom.next(this.startMarker) == this.endMarker); //collapsed
	}
});

