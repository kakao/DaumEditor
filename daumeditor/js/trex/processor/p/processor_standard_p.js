
Trex.I.Processor.StandardP = {
	putBogusParagraph: function() {
		var _body = this.doc.body;
		var _lastChild = $tom.last(_body);
		if (_lastChild && $tom.kindOf(_lastChild, 'p')) {
			return;
		}
		var _newChild = this.newParagraph('p');
		if($tom.kindOf(_lastChild, "br")) {
			$tom.replace(_lastChild, _newChild);
		} else {
			$tom.append(_body, _newChild);
		}
	}
};


Trex.module("put bogus paragraph @when any key event fires",
	function(editor, toolbar, sidebar, canvas) { //NOTE: #FTDUEDTR-695
		if($tx.msie_nonstd) {
			return;
		}
		if (canvas.config.newlinepolicy == "p") {
			canvas.reserveJob(Trex.Ev.__CANVAS_PANEL_KEYUP, function(){
				if (!canvas.isWYSIWYG()) {
					return;
				}
				var _processor = canvas.getProcessor();
				_processor.putBogusParagraph();
			}, 10);
		}
	}
);

Trex.module("interrupt enter key action @ wysiwyg panel", function(editor, toolbar, sidebar, canvas/*, config*/) {
    var _config = TrexConfig.get('canvas');
    if (_config.newlinepolicy != "p") {
        return;
    }

    canvas.observeKey({
        ctrlKey: _FALSE,
        altKey: _FALSE,
        shiftKey: _FALSE,
        keyCode: Trex.__KEY.ENTER
    }, function(ev) {
        if (!canvas.isWYSIWYG()) {
            return;
        }
        var _processor = canvas.getProcessor();
        try {
            _processor.getTxSel().collapse(_FALSE);
            _processor.controlEnterByParagraph(ev);
        } catch(e) {
            if (e == $propagate) {
                throw e;
            }
        }
    });
});
