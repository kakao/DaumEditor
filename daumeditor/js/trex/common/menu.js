/**
 * @fileoverview
 * 에디터에서 사용되는 menu의 모음
 */

TrexMessage.addMsg({
	'@menu.pallete.enter': "입력",
	'@menu.pallete.more': "더보기"
});
/**
 * 일반적인 동작의 메뉴 객체로, 특화된 메뉴는 이 클래스를 상속받아 사용한다.<br/>
 * 해당 엘리먼트는 미리 DOM에 있어야 한다.
 * tool에서 사용된다.
 * 
 * @class
 * @param {Object} config
 * 
 * @example
 *	Trex.Menu.Example = Trex.Class.create({
 *		$extend: Trex.Menu,
 *		ongenerated: function(config) {
 *			//TODO
 *		},
 *		onregenerated: function(config) {
 *			//TODO
 *		}
 * });
 * 
 *	new Trex.Menu({
 *		id: 'tx_example_menu',
 *		options: [
 *			{ label: '옵션1', title: '옵션1', data: 'option1' },
 *			{ label: '옵션2', title: '옵션1', data: 'option2' }
 *		]
 *	});
 */
Trex.Menu = Trex.Class.create(/** @lends Trex.Menu.prototype */{
    $mixins: [Trex.I.JobObservable],
	isInit: _FALSE,
	isDisplayed: _FALSE,
	_command: function(){},
	/**
	 * menu에 command를 설정한다.
	 * @private
	 * @function
	 */
	setCommand: function(cmd){
		this._command = cmd;
	},
	initialize: function(config) {
		var _config = this.config = config;
		
		var _elMenu;
		if(_config.el) {
			_elMenu = _config.el;
			if(!_elMenu) {
				throw new Error("[Exception]Trex.Menu : not exist element(" + _config.el + ")");
			}
		} else {
			var _elementId = _config.id;
			var _initializedId = ((_config.initializedId)? _config.initializedId: "");
			if (!_elementId) {
				if (!_config.identity) {
					throw new Error("[Exception]Trex.Menu : not exist config - id");
				}
				_elementId = "tx_" + _config.identity + "_menu";
			}
			_elMenu = $tx(_elementId + _initializedId);
			if(!_elMenu) {
				throw new Error("[Exception]Trex.Menu : not exist element(" + _elementId + ")");
			}
		}
		this.elMenu = _elMenu;
		
		if(_config.top){
			_elMenu.style.top = _config.top + 'px';
		}
		if(_config.left){
			_elMenu.style.left = _config.left + 'px';
		}

		if(this.oninitialized) {
			this.oninitialized.bind(this)(config);
		}
		if (this.ongenerated) {
			this.generateHandler = this.ongenerated.bind(this);
		}
		if (this.onregenerated) {
			this.regenerateHandler = this.onregenerated.bind(this);
		}
	},
	/**
	 * menu를 DOM을 생성한다.
	 * @function
	 */
	generate: function(initValue) {
		if (this.generateHandler) {
			var _config = this.config;
			this.generateHandler(_config, initValue);
		}
	},
	/**
	 * menu를 재생성한다.
	 * @function
	 */
	regenerate: function(initValue) {
		if (this.initHandler) {
			this.initHandler();
		}
		if (this.regenerateHandler) {
			var _config = this.config;
			this.regenerateHandler(_config, initValue);
		}
	},
    /**
	 * menu option 중에서 유효한 값만 걸러낸다.
	 * @function
	 */
	getValidOptions: function(config) {
        return config.options.findAll(function(option) {
            return !option.expired;
        });
	},
	/**
	 * menu 에서 선택된 항목에 대한 command를 실행한다.
	 * @function
	 */
	onSelect: function() {
		var args = $A(arguments);
		var ev = args.shift();
		this._command.apply(this, args); //가변적인 arguments를 위해
		this.hide();
		$tx.stop(ev);
	},
	/**
	 * menu 에서 취소를 누르면 menu 를 닫는다.
	 * @function
	 */
	onCancel: function() {
		if(this.cancelHandler) {
			this.cancelHandler();
		}
		this.hide();
	},
	/**
	 * menu 가 열린 상태인지 확인한다.
	 * @function
	 * @return {boolean} 열려있으면 true, 아니면 false
	 */
	visible: function() {
		return this.isDisplayed;
	},
	/**
	 * menu 를 연다. this.generate() 또는 this.regenerate() function을 호출한다.
	 * @function
	 */
	show: function(initValue) {
		$tx.show(this.elMenu);
		if(this.isInit) {
			this.regenerate(initValue);
		} else {
			if(!!this.config.listseturl) {
				this.lazyGenerate(initValue);
			} else {
				this.generate(initValue);
				this.isInit = _TRUE;
				this.regenerate(initValue);
			}
		}
		if(this.showSpecial) { //NOTE: 메뉴가 보여질 때 추가적으로 실행할 액션, ex) URL넣기에서 focus를 줄 때
			this.showSpecial();
		}
		this.isDisplayed = _TRUE;
        this.fireJobs(Trex.Ev.__MENU_LAYER_SHOW, {
            detail: {
                menu: this
            }
        });
	},
	lazyGenerate: function(initValue) {
		var _menu = this;
		new (Trex.Class.create({
			$mixins: [Trex.I.JSRequester],
			initialize: function() {
				this.importScript(
					_menu.config.listseturl,
					'utf-8',
					_DOC,
					function() {
						_menu.generate();
						_menu.isInit = _TRUE;
						_menu.regenerate(initValue);
					}
				);
			}
		}))();
	},
	/**
	 * menu 를 닫는다.
	 * @function
	 */
	hide: function() {
		$tx.hide(this.elMenu);
		this.isDisplayed = _FALSE;
        this.fireJobs(Trex.Ev.__MENU_LAYER_HIDE, {
            detail: {
                menu: this
            }
        });
	},
	/**
	 * menu 를 열거나 닫는다.
	 * @function
	 */
	toggle: function() {
		if( this.isDisplayed ){
			this.hide();
		}else{
			this.show();
		}
	},
	/**
	 * menu 를 닫는다.
	 * @function
	 */
	release: function(ev) {
		if(!this.isInit) {
			return;
		}
		this.hide(ev);
	}
});

Trex.MarkupTemplate.add(
	'menu.select', 
	'<ul class="tx-menu-list" unselectable="on">#{items}</ul>'
);
Trex.MarkupTemplate.add(
	'menu.select.item',
	'<li class="tx-menu-list-item"><a class="#{klass}" href="javascript:;" unselectable="on">#{label}</a></li>'
);

/**
 * Trex.Menu.Select
 * as fontfamily, fontsize
 * 
 * @extends Trex.Menu
 * @class
 * @param {Object} config
 */
Trex.Menu.Select = Trex.Class.create(/** @lends Trex.Menu.Select.prototype */{
	/** @ignore */
	$extend: Trex.Menu,
	/**
	 * menu를 생성한다.
	 * @function
	 */
	generate: function() {
		/*
			[{
				label: "string",
				title: "string",
				data: "string",
				klass: "string"
			}]
		*/
		var _config = this.config;
		var _optionz = this.getValidOptions(_config);

		var _elList = this.generateList(_optionz);
		$tom.insertFirst(this.elMenu, _elList);

        if (this.generateHandler) {
			this.generateHandler(_config);
		}
		if (this.ongeneratedList) {
			this.generateList = this.ongeneratedList.bind(this);
		}
		if (this.ongeneratedListItem) {
			this.generateListItem = this.ongeneratedListItem.bind(this);
		}
	},

	/**
	 * menu 의 list markup 을 만들고 event handler 를 연결한다.
	 * @function
	 */
	generateList: function(optionz) {
		var _elGroup = Trex.MarkupTemplate.get("menu.select").evaluateAsDom({
			'items': this.generateListItem(optionz)
		});
		
		var _elItemList = $tom.collectAll(_elGroup, "li a");
		for (var i=0; i < optionz.length; i++) {
			var _option = optionz[i];
			var _elItem = _elItemList[i];
			$tx.observe(_elItem, "click", this.onSelect.bindAsEventListener(this, _option.data, _option.title));
		}
		return _elGroup;
	},
	/**
	 * menu 의 list item markup 생성한다.
	 * @function
	 * @return {String} HTML markup
	 */
	generateListItem: function(option) {
		var result = [];
		for(var i=0; i < option.length; i++) {
			result.push(Trex.MarkupTemplate.get("menu.select.item").evaluate(option[i]));	
		}
		return result.join("");
	},
	/**
	 * menu 의 list item 이 선택되었을 때 command 를 실행한다.
	 * @function
	 */
	onSelect: function() {
		var _args = $A(arguments);
		var _ev = _args.shift();
		this._command.apply(this, _args); 
		this.hide();
		$tx.stop(_ev);
	}
});

Trex.MarkupTemplate.add(
	'menu.items', [
		'<table unselectable="on"><tbody>',
		'	#{for:row}<tr>',
		'		#{for:col}<td class="tx-menu-list-item">',
		'<a href="javascript:;"><span class="#{klass}">',
		'#{if:image!=""}<img src="#{image}" data="#{data}"/>#{/if:image}',
		'#{if:image=""}#{data}#{/if:image}',
		'</span></a>',
		'		</td>#{/for:col}',
		'	</tr>#{/for:row}',
		'</tbody></table>'
	].join("")
);

Trex.MarkupTemplate.add(
	'menu.list', [
		'<div class="tx-menu-inner">',
		'	<div class="tx-menu-list">',
		'   	#{items}',
		'    </div>',
		'</div>'
	].join("")
);

/**
 * Trex.Menu.List
 * as horizontalrule, lineheight, quote, textbox
 * 
 * @extends Trex.Menu
 * @class
 * @param {Object} config
 */
Trex.Menu.List = Trex.Class.create(/** @lends Trex.Menu.List.prototype */{
	/** @ignore */
	$extend: Trex.Menu,
	/**
	 * menu를 생성한다.
	 * @function
	 */
	generate: function() {
		var _config = this.config;
		/*
			[{
				data: "string",
				klass: "string"
			}]
		*/
		var _optionz = this.getValidOptions(_config);
		this.cols = _config.cols || 1;
		this.rows = _config.rows || _optionz.length;

		var _elList = this.generateList(_optionz);
		$tom.insertFirst(this.elMenu, _elList);

        if (this.ongeneratedList) {
			this.generateList = this.ongeneratedList.bind(this);
		}
		if (this.ongeneratedListItem) {
			this.generateListItem = this.ongeneratedListItem.bind(this);
		}
		
		if (this.generateHandler) {
			this.generateHandler(_config);
		}
	},
	/**
	 * menu 의 list markup 을 만들고 mouse event handler 를 연결한다.
	 * @function
	 */
	generateList: function(options) {
		var _options = Trex.MarkupTemplate.splitList(this.rows, this.cols, options);
		var _elList = Trex.MarkupTemplate.get('menu.list').evaluateAsDom({
			'items': Trex.MarkupTemplate.get('menu.items').evaluate(_options)
		});
		
		$tx.observe(_elList, "click", this.onSelect.bindAsEventListener(this));
		$tx.observe(_elList, 'mouseover', this.onItemMouseOver.bindAsEventListener(this));
		$tx.observe(_elList, 'mouseout', this.onItemMouseOut.bindAsEventListener(this));
		
		return _elList;
	},
	/**
	 * menu 항목에 mouse over 할 때 hover state 의 style class 를 적용한다.
	 * @function
	 */
	onItemMouseOver: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			$tx.addClassName(_el, "tx-item-hovered");
		}
		$tx.stop(ev);
	},
	/**
	 * menu 항목에 mouse out 할 때 hover state 의 style class 를 해제한다.
	 * @function
	 */
	onItemMouseOut: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			$tx.removeClassName(_el, "tx-item-hovered");
		}
		$tx.stop(ev);
	},
	/**
	 * menu 의 항목이 선택되었을 때 command 를 실행한다. 
	 * @function
	 */
	onSelect: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			var _data;
			if(_el.firstChild && _el.firstChild.nodeType == 1 && _el.firstChild.tagName.toLowerCase() == 'img') {
				_data = $tom.getAttribute(_el.firstChild, "data") || "";
			} else {
				_data = _el.innerText;	
			}
			this._command(_data);
			this.hide();
		}
		$tx.stop(ev);
	}
});

Trex.MarkupTemplate.add(
	'menu.matrix', [
		'<div class="tx-menu-inner">',
		'	<ul class="tx-menu-matrix-title">',
		'		#{for:matrices}<li class=""><a href="javascript:;" class="tx-menu-matrix-title-item">#{title}</a></li>#{/for:matrices}',
		'	</ul>',
		'	<div class="tx-menu-matrix-listset">',
		'   	#{for:matrices}<div class="tx-menu-matrix-list #{klass}">',
		'       	#{items}',
		'		</div>#{/for:matrices}',
		'    </div>',
		'</div>'
	].join("")
);

/**
 * Trex.Menu.Matrix
 * as emoticon
 * 
 * @extends Trex.Menu
 * @class
 * @param {Object} config
 */
Trex.Menu.Matrix = Trex.Class.create(/** @lends Trex.Menu.Matrix.prototype */{
	/** @ignore */
	$extend: Trex.Menu,
	/**
	 * menu를 생성한다.
	 * @function
	 */
	generate: function() {
		var _config = this.config;
		/*
			rows: number,
			cols: number,
			matrices: [{
				title: "string",
				options: ["string", ...]
			}]

		*/
		var _matrices = this.matrices = _config.matrices.findAll(function(matrix) {
			return !matrix.onlyIE || $tx.msie;
		});
		this.cols = _config.cols || 10;
		this.rows = _config.rows || 5;

		var _elList = this.generateMatrix(_matrices);
		$tom.insertFirst(this.elMenu, _elList);

		if (this.ongeneratedList) {
			this.generateList = this.ongeneratedList.bind(this);
		}
		if (this.ongeneratedListItem) {
			this.generateListItem = this.ongeneratedListItem.bind(this);
		}
			
		if (this.generateHandler) {
			this.generateHandler(_config);
		}

		this.showTab();
	},
	/**
	 * menu를 재생성한다.
	 * @function
	 */
	regenerate: function() {
		this.showTab();
		if (this.regenerateHandler) {
			var _config = this.config;
			this.regenerateHandler(_config);
		}
	},
	/**
	 * menu를 열 때 디폴트 Tab 혹은 최근에 열었던 Tab 을 보여준다. 
	 * @function
	 */
	showTab: function() {
		var listItemToShow = this.lastElList;
		var titleItemToShow = this.lastElTitleItem;
		
		var isFirstTime = (!listItemToShow || !titleItemToShow);
		if (isFirstTime) {
			listItemToShow = this.defaultElListItem;
			titleItemToShow = this.defaultElTitleItem;
		}
		
		this.onTitleClick(_NULL, titleItemToShow, listItemToShow);
	},

	/**
	 * 격자무늬 형태의 menu 항목을 생성하고 mouse event handler 를 연결한다.
	 * @function
	 */
	generateMatrix: function(matrices) {
		var _menu = this;

		var _cols = this.cols;
		var _rows = this.rows;
		matrices.each(function(matrix) {
			var _options = Trex.MarkupTemplate.splitList(_rows, _cols, matrix.options);
			matrix['items'] = Trex.MarkupTemplate.get('menu.items').evaluate(_options);
		});
		
		var _elInner = Trex.MarkupTemplate.get('menu.matrix').evaluateAsDom({
			'matrices': matrices
		});

		var _elLists = $tom.collectAll(_elInner, 'div.tx-menu-matrix-listset div.tx-menu-matrix-list');
		var _elTitles = $tom.collectAll(_elInner, 'ul.tx-menu-matrix-title li');
		
		var defaultIndex = function() {
			for (var i = 0, length = matrices.length; i < length; i++) {
				if (matrices[i].defaultshow) {
					return i;
				}
			}
			return 0;
		}();
		this.defaultElListItem = _elLists[defaultIndex];
		this.defaultElTitleItem = _elTitles[defaultIndex];
		
        for (var i = 0; i < matrices.length; i++) {
            var _elList = _elLists[i];
            $tx.observe(_elList, "click", _menu.onSelect.bindAsEventListener(_menu));
            $tx.observe(_elList, 'mouseover', _menu.onItemMouseOver.bindAsEventListener(_menu));
            $tx.observe(_elList, 'mouseout', _menu.onItemMouseOut.bindAsEventListener(_menu));

            var _elTitle = _elTitles[i];
            $tx.observe(_elTitle, "click", _menu.onTitleClick.bindAsEventListener(_menu, _elTitle, _elList));
        }
		return _elInner;
	},
	/**
	 * menu 의 group title tab 에 대한 event handler를 연결한다.
	 * @function
	 */
	onTitleClick: function(ev, elTitleItem, elList) {
		if (this.lastElList != elList) {
			$tx.show(elList);
			if (this.lastElList) {
				$tx.hide(this.lastElList);
			}
			this.lastElList = elList;

			if (this.lastElTitleItem) {
				$tx.removeClassName(this.lastElTitleItem, 'tx-selected');
			}
			$tx.addClassName(elTitleItem, 'tx-selected');
			this.lastElTitleItem = elTitleItem;
		}
		if (ev) {
			$tx.stop(ev);
		}
	},
	/**
	 * menu 항목에 mouse over 하면 hovered state css class 를 적용한다.
	 * @function
	 */
	onItemMouseOver: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			$tx.addClassName(_el,"tx-item-hovered");
		}
		$tx.stop(ev);
	},
	/**
	 * menu 항목에 mouse out 하면 hovered state css class 를 해제한다.
	 * @function
	 */
	onItemMouseOut: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			$tx.removeClassName(_el, "tx-item-hovered");
		}
		$tx.stop(ev);
	},
	/**
	 * menu 의 list item 이 선택되었을 때 command 를 실행한다.
	 * @function
	 */
	onSelect: function(ev) {
		var _el = $tx.findElement(ev, 'span');
		if (_el.tagName && _el.tagName.toLowerCase() == 'span') {
			this._command(_el.innerText);
			this.hide();
		}
		$tx.stop(ev);
	}
});

Trex.MarkupTemplate.add(
	'menu.colorPallete', [
		'<div class="tx-menu-inner">',
		'<ul class="tx-pallete-text-list"></ul>',
		'<ul class="tx-pallete-thumb-list"></ul>',
		'<p class="tx-pallete-input"><span style="background-color: rgb(7, 3, 3);"></span><input type="text" class="tx-color-value"/><a class="tx-enter">@menu.pallete.enter</a></p>',
		'<div class="tx-pallete-buttons">',
		'	<p class="tx-pallete-more"><a class="tx-more-down" href="javascript:;">@menu.pallete.more</a></p>',
		'</div>',
		'<div class="tx-pallete-picker">',
		'	<div class="tx-pallete-pickerbox">',
		'		<div class="tx-chromabar" style="background-color: rgb(255, 0, 0);"></div><div class="tx-huebar"></div>',
		'	</div>',
		'</div>',
		'</div>'
	].join("")
);

/**
 * Trex.Menu.ColorPallete
 * 
 * @extends Trex.Menu
 * @class
 * @param {Object} config
 */
Trex.Menu.ColorPallete = Trex.Class.create(/** @lends Trex.Menu.ColorPallete.prototype */{
	/** @ignore */
	$extend: Trex.Menu,
	/** @ignore */
	$mixins: [
		Trex.I.ColorPallete
	],
	/**
	 * menu를 생성한다.
	 * @function
	 */
	generate: function() {
		var _config = this.config;
		
		var _elMenu = this.elMenu;
		Trex.MarkupTemplate.get("menu.colorPallete").evaluateToDom({}, _elMenu);
		
		var _transCfg = _config.thumbs.transparent;
		_config.thumbs.transparent = Object.extend(_config.thumbs.transparent, {
			image: TrexConfig.getIconPath(_transCfg.image),
			thumb: TrexConfig.getIconPath(_transCfg.thumb),
			thumbImage:  TrexConfig.getIconPath(_transCfg.thumbImage)
		});
		
		if(!this.hookEvent) {
			throw new Error("[Exception]Trex.Menu.ColorPallete : not implement function(hookEvent)");
		}
		this.hookEvent(_config);

		if (this.generateHandler) {
			this.generateHandler(_config);
		}

        this.bindEvents();
	},
	/**
	 * menu 의 list item(color) 이 선택되었을 때 command 를 실행한다.
	 * @function
	 */
	onSelect: function() {
		var _args = $A(arguments);
		var _ev = _args.shift();
		this._command.apply(this, _args);
		this.remainColor(_args);
		this.hide();
		$tx.stop(_ev);
	},
	/**
	 * menu 의 list item(color) 이 선택되었을 때 선택 한 color value 를 input box에 남긴다.
	 * this.onSelect function 에서 호출한다.
	 * @function
	 */
	remainColor: function(color) {
		if(color) {
			this.setColorValueAtInputbox(color);	
		}
	},
    bindEvents: function() {
        var self = this;
        $tx.observe(this.elMore, 'click', function(ev){
            self.fireJobs(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, {
                detail: {
                    menu: self
                }
            });
        });
    }
});
