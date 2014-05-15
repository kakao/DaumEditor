(function(){
	
	/**
	 * @fileoverview 
	 *  Tool '특수문자' Source,
	 * Class Trex.Tool.SpecialChar 와 configuration을 포함    
	 *     
	 */
	var _DOC = document,
		_WIN = window,
		_DOC_EL = _DOC.documentElement,
		_FALSE = false,
		_TRUE = true,
		_NULL = null,
		_UNDEFINED;
	
	TrexMessage.addMsg({
		'@specialchar.cancel.image': "#iconpath/btn_l_cancel.gif?v=2",
		'@specialchar.confirm.image': "#iconpath/btn_l_confirm.gif?v=2",
		'@specialchar.title': "선택한 기호"
	});
			
	Trex.Class.overwrite(Trex.Tool.SpecialChar, {
		oninitialized: function() {
			var _canvas = this.canvas;
			var _toolHandler = function(value) {
				if(!value){
					return;
				}
				_canvas.execute(function(processor) {
					if ($tx.msie_docmode < 9) {
                        // ie에서 특수문자 입력시 savedCaret 내부가 아닌 상위 p태그의 이전으로 insert가 되는 현상이 있어서 분기.
                        var timekey = 'char' + (new Date()).getTime();
                        processor.pasteContent('<span id="' + timekey + '">' + value + '</span>', _FALSE);
                        var spanInDoc = processor.doc.getElementById(timekey);
                        $tom.unwrap(spanInDoc);
                    } else {
                        processor.pasteContent(value, _FALSE);
                    }
				});
			};
	
			/* button & menu weave */
			this.resetWeave();
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				new Trex.Menu.SpecialChar(this.menuCfg),
				/* handler */
				_toolHandler
			);
		}
	});
	
	Trex.MarkupTemplate.add(
		'menu.specialchar.input', [
			'<dl class="tx-menu-matrix-input">',
			'	<dt><span>@specialchar.title</span></dt>',
			'	<dd><input type="text" value=""/></dd>',
			'	<dd><img class="tx-menu-btn-confirm" src="@specialchar.confirm.image" align="absmiddle"/></dd>',
			'	<dd><img class="tx-menu-btn-cancel" src="@specialchar.cancel.image" align="absmiddle"/></dd>',
			'</dl>'
		].join("")
	);
	Trex.Menu.SpecialChar = Trex.Class.create({
		$extend: Trex.Menu.Matrix,
		ongenerated: function() {
			var _elMenu = this.elMenu;
			
			var _elInputSet = Trex.MarkupTemplate.get('menu.specialchar.input').evaluateAsDom({});
			$tom.append($tom.collect(_elMenu, 'div.tx-menu-inner'), _elInputSet);
	
			var _elInput = this.elInput = $tom.collect(_elInputSet, 'input');
			var _elImgs = $tom.collectAll(_elInputSet, 'img');
				
			if(_elImgs.length == 2) {
				$tx.observe(_elImgs[0], "click", function() {
					this._command(this.elInput.value);
					this.hide();
				}.bind(this));
				$tx.observe(_elImgs[1], "click", function() {
					this.onCancel();
				}.bind(this));
			}
			
			$tx.observe( _elInput, "keydown", function(ev){
				if ( ev.keyCode == 13 ){
					$tx.stop(ev);
					this._command(this.elInput.value);
					this.hide();
				}
			}.bind(this));
		},
		onregenerated: function() {
			this.elInput.value = "";
			this.elInput.focus();
		},
		onSelect: function(ev) {
			var _elInput = this.elInput;
			var el = $tx.findElement(ev, 'span');
			if (el.tagName && el.tagName.toLowerCase() != 'span') {
				return;
			}
			_elInput.value += (!el.innerText || el.innerText == "&nbsp;" || el.innerText.trim() == "")? "": el.innerText;
			$tx.stop(ev);
			
			_elInput.focus();
			if ($tx.msie) { //NOTE: #FTDUEDTR-1044
				try {
					var _sel = _DOC.selection.createRange();
					_sel.move("character", _elInput.value.length);
					_sel.select();
				} catch (ignore) {}
			}
		}
	});
	
	var thisToolName = 'specialchar';
	Editor.forEachEditor(function (editor) {
		editor.getTool()[thisToolName].oninitialized();
	});
	Editor.editorForAsyncLoad.getTool()[thisToolName].forceActivate();
})();
