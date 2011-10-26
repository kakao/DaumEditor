Trex.Canvas.TextAreaProcessor = Trex.Class.create({
	$mixins: [ ],
	initialize: function(textarea) {
		this.el = textarea;
	},
	focus: function() {
		this.el.focus();
	},
	/**
	 * 본문의 처음으로 캐럿을 옮긴다.
	 * @example
	 * 	processor.focusOnTop();
	 */
	focusOnTop: function() {
		var textarea = this.el;
        // TODO extract method as 'focusWithoutScrolling'
		if (textarea.createTextRange) { // IE
			var range = textarea.createTextRange();
			range.collapse(_TRUE);
			range.moveStart("character", 0);
			range.moveEnd("character", 0);
			range.select();
        } else if (textarea.setSelectionRange) { // Others
            textarea.select();
            textarea.setSelectionRange(0, 0);
		} else { // fallback
			textarea.focus();
		}
	},
	blur: function() {
		_WIN.focus();
	},
	savePosition: function() {
		if (this.el.createTextRange) {
			this.currentPos = _DOC.selection.createRange().duplicate();
		}	
	},
	controlEnter: function() {
		var _processor = this;
		_processor.insertTag("<br/>", "");
	},
	insertTag: function(prefix, postfix) {
		this.pasteContent(prefix + postfix);
		return _TRUE;
	},
	pasteContent: function( content/*, newLine, wrapStyle*/){
		this.el.value += content;
	}
});
