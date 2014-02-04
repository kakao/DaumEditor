Trex.I.Processor.TridentStandard = {
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
     * Webkit에서 newlinepolicy가 p일 경우 Enter Key 이벤트가 발생하면 실행한다.
     * @param {Event} ev - Enter Key 이벤트
     */
    controlEnterByParagraph: function(ev) {
        throw $propagate;
    },
    /**
     * @private
     * @memberOf Trex.Canvas.ProcessorBR
     * Webkit에서 newlinepolicy가 br일 경우 Enter Key 이벤트가 발생하면 실행한다.
     * @param {Event} ev - Enter Key 이벤트
     */
    controlEnterByLinebreak: function(ev) {
        var _processor = this;
        var _rng = this.getRange(false);
        var _parent = _rng.endContainer.parentNode;

        if (_parent && (_parent.tagName == "P" || _parent.tagName == "DIV" || _parent.tagName == "BODY" || _parent.tagName == "BLOCKQUOTE")) {

            if(_parent.tagName == "BLOCKQUOTE" || $tx.hasClassName(_parent, "txc-textbox") || $tx.hasClassName(_parent, "txc-moreless")){
                $tx.stop(ev);
                var _brNode = _processor.win.br();
                _rng.insertNode(_brNode);
                _rng.selectNode(_brNode);
                _rng.collapse(false);
                _brNode = _processor.win.br();
                _rng.insertNode(_brNode);
                _rng.selectNode(_brNode);
                _rng.collapse(false);

                var _rng = _processor.getRange(false);
                _rng.selectNodeContents(_brNode.nextSibling);

                var _sel = _processor.getSel();
                _sel.removeAllRanges();
                _sel.addRange(_rng);
                _sel.collapseToStart();
            }
        }
    },
    /**
     * 선택된 영역의 native queryCommandState 값을 얻어온다.
     * @param {String} command - 커맨드 명
     * @returns {Boolean} - 해당 영역이 커맨드 상태인지 여부
     * @example
     * 	processor.queryCommandState('bold');
     * @description
     * webkit 계열의 브라우저(크롬,사파리)에서 img 에 대한 queryCommandState 가 부정확하여 수정.
     */
    queryCommandState: function(command) {
        var range = this.getRange();
        if (this.hasControl() && range.collapsed === _FALSE && range.endOffset - range.startOffset === 1) {
            if (command === "bold" || command === "underline" || command === "italic" || command === "strikethrough") {
                var elem = this.getControl();
                if (elem.tagName === "IMG" || elem.tagName === "BUTTON") {
                    return _FALSE;
                }
            }
        }//<-여기까지 webkit 계열의 브라우저 queryCommandState 에러 처리.
        //위 코드와 관련된 티켓: #FTDUEDTR-1107
        try {
            return this.doc.queryCommandState(command);
        } catch(e) { return _FALSE; }
    },
    /**
     * for safari bug. 빈노드에 글자크기, 글자폰트 기억 못시킴.
     */
    addDummyNbsp: function (nodes) {
        var _node;
        if (nodes.length === 1) {
            _node = nodes[0];
            if (_node.tagName.toLowerCase() === "span"
                && _node.childNodes.length === 1
                && _node.firstChild.nodeType === 3
                && _node.firstChild.data === "") {
                _node.firstChild.data = "\u00A0";
            }
        }
    }
};


/*-------------------------------------------------------*/

Object.extend(Trex.I.Processor.TridentStandard, {
    restoreRange: function() { //TODO: rename
        if (!this.isRangeInsideWysiwyg && this.lastRange) {
            var _sel = this.getSel();
            _sel.removeAllRanges();
            _sel.addRange(this.lastRange);
        }
    }
});

