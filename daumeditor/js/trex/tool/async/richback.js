/**
 * @fileoverview 
 *  배경 Tool '배경' Source,
 *  Class Trex.Tool.Back configuration 을 포함 하고있다.    
 * 
 */

(function() {
	var _DOC = document,
	_WIN = window,
	_DOC_EL = _DOC.documentElement,
	_FALSE = false,
	_TRUE = true,
	_NULL = null,
	_UNDEFINED;
	
	var _backConfig = {};
	var _Layer = {
		created: _FALSE,
		__OPTIONS: {
			'back': {
				style: {
					"position": "absolute", "width": "100%", "height": "400px", "top":"0", "left":"0", "zIndex":"-100", "overflow":"hidden"
				}
			},
			'wrapper': {id:"tx_background_wrapper", style: {"marginTop": "0"}},
			'cell1': {style: {"float": "left", "backgroundRepeat": "no-repeat", "fontSize":"0"}},
			'cell2': {style: {"float": "right", "backgroundRepeat": "no-repeat", "fontSize":"0"}},
			'cell3': {style: {"backgroundRepeat": "repeat-x", "margin": "0 15px", "fontSize":"0"}},
			'cell4': {style: {"float": "left", "backgroundRepeat": "repeat-y"}},
			'cell5': {style: {"float": "right", "backgroundRepeat": "repeat-y"}},
			'cell6': {style: {"backgroundRepeat": "repeat"}},
			'cell7': {style: {"float": "left", "backgroundRepeat": "no-repeat", "fontSize":"0"}},
			'cell8': {style: {"float": "right", "backgroundRepeat": "no-repeat", "fontSize":"0"}},
			'cell9': {style: {"backgroundRepeat": "repeat-x", "margin": "0 15px", "fontSize":"0"}}
		},
		create: function(canvas) {
			var _layerOptions = this.__OPTIONS;
			
			if ($tx.msie6) {
				// IE6 has 3px jog bug
				_layerOptions['cell4'].style["marginRight"] = "-3px";
				_layerOptions['cell5'].style["marginLeft"] = "-3px";
				_layerOptions['cell6'].style["margin"] = "0 3px";
			}
			
			//elements create
			var _elements = {
				back : tx.div(_layerOptions['back']),
				wrapper : tx.div(_layerOptions['wrapper']),
				cell1 : tx.div(_layerOptions['cell1']),
				cell2 : tx.div(_layerOptions['cell2']),
				cell3 : tx.div(_layerOptions['cell3']),
				
				cell4 : tx.div(_layerOptions['cell4']),
				cell5 : tx.div(_layerOptions['cell5']),
				cell6 : tx.div(_layerOptions['cell6']),
				
				cell7 : tx.div(_layerOptions['cell7']),
				cell8 : tx.div(_layerOptions['cell8']),
				cell9 : tx.div(_layerOptions['cell9'])
			};
			
			_elements['back'].appendChild(_elements['wrapper']);
			
			_elements['wrapper'].appendChild(tx.div(_elements['cell1'], _elements['cell2'], _elements['cell3']));
			_elements['wrapper'].appendChild(tx.div(_elements['cell4'], _elements['cell5'], _elements['cell6']));
			_elements['wrapper'].appendChild(tx.div(_elements['cell7'], _elements['cell8'], _elements['cell9']));
			
			var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
			_wysiwygPanel.el.parentNode.insertBefore(_elements['back'], _wysiwygPanel.el);
			
			this.get = function(name) {
				return _elements[name];
			};
			this.created = _TRUE; 
		},
		update: function(id, styles) {
			var _layerOptions = this.__OPTIONS;
			if (_layerOptions[id]) {
				for (var _name in styles) {
					_layerOptions[id]['style'][_name] = styles[_name];
				}
			}
		},
		get: function() {
			return _NULL;
		}
	}; 
	
	
	
	TrexMessage.addMsg({
		'@back.title': "배경",
		'@back.need.user.image': "사진을 추가 한 후 이용해 주세요.",
		'@back.need.original.size': "전체반복에서는 선택할 수 없습니다.",
		'@back.over.file.size': "첨부할 수 있는 용량(800Kb)을 초과하였습니다.",
		'@back.need.border.width': "먼저 테두리 굵기를 선택해주세요."
	});
	
	Trex.Class.overwrite(Trex.Tool.Back, {
		$const: {
			__Identity: 'back'
		},
		$extend: Trex.Tool,
        oninitialized: function() {
            var _tool = this;
			var _canvas = this.canvas;
			
			var _toolHandler = function(data) {
				if(!data) {
					return;
				}
				
				if(!_Layer.created) {
					_Layer.create(_canvas);
				}
				if(data.topLeftImage && data.topLeftImage != "none") {
					_tool.applySkin(data);
				} else if(data.backgroundImage && data.backgroundImage != "none") {
					_tool.applyUpload(data);
				} else if( (data.backgroundColor && data.backgroundColor != "transparent") || data.borderStyle || data.opacity < 1){ //색상
					_tool.applyColor(data);
				} else{
					_tool.clear();
				}
				_canvas.fireJobs('canvas.apply.background', data);
			};
			
			/* button & menu weave */
			var menu = new Trex.Menu.Back(
				TrexConfig.merge(this.menuCfg, {
					backConfig: _backConfig
				})
			);
			this.resetWeave();
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				menu,
				/* handler */
				_toolHandler
			);
			
			this.forceActivate();
		},
		applySkin: function(data) {
			if(!_Layer.created) {
				return;
			}
			/* IE에서는 셋팅되는 순서에 따라 결과가 다르다. 그러므로 가운데 row를 가장 나중에 셋팅한다. */
			
			// 상단의 왼쪽, 오른쪽, 가운데 셀
			_backConfig = Object.extend({}, data);
			$tx.setStyle( _Layer.get("cell1"), { 
				'width': _backConfig.topLeftWidth, 
				'height': _backConfig.topLeftHeight,
				'backgroundImage': _backConfig.topLeftImage? "url("+_backConfig.topLeftImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell2"), { 
				'width': _backConfig.topRightWidth, 
				'height':_backConfig.topRightHeight,
				'backgroundImage': _backConfig.topRightImage? "url("+_backConfig.topRightImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell3"), { 
				'paddingTop':_backConfig.topCenterHeight,
				'backgroundImage': _backConfig.topCenterImage? "url("+_backConfig.topCenterImage+")": "none"
			});
			
			// 하단의 왼쪽, 오른쪽, 가운데 셀
			$tx.setStyle( _Layer.get("cell7"), { 
				'width': _backConfig.botLeftWidth, 
				'height':_backConfig.botLeftHeight,
				'backgroundImage': _backConfig.botLeftImage? "url("+_backConfig.botLeftImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell8"), { 
				'width': _backConfig.botRightWidth, 
				'height':_backConfig.botRightHeight,
				'backgroundImage': _backConfig.botRightImage? "url("+_backConfig.botRightImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell9"), { 
				'paddingTop':_backConfig.botCenterHeight,
				'backgroundImage': _backConfig.botCenterImage? "url("+_backConfig.botCenterImage+")": "none"
			});
			
			// 중단의 왼쪽, 오른쪽, 가운데 셀
			$tx.setStyle( _Layer.get("cell4"), { 
				'width': _backConfig.midLeftWidth, 
				'backgroundImage': _backConfig.midLeftImage? "url("+_backConfig.midLeftImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell5"), { 
				'width': _backConfig.midRightWidth, 
				'backgroundImage': _backConfig.midRightImage? "url("+_backConfig.midRightImage+")": "none"
			});
			$tx.setStyle( _Layer.get("cell6"), { 
				'backgroundImage': _backConfig.midCenterImage? "url("+_backConfig.midCenterImage+")": "none",
				'backgroundColor':"transparent",
				'backgroundRepeat':"repeat",
				'borderWidth': "0",
				'borderStyle': "solid",
				'borderColor': "",
				'opacity': ""
			});
		},
		applyColor: function(data){
			if(!_Layer.created) {
				return;
			}
			
			_backConfig = Object.extend({}, data);
			
			/* IE에서는 셋팅되는 순서에 따라 결과가 다르다. 그러므로 가운데 row를 가장 나중에 셋팅한다. */
			$tx.setStyle( _Layer.get("cell1"), { 
				'width': 0, 
				'height':0
			});
			$tx.setStyle( _Layer.get("cell2"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell3"), { 
				'paddingTop':0
			});
			
			$tx.setStyle( _Layer.get("cell7"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell8"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell9"), { 
				'paddingTop': 0
			});
			
			$tx.setStyle( _Layer.get("cell4"), { 
				'width': 0
			});
			$tx.setStyle( _Layer.get("cell5"), { 
				'width': 0
			});
			$tx.setStyle( _Layer.get("cell6"), { 
				'backgroundColor': _backConfig.backgroundColor || "transparent",
				'borderColor': _backConfig.borderColor || "transparent",
				'borderWidth': _backConfig.borderWidth || "0",
				'opacity': (_backConfig.opacity + "" != "" && _backConfig.opacity < 1)? _backConfig.opacity: "",
				'borderStyle': "solid",
				'backgroundImage': "none"				// background color를 먹게 하기 위해.image가 있으면 color안 먹음.
			});
		},
		applyUpload: function(data){
			if(!_Layer.created) {
				return;
			}
			
			_backConfig = Object.extend({}, data);	
			
			$tx.setStyle( _Layer.get("cell1"), { 
				'width': 0, 
				'height':0
			});
			$tx.setStyle( _Layer.get("cell2"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell3"), { 
				'paddingTop':0
			});
			
			$tx.setStyle( _Layer.get("cell7"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell8"), { 
				'width': 0, 
				'height': 0
			});
			$tx.setStyle( _Layer.get("cell9"), { 
				'paddingTop': 0
			});
			
			$tx.setStyle( _Layer.get("cell4"), { 
				'width': 0
			});
			$tx.setStyle( _Layer.get("cell5"), { 
				'width': 0
			});
			$tx.setStyle( _Layer.get("cell6"), { 
				'backgroundRepeat': _backConfig.backgroundRepeat || "no-repeat",
				'backgroundPosition': _backConfig.backgroundPosition || "left top",
				'backgroundImage': (_backConfig.backgroundImage)?"url("+ _backConfig.backgroundImage +")":"none",
				'backgroundColor': _backConfig.backgroundColor || "transparent",
				'borderWidth': "0",
				'borderStyle': "solid",
				'borderColor': "",
				'opacity': (_backConfig.opacity + "" != "" && _backConfig.opacity < 1)? _backConfig.opacity: ""
			});
		},
		clear: function(){
			_backConfig = {};
			$tx.setStyle( _Layer.get("cell1"), { 
				'width': 0, 
				'height': 0,
				'backgroundImage': "none"
			});
			$tx.setStyle( _Layer.get("cell2"), { 
				'width': 0, 
				'height': 0,
				'backgroundImage': "none"
			});
			$tx.setStyle( _Layer.get("cell3"), { 
				'paddingTop': 0,
				'backgroundImage': "none" 
			});
			
			// 하단의 왼쪽, 오른쪽, 가운데 셀
			$tx.setStyle( _Layer.get("cell7"), { 
				'width': 0, 
				'height': 0,
				'backgroundImage': "none"
			});
			$tx.setStyle( _Layer.get("cell8"), { 
				'width': 0, 
				'height': 0,
				'backgroundImage': "none"
			});
			$tx.setStyle( _Layer.get("cell9"), { 
				'paddingTop': 0,
				'backgroundImage': "none"
			});
			
			// 중단의 왼쪽, 오른쪽, 가운데 셀
			$tx.setStyle( _Layer.get("cell4"), { 
				'width': 0, 
				'backgroundImage': "none"
			});
			$tx.setStyle( _Layer.get("cell5"), { 
				'width': 0, 
				'backgroundImage': "none" 
			});
			
			$tx.setStyle( _Layer.get("cell6"), { 
				'backgroundImage': "none",
				'backgroundColor': "transparent",
				'backgroundRepeat': "repeat",
				'borderWidth': "0",
				'borderStyle': "solid",
				'borderColor': "",
				'opacity': ""
			});
		},
		getBackConfig: function(){
			return _backConfig;
		},
		getBasicCellStyle: function(){
			return _Layer.__OPTIONS;
		}
	});	
	
	
	Trex.Menu.Back = Trex.Class.create({
		$extend: Trex.Menu,
		generate: function() {
			var _elMenu = this.elMenu;
			var _elInner = $tom.collect(_elMenu, 'div.tx-menu-inner');

			var _elTab = $tom.collect(_elInner, 'div.tx-menu-tab');
			if(_elTab) {
				_elTab.appendChild(this.generateTab());
			}
			
			var _config = Object.extend({
				changeHandler: this.onChange.bind(this)
			} , this.config );
			this.skinMenu = new Trex.Menu.Back.Skin( _config );
			this.colorMenu = new Trex.Menu.Back.Color( _config );
			this.uploadMenu = new Trex.Menu.Back.Upload( _config );
			
			var elConfirm = $tom.collect("#tx_back_menu img.tx-menu-confirm");
			$tx.observe( elConfirm, "click", function(ev){
				this.onCancel(ev);
				this.saveHistory();
			}.bind(this));
			
			var elCancel = $tom.collect("#tx_back_menu img.tx-menu-cancel");
			$tx.observe( elCancel, "click", function(ev){
				this.onCancel(ev);
				this.onSelect(ev, this.propConfig);
			}.bind(this));
		},
		regenerate: function() {
			this.propConfig = Object.extend( {}, _backConfig );
			var _cfg = this.propConfig;
			this.colorMenu.regenerate( this.propConfig );
			this.uploadMenu.regenerate( this.propConfig );
			this.skinMenu.regenerate( this.propConfig );
			
			if (_cfg.backgroundImage) { //업로드
				this.changeTab("", "upload");
			} else if ((_cfg.backgroundColor && _cfg.backgroundColor != "transparent") || 
					   (_cfg.borderWidth && _cfg.borderWidth.parsePx() != "0")) { 	//색상
				this.changeTab("", "color");
			} else{
				this.changeTab("", "skin");
			}
		},
		onChange: function(){
			var _backConfig;
			if (this.currentTab == "skin") {
				_backConfig = this.skinMenu.getValue();
			} else if (this.currentTab == "color") {
				_backConfig = this.colorMenu.getValue();
			} else{
				_backConfig = this.uploadMenu.getValue();
			}
			
			this.tool.execute( _backConfig );
			this.tool.button.pushedState()
		},
		saveHistory: function() {
			// for history
			var _toolHandler = this.tool.execute;
			this.tool.canvas.history.saveHistory(
                { back: Object.extend({}, this.propConfig) },
                { back: Object.extend({}, _backConfig) },
                function(data) {
                    _toolHandler(data.back);
                }
            );
		},
		generateTab: function() {
			this.currentTab = _NULL;
			this.changeTab = function(ev, tabName) {
                this.skinMenu.hide();
                this.colorMenu.hide();
                this.uploadMenu.hide();

                $tx.removeClassName(_el0, "selected");
                $tx.removeClassName(_el1, "selected");
                $tx.removeClassName(_el2, "selected");
                if (tabName == "color") {
                    this.colorMenu.show();
                    $tx.addClassName(_el1, "selected");
                } else if (tabName == "upload") {
                    this.uploadMenu.show();
                    $tx.addClassName(_el2, "selected");
                } else {
                    this.skinMenu.show();
                    $tx.addClassName(_el0, "selected");
                }

                this.currentTab = tabName || "skin";
                if (ev) {
                    $tx.stop(ev);
                }
            };

			var _elTab = tx.ul();
			var _el0 = tx.li( tx.a({href: "javascript:;", unselectable: "on"}, "디자인") );
			$tx.observe(_el0, "click", this.changeTab.bindAsEventListener(this, "skin"));
			
			var _el1 = tx.li( tx.a({href: "javascript:;", unselectable: "on"}, "색상") );
			$tx.observe(_el1, "click", this.changeTab.bindAsEventListener(this, "color"));
			
			var _el2 = tx.li(tx.a({href: "javascript:;", unselectable: "on"}, "직접 올리기") );
			$tx.observe(_el2, "click", this.changeTab.bindAsEventListener(this, "upload"));
			
			_elTab.appendChild(_el0);
			_elTab.appendChild(_el1);
			_elTab.appendChild(_el2);
			
			return _elTab;
		},
		hide: function(){
			// For IE rendering BUG
			this.skinMenu.hide();
			this.colorMenu.hide();
			this.uploadMenu.hide();
			
			$tx.hide(this.elMenu);
			this.isDisplayed = _FALSE;
		}
	});
	
	Trex.Menu.Back.Skin = Trex.Class.create({
		initialize: function(config){
			this.el = $tx("tx_background_thum_area");
			this.imageList = (typeof getBackImages == "function") ? getBackImages() : [];  
			this.paging = new Trex.Paging( this.imageList, { initPage:1, pagesize:6, blocksize:5 } );
			this.elBackImages = $tom.collect( this.el, "ul" );
			this.elPaging = $tom.collect( this.el, "ol" );
			this.changeHandler = config.changeHandler;
			this.selectedEl = tx.div();
			
			this.regenerate(config.backConfig);
		},
		regenerate: function(backConfig){
			this.localBackConfig = Object.extend({}, backConfig );
			this.showList(1);
		},
		getValue: function(){
			return this.localBackConfig;
		},
		changeThumbview: function(){
			// do Nothing
		},
		hide: function(){
			$tx.hide(this.el);
		},
		show: function(){
			$tx.show(this.el);
		},
		/* specific methods */
		displayBackImages: function(){ 
			var datas = this.paging.getOnePageData();
			this.elBackImages.innerHTML = "";
			
			var _onSelect = function(backConfig){
				this.localBackConfig = Object.extend( {}, backConfig );
				this.changeHandler();
			}.bind(this);
			
			for( var i = 0; i < datas.length; i++ ){
				var _elA = tx.a({ href: "#" },
				 	tx.img({ 
						src:datas[i].preview, width:"61", height:"61", id:datas[i].seq, alt:"스킨 샘플"+(i+1)
					})
				);
				$tx.observe( _elA, "click", function(skinProp){
						return function(ev){
							if (this.selectedEl) {
								$tx.removeClassName(this.selectedEl, "selected");
							}
							this.selectedEl = $tx.findElement(ev, "a");
							$tx.addClassName( this.selectedEl, "selected" );
							_onSelect(skinProp);
							$tx.stop(ev);
						}.bind(this);
					}.bind(this)(datas[i])
				);
				this.elBackImages.appendChild(tx.li( _elA ));
			}
		},
        displayPaging: function() {                                // paging의 view를 처리한다.
            var pagelist = this.paging.getPageList();
			this.elPaging.innerHTML = "";
			
			var _prevPageBlock = this.paging.getPrevBlock();
			var _prev = tx.li( {"className": "nav"},
				tx.a( { 
					"className": (_prevPageBlock)?"prev":"prev-disable"
				}, "이전") 
			);
			if ( _prevPageBlock ){
				$tx.observe(_prev, "click", this.showList.bind(this, _prevPageBlock));
			}
			this.elPaging.appendChild( _prev );
			
			for( var i = 0; i < pagelist.length; i++ ){
				var _property = ( pagelist[i] == this.paging.currentpage ) ? {"className": "selected"} : {};
				var _elA = tx.a( _property, pagelist[i] );
				$tx.observe(_elA, "click", this.showList.bind(this, pagelist[i]));
				this.elPaging.appendChild( tx.li( _elA ) );
			}
			
			var _nextPageBlock = this.paging.getNextBlock();
			var _next = tx.li( {"className": "nav"},
				tx.a( { 
					"className": _nextPageBlock?"next":"next-disable"
				}, "다음") 
			);
			if ( _nextPageBlock ){
				$tx.observe(_next, "click", this.showList.bind(this, _nextPageBlock));
			}
			this.elPaging.appendChild( _next );
		}, 
		showList: function(page){
			this.paging.movePage(page);
			this.displayBackImages(); 
			this.displayPaging(page);
		}
	});
	
	Trex.Menu.Back.Color = Trex.Class.create({
		initialize: function(config){
			this.config = config;
			this.el = $tx("tx_background_color_area");
			this.elMenus = $tom.collectAll( this.el, "dl"); 
			this.changeHandler = config.changeHandler;
			
			this.initBackColor();
			this.initBorderWidth();
			this.initBorderColor();
			this.initOpacity();
		},
		initBackColor: function(){
			var elMenu = this.elMenus[0];
			var menu = this.menuBackColor = new Trex.Menu.ColorPallete({
				el: $tom.collect( elMenu, "div.tx-colorpallete"), 
			 	thumbs: this.config.thumbs, 
				needTrans: _TRUE 
			});
            menu.setCommand(function(color) {
                this.changeProp( {backgroundColor:color} );
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
			
			var handler = function(ev){
				this.menuBorderWidth.hide(); 
				this.menuBorderColor.hide();
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			$tx.observe($tom.collect( elMenu, "a.tx-color-bg-thumb" ), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initBorderWidth: function(){
			var elMenu = this.elMenus[1];
			var menu = this.menuBorderWidth = new Trex.Menu.Select({
				el: $tom.collect( elMenu, "div.tx-colorpallete" ), 
				options: this.config.borderOptions
			});
			menu.setCommand( function(klass, data){
				this.changeProp( {borderWidth: data} );
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
			
			var handler = function(ev) {
				this.menuBackColor.hide(); 
				this.menuBorderColor.hide();
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			$tx.observe($tom.collect( elMenu, "a.tx-weight-border-thumb" ), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initBorderColor: function(){
			var elMenu =  this.elMenus[2];
			var menu = this.menuBorderColor = new Trex.Menu.ColorPallete( {
				el: $tom.collect( elMenu, "div.tx-colorpallete" ), 
				thumbs: this.config.thumbs
			});
			var handler = function(ev) {
				if ( this.localBackConfig.borderWidth == 0 ){
					alert(TXMSG("@back.need.border.width"));
					return;
				}
				this.menuBackColor.hide(); 
				this.menuBorderWidth.hide();
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			
			menu.setCommand( function(color){
				this.changeProp( {borderColor: color} );
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
			$tx.observe( $tom.collect( elMenu, "a.tx-color-border-thumb" ), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initOpacity: function(){
			var _handler = function( value ){
				this.changeProp( {'opacity': (1 - value/100)} );
				this.changeThumbview();
				this.changeHandler();
			}.bind(this);
			
			this.opacitySlide = new Trex.Slidebar( {
				handler: _handler.bind(this),
				el: this.el,
				knobWidth: 7,
				barSize: 60
			});
		},
		regenerate: function(backConfig){
			this.localBackConfig = {
                'backgroundColor': backConfig.backgroundColor || "transparent",
                'opacity': backConfig.opacity || "1",
                'borderColor': backConfig.borderColor || "transparent",
                'borderWidth': (backConfig.borderWidth && backConfig.borderWidth != "0pt") ? backConfig.borderWidth : "0",
                'borderStyle': backConfig.borderStyle || "solid"
            };
			this.opacitySlide.regenerate((1 - this.localBackConfig.opacity.toNumber()) * 100);
			this.changeProp({});
			this.changeThumbview();
		},
		changeProp: function(properties){
			for(var name in properties) {
				this.localBackConfig[name] = properties[name];
			}
			
			if ( (!this.localBackConfig.backgroundColor || this.localBackConfig.backgroundColor =="transparent" ) && this.localBackConfig.borderWidth == "0" ){
				this.opacitySlide.setDisable();
			}else{
				this.opacitySlide.setEnable();
			}
		},
		getValue: function(){
			return this.localBackConfig;
		},
		changeThumbview: function(){
			var elBackColorThumb = $tom.collect(this.elMenus[0], "a.tx-color-bg-thumb"); 
			var elBorderWidthThumb = $tom.collect(this.elMenus[1], "a.tx-weight-border-thumb"); 
			var elBorderColorThumb = $tom.collect(this.elMenus[2], "a.tx-color-border-thumb");

            setBackgroundColorPreview(elBackColorThumb, this.localBackConfig.backgroundColor);
			$tx.setStyle( elBorderColorThumb, { backgroundColor: this.localBackConfig.borderColor} );
			
			if ( !elBorderWidthThumb.prevClass ){
				$tx.addClassName( elBorderWidthThumb, this.config.borderOptions[0].klass );
				elBorderWidthThumb.prevClass = this.config.borderOptions[0].klass;
			}
			for( var i = 0; i < this.config.borderOptions.length; i++ ){
				if ( this.config.borderOptions[i].title == this.localBackConfig.borderWidth ) {
					$tx.removeClassName( elBorderWidthThumb, elBorderWidthThumb.prevClass );
					$tx.addClassName( elBorderWidthThumb, this.config.borderOptions[i].klass );
					elBorderWidthThumb.prevClass = this.config.borderOptions[i].klass;
				}
			} 
			
			// 버튼들의 dimmed 처리
			var wrapperBorderColor = $tom.collect(this.elMenus[2], "dd");
			var wrapperOpacitySlide = $tom.collect(this.elMenus[3], "dd");
			var opacityValue = (this.localBackConfig.borderWidth.parsePx() != "0")?1:0.3; 			
			$tx.setStyle( wrapperBorderColor, {"opacity":opacityValue} );
			
			opacityValue = ( this.localBackConfig.backgroundColor != "transparent" || this.localBackConfig.borderWidth != "0")?1:0.3;
			$tx.setStyle( wrapperOpacitySlide, {"opacity":opacityValue} );
		},
		show: function(){
			$tx.show(this.el);
		},
		hide: function(){
			this.menuBorderColor.hide();
			this.menuBackColor.hide();
			this.menuBorderWidth.hide();
			$tx.hide(this.el);
		}
	});
	
	Trex.Menu.Back.Upload = Trex.Class.create({
		initialize: function(config){
			this.config = config;
			this.el = $tx('tx_background_img_area');
			this.elMenus = $tom.collectAll( this.el, "dl");
			this.changeHandler = config.changeHandler;
			this.hasImage = _FALSE;
			this.hasRepeat = _FALSE;
			
			this.initUploader();
			this.initRepeat();
			this.initBackColor();
			this.initBackPosition();
			this.initOpacity();
		},
		initUploader: function(){
			/* 설정 파일들 들어내야 된다. */
			var preview = $tom.collect( this.el, "div.tx-background-img-preview-inner" );
			var removeBtn = $tom.collect( preview, "img" );
						
			var params = {
					quality: 'high',
					swLiveConnect: _TRUE+'',
					wmode: 'opaque'
			};
			var flashvars = {
					coca_service: this.config.coca.coca_service,
					service: this.config.coca.service,
					sname: this.config.coca.service,
					single_selection: _TRUE+''
			};
			Trex.Flash.load(
				TrexConfig.getUrl(this.config.coca.url), 
				'tx_coca_uploader_embed_target',
				'coca',
				{
					width: this.config.coca.width,
					height: this.config.coca.height,
					flashvarObj: flashvars,
					paraObj: params,
					attrObj:{
						bgcolor: this.config.coca.color
					}
				}
			);
			
			var _uploadHandler = function(imageBackConfig){
				this.hasImage = _TRUE;
				this.changeProp(imageBackConfig);
				this.changeThumbview();
				this.changeHandler();
			}.bind(this);
			var _removeHandler = function(){
				this.hasImage = _FALSE;
				this.changeProp( {backgroundImage:""});
				this.changeThumbview();
				this.changeHandler();
			}.bind(this);
			
			$tx.observe( removeBtn, "click", function(){
				$tx.setStyle(preview, {
					"backgroundImage": ""
				});
				_removeHandler();
			});

			var handler = {
                on_upload_complete: function(result) {
                    var resultArr = result.split("|");
					var thumb = resultArr[2].replace(/\/attach\//, "/P150x100/");
					var src = resultArr[2].replace(/\/attach\//, "/image/");
					$tx.setStyle(preview, {
						"backgroundImage": "url(" + thumb + ")"
					});
					
					_uploadHandler({"backgroundImage":src});
				},
				on_over_filesize: function(){
					alert(TXMSG("@back.over.file.size"));
				}
			};
			window.Coca = handler;
		},
		initRepeat: function(){
			var elMenu = this.elMenus[0];
		
			var menu = this.menuRepeat = new Trex.Menu.Select({	
				el: $tom.collect( elMenu, "div.tx-colorpallete" ), 
				options: this.config.repeatOptions
			});
			menu.setCommand( function(klass, data){
				this.hasRepeat = data.match(/^repeat/i)?_TRUE:_FALSE;
				this.changeProp({"backgroundRepeat": data});
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
			
			var handler = function(ev) {
				if ( !this.localBackConfig.backgroundImage ){
					alert( TXMSG("@back.need.user.image") );
					return;
				}
				this.menuBackColor.hide(); 
				this.menuPosition.hide();				
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			$tx.observe($tom.collect( elMenu, "a"), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initBackColor: function(){
			var elMenu = this.elMenus[1];
			var menu = this.menuBackColor = new Trex.Menu.ColorPallete( {
				el: $tom.collect( elMenu, "div.tx-colorpallete" ), 
				thumbs: this.config.thumbs,
				needTrans: _TRUE
			});
			menu.setCommand(function(color){
				this.changeProp({"backgroundColor": color});
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
									
			var handler = function(ev) {
				if ( !this.localBackConfig.backgroundImage ){
					alert( TXMSG("@back.need.user.image") );
					return;
				}
				if ( this.hasRepeat ){
					alert(TXMSG("@back.need.original.size"));
					return;
				}
				this.menuRepeat.hide(); 
				this.menuPosition.hide();
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			$tx.observe($tom.collect( elMenu, "a.tx-color-bg-thumb" ), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initBackPosition: function(){
			var elMenu = this.elMenus[2];
			var menu = this.menuPosition = new Trex.Menu.Select( {
				el: $tom.collect( elMenu, "div.tx-colorpallete" ),  
				options: this.config.positionOptions
			});
			menu.setCommand( function(klass, data){
				this.changeProp({"backgroundPosition": data});
				this.changeThumbview();
				this.changeHandler();
			}.bind(this));
													
			var handler = function(ev) {
				if ( !this.localBackConfig.backgroundImage ){
					alert( TXMSG("@back.need.user.image") );
					return;
				}
				this.menuRepeat.hide(); 
				this.menuBackColor.hide();
				menu.toggle();
				$tx.stop(ev);
			}.bind(this);
			$tx.observe($tom.collect( elMenu, "a.tx-align-thumb" ), 'click', handler);
			$tx.observe($tom.collect( elMenu, "a.tx-color-arrow-down" ), 'click', handler);
		},
		initOpacity: function(){
			var _handler = function( value ){
				this.changeProp({'opacity': (1 - value/100) });
				this.changeThumbview();
				this.changeHandler();
			}.bind(this);
			
			this.opacitySlide = new Trex.Slidebar( {
				handler: _handler.bind(this),
				el: this.el,
				knobWidth: 7,
				barSize: 60
			});
		},
		regenerate: function(backConfig){
			if ( backConfig.backgroundPosition == "0pt 50%" ){
				 backConfig.backgroundPosition = "left top";
			}
			this.localBackConfig = {
                'backgroundColor': backConfig.backgroundColor || "transparent",
                'backgroundImage': (backConfig.backgroundImage) ? backConfig.backgroundImage : "",
                'backgroundRepeat': backConfig.backgroundRepeat || "no-repeat",
                'backgroundPosition': backConfig.backgroundPosition || "left top",
                'opacity': backConfig.opacity || "1"
            };
			this.opacitySlide.regenerate((1 - this.localBackConfig.opacity.toNumber()) * 100);
			this.changeProp({});
			this.changeThumbview();
		},
		changeProp: function(properties){
			for( var name in properties ){
				this.localBackConfig[name] = properties[name];
			}
			
			//opacity slide를 control하기 위한 루틴
			if ( this.localBackConfig.backgroundImage && this.localBackConfig.backgroundImage != "none" ){
				this.opacitySlide.setEnable();	
			}else {
				this.opacitySlide.setDisable();
			}
		},
		getValue: function(){
			return this.localBackConfig;
		},
		changeThumbview: function(){
			var elBackRepeatThumb = $tom.collect(this.elMenus[0], "div.tx-color-box a"); 
			var elBackColorThumb = $tom.collect(this.elMenus[1], "a.tx-color-bg-thumb"); 
			var elBackPositionThumb = $tom.collect(this.elMenus[2], "a.tx-align-thumb");
			var preview = $tom.collect( this.el, "div.tx-background-img-preview-inner" );

            setBackgroundColorPreview(elBackColorThumb, this.localBackConfig.backgroundColor);
			$tx.setStyle(preview, { "backgroundImage": "url(" + this.localBackConfig.backgroundImage.replace(/\/image\//,"/P150x100/") + ")" });
            var i;
			for(i = 0; i < this.config.repeatOptions.length; i++ ){
				if ( this.config.repeatOptions[i].title == this.localBackConfig.backgroundRepeat ) {
					if (elBackRepeatThumb.prevClass) {
						$tx.removeClassName(elBackRepeatThumb, elBackRepeatThumb.prevClass);
					}
					$tx.addClassName( elBackRepeatThumb, this.config.repeatOptions[i].klass );
					elBackRepeatThumb.prevClass = this.config.repeatOptions[i].klass;
				}
			}
			
			for(i = 0; i < this.config.positionOptions.length; i++ ){
				if ( this.config.positionOptions[i].title == this.localBackConfig.backgroundPosition ) {
					if (elBackPositionThumb.prevClass) {
						$tx.removeClassName(elBackPositionThumb, elBackPositionThumb.prevClass);
					}
					$tx.addClassName( elBackPositionThumb, this.config.positionOptions[i].klass );
					elBackPositionThumb.prevClass = this.config.positionOptions[i].klass;
				}
			}
			
			// 버튼들의 dimmed 처리
			var wrapperBackRepeat = $tom.collect(this.elMenus[0], "dd");
			var wrapperBackColor = $tom.collect(this.elMenus[1], "dd");
			var wrapperBackPosition = $tom.collect(this.elMenus[2], "dd");
			var wrapperOpacitySlide = $tom.collect(this.elMenus[3], "dd");
			var hasImage = ( this.localBackConfig.backgroundImage && this.localBackConfig.backgroundImage != "none" );
			var isRepeat = (this.localBackConfig.backgroundPosition == "repeat" );
			var removeBtn = $tom.collect( this.el, "div.tx-background-img-preview-inner img" );
			
			$tx.setStyle( wrapperBackRepeat, {"opacity":(hasImage)?1:0.3} );
			$tx.setStyle( wrapperBackColor, {"opacity":(hasImage && !isRepeat)?1:0.3} );
			$tx.setStyle( wrapperBackPosition, {"opacity":(hasImage)?1:0.3} );
			$tx.setStyle( wrapperOpacitySlide, {"opacity":(hasImage)?1:0.3} );
			if ( hasImage ) {
				$tx.show( removeBtn );
			}else {
				$tx.hide( removeBtn );
			}
		},
		show: function(){
			$tx.show(this.el);
		},
		hide: function(){
			this.menuRepeat.hide();
			this.menuBackColor.hide();
			this.menuPosition.hide();
			$tx.hide(this.el);
		}
	});
	
	var module = function(editor, toolbar, sidebar, canvas) {
        var _sizeConfig = canvas.getSizeConfig();
		if(!_sizeConfig) {
			return;
		}
		
		var __WrapWidth = _sizeConfig.wrapWidth;			//전체 에디터 사이즈(스크롤 사이즈 포함, 999)
		var __ContentWidth = _sizeConfig.contentWidth;		//단 사이즈(971, 774, 577 3단이 있음)
		var __CanvasWidth = Math.min(__ContentWidth, __WrapWidth);// __ContentWidth와 같음. 
		
		var __HolderHorPadding = (__CanvasWidth == 971)? 5:0; // 배경 가로 패딩 
		var __HolderVerPadding = 5;								// 배경 세로 패딩
		var __ScrollWidth = 16;									// 스크롤바의 크기
		
		var __BgLeftPos = Math.max(Math.ceil((__WrapWidth - __CanvasWidth - 2) / 2), 0);
		//var __BgLeftPos = Math.max(Math.ceil((__WrapWidth - __CanvasWidth - __HolderHorPadding * 2 - __ScrollWidth - 2) / 2), 0);
					
		// change content
		var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
		
		// When horizontal scroll
		var verScrollValue = 0;
		// When vertical scorll
		var horScrollValue = 0;
		var _changeScroll = function() {
			if(_wysiwygPanel.getScrollTop() != verScrollValue) {
				verScrollValue = _wysiwygPanel.getScrollTop();
				$tx.setStyle(_Layer.get("wrapper"), {marginTop: (-1*verScrollValue).toPx() });
			}
			
			if(_wysiwygPanel.getScrollLeft() != horScrollValue) {
				horScrollValue = _wysiwygPanel.getScrollLeft();
				$tx.setStyle(_Layer.get("wrapper"), {marginLeft: (__BgLeftPos - horScrollValue).toPx() });
			}
		};
		
		// 배경 마크업에 박혀있는 font color
		//var fontColorFromBackground = "";
		
		// When Height of contents is changed
		var _adjustBackgroundHeight = function(height) {
			if (!_Layer.created) {
				return;
			}
			height -= __HolderVerPadding * 2;
			if(_backConfig.topCenterHeight) {
				height -= _backConfig.topCenterHeight.parsePx();
			}
			if(_backConfig.botCenterHeight) {
				height -= _backConfig.botCenterHeight.parsePx();
			}
			if (_backConfig.borderWidth) {
				height -= _backConfig.borderWidth.parsePx() * 2;
			}
			$tx.setStyle(_Layer.get("cell4"), {height: height.toPx() });
			$tx.setStyle(_Layer.get("cell5"), {height: height.toPx() });
			$tx.setStyle(_Layer.get("cell6"), {height: height.toPx() });

			_changeScroll();
		};
		
		// When Width of contents is changed
		var _adjustBackgroundWidth = function( width ) {
			if (!_Layer.created) {
				return;
			}
			width -= __HolderHorPadding * 2;
			$tx.setStyle(_Layer.get("wrapper"), {width: Math.max(width, __CanvasWidth).toPx() });
		};

		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_SCROLLING, function() {
            if (!_Layer.created) {
				return;
			}
			_changeScroll();
		});

		//리사이즈
		canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(height) {
			if (!_Layer.created) {
				return;
			}
			height = height.parsePx();
			height -= __HolderVerPadding * 2;
			 
			if ( height > _wysiwygPanel.getPanelHeight().parsePx() ){
				var centerHeight = height;
				if(_backConfig.topCenterHeight) {
					centerHeight -= _backConfig.topCenterHeight.parsePx();
				}
				if(_backConfig.botCenterHeight) {
					centerHeight -= _backConfig.botCenterHeight.parsePx();
				}
				$tx.setStyle(_Layer.get("cell6"), {height: centerHeight.toPx() });
				$tx.setStyle(_Layer.get("cell4"), {height: centerHeight.toPx() });
				$tx.setStyle(_Layer.get("cell5"), {height: centerHeight.toPx() });
			}
			$tx.setStyle(_Layer.get("back"), {
				height: height.toPx()
			});
			_changeScroll();
		});
		
		var _currentWidth = 0;
		var _currentHeight = 0;
        var _tempW;
		var _calculateDocSize = function(forced) {
			if (!_Layer.created) {
				return;
			}
			try{
				if (canvas.isWYSIWYG()) {
					var _wysiwygPanelJsObj = canvas.getCurrentPanel();
					var _doc = _wysiwygPanelJsObj.getDocument(); // iframe.contentDocument
					var _iframe = _wysiwygPanelJsObj.el; // #tx_canvas_wysiwyg
					var _newH;
					var _newW;
					if ($tx.msie) {
						_newH = _doc.body.scrollHeight;
						
						_tempW = (_doc.documentElement.offsetWidth || _doc.documentElement.scrollWidth);
						_newW = _doc.body.scrollWidth;
						_newW = (_tempW >= _newW)?_tempW - (2 * __BgLeftPos):_newW - __BgLeftPos * 2;
						_newW -= __ScrollWidth;
					} else {
						_newH = (_doc.documentElement.offsetHeight || _doc.documentElement.scrollHeight);
						 
						_tempW = (_doc.documentElement.offsetWidth || _doc.documentElement.scrollWidth);
						
						_newW = _iframe.contentDocument.body.scrollWidth;
						_newW = (_tempW >= _newW)?_tempW - (2 * __BgLeftPos):_newW - __BgLeftPos;
						_newW -= __ScrollWidth;
					}
					
					if (_wysiwygPanel.getPanelHeight().parsePx() >= _newH) {
						_newH = _wysiwygPanel.getPanelHeight().parsePx();
					}
					 						
					if (_currentWidth != _newW || forced) {
						_adjustBackgroundWidth(_newW);
					}
					
					if (_currentHeight!= _newH || forced) {
						_adjustBackgroundHeight(_newH);
					}
					
					_currentWidth = _newW;
					_currentHeight = _newH;
				}
			}catch(error){ console.log( error );}
		};
		
		//리사이즈
        canvas.observeJob('canvas.apply.background', function() {
            _calculateDocSize(_TRUE);
		});
		
		// iframe이 로딩되면 일정주기로 컨텐츠의 크기를 계산하는 함수를 호출한다.
		canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
			setInterval(_calculateDocSize, 300);
		},600);
		
		_Layer.update('wrapper', { 
			width: __CanvasWidth.toPx(),
			marginLeft: __BgLeftPos.toPx() 
		});
		
		_Layer.update('back', { 
			height: (400 - __HolderVerPadding * 2).toPx(),
			paddingTop: __HolderVerPadding.toPx(),
			paddingRight: __HolderHorPadding.toPx(),
			paddingBottom: __HolderVerPadding.toPx(),
			paddingLeft: __HolderHorPadding.toPx()
		});
	};
	Trex.module("observe changing background", module );
	

    var setBackgroundColorPreview = function(backColorThumbEl, color) {
        if (!color || color === "transparent") {
            var transparentImageUrl = TrexConfig.getIconPath(Trex.__CONFIG_COMMON.thumbs.transparent.thumbImage);
            $tx.setStyle(backColorThumbEl, { backgroundImage: "url(" + transparentImageUrl + ")"})
        } else {
            $tx.setStyle(backColorThumbEl, {backgroundColor: color, backgroundImage: "none"})
        }
    };
    
    var editorApplication = Editor;
    editorApplication.getTool().back.oninitialized();
    
    module( editorApplication, 
		editorApplication.getToolbar(), 
		editorApplication.getSidebar(), 
		editorApplication.getCanvas(), 
		editorApplication.getConfig()
    );
    
})();
