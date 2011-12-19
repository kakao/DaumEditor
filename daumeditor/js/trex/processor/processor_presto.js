Trex.I.Processor.Presto = {
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
	 * Presto에서 newlinepolicy가 p일 경우 Enter Key 이벤트가 발생하면 실행한다. 
	 * @param {Event} ev - Enter Key 이벤트
	 */
	controlEnterByParagraph: function(ev) {
		throw $propagate;
	}
};
