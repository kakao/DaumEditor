/**
 * @fileoverview 
 * 직접 편집이 가능한 기능을 포함한 Tool '글상자' Source,
 * Class Trex.Tool.RichTextBox 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"richtextbox",
	{
		sync: _FALSE,
		status: _TRUE,
		rows: 4,
		cols: 6,
		borderwidth: 1,
		bordercolor: '#cbcbcb',
		bgcolor: '#ffffff',
		padding: "10px",
		styles: [ 
			{	klass: "", image: "#iconpath/textbox/thum_line01.gif?v=2", data: "solid" },
			{	klass: "", image: "#iconpath/textbox/thum_line02.gif?v=2", data: "double" },
			{	klass: "", image: "#iconpath/textbox/thum_line03.gif?v=2", data: "dashed" },
			{	klass: "", image: "#iconpath/textbox/thum_line04.gif?v=2", data: "none" }
		],
		options: Trex.__CONFIG_COMMON.textbox.options,
		thumbs: Trex.__CONFIG_COMMON.thumbs
	}
);

TrexMessage.addMsg({
	'@richtextbox.add': "더하기",
	'@richtextbox.sub': "빼기",
	'@richtextbox.alert': "1 이상 20 이하의 숫자만 입력 가능합니다.",
	'@richtextbox.bg.color': "배경색",
	'@richtextbox.border.color': "선 색",
	'@richtextbox.border.style': "선 스타일",
	'@richtextbox.border.width': "선 굵기"
});

Trex.Tool.RichTextBox = Trex.Class.create({
	$const: {
		__Identity: 'richtextbox'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
		var _canvas = this.canvas;
		var _toolbar = this.toolbar;
		var _tool = this;
		
		var _toolHandler = this.handler = function() {
			var _this = _tool.menu; 
			var _style = {
				"borderStyle": _this.elPreview.style.borderStyle,
				"borderWidth": _this.elPreview.style.borderWidth,
				"borderColor": _this.elPreview.style.borderColor,
				"backgroundColor": _this.elPreview.style.backgroundColor,
				"padding": _this.padding
			};
            var _tag = "div";
            var _attributes = { "className": 'txc-textbox', style: _style };
            _canvas.execute(function(processor) {
                var _nodes = processor.blocks(function() {
                    return '%wrapper,%paragraph';
                });
                var _bNode;
                _nodes = _nodes.findAll(function(node) {
                    if($tom.kindOf(node, "%innergroup")) {
                        _bNode = processor.wrap($tom.children(node), _tag, _attributes);
                        _toolbar.fireJobs('cmd.textbox.added', _bNode);
                        return _FALSE;
                    } else {
                        return _TRUE;
                    }
                });
                _bNode = processor.wrap(_nodes, _tag, _attributes);
                _toolbar.fireJobs('cmd.textbox.added', _bNode);
            });
		};
		
		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			new Trex.Menu.RichTextbox(this.menuCfg),
			/* handler */
			_toolHandler
		);
	}
});
Trex.MarkupTemplate.add(
		'richtextbox.colorpallete',
		['<dd class="#{wrapClass}">',
		'	<div class="tx-color-box">',
		'		<a href="javascript:;" class="tx-color-bg-thumb" style="background-color:#{color}"></a>', //==> _elThumb
		'	</div>',
		'	<a href="javascript:;" class="tx-color-arrow-down"></a>',
		'	<div class="tx-colorpallete" unselectable="on" style="display:none;z-index:15000;"></div>',
		'</dd>'].join("")
	);
Trex.Menu.RichTextbox = Trex.Class.create({
	$extend: Trex.Menu,
	ongenerated: function(config) {
		var _this = this;
		var _styleHashMap = {};
		config.options.each(function(option) {
			_styleHashMap[option.data] = option.style;
		});
		
		this.borderWidth = config.borderWidth || 1;
		this.borderColor = config.borderColor || '#cbcbcb';
		this.bgColor = config.bgColor || '#ffffff';
		this.padding = config.padding;
		
		var _generateBorderStyle = this.generateBorderStyle.bind(this);
		var _generateBorderWidth = this.generateBorderWidth.bind(this);
		var _generateBorderColor = this.generateBorderColor.bind(this);
		var _generateBgColor = this.generateBgColor.bind(this);
		
		var _elMenu = this.elMenu;
		var _elHeader = $tom.collect(_elMenu, 'div.tx-menu-header');
		var _elPreviewArea = $tom.collect(_elHeader, 'div.tx-menu-preview-area');
        this.elPreview = $tom.collect(_elPreviewArea, 'div.tx-menu-preview');
        var _elSwitch = this.elSwitch = $tom.collect(_elHeader, 'div.tx-menu-switch');
		var _elSimple = $tom.collect(_elSwitch, 'div.tx-menu-simple');
		var _elAdvanced = $tom.collect(_elSwitch, 'div.tx-menu-advanced');
		var _elInner = $tom.collect(_elMenu, 'div.tx-menu-inner');
		var _elFooter = $tom.collect(_elMenu, 'div.tx-menu-footer');
		var _elConfirm = $tom.collect(_elFooter, 'img.tx-menu-confirm');
		var _elCancel = $tom.collect(_elFooter, 'img.tx-menu-cancel');
		
		(function create_thumbs_for_simplemode(){
			var _el = _this.simplePalette= tx.div({ className: 'tx-menu-list'});
			_elInner.appendChild(_el);
			var _rows = config.rows;
			var _cols = config.cols;
			_el.innerHTML = Trex.HtmlCreator.createTableMarkup(_rows, _cols, config.options);
			
			$tx.observe(_el, 'click', function(ev){
				var _el = $tx.element(ev);
				TrexEvent.fire(_el, {
					'span': function(){
						var _class;
						if(_el.firstChild && _el.firstChild.nodeType == 1 && _el.firstChild.tagName.toLowerCase() == 'img') {
							_class = _el.firstChild.title;
						} else {
							_class = _el.innerText;	
						}
						var _style = _styleHashMap[_class];
						applyPreviewStyle(_style);
					}
				});	
				$tx.stop(ev);
			});
		})();
		
		(function createElementsInInnerContainerForAdvancedMode(){
			var _el = _this.advancedPalette = tx.div({ className: "tx-advanced-list" });
			_elInner.appendChild(_el);
			_el.appendChild(
				tx.dl({
					style: {
						"height": "24px"
					}
				}, 
				tx.dt(TXMSG("@richtextbox.border.style")), _generateBorderStyle()));
			_el.appendChild(tx.dl(tx.dt(TXMSG("@richtextbox.border.width")), _generateBorderWidth()));
			_el.appendChild(tx.dl(tx.dt(TXMSG("@richtextbox.border.color")), _generateBorderColor()));
			_el.appendChild(tx.dl(tx.dt(TXMSG("@richtextbox.bg.color")), _generateBgColor()));
		})();
		
		var copyStyles = function(){
			_this.borderWidthInput.value = parseInt(_this.elPreview.style.borderWidth);
			_this.borderColorInput.style.backgroundColor = _this.elPreview.style.borderTopColor;
			_this.bgColorInput.style.backgroundColor = _this.elPreview.style.backgroundColor;
		};
		
		var applyPreviewStyle = function (style){
			_this.elPreview.style.border = style['border'];
			_this.elPreview.style.backgroundColor = style['backgroundColor']
		};
		
		var selectMode = function(mode){
			if(mode =="simple"){
				$tx.addClassName(_elSimple, "tx-selected");
				$tx.show(_this.simplePalette);
				$tx.removeClassName(_elAdvanced, "tx-selected");
				$tx.hide(_this.advancedPalette);
			}else if(mode =="advanced"){
				$tx.removeClassName(_elSimple, "tx-selected");
				$tx.hide(_this.simplePalette);
				$tx.addClassName(_elAdvanced, "tx-selected");
				$tx.show(_this.advancedPalette);
				copyStyles();
			}
            _this.fireJobs(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, {
                detail: {
                    menu: _this
                }
            });
		};
		
		(function bindingEvents(){
			$tx.observe(_elSimple, 'click', selectMode.bind(_this, "simple") );
			$tx.observe(_elAdvanced, 'click', selectMode.bind(_this, "advanced") );
			$tx.observe(_elConfirm, 'click', _this.onSelect.bind(_this));
			$tx.observe(_elCancel, 'click', function(){
				_this.onCancel();
			});
		})();
		
		selectMode("simple");
		applyPreviewStyle(_styleHashMap['txc-textbox13']);
	},
	generateBorderStyle: function(){
		var _this = this;
		var _elWrap = tx.dd({ className: 'tx-border-area' });
		$tx.observe(_elWrap, 'click', function(ev) {
			var _el = $tx.element(ev);
			TrexEvent.fire(_el, {
				'img': function(element){
					var _data = element.getAttribute("data");
					_this.elPreview.style.borderStyle = _data;
					if(_data == 'double' && _this.borderWidthInput.value.toNumber() < 3){
						_this.elPreview.style.borderWidth = "3px";
						_this.borderWidthInput.value = "3";
					} 
				}
			});
			$tx.stop(ev);
		});
		_elWrap.innerHTML = Trex.HtmlCreator.createTableMarkup(1, 4, this.config.styles);
		return _elWrap;
	},
	generateBorderWidth: function() {
		var _this = this;
		var _elWrap = tx.dd({ className: 'tx-border-area' });
		var _elInput = this.borderWidthInput = tx.input({ type: 'text', value: this.borderWidth });
		_elWrap.appendChild(_elInput);

		var _drawDeco = function(width) {
			if(width > 20 ) {
				alert(TXMSG("@richtextbox.alert"));
				_elInput.value = 20;
			}else if(width < 1){
				alert(TXMSG("@richtextbox.alert"));
				_elInput.value = 1;
			}else{
				_this.elPreview.style.borderWidth = width + "px";
				_elInput.value = width;	
			}
		};

		$tx.observe(_elInput, 'blur', function(ev) {
			_drawDeco(_elInput.value.toNumber(), ev);
		});
		$tx.observe( _elInput, "keydown", function(ev){
			if( ev.keyCode == $tx.KEY_RETURN )
				$tx.stop(ev);
		});
		var _elAddBtn = tx.a({ href:'javascript:;', className: 'btn_add' }, TXMSG("@richtextbox.add"));
		_elWrap.appendChild(_elAddBtn);
		$tx.observe(_elAddBtn, 'click', function(ev) {
			_drawDeco(_elInput.value.toNumber() + 1);
			$tx.stop(ev);
		});

		var _elSubBtn = tx.a({ href:'javascript:;', className: 'btn_sub' }, TXMSG("@richtextbox.sub"));
		_elWrap.appendChild(_elSubBtn);
		$tx.observe(_elSubBtn, 'click', function(ev) {
			_drawDeco(_elInput.value.toNumber() - 1);
			$tx.stop(ev);
		});
		
		return _elWrap;
	},
	generateBorderColor: function() {
		var _this = this;
		var _elWrap = Trex.MarkupTemplate.get("richtextbox.colorpallete").evaluateAsDom({"color": this.borderColor, "wrapClass": "tx-color-wrap"});
		var _elPallete = $tom.collect(_elWrap, "div.tx-colorpallete");
		
		var _changeBorderColor = function(color) {
			_this.elPreview.style.borderColor = _elThumb.style.backgroundColor = _this.borderColor = color;
		};
		
		var _colorPallete = _NULL;
		var _toggleColorPallete = function() {
			if (_colorPallete == _NULL) {
				_colorPallete = _this.createColorPallete(_elPallete, _changeBorderColor);
				_colorPallete.show();
			} else {
				if (!$tx.visible(_elPallete)) _colorPallete.show();
				else _colorPallete.hide();
			}
		};
		
		this.externalBorderColorToggler = function(){
			if ($tx.visible(_elPallete)) {
				_colorPallete.hide();
			}
		};
		
		var _elThumb = this.borderColorInput = $tom.collect(_elWrap, ".tx-color-box a");
		$tx.observe(_elThumb, 'click', function(ev) {
			_this.externalBgColorToggler();
			_toggleColorPallete();
			$tx.stop(ev);
		});

		var _elArrow = $tom.collect(_elWrap, "a.tx-color-arrow-down");
		$tx.observe(_elArrow, 'click', function(ev) {
			_this.externalBgColorToggler();
			_toggleColorPallete();
			$tx.stop(ev);
		});

		return _elWrap;
	},
	createColorPallete: function(element, cmd) {
        var self = this;
		var pallete = new Trex.Menu.ColorPallete({el: element, thumbs: this.config.thumbs});
		pallete.setCommand(cmd);
        pallete.observeJob(Trex.Ev.__MENU_LAYER_SHOW, function(ev){
            self.fireJobs(Trex.Ev.__MENU_LAYER_SHOW, ev);
        });
        pallete.observeJob(Trex.Ev.__MENU_LAYER_HIDE, function(ev){
            self.fireJobs(Trex.Ev.__MENU_LAYER_HIDE, ev);
        });
        pallete.observeJob(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, function(ev){
            self.fireJobs(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, ev);
        });
		return pallete;
	},
	generateBgColor: function() {
		var _this = this;
		var _elWrap = Trex.MarkupTemplate.get("richtextbox.colorpallete").evaluateAsDom({"color":this.bgColor});
		var _elPallete = $tom.collect(_elWrap, "div.tx-colorpallete");
		
		var _changeBgColor = function(color) {
			_this.elPreview.style.backgroundColor = _elThumb.style.backgroundColor = _this.bgColor = color;
		};
		
		var _colorPallete = _NULL;
		var _toggleColorPallete = function() {
			if (_colorPallete == _NULL) {
				_colorPallete = _this.createColorPallete(_elPallete, _changeBgColor);
				_colorPallete.show();
			} else {
				if (!$tx.visible(_elPallete)) _colorPallete.show();
				else _colorPallete.hide();
			}
		};
		
		this.externalBgColorToggler = function(){
			if ($tx.visible(_elPallete)) {
				_colorPallete.hide();
			}
		};
		
		var _elThumb = this.bgColorInput = $tom.collect(_elWrap, ".tx-color-box a");			
		$tx.observe(_elThumb, 'click', function(ev) {
			_this.externalBorderColorToggler();
			_toggleColorPallete();
			$tx.stop(ev);
		});
		
		var _elArrow = $tom.collect(_elWrap, "a.tx-color-arrow-down");
		$tx.observe(_elArrow, 'click', function(ev) {
			_this.externalBorderColorToggler();
			_toggleColorPallete();
			$tx.stop(ev);
		});

		return _elWrap;
	}
});