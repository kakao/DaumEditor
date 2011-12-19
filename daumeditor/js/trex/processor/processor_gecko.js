Trex.I.Processor.Gecko = {
	/**
	 * Paragraph 를 채운다.
 	 * @private
 	 * @param {Node} node - paragraph 노드
	 */
	stuffNode: function(node) {
		return $tom.stuff(node, this.newNode('br'));
	},
	/**
	 * @private
	 * @memberOf Trex.Canvas.ProcessorP
	 * Gecko에서 newlinepolicy가 p일 경우 Enter Key 이벤트가 발생하면 실행한다. 
	 * @param {Event} ev - Enter Key 이벤트
	 */
	controlEnterByParagraph: function() {
		var _bNode = this.findNode('li,td,th');
		if (_bNode) { 
			throw $propagate;
		}
		
		var _btnNode = this.findNode("button");
		if(_btnNode) {
			this.moveCaretTo($tom.next(_btnNode));
			throw $propagate;
		}
		
		var _dvNode;
		this.getTxSel().collapse(_FALSE);
		var _wNode = this.findNode('%paragraph');
		if (_wNode) {
			this.execWithMarker(function(marker) {
				_dvNode = $tom.divideParagraph(marker.endMarker);
			});
			this.stuffNode(_wNode);
		} else {
			_dvNode = this.newParagraph('p');
			this.execWithMarker(function(marker) {
				$tom.insertAt(_dvNode, marker.endMarker);
			});
		}
		this.stuffNode(_dvNode);
		this.moveCaretTo(_dvNode);
	}
};
