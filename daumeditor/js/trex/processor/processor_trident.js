Trex.I.Processor.Trident = {
	/**
	 * Paragraph 를 채운다.
 	 * @private
 	 * @param {Node} node - paragraph 노드
	 */
	stuffNode: function(node) {
		if($tom.getLength(node) == 0) {
			node.innerHTML = '&nbsp;';
		}
		return node;
	},
	/**
	 * @private
	 * @memberOf Trex.Canvas.ProcessorP
	 * Trident에서 newlinepolicy가 p일 경우 Enter Key 이벤트가 발생하면 실행한다. 
	 */
	controlEnterByParagraph: function() {
		var _bNode = this.findNode('div');
        var _dvNode;
		if (!_bNode) { 
			throw $propagate;
		}
		
		var _pNode = this.findNode('%paragraph');
		if ($tom.kindOf(_pNode, 'p')) { 
			if($tom.first(_bNode, 'p') == _pNode) {
				this.execWithMarker(function(marker) {
					_dvNode = $tom.divideParagraph(marker.endMarker);
				});
				this.stuffNode(_pNode);
				this.stuffNode(_dvNode);
				this.moveCaretTo(_dvNode);
			} else {
				throw $propagate;
			}
		} else if($tom.kindOf(_pNode, 'li,td,th,dd,dt')) {
			throw $propagate;
		} else {
			_dvNode = this.newParagraph('p');
			this.execWithMarker(function(marker) {
				$tom.insertNext(_dvNode, marker.endMarker);
			});
			this.moveCaretTo(_dvNode);
		}
	}
};

Trex.module("delete image element @when backspace key event fires",
	function(editor, toolbar, sidebar, canvas) {
		if ($tx.msie) {
			canvas.observeKey({ 
				ctrlKey: _FALSE,
				altKey: _FALSE,
				shiftKey: _FALSE,
				keyCode: Trex.__KEY.BACKSPACE
			}, function() {
				var _processor = canvas.getProcessor();
				if (_processor.hasControl() && _processor.getControl()) {
					try {
						var _node = _processor.getControl();
						$tom.remove(_node);
					} catch (e) { }
					throw $stop;
				}
				throw $propagate;
			});
		}
	}
);

Trex.module("delete table element @when backspace key event fires",
	function(editor, toolbar, sidebar, canvas) {
		if ($tx.msie) {
			var _oldRangeLeftOffset;
			canvas.observeKey({ 
				ctrlKey: _FALSE,
				altKey: _FALSE,
				shiftKey: _FALSE,
				keyCode: Trex.__KEY.BACKSPACE
			}, function() {
				var _processor = canvas.getProcessor();
				var _rng = _processor.getRange();
				try{
					if(_oldRangeLeftOffset == _rng.boundingLeft){
						var _el = $tom.previous(_processor.getNode());
						if($tom.kindOf(_el, "table")){
							$tom.remove(_el);	
						}	
					}
				}catch(e){ }
				_oldRangeLeftOffset = _rng.boundingLeft;
				throw $propagate;
			});
		}
	}
);

/*-------------------------------------------------------*/

Object.extend(Trex.I.Processor.Trident, {
	isRangeInsideWysiwyg: false,
	lastRange: _NULL,
	restoreRange: function() { //TODO: rename
		if (!this.isRangeInsideWysiwyg && this.lastRange) {
			try {
				this.lastRange.select();
			} catch (e) {
				var _sel = this.getSel();
				var _type = _sel.type.toLowerCase();
				if (_type === "control") {
					_sel.empty();
					var _rng = _sel.createRange();
					_rng.collapse(_FALSE);
					_rng.select();
				}
			} finally {
				this.lastRange = _NULL;
			}
		}
	}
});

Trex.module("bind iframe activate or deactivate event",
	function(editor, toolbar, sidebar, canvas) {
		if ($tx.msie) {
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
		}
	}
);
