/**
 * @fileoverview
 * attachments.js
 *
 */
TrexMessage.addMsg({
	'@attacher.only.wysiwyg.alert': "에디터 상태에서만 본문에 삽입할 수 있습니다.\n에디터모드에서 첨부박스의 썸네일을 클릭해서 삽입할 수 있습니다."
});
/**
 * Trex.Attachment
 * 첨부된 data를 wrapping하는 class
 *
 * @abstract
 * @class
 * @extends Trex.Entry
 *
 * @param {Object} actor
 * @param {Object} data
 */
Trex.Attachment = Trex.Class.draft(/** @lends Trex.Attachment.prototype */{
	/** @ignore */
	$extend: Trex.Entry,
	isChecked: _FALSE,
	focused: _FALSE,
	attrs: {
		align: "left"
	},
	initialize: function(actor, data) {
		this.actor = actor;
		this.canvas = actor.canvas;
		this.entryBox = actor.entryBox;
		
		this.type = this.constructor.__Identity;
		this.setProperties(data);
		
		if (this.oninitialized) {
			this.oninitialized(actor, data);
		}
	},
	/**
	 * focused 값을 설정한다.
	 * @function
	 */
	setFocused: function(focused) {
		if (this.focused !== focused) {
			this.focused = focused;
		}
	},
	/**
	 * existStage 값을 설정한다.
	 * @function
	 */
	setExistStage: function(existStage) { //just attachments~
		/**
		 * attachment가 content에 존재하는지 확인할 때 사용되는 속성
		 */
		this.existStage = existStage;
		if (this.entryBox.changeState) {
			this.entryBox.changeState(this);
		}
	},
	/**
	 * content에서 attachment를 지운다.
	 * @function
	 */
	remove: function() {
		var _content = this.canvas.getContent();
		if (this.canvas.isWYSIWYG()) {
			if (_content.search(this.regHtml) > -1) {
				_content = _content.replace(this.regHtml, "");
				this.canvas.setContent(_content);
			}
		} else {
			if (_content.search(this.regText) > -1) {
				_content = _content.replace(this.regText, "");
				this.canvas.setContent(_content);
			}
		}
	},
	/**
	 * attachment HTML을 에디터 본문에 붙여넣는다.
	 * @function
	 */
	register: function() {
		if (Editor.getSidebar().addOnlyBox) {
			return;
		}
		var _actor = this.actor;
		if (_actor.boxonly) {
			return;
		}
		
		if (this.canvas.isWYSIWYG()) {
			var _pastescope = this.pastescope;
			var _dispHtml = this.dispHtml;
			var objectElemTagName = "img";
            var findRegex = this.matchRegexStartTag;// /<(\w+)/
			var matched = _dispHtml.match(findRegex);
			//for other elements(Exam: button of file attachment).
			if (matched && matched[1]) {
				objectElemTagName = matched[1];
			}
			if (this.objectStyle) {
				var objectElemeReg = new RegExp("<" + objectElemTagName + " ", "i");
				_dispHtml = _dispHtml.replace(objectElemeReg, "<" + objectElemTagName + " style=\"" + Trex.Util.toStyleString(this.objectStyle) + "\" ");
			}
			if (this.objectAttr) {
				_dispHtml = _dispHtml.replace(objectElemeReg, "<" + objectElemTagName + " " + Trex.Util.toAttrString(this.objectAttr) + " ");
			}
			var _style = this.paragraphStyle || {};
			if ($tx.webkit) {
				this.canvas.getPanel('html').el.focus(); // FTDUEDTR-1281
			}
			this.canvas.execute(function(processor) {
				processor.moveCaretWith(_pastescope);
				processor.pasteContent(_dispHtml, _TRUE, {
					'style': _style
				});
			});
		} else {
			if (this.actor.wysiwygonly) {
				alert(TXMSG("@attacher.only.wysiwyg.alert"));
			} else {
				this.canvas.getProcessor().insertTag('', this.dispText);
			}
		}
	},
	/**
	 * 인자로 받은 old regex로 attachment를 식별해서 HTML을 교체한다.
	 * @function
	 */
	replace: function(oldReg) {
		var _canvas = this.canvas;
		var _content = _canvas.getContent();
		var _actor = this.actor;
		if (!_actor.boxonly) {
			if (_canvas.isWYSIWYG()) {
				if (_content.search(oldReg.regHtml) > -1) {
					_content = _content.replace(oldReg.regHtml, this.dispHtml);
					_canvas.setContent(_content);
				} else {
					_canvas.pasteContent(this.dispHtml, _TRUE);
				}
			} else {
				if (_content.search(oldReg.regText) > -1) {
					_content = _content.replace(oldReg.regText, "");
					_canvas.setContent(_content);
				}
				alert(TXMSG("@attacher.only.wysiwyg.alert"));
			}
		}
	},
	/**
	 * attachment 관련하여 필요한 속성을 this 객체에 할당한다.
	 * @function
	 */
	setProperties: function(data) {
		var _data = data;
		this.data = _data;
		this.key = this.actor.getKey(_data) || 'K' + Trex.Util.generateKey();
		this.field = this.getFieldAttr(_data);
		this.boxAttr = this.getBoxAttr(_data);
		
		this.objectAttr = this.getObjectAttr.bind(this)(_data);
		this.objectStyle = this.getObjectStyle.bind(this)(_data);
		this.paragraphStyle = this.getParaStyle.bind(this)(_data);
		
		this.saveHtml = this.getSaveHtml.bind(this)(_data);
		this.dispHtml = this.getDispHtml.bind(this)(_data);
		this.dispText = this.getDispText.bind(this)(_data);
		this.regLoad = this.getRegLoad.bind(this)(_data);
		this.regHtml = this.getRegHtml.bind(this)(_data);
		this.regText = this.getRegText.bind(this)(_data);
	},
	refreshProperties: function() {
		this.setProperties(this.data);
	},
	/**
	 * object의 attribute 값을 가져온다.
	 * @function
	 */
	getObjectAttr: function() {
		return this.actor.config.objattr;
	},
	getObjectStyle: function() {
		var objstyle = {};
		if (this.actor.config.objstyle) {
			objstyle = Object.extend(objstyle, this.actor.config.objstyle);
		}
		return objstyle;
	},
	getParaStyle: function(data) {
		var parastyle = Object.extend({}, this.actor.config.parastyle || this.actor.config.defaultstyle);
		return parastyle;
	},
    updateEntryElement: function(targetElement) {
        if (!targetElement) {
            return;
        }

        var tempNode = _DOC.createElement('div');
        tempNode.innerHTML = this.dispHtml;
        targetElement.innerHTML = $tom.first(tempNode).innerHTML;
    }
});
