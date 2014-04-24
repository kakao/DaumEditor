Trex.Canvas.TextAreaProcessor = Trex.Class.create({
	$mixins: [ ],
	initialize: function(textarea) {
		this.el = textarea;
	},
	focus: function() {
		this.el.focus();
	},
	blur: function() {
		_WIN.focus();
	},
    /**
     * 본문의 처음으로 캐럿을 옮긴다.
     * @example
     * 	processor.focusOnTop();
     */
    focusOnTop: function() {
        var textarea = this.el;
        textarea.focus();
        this._selectCharacter(0, 0);
        textarea.scrollTop = 0;
    },
    focusOnBottom: function() {
        var textarea = this.el;
        textarea.focus();
        var len = textarea.value.length;
        this._selectCharacter(len, len);
        textarea.scrollTop = textarea.scrollHeight;
    },
	savePosition: function() {
        // 왜 사용되었는지 의문.. this.currentPos가 쓰이는 곳이 없음. #FTDUEDTR-1395
//		if (this.el.createTextRange) {
//			this.currentPos = _DOC.selection.createRange().duplicate();
//		}
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
	},
    _selectCharacter: function(startChar, endChar) {
        var textarea = this.el;
        if (textarea.setSelectionRange) { // standard
            textarea.select();
            textarea.setSelectionRange(startChar, endChar);

        } else if (textarea.createTextRange) { // IE
            var range = textarea.createTextRange();
            range.collapse(_TRUE);
            range.moveStart("character", startChar);
            range.moveEnd("character", endChar);
            range.select();
        }
    }
});
