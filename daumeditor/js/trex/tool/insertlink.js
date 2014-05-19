/**
 * @fileoverview 
 * '링크삽입' Icon Source,
 * Class Trex.Tool.Link과 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"link",
	{
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _TRUE
	}
);

TrexMessage.addMsg({
	'@insertlink.cancel.image': "#iconpath/btn_cancel.gif?v=2",
	'@insertlink.confirm.image': "#iconpath/btn_confirm.gif?v=2",
	'@insertlink.invalid.url': "URL을 입력해주세요.",
	'@insertlink.link.alt': "[#{title}]로 이동합니다.",
	'@insertlink.remove.image': "#iconpath/btn_remove.gif?v=2",
	'@insertlink.title': "선택된 부분에 걸릴 URL주소를 넣어주세요.",
	'@insertlink.onclick.target': "클릭 시",
	'@insertlink.target.blank': "새 창",
	'@insertlink.target.self': "현재창",
	'@insertlink.class.name': "tx-link"
});

Trex.Tool.Link = Trex.Class.create({
	$const: {
		__Identity: 'link'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
			var _tool = this; 
			var _canvas = this.canvas;

			var _toolHandler = function(data) {
				if (_canvas.isWYSIWYG()) {
					if (data) {
						_canvas.execute(function(processor) {
							var _attributes = {
								'href': data.link,
								'target': data.target ? data.target : '_blank',
								'className': data.className
							};
                            var _aNode, _nodes;
							if(processor.findNode('a')) {
								_aNode = processor.findNode('a');
								$tom.applyAttributes(_aNode, _attributes);
							} else if (processor.hasControl()) {
								_nodes = processor.controls(function() {
									return 'img';
								});
								$tom.wrap(processor.create('a', _attributes), _nodes);
							} else if(processor.isCollapsed()) {
								_aNode = processor.create('a', _attributes);
                                var text = processor.doc.createTextNode(data.link);
                                _aNode.appendChild(text);
								processor.pasteNode(_aNode, _FALSE);
							} else {
								_nodes = processor.inlines(function() {
									return '%text,img,a,%inline';
								});
								_nodes.each(function(node) {
									if ($tom.hasUsefulChildren(node, _TRUE)) {
										if ($tom.kindOf(node, 'a')) {
											$tom.applyAttributes(node, _attributes);
										} else if ($tom.kindOf(node, 'img')) {
											$tom.wrap(processor.create('a', _attributes), [node]);
										} else {
											var _styleValue = $tom.getStyleText(node);
											var _oldNodes = $tom.collectAll(node, 'a');
											_oldNodes.each(function(oldNode){
												$tom.moveChildToParent(oldNode);
												$tom.remove(oldNode);
											});
											var _aNode = processor.create('a', _attributes);
											$tom.setStyleText(_aNode, _styleValue);
											$tom.replace(node, _aNode);
										}	
									} else {
										$tom.remove(node);
									}
								});
							}
						});
					} else {
						_canvas.execute(function(processor) {
							var _node = processor.findNode('a');
							if (_node) {
								processor.unwrap(_node);
							}
						});
					}
				}else{
					_canvas.execute(function(processor) {
						processor.insertTag('<a href="' + data.link + '" target="' +data.target+ '" >','</a>');
					});	
				}	
			};
			
			var __DefaultValue = "";
			var _initHandler = function() {
				if (_canvas.isWYSIWYG()) {
					return _canvas.query(function(processor){
						var node, value, target, text;
						node = processor.findNode('a');
						if (node) {
							value = $tom.getAttribute(node, "href");
							if (value) {
								target = $tom.getAttribute(node, "target");
								return {
									exist: _TRUE,
									value: value,
									target: target
								};
							}
						} else {
							text = processor.getText();
							if (/^\w+\:\/\/\S+/.test(text)) { // only for url with protocol. 
								return {
									exist: _FALSE,
									value: text
								}
							}
						}
						return {
							exist: _FALSE,
							value: __DefaultValue
						};
					});
				}else{
					return {
						exist: _FALSE,
						value: __DefaultValue
					};
				}
			};

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				new Trex.Menu.Link(this.menuCfg),
				/* handler */
				_toolHandler,
				/* handler for menu initial value */
				_initHandler
			);

			var _popdownHandler = function(ev) {
				_tool.button.onMouseDown(ev);
			};
			this.bindKeyboard({ // ctrl + k - 링크
				ctrlKey: _TRUE,
				keyCode: 75
			}, _popdownHandler);
		}
	
});

/* Trex.Menu.Link ************************************************************************************/
Trex.MarkupTemplate.add(
	'menu.insertlink', [
		'<div class="tx-menu-inner">',
		'    <dl>',
		'        <dt>',
		'            @insertlink.title',
		'        </dt>',
		'        <dd>',
		'            <input type="text" class="tx-text-input"/>',
		'        </dd>',
		'        <dd class="tx-rp">',
		'            <span class="tx-text tx-first">@insertlink.onclick.target</span>',
		'            <span><input type="radio" name="tx-insertlink-win" value="_blank"/><span class="tx-text">@insertlink.target.blank</span></span>',
		'            <span><input type="radio" name="tx-insertlink-win" value="_top"/><span class="tx-text">@insertlink.target.self</span></span>',
		'        </dd>',
		'        <dd class="tx-hr">',
		'            <hr/>',
		'        </dd>',
		'        <dd>',
		'            <img width="32" height="21" src="@insertlink.confirm.image"/>',
		'            <img width="32" height="21" src="@insertlink.cancel.image"/>',
		'            <img width="51" height="21" src="@insertlink.remove.image" style="display: none;"/>',
		'        </dd>',
		'    </dl>',
		'</div>'
	].join("")
);
Trex.Menu.Link = Trex.Class.create({
	$extend: Trex.Menu,
	ongenerated: function() {
		var _elMenu = this.elMenu;
		Trex.MarkupTemplate.get('menu.insertlink').evaluateToDom({}, _elMenu);
		
		var _elTargets = $tom.collectAll(_elMenu, ".tx-rp input");
		var _newInput = this.newInput = _elTargets[0];
		$tx.observe(_newInput, "click", function(){
				_newInput.checked = "checked";
				_currInput.checked = "";
		});
		var _currInput = this.currInput = _elTargets[1];
		$tx.observe(_currInput, "click", function(){
				_currInput.checked = "checked";
				_newInput.checked = "";
		});
			
		var _checkValidation = this.urlValidator;
		var _elInput = this.elInput = $tom.collect(_elMenu, 'input.tx-text-input');
		$tx.observe(_elInput, "keydown", function(ev) {
			if(ev.keyCode == 13) { //Enter
				var _val = _checkValidation(_elInput.value);
				if (!_val) {
					alert( TXMSG("@insertlink.invalid.url") );
					$tx.stop(ev);
					return;
				}
				var _target = _newInput.checked ? _newInput.value : _currInput.value;
				this.onSelect(ev, {
					link: _val,
					target: _target,
					className: TXMSG("@insertlink.class.name")
				});
				$tx.stop(ev);
			}
		}.bindAsEventListener(this));
		
		var _elImgs = $tom.collectAll(_elMenu, 'img');
		$tx.observe(_elImgs[0], "click", function(ev) {
			var _val = _checkValidation(_elInput.value);
			if (!_val) {
				alert( TXMSG("@insertlink.invalid.url") );
				$tx.stop(ev);
				return;
			}
			var _target = _newInput.checked ? _newInput.value : _currInput.value;
			this.onSelect(ev, {
					link: _val,
					target: _target,
					className: TXMSG("@insertlink.class.name")
				});
			$tx.stop(ev);
		}.bind(this));
		
		$tx.observe(_elImgs[1], "click", function() {
			this.onCancel();
		}.bindAsEventListener(this));

		var _elRemoveBtn = $tx(_elImgs[2]);
		$tx.observe(_elRemoveBtn, "click", function(ev) {
			this.onSelect(ev, _NULL);
		}.bindAsEventListener(this));
		this.toggleRemoveBtn = function(exist) {
			_elRemoveBtn.style.display = ((exist)? '': 'none');
		};
	},
	onregenerated: function() {
		var _elInput = this.elInput;
		var _initData = this.initHandler();
		_elInput.value = _initData.value;
		if(_initData.target == "_self" || _initData.target == "_top"){
			this.currInput.checked = "checked";
			this.newInput.checked = "";
		}else{
			this.newInput.checked = "checked";
			this.currInput.checked = "";
		}
		
		this.toggleRemoveBtn(_initData.exist);
		_elInput.focus();
		
		// Set focus to end of input box. ( For IE );
		if ($tx.msie_nonstd) {
			setTimeout(function() {
				try {
					_elInput.focus();
					var _sel = _DOC.selection.createRange();
					_sel.move("character", _elInput.value.length);
					_sel.select();
				}
				catch (ignore) {}
			}, 100);
		}
	},
    urlValidator: function(value) {
        if (!value) {
            return _FALSE;
        }
        value = value.trim();
        if (value.length == 0) {
            return _FALSE;
        }
        var pattern = /^[a-z0-9+.-]+:|^\/\//i;// FTDUEDTR-1330 && MAILCS-24754
        if ( pattern.test(value) ) {
            return value;
        } else {
            return "http://" + value;
        }
    }
});

