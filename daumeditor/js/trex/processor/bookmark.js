/**
 * @fileOverview
 * 선택된 영역을 북마크하여 
 * 포커스된 document가 변경되거나 DOM 조작을 하더라도 선택 영역이 유지되도록 한다.
 * Processor 에서 주로 사용된다. 
 */

/**
 * 선택된 영역을 북마크하여 <br/> 
 * 포커스된 document가 변경되거나 DOM 조작을 하더라도 선택 영역이 유지되도록 하는 객체로 <br/>
 * native range 객체에 있는 5가지 프로퍼티만 저장한다. <br/>
 * 주로 Processor와 연관된 객체에서 호출하며, <br/>
 * processor.getBookmark()를 통해서 bookmark를 얻어서 사용한다.<br/>
 * 
 * @class
 */
Trex.Canvas.Bookmark = Trex.Class.create(/** @lends Trex.Canvas.Bookmark.prototype */{
	startContainer: _NULL,
	startOffset: 0,
	endContainer: _NULL,
	endOffset: 0,
	initialize: function(processor) {
		this.processor = processor;
		this.win = processor.win;
		this.doc = processor.doc;
		this.dummy = function() {
			return processor.newDummy();
		};
	},
	/**
	 * 시작위치와 끝위치를 동일하게 북마크를 수정한다.
	 * @param {Boolean} toStart - 위치, 시작 = true
	 * @example
	 * 	bookmark.collapse(true);
	 */
	collapse: function (toStart) {
		if (toStart) {
			this.updateEnd(this.startContainer, this.startOffset);
		} else {
			this.updateStart(this.endContainer, this.endOffset);
		}
	},
	/**
	 * native range 객체로 북마크를 수정한다.
	 * @param {Object} rng - native range 객체
	 * @example
	 * 	bookmark.save(range);
	 */
	save: function(rng) {
		this.updateStart(rng.startContainer, rng.startOffset);
		this.updateEnd(rng.endContainer, rng.endOffset);
	},
	/**
	 * 특정 노드의 앞과 뒤로 북마크를 수정한다. 
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.saveAroundNode(node);
	 */
	saveAroundNode: function (node) {
		this.updateStartBefore($tom.top(node));
		this.updateEndAfter($tom.bottom(node));
	},
	/**
	 * 특정 노드의 처음으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.saveIntoFirst(node);
	 */
	saveIntoFirst: function(node) {
		var _node = $tom.top(node);
		this.updateEndBefore(_node);
		this.collapse(_FALSE);
	},
	/**
	 * 특정 노드의 마지막으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.saveIntoLast(node);
	 */
	saveIntoLast: function(node) {
		var _node = $tom.bottom(node);
		this.updateEndBefore(_node);
		this.collapse(_FALSE);
	},
	/**
	 * 특정 노드의 이전으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.saveNextTo(node);
	 */
	savePreviousTo: function(node) {
		if($tom.previous(node)) {
			var _node = $tom.top($tom.previous(node));
			this.updateEndAfter(_node);
		} else {
			this.updateEndBefore(node);
		}
		this.collapse(_FALSE);
	},
	/**
	 * 특정 노드의 다음으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.saveNextTo(node);
	 */
	saveNextTo: function(node) {
		if($tom.next(node)) {
			var _node = $tom.top($tom.next(node));
			this.updateEndBefore(_node);
		} else {
			this.updateEndAfter(node);
		}
		this.collapse(_FALSE);
	},
	/**
	 * marker node로 북마크를 수정한다.
	 * @param {Object} marker - marker 객체
	 * @example
	 * 	bookmark.saveWithMarker(marker);
	 */
	saveWithMarker: function(marker) {
		if (marker.checkCollapsed()) { //collapsed
			this.updateEndAfter(marker.endMarker);
			this.collapse(_FALSE);
		} else {
			this.updateStartBefore(marker.startMarker);
			this.updateEndAfter(marker.endMarker);
		}
	},
	/**
	 * txSelection가지고 저장된 북마크를 선택한다. 
	 * @param {Object} txSelection - txSelection 객체
	 * @example
	 * 	bookmark.select(txSelection);
	 */
	select: function(txSel) {
		if (this.isValid()) {
			var _rng = txSel.createTextRange();
			try {
				txSel.setStart(_rng, this.startContainer, this.startOffset);
				txSel.setEnd(_rng, this.endContainer, this.endOffset);
			} catch (e) {
				console.log(e)
			}
			txSel.selectRange(_rng);
		}
		this.reset();
	},
    isValid: function() {
        return this.isValidStartContainer() && this.isValidEndContainer();
    },
    isValidStartContainer: function() {
        return this.doc.body === $tom.body(this.startContainer);
    },
    isValidEndContainer: function() {
        return this.doc.body === $tom.body(this.endContainer);
    },
	/**
	 * @private
	 * 시작 관련 프로퍼티를 특정 위치로 지정한다.
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	bookmark.updateStart(node, 1);
	 */
	updateStart: function(node, offset) {
		this.startContainer = node;
		this.startOffset = offset;
	},
	/**
	 * @private
	 * 시작 관련 프로퍼티를 특정 위치로 이전으로 지정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.updateStartBefore(node);
	 */
	updateStartBefore: function(node) {
		var _tNode = this.dummy();
		$tom.insertAt(_tNode, node);
			
		this.startContainer = _tNode;
		this.startOffset = 0;
	},
	/**
	 * @private
	 * 시작 관련 프로퍼티를 특정 위치로 다음으로 지정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.updateStartAfter(node);
	 */
	updateStartAfter: function(node) {
		var _tNode = this.dummy();
		$tom.insertNext(_tNode, node);
			
		this.startContainer = _tNode;
		this.startOffset = 0;
	},
	/**
	 * @private
	 * 끝 관련 프로퍼티를 특정 위치로 지정한다.
	 * @param {Element} node - 특정 부모 노드
	 * @param {Number} offset - 노드의 옵셋
	 * @example
	 * 	bookmark.updateEnd(node, 1);
	 */
	updateEnd: function(node, offset) {
		this.endContainer = node;
		this.endOffset = offset;
	},
	/**
	 * @private
	 * 끝 관련 프로퍼티를 특정 위치로 이전으로 지정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.updateEndBefore(node);
	 */
	updateEndBefore: function(node) {
		var _tNode = this.dummy();
		if (node.nodeName && node.nodeName.toUpperCase() == "P" && !node.nodeValue) { // Note: 마지막 조건( !node.nodeValue)은 무의미한데..
			$tom.append(node, _tNode);
		}else {
			$tom.insertAt(_tNode, node);
		}
		
		this.endContainer = _tNode;
		this.endOffset = _tNode.length;
	},
	/**
	 * @private
	 * 끝 관련 프로퍼티를 특정 위치로 다음으로 지정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	bookmark.updateEndAfter(node);
	 */
	updateEndAfter: function(node) {
		var _tNode = this.dummy();
		$tom.insertNext(_tNode, node);
		
		this.endContainer = _tNode;
		this.endOffset = _tNode.length;
	},
	/**
	 * @private
	 * 북마크를 초기화한다.
	 * @returns {Boolean} - collapse 여부
	 * @example
	 * 	bookmark.reset();
	 */
	reset: function() {
		this.startContainer = _NULL;
		this.startOffset = 0;
		this.endContainer = _NULL;
		this.endOffset = 0;
	}
});
	