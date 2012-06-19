(function(){
	var TdUtil = {
		getEventElement: function(ev){
			var el = $tx.findElement(ev, "td");
			if (el && el.tagName && el.tagName.toUpperCase() == "TD") {
				return el;
			} else {
				return _NULL;
			}
		},
		getMaxCoord: function(el){
			var xCoords = this.getXCoords(el);
			var yCoords = this.getYCoords(el);
			return {
				x: xCoords[xCoords.length-1],
				y: yCoords[yCoords.length-1]
			};
		},
		getMinCoord: function(el){
			var xCoords = this.getXCoords(el);
			var yCoords = this.getYCoords(el);
			return {
				x: xCoords[0],
				y: yCoords[0]
			};
		},
		getYCoords: function(el){
			return this.getCoordsByKey(el, "row" );
		},
		getXCoords: function(el){
			return this.getCoordsByKey(el, "col" );
		},
		getCoordsByKey: function(el, keyword){
			var regExp = new RegExp( keyword+"(\\d+)", "gim");
			var resultArr = [];
			var klass = el.getAttribute( keyword + "Class" );
			klass.trim().replace( regExp, function(m, value){
				resultArr.push(value.toNumber());
			});
			return resultArr;
		},
		setSelect: function(element){
			$tx.setStyle(element, {
				backgroundImage: "url(http://i1.daumcdn.net/icon/editor/table_focus_50.png)"
			});
		},
		setUnselect: function(element){
			$tx.setStyle(element, {
				backgroundImage: ""
			});
		},
		clearContent: function(element){
			element.setAttribute("unselectable", "on");
			element.innerHTML = "-";
			//$tx.setStyle( element, {width: "auto"} );
		},
		clearCoords: function(element){
			element.setAttribute("colClass","");
			element.setAttribute("rowClass","");
		},
		setCoords: function(element, row, col){
			var rowSpan = row + 1;
			var rowCount = this.getRowSpan( element );
			var rowClass = "row ".times(rowCount).replace(/(row)/g, function(m, value){
				return value+(rowSpan++);
			});

			var colSpan= col + 1;
			var colCount = this.getColSpan( element );
			var colClass = "col ".times(colCount).replace(/(col)/g, function(m, value){
				return value+(colSpan++);
			});

			element.setAttribute("colClass", colClass);
			element.setAttribute("rowClass", rowClass);
		},
		getColSpan: function(element){
			return parseInt( element.getAttribute("colSpan") || 1 );
		},
		getRowSpan: function(element){
			return parseInt( element.getAttribute("rowSpan") || 1 );
		}
	};

	var Boundary = {
		start: {x:-1, y:-1},
		top: -1,
		left: -1,
		bottom: -1,
		right: -1,
		init: function(x,y){
			this.start.x = this.left = this.right = x;
			this.start.y = this.top = this.bottom = y;
		},
		clear: function(){
			this.top = this.left = this.bottom = this.right = this.start.x = this.start.y= -1;
		},
		changeBoundary: function(x,y){
			this.top = Math.min(this.start.y, y);
			this.bottom = Math.max(this.start.y, y);
			this.left = Math.min(this.start.x, x);
			this.right = Math.max(this.start.x, x);
		},
		getRectCoord: function(){
			return {
				sx: this.left,
				sy: this.top,
				ex: this.right,
				ey: this.bottom
			}
		}
	};

	var TableEditActionValidator = {
		canMerge: function(rectCoord, tdMatrix){
			var i;
			for(i = rectCoord.sy; i < rectCoord.ey + 1; i++ ){
				if ( TdUtil.getMinCoord(tdMatrix[i][rectCoord.sx]).x - 1 != rectCoord.sx ||
					TdUtil.getMaxCoord(tdMatrix[i][rectCoord.ex]).x - 1 != rectCoord.ex ){
						return _FALSE;
				}
			}

			for(i = rectCoord.sx; i < rectCoord.ex + 1; i++ ){
				if ( TdUtil.getMinCoord(tdMatrix[rectCoord.sy][i]).y - 1 != rectCoord.sy ||
					TdUtil.getMaxCoord(tdMatrix[rectCoord.ey][i]).y - 1!= rectCoord.ey ){
						return _FALSE;
				}
			}

			return _TRUE;
		},
		canSplit: function(rectCoord, tdMatrix){
			var topLeftCoord = TdUtil.getMinCoord( tdMatrix[rectCoord.sy][rectCoord.sx]);
			var bottomRightCoord = TdUtil.getMinCoord( tdMatrix[rectCoord.ey][rectCoord.ex]);

			return ( topLeftCoord.x == bottomRightCoord.x
					&& topLeftCoord.y == bottomRightCoord.y
					&& topLeftCoord.x > 0
					&& topLeftCoord.y > 0);
		},
		isMergedCell: function(rectCoord, tdMatrix){
			var maxCoord= TdUtil.getMaxCoord( tdMatrix[rectCoord.sy][rectCoord.sx]);
			var minCoord= TdUtil.getMinCoord( tdMatrix[rectCoord.sy][rectCoord.sx]);

			if ( maxCoord.x != minCoord.x || maxCoord.y != minCoord.y ){
				return _TRUE;
			}else{
				return _FALSE;
			}
		},
		canRemoveRow:function(rectCoord, tdMatrix){
			var minRow = rectCoord.sy;
			var maxRow = rectCoord.ey;
			var colSize = tdMatrix[0].length;
			for( var i = 0; i < colSize; i++ ){
				if ( minRow != TdUtil.getMinCoord( tdMatrix[rectCoord.sy][i] ).y - 1){
					return _FALSE;
				}
				if ( maxRow != TdUtil.getMaxCoord( tdMatrix[rectCoord.ey][i] ).y - 1){
					return _FALSE;
				}
			}
			return _TRUE;
		},
		canRemoveCol: function(rectCoord, tdMatrix){
			var minCol = rectCoord.sx;
			var maxCol = rectCoord.ex;
			var rowSize = tdMatrix.length;
			for( var i = 0; i < rowSize; i++ ){
				if ( minCol != TdUtil.getMinCoord( tdMatrix[i][rectCoord.sx]).x - 1){
					return _FALSE;
				}
				if ( maxCol != TdUtil.getMaxCoord( tdMatrix[i][rectCoord.ex]).x - 1){
					return _FALSE;
				}
			}
			return _TRUE;
		},
		isAllRowSelected: function(rectCoord, tdMatrix){
			return ( tdMatrix.length <= rectCoord.ey - rectCoord.sy +1 )?_TRUE:_FALSE;
		},
		isAllColSelected: function(rectCoord, tdMatrix){
			return ( tdMatrix[0].length <= rectCoord.ex - rectCoord.sx +1 )?_TRUE:_FALSE;
		},
		canAddUpperRow: function( row, tdMatrix){
			for( var i = 0; i < tdMatrix[0].length; i++ ){
				if ( tdMatrix[row-1][i] == tdMatrix[row][i] ){
					return _FALSE;
				}
			}
			return _TRUE;
		},
		canAddBelowRow: function( row, tdMatrix){
			for( var i = 0; i < tdMatrix[0].length; i++ ){
				if ( tdMatrix[row+1][i] == tdMatrix[row][i] ){
					return _FALSE;
				}
			}
			return _TRUE;
		},
		canAddLeftCol: function( col, tdMatrix){
			for( var i = 0; i < tdMatrix.length; i++ ){
				if ( tdMatrix[i][col-1] == tdMatrix[i][col] ){
					return _FALSE;
				}
			}
			return _TRUE;
		},
		canAddRightCol: function( col, tdMatrix){
			for( var i = 0; i < tdMatrix.length; i++ ){
				if ( tdMatrix[i][col+1] == tdMatrix[i][col] ){
					return _FALSE;
				}
			}
			return _TRUE;
		}
	};

	Trex.MarkupTemplate.add("table.edit",
'<div class="tx-table-edit">\
<ul class="tx-tab tx-tab-menu1">\
<li><a href="javascript:;">표구성</a></li>\
<li><a href="javascript:;">디자인</a></li>\
<li><a href="javascript:;">서식</a></li>\
</ul>\
<div class="tx-table-edit-layout">\
<div class="tx-table-edit-layout-wrapper">\
<div class="tx-table-edit-layout-insert">\
<h4>삽입</h4>\
<ul class="tx-2cell">\
<li class="tx-left"><a href="javascript:;" class="tx-up" title="위에 추가">위</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-down" title="아래에 추가">아래</a></li>\
</ul>\
<ul class="tx-2cell">\
<li class="tx-left"><a href="javascript:;" class="tx-left" title="왼쪽에 추가">왼쪽</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-right" title="오른쪽 추가">오른</a></li>\
</ul>\
</div>\
<div class="tx-table-edit-layout-cell">\
<h4>삭제</h4>\
<ul class="tx-2cell">\
<li class="tx-left"><a href="javascript:;" class="tx-col" title="열삭제">열</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-row" title="행삭제">행</a></li>\
</ul>\
<h4 style="width:50px">병합/분할</h4>\
<ul class="tx-2cell">\
<li class="tx-left"><a href="javascript:;" class="tx-merge" title="병합">합</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-split" title="분할">분</a></li>\
</ul>\
</div>\
<div class="tx-table-edit-layout-align">\
<h4>정렬</h4>\
<ul class="tx-3cell">\
<li class="tx-left"><a href="javascript:;" class="tx-top" title="상단">상</a></li>\
<li class="tx-center"><a href="javascript:;" class="tx-middle" title="중단">중</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-bottom" title="하단">하</a></li>\
</ul>\
<ul class="tx-3cell">\
<li class="tx-left"><a href="javascript:;" class="tx-alignleft" title="왼쪽 정렬">좌</a></li>\
<li class="tx-center"><a href="javascript:;" class="tx-aligncenter" title="가운데 정렬">중</a></li>\
<li class="tx-right"><a href="javascript:;" class="tx-alignright" title="오른쪽 정렬">우</a></li>\
</ul>\
</div>\
</div>\
</div>\
<div class="tx-table-edit-design">\
<div class="tx-table-edit-design-wrapper">\
<dl>\
<dt>테두리선택</dt>\
<dd class="tx-table-edit-borderrange tx-btn-widget">\
<a href="javascript:;" class="tx-icon">테두리</a>\
<a href="javascript:;" class="tx-arrow">테두리</a>\
<div class="tx-menu"></div>\
</dd>\
<dt>선</dt>\
<dd class="tx-table-edit-bordercolor tx-btn-widget-tbg">\
<a href="javascript:;" class="tx-icon">선색</a>\
<a href="javascript:;" class="tx-arrow">선색</a>\
<div class="tx-colorpallete"></div>\
</dd>\
<dd class="tx-table-edit-borderwidth tx-btn-widget">\
<a href="javascript:;" class="tx-icon">굵기</a>\
<a href="javascript:;" class="tx-arrow">굵기</a>\
<div class="tx-menu"></div>\
</dd>\
<dd class="tx-table-edit-borderstyle tx-btn-widget">\
<a href="javascript:;" class="tx-icon">스타일</a>\
<a href="javascript:;" class="tx-arrow">스타일</a>\
<div class="tx-menu"></div>\
</dd>\
<dt>배경색</dt>\
<dd class="tx-table-edit-backcolor tx-btn-widget-brbg">\
<a href="javascript:;" class="tx-icon">배경색</a>\
<a href="javascript:;" class="tx-arrow">배경색</a>\
<div class="tx-colorpallete" unselectable="on"></div>\
</dd>\
</dl>\
</div>\
</div>\
<div class="tx-table-edit-template">\
<div class="tx-table-edit-template-wrapper">\
<ul>\
<!--li class="tx-ex1"><a href="javascript:"></a></li-->\
</ul>\
<a href="javascript:;" class="tx-button-on">더보기</a>\
<ul class="tx-table-edit-template-all">\
<!--li class="tx-ex1"><a href="javascript:"></a></li-->\
</ul>\
</div>\
</div>\
<div class="tx-table-edit-main">\
<a href="javascript:;" class="tx-confirm">확인</a>\
<a href="javascript:;" class="tx-cancel">취소</a>\
</div>\
</div>'
	);

	Trex.Menu.Table.TableEdit = Trex.Class.create({
		$const:{
			__OPTIONS:{
				WIDTH:[
					{label:"1pt", title:"1px", klass:"tx-1px", data:"1"},
					{label:"2pt", title:"2px", klass:"tx-2px", data:"2"},
					{label:"3pt", title:"3px", klass:"tx-3px", data:"3"},
					{label:"4pt", title:"4px", klass:"tx-4px", data:"4"},
					{label:"5pt", title:"5px", klass:"tx-5px", data:"5"},
					{label:"6pt", title:"6px", klass:"tx-6px", data:"6"},
					{label:"7pt", title:"7px", klass:"tx-7px", data:"7"}
				],
				RANGE:[
					{label:"모든 테두리", title:"전체", klass:"tx-all", data:"all"},
					{label:"바깥 테두리", title:"바깥쪽", klass:"tx-out", data:"out"},
					{label:"안쪽 테두리", title:"안쪽", klass:"tx-in", data:"in"},
					{label:"위쪽 테두리", title:"위쪽", klass:"tx-top", data:"top"},
					{label:"아래쪽 테두리", title:"아랫쪽", klass:"tx-bottom", data:"bottom"},
					{label:"왼쪽 테두리", title:"왼쪽", klass:"tx-left", data:"left"},
					{label:"오른쪽 테두리", title:"오른쪽", klass:"tx-right", data:"right"}
				],
				STYLE:[
					{label:"없음", title:"없음", klass:"tx-none", data:"none"},
					{label:"실선", title:"실선", klass:"tx-solid", data:"solid"},
					{label:"굵은점선", title:"굵은점선", klass:"tx-dashed", data:"dashed"},
					{label:"점선", title:"점선", klass:"tx-dotted", data:"dotted"}
				]
			}
		},
		initialize: function(config){
			/* config = {
			 * 	table: 편집할 테이블
			 * }
			 */

			console.log("table editor......init...");
			if ( !config.table ){
				alert( "편집할 테이블을 선택해주세요." );
				return ;
			}

			var _config = this.config = $tx.extend({}, config );
			this.previewTable = new Trex.Menu.Table.TableEdit.PreviewTable(_config);
			this.realTable = new Trex.Menu.Table.TableEdit.TableEditor(_config);
			this.elContainer = this.elPreviewArea = _NULL;
			this.createTableEditLayer();

			this.blackBox = config.editor.getBlackBox();
			this.blackBox.show( this.elContainer );
			this.eventBinding();
			this.showMenu(0);
			// TODO property 정리
			this.borderRange = "all";
		},

		createTableEditLayer: function(){
			this.elPreviewArea = tx.div({className:"tx-preview"});
			this.elPreviewArea.appendChild( this.previewTable.getTable() );

			this.elContainer = tx.div({className:"tx-table-edit-container"});
			this.elContainer.appendChild( this.elPreviewArea );

			this.elMenu = Trex.MarkupTemplate.get("table.edit").evaluateAsDom({});
			this.elContainer.appendChild( this.elMenu );

			/* IE 여백 버그 보정(Guillotine Bug). */
			var _marginDiv = tx.div({style:{clear:"both"}});
			_marginDiv.style.clear = "both";
			this.elContainer.appendChild(_marginDiv);
		},
		_eventBindingTab: function(){
			var showMenu = this.showMenu = function(layerNumber){
				if ( isNaN(layerNumber) ){
					return;
				}
				for( var i = 0; i < menuBtns.length; i++ ){
					$tx.removeClassName( parentOfBtn, "tx-tab-menu"+(i+1));
					$tx.hide( menuLayers[i] );
				}
				$tx.addClassName( parentOfBtn, "tx-tab-menu"+(layerNumber+1));
				$tx.show( menuLayers[layerNumber] );
			};

			var parentOfBtn = $tom.collect( this.elMenu, "ul.tx-tab");
			var menuBtns = $tom.collectAll( parentOfBtn, "li");
			var menuLayers = [
				$tom.collect( this.elContainer, "div.tx-table-edit-layout"),
				$tom.collect( this.elContainer, "div.tx-table-edit-design"),
				$tom.collect( this.elContainer, "div.tx-table-edit-template")
			];

			var clickHandler = function(ev, menuIndex){
				showMenu(menuIndex);
				return _FALSE;
			};
			for( var i = 0; i < menuBtns.length; i++ ){
				$tx.observe( menuBtns[i], "click", clickHandler.bindAsEventListener(this, i) );
			}
		},
		_eventBindingLayoutMenu: function(){
			var self = this;
			var menus = $tom.collectAll( $tom.collect( this.elMenu, ".tx-table-edit-layout"), "a" );
			var menuset = [ "addRowUpper", "addRowBelow",
							"addColLeft", "addColRight",
							"removeCol", "removeRow",
							"merge", "split",
							"changeTextValignTop", "changeTextValignMiddle", "changeTextValignBottom",
							"changeTextAlignLeft", "changeTextAlignCenter", "changeTextAlignRight"
						];

			var mouseOverHandler = function( ev ){
				var el = $tx.findElement(ev, "li");
				var parentEl = el.parentNode;
				if (el){
					var position = $tx.classNames(el)[0].replace("tx","");
					parentEl.className = parentEl.className + position;
				}
			};
			var mouseOutHandler = function(ev){
				var el = $tx.findElement(ev, "ul");
				if (el){
					el.className = el.className.replace(/-right|-center|-left/,"");
				}
			};
			var clickHandler = function(ev, index){
				$tx.stop(ev);
				self[menuset[index]]();
				return _FALSE;
			};

			for( var i = 0; i < menus.length; i++ ){
				$tx.observe( menus[i], "click", clickHandler.bindAsEventListener(this, i));
				$tx.observe( menus[i], "mouseover", mouseOverHandler );
				$tx.observe( menus[i], "mouseout", mouseOutHandler );
			}
		},
		_eventBindingDesignMenu: function(){
			var self = this;
			var _elPart = $tom.collect(this.elMenu, "div.tx-table-edit-design");

			var _toolbar = this.config.editor.toolbar;
			var _elBackColorIcon = $tom.collect(_elPart, "dd.tx-table-edit-backcolor a.tx-icon");
			_toolbar.makeWidget(
				new Trex.Button.ColorWidget({
					status: _TRUE,
					el: $tom.collect(_elPart, "dd.tx-table-edit-backcolor")
				}),
				new Trex.Menu.ColorPallete({
					el: $tom.collect(this.elMenu, "dd.tx-table-edit-backcolor div.tx-colorpallete"),
					thumbs: Trex.__CONFIG_COMMON.thumbs
				}),
				function(color){
					if ( !$tx.hasClassName( _elBackColorIcon, "tx-selected" ) ){
						$tx.addClassName( _elBackColorIcon, "tx-selected" );
					}
					self.changeCellStyle( "changeBackColor", color );
				}
			);

			var _elBorderRangeIcon = $tom.collect(_elPart, "dd.tx-table-edit-borderrange a.tx-icon") ;
			_toolbar.makeWidget(
				new Trex.Button.Widget({
					status: _TRUE,
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderrange")
				}),
				new Trex.Menu.Select({
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderrange div.tx-menu"),
					options: Trex.Menu.Table.TableEdit.__OPTIONS.RANGE
				}),
				function(value){
					$tx.removeClassName( _elBorderRangeIcon, _elBorderRangeIcon.previousClassName || "tx-range" );
					_elBorderRangeIcon.previousClassName = "tx-range-" + value;
					$tx.addClassName( _elBorderRangeIcon, "tx-range-" + value);
					self.setBorderRange(value);
				}
			);

			var _elBorderColorIcon =  $tom.collect(_elPart, "dd.tx-table-edit-bordercolor a.tx-icon");
			_toolbar.makeWidget(
				new Trex.Button.ColorWidget({
					status: _TRUE,
					el: $tom.collect(_elPart, "dd.tx-table-edit-bordercolor")
				}),
				new Trex.Menu.ColorPallete({
					el: $tom.collect(this.elMenu, "dd.tx-table-edit-bordercolor div.tx-colorpallete"),
					thumbs: Trex.__CONFIG_COMMON.thumbs
				}),
				function(color){
					if ( !$tx.hasClassName( _elBorderColorIcon, "tx-selected" ) ){
						$tx.addClassName( _elBorderColorIcon, "tx-selected" );
					}
					self.changeCellStyle( "changeBorderColor", color );
				}
			);

			_toolbar.makeWidget(
				new Trex.Button.Widget({
					status: _TRUE,
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderwidth")
				}),
				new Trex.Menu.Select({
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderwidth div.tx-menu"),
					options: Trex.Menu.Table.TableEdit.__OPTIONS.WIDTH
				}),
				function(value){
					var width = value.toPx();
					self.changeCellStyle( "changeBorderWidth", width );
				}
			);

			_toolbar.makeWidget(
				new Trex.Button.Widget({
					status: _TRUE,
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderstyle")
				}),
				new Trex.Menu.Select({
					el: $tom.collect(_elPart, "dd.tx-table-edit-borderstyle div.tx-menu"),
					options: Trex.Menu.Table.TableEdit.__OPTIONS.STYLE
				}),
				function(style){
					self.changeCellStyle( "changeBorderType", style );
				}
			);
		},
		_eventBidingTemplateMenu: function(){
			var ulList = $tom.collectAll( this.elMenu, "div.tx-table-edit-template ul");
			var elListSome = ulList[0];
			var elListAll = ulList[1];
			var templateList = (new Trex.Tool.Table.TemplateWizard()).getTemplateList();
			var self = this;

			var _makeTemplateList = function(list, parentEl, offset){
				for( var i = 0; i < list.length; i++){
					var elLi = tx.li({className:"tx-"+list[i].klass});
					var elA = tx.a({href:"javascript:;"});
					var elSpan = tx.span(" ");
					$tx.observe(elA, "click", function(index){
						return function(){ self.applyTemplateStyle(index); return _FALSE; }
					}(i+offset));
					elA.appendChild( elSpan );
					elLi.appendChild(elA);
					parentEl.appendChild(elLi);
				}
			};

			_makeTemplateList(templateList.slice(10), elListAll, 10);
			_makeTemplateList(templateList.slice(1,10), elListSome, 1);

			var elDownBtn = $tom.collect( this.elMenu, "a.tx-button-on" );
			$tx.observe( elDownBtn, "click", function(){
				elDownBtn.className = $tx.hasClassName(elDownBtn, "tx-button")?"tx-button-on":"tx-button";
				$tx.toggle( elListAll );
				return _FALSE;
			});
		},
		_eventBindingMainMenu: function(){
			var self = this;

			var elMainMenu = $tom.collect( this.elContainer, "div.tx-table-edit-main" );
			var elBtnConfirm = $tom.collect( elMainMenu, "a.tx-confirm");
			$tx.observe(elBtnConfirm, "click", function(){self.done(); return _FALSE;});
			var elBtnCancel = $tom.collect( elMainMenu, "a.tx-cancel");
			$tx.observe(elBtnCancel, "click", function(){self.cancel();return _FALSE;});
		},
		eventBinding: function(){
			this._eventBindingTab();
			this._eventBidingTemplateMenu();
			this._eventBindingLayoutMenu();
			this._eventBindingDesignMenu();
			this._eventBindingMainMenu();
		},
		getContainer: function(){
			return this.elContainer;
		},
		_executeLayoutCommand: function( command, optionValue ){
			//TODO error code 를 검사해서 error메세지를 뿌려주는 걸로 바꾸자.
			this.previewTable.clearSelection();
			this.previewTable[command](optionValue);
			this.previewTable.refreshCoord();
			this.realTable[command](optionValue);
			this.previewTable.clearBoundary();
		},
		addRowUpper: function(){
			var row = this.previewTable.getSelectedRectCoord().sy;
			if ( row < 0 ){
				alert('추가될 행을 선택해주세요.');
				return ;
			}

			if ( row != 0 && !TableEditActionValidator.canAddUpperRow(row, this.previewTable.getTdMatrix())) {
				alert('좌우측에 합쳐진 행이 있어서 행을 추가할 수 없습니다.');
				return;
			}
			this._executeLayoutCommand("addRowUpper", row);
		},
		addRowBelow: function(){
			var row = this.previewTable.getSelectedRectCoord().ey;
			if ( row < 0 ){
				alert('추가될 행을 선택해주세요.');
				return ;
			}
			if ( this.previewTable.getTdMatrix().length-1 != row
				&& !TableEditActionValidator.canAddBelowRow(row, this.previewTable.getTdMatrix())) {
				alert('좌우측에 합쳐진 행이 있어서 행을 추가할 수 없습니다.');
				return;
			}
			this._executeLayoutCommand("addRowBelow", row);
		},
		addColLeft: function(){
			var col = this.previewTable.getSelectedRectCoord().sx;
			if ( col < 0 ){
				alert('추가될 열을 선택해주세요.');
				return ;
			}
			if ( 0 != col && !TableEditActionValidator.canAddLeftCol(col, this.previewTable.getTdMatrix())) {
				alert('위아래에 합쳐진 열이 있어서 열을 추가할 수 없습니다.');
				return;
			}

			this._executeLayoutCommand("addColLeft", col);
		},
		addColRight: function(){
			var col = this.previewTable.getSelectedRectCoord().ex;
			if ( col < 0 ){
				alert('추가될 열을 선택해주세요.');
				return ;
			}
			if ( this.previewTable.getTdMatrix()[0].length-1 != col
				&& !TableEditActionValidator.canAddRightCol(col, this.previewTable.getTdMatrix())) {
				alert('위아래에 합쳐진 열이 있어서 열을 추가할 수 없습니다.');
				return;
			}

			this._executeLayoutCommand("addColRight", col);
		},
		removeRow: function(){
			var rectCoord = this.previewTable.getSelectedRectCoord();
			var startRow = rectCoord.sy;
			var endRow = rectCoord.ey;

			if ( startRow < 0 ){
				alert('삭제할 행을 선택해주세요.');
				return ;
			}
			if ( !TableEditActionValidator.canRemoveRow(rectCoord, this.previewTable.getTdMatrix())){
				alert( '삭제할 수 없는 행이 포함되어 있습니다.' );
				return;
			}
			if ( TableEditActionValidator.isAllRowSelected(rectCoord, this.previewTable.getTdMatrix()) ){
				alert( '모든 행을 삭제할 수 없습니다.' );
				return ;
			}

			this.previewTable.clearSelection();
			for( var i = startRow; i <= endRow; i++ ){
				this.previewTable.removeRow(startRow);
				this.realTable.removeRow(startRow);
			}
			this.previewTable.refreshCoord();
			this.previewTable.clearBoundary();
		},
		removeCol: function(){
			var rectCoord = this.previewTable.getSelectedRectCoord();
			var startCol = rectCoord.sx;
			var endCol = rectCoord.ex;

			if ( startCol < 0 ){
				alert('삭제할 열을 선택해주세요.');
				return ;
			}
			if ( !TableEditActionValidator.canRemoveCol(rectCoord, this.previewTable.getTdMatrix())){
				alert( '삭제할 수 없는 열이 포함되어 있습니다.' );
				return;
			}
			if ( TableEditActionValidator.isAllColSelected(rectCoord, this.previewTable.getTdMatrix()) ){
				alert( '모든 열을 삭제할 수 없습니다.' );
				return;
			}

			for( var i = startCol; i <= endCol; i++ ){
				this._executeLayoutCommand( "removeCol", startCol );
			}
		},
		merge: function(){
			var rectCoord = this.previewTable.getSelectedRectCoord();
			if( rectCoord.sx < 0 || rectCoord.sy < 0 ){
				alert( '합칠 칸들을 선택해주세요.' );
				return _FALSE;
			}
			if ( this.previewTable.getTdMatrix()[rectCoord.sy][rectCoord.sx] == this.previewTable.getTdMatrix()[rectCoord.ey][rectCoord.ex]){
				alert('합칠칸을 두칸이상 선택해주세요.');
				return _FALSE;
			}
			if ( !TableEditActionValidator.canMerge(rectCoord, this.previewTable.getTdMatrix()) ){
				alert('합치기를 수행할 수 없는 선택영역입니다.');
				return _FALSE;
			}

			this.previewTable.clearSelection();

			this.previewTable.merge(rectCoord);
			this.previewTable.refreshCoord();
			this.realTable.merge(rectCoord);

			this.previewTable.clearBoundary();
		},
		split: function(){
			var rectCoord = this.previewTable.getSelectedRectCoord();

			if( rectCoord.sx < 0 || rectCoord.sy < 0 ){
				alert( '나눌 칸을 선택해주세요.' );
				return _FALSE;
			}
			if ( !TableEditActionValidator.canSplit(rectCoord, this.previewTable.getTdMatrix()) ){
				alert('나누어질 칸을 한칸만 선택해주세요.');
				return _FALSE;
			}
			if (!TableEditActionValidator.isMergedCell(rectCoord, this.previewTable.getTdMatrix())) {
				alert('더이상 나눌 수 없는 칸입니다. 두칸이상 합쳐진 칸을 선택해주세요.');
				return _FALSE;
			}
			this.previewTable.clearSelection();

			this.previewTable.split(rectCoord);
			this.previewTable.refreshCoord();
			this.realTable.split(rectCoord);

			this.previewTable.clearBoundary();
		},
		changeCellStyle: function( command, value ){
			var rectCoord = this.previewTable.getSelectedRectCoord();
			this.previewTable[command](rectCoord, value, this.borderRange);
			this.realTable[command](rectCoord, value, this.borderRange);
		},
		_changeTextAlign:function(align){
			var rectCoord = this.previewTable.getSelectedRectCoord();

			this.previewTable.changeTextAlign(rectCoord, align);
			this.realTable.changeTextAlign(rectCoord, align);
		},
		changeTextAlignLeft: function(){
			this._changeTextAlign("left");
		},
		changeTextAlignCenter: function(){
			this._changeTextAlign("center");
		},
		changeTextAlignRight: function(){
			this._changeTextAlign("right");
		},
		_changeTextValign:function(align){
			var rectCoord = this.previewTable.getSelectedRectCoord();

			this.previewTable.changeTextValign(rectCoord, align);
			this.realTable.changeTextValign(rectCoord, align);
		},
		changeTextValignTop: function(){
			this._changeTextValign("top");
		},
		changeTextValignMiddle: function(){
			this._changeTextValign("middle");
		},
		changeTextValignBottom: function(){
			this._changeTextValign("bottom");
		},
		applyTemplateStyle: function(styleIndex){
			if ( isNaN(styleIndex) ){
				return ;
			}

			this.previewTable.applyTemplateStyle(styleIndex);
			this.realTable.applyTemplateStyle(styleIndex);
		},
		setBorderRange: function(value){
			this.borderRange = value;
		},
		cancel:function(){
			this.blackBox.hide();
		},
		done: function(){
			$tom.insertAt(this.realTable.getTable(), this.config.table);
			$tom.remove(this.config.table);
			this.blackBox.hide();
		}
	});
	Trex.Menu.Table.TableEdit.TableEditor = Trex.Class.create({
		$const: {
			BORDER_STYLE:"1px solid #ccc"
		},
		initialize: function(config){
			this.elTable = this.createTable( config.table );
			this.initTdMatrix();
			this.tableConfig = {};

			var canvas = config.editor.getCanvas();
			this.doc = canvas.getCurrentPanel().getDocument();
		},
		initTdMatrix: function(){
			var tableMatrixer = new Trex.Tool.Table.TableCellMatrixer(this.elTable);
			this.tdMatrix = tableMatrixer.getTdMatrix();
			this.rowSize = tableMatrixer.getRowSize();
			this.colSize = tableMatrixer.getColSize();
		},
		createTable: function(table){
			return table.cloneNode(_TRUE);
		},
		setTdBorderStyle: function(elTd, isTop, isLeft ){
			var borderStyle = Trex.Menu.Table.TableEdit.TableEditor.BORDER_STYLE;
			$tx.setStyle( elTd, {
				borderRight: borderStyle,
				borderBottom: borderStyle,
				borderTop:(isTop)?borderStyle:"",
				borderLeft:(isLeft)?borderStyle:""
			});
		},
		createTd: function(properties){
			var td = this.doc.createElement("td");
			td.innerHTML = "&nbsp;";
			for( var name in properties ){
				td.setAttribute(name, properties[name] );
			}

			return td;
		},
		createTr: function(){
			var tr = this.doc.createElement("tr");

			for( var i = 0; i< this.colSize; i++){
				var td = this.createTd({});
				this.setTdBorderStyle(td, _FALSE, (i==0));
				tr.appendChild( td );
			}
			return tr;
		},
		addRowUpper: function(index){
			this._addRow(index);
			if ( index == 0 ){
				for( var i = 0; i < this.colSize; i++ ){
					$tx.setStyle(this.tdMatrix[0][i], {borderTop: "1px solid #000" } );
					$tx.setStyle(this.tdMatrix[1][i], {borderTop: "none" } );
				}
			}
		},
		addRowBelow: function(index){
			this._addRow( index, _TRUE);
		},
		_addRow: function(index, isBelow){
			var trArr = dGetties(this.elTable, "tr");
			var indexTr = trArr[index];
	//		var indexTr = this.tdMatrix[index][0].parentNode;
			var newTr = this.createTr();
			$tom[(isBelow)?'insertNext':'insertAt'](newTr, indexTr);

			if ( isBelow ){
				index++;
			}

			this.tdMatrix.splice(index, 0, $tom.collectAll(newTr, "td"));
			this.rowSize++;
		},
		addColLeft: function(index){
			this._addCol(index);
			if ( index == 0 ){
				for( var i = 0; i < this.rowSize; i++){
					$tx.setStyle(this.tdMatrix[i][1], {borderLeft: "none" } );
				}
			}
		},
		addColRight: function(index){
			this._addCol(index, _TRUE);
		},
		_resizeAllCellWidth: function(){
			var width = $tx.getStyle(this.elTable, "width") || this.elTable.getAttribute("width") || 389;
			width = parseInt(width);
			if ( !width ){
				return;
			}

			var oneCellWidth = Math.round( width / this.colSize, 0);
			for (var i = 0; i < this.rowSize; i++) {
				for (var j = 0; j < this.colSize; j++) {
					$tx.setStyle(this.tdMatrix[i][j], {
						width: ( oneCellWidth * TdUtil.getColSpan(this.tdMatrix[i][j])).toPx()
					});
				}
			}
		},
		_addCol: function(index, isRight){
			var usedStack = [];
			var indexTd = _NULL;

			var _getIndexTd = function(row, colIndex, tdMatrix, isRight){
				var index = colIndex;
				while ( tdMatrix[row][index] && usedStack.contains(tdMatrix[row][index]) ){
					index += (isRight)?-1:1;
				}
				usedStack.push( tdMatrix[row][index] );
				return tdMatrix[row][index];
			};

			for( var i = 0; i < this.rowSize; i++){
				indexTd = _getIndexTd( i, index, this.tdMatrix, isRight );

				var newTd = this.createTd({});
				this.setTdBorderStyle( newTd, i==0, index==0 );
				$tom[(!isRight)?'insertAt':'insertNext'](newTd, indexTd);

				this.tdMatrix[i].splice(isRight?index+1:index, 0, newTd);
			}
			this.colSize++;
			this._resizeAllCellWidth();
		},
		removeRow: function(index){
			var tr = this.tdMatrix[index][0].parentNode;
			$tom.remove( tr );
			this.tdMatrix.splice(index,1);
			this.rowSize--;

			if (index == 0) {
				for (var i = 0; i < this.colSize; i++) {
					this.setTdBorderStyle(this.tdMatrix[0][i], index == 0, i == 0);
				}
			}
		},
		removeCol: function(index){
			var i;
			for(i = 0; i < this.rowSize; i++){
				$tom.remove(this.tdMatrix[i][index]);
				this.tdMatrix[i].splice(index,1);
			}
			this.colSize--;

			for(i = 0; i< this.rowSize; i++){
				if (this.tdMatrix[i][index]) {
					this.setTdBorderStyle(this.tdMatrix[i][index], i == 0, index == 0);
				}
			}
		},
		merge: function(rectCoord){
			var totalColSpan = 0, i;
			for(i  = rectCoord.sx; i <= rectCoord.ex; i){
				var colSpan = TdUtil.getColSpan( this.tdMatrix[rectCoord.sy][i] );
				totalColSpan += colSpan;
				i += colSpan;
			}

			var totalRowSpan = 0;
			for(i  = rectCoord.sy; i <= rectCoord.ey; i){
				var rowSpan = TdUtil.getRowSpan( this.tdMatrix[i][rectCoord.sx] );
				totalRowSpan += rowSpan;
				i += rowSpan;
			}
			var mergeTd = this.createTd( {
				"rowSpan": totalRowSpan,
				"colSpan": totalColSpan
			});

			/* TODO 이하의 코드와 위의 코드 분리할 수 있겠다. */

			var _isAliveTd= function(td){
				return ( td.parentNode && td.parentNode.nodeType != '11' );
			};

			this.setTdBorderStyle( mergeTd, rectCoord.sy==0, rectCoord.sx==0 );
			var indexTd = this.tdMatrix[rectCoord.sy][rectCoord.sx];

			$tom.insertAt( mergeTd, indexTd );
			var contents = "";
			for (i = rectCoord.sy; i <= rectCoord.ey; i++) {
				var colContents = "";
				for (var j = rectCoord.sx; j <= rectCoord.ex; j++) {
					if ( _isAliveTd(this.tdMatrix[i][j]) ){
						$tom.remove( this.tdMatrix[i][j] );
						colContents += this.tdMatrix[i][j].innerHTML + "";
					}
					this.tdMatrix[i][j] = mergeTd;
				}
				contents += colContents + "";
			}
			mergeTd.innerHTML = contents;

			this._resizeAllCellWidth();
		},
		split: function(rectCoord){
			var _self = this;
			var _findIndexTd = function(row, col){
				if ( !_self.tdMatrix[row][col-1] ){
					return _NULL;
				}else if ( TdUtil.getRowSpan( _self.tdMatrix[row][col-1] ) > 1){
					return _findIndexTd(row, col-1);
				}else {
					return _self.tdMatrix[row][col-1];
				}
			};

			var yIndex = rectCoord.sy;
			var xIndex = rectCoord.sx;
			var el = this.tdMatrix[yIndex][xIndex];
			var content = el.innerHTML;
			var rowSpan = TdUtil.getRowSpan( el );
			var colSpan = TdUtil.getColSpan( el );
			var trArr = $tom.collectAll( this.elTable, "tr" );
			for( var i = yIndex; i < yIndex + rowSpan; i++  ){
				for ( var j = xIndex; j < xIndex + colSpan; j++ ) {
					var td = this.createTd({});
					this.setTdBorderStyle(td, i==0, j==0);
					var indexTd = _findIndexTd(i, j);
					if ( indexTd ){
						$tom.insertNext(td, indexTd);
					}else{
						$tom.insertFirst( trArr[i], td );
					}
					this.tdMatrix[i][j] = td;
				}
			}
			this.tdMatrix[yIndex][xIndex].innerHTML = content;
			$tom.remove(el);
			this._resizeAllCellWidth();
		},
		_changeTopBorderStyle: function(rectCoord, styleType, value){
			var style = {};

//			var isTopCell = (rectCoord.sy == 0);
			style[( rectCoord.sy == 0) ? "borderTop"+styleType:"borderBottom"+styleType] = value;
			var yIndex = (rectCoord.sy == 0)?0:rectCoord.sy-1;

			for (var i = rectCoord.sx; i <= rectCoord.ex; i++) {
				$tx.setStyle(this.tdMatrix[yIndex][i], style);
			}
		},
		_changeBottomBorderStyle: function(rectCoord, styleType, value){
			var style = {};

			style["borderBottom"+styleType] = value;
			var yIndex = rectCoord.ey;

			for (var i = rectCoord.sx; i <= rectCoord.ex; i++) {
				$tx.setStyle(this.tdMatrix[yIndex][i], style);
			}
		},
		_changeLeftBorderStyle: function(rectCoord, styleType, value){
			var style = {};

//			var isLeftmostCell = (rectCoord.sx == 0);
			style[( rectCoord.sx == 0) ? "borderLeft"+styleType:"borderRight"+styleType] = value;
			var xIndex = (rectCoord.sx== 0)?0:rectCoord.sx-1;

			for (var i = rectCoord.sy; i <= rectCoord.ey; i++) {
				$tx.setStyle(this.tdMatrix[i][xIndex], style);
			}
		},
		_changeRightBorderStyle: function(rectCoord, styleType, value){
			var style = {};

			style["borderRight"+styleType] = value;
			var xIndex = rectCoord.ex;

			for (var i = rectCoord.sy; i <= rectCoord.ey; i++) {
				$tx.setStyle(this.tdMatrix[i][xIndex], style);
			}
		},
		_changeInBorderStyle: function(rectCoord, styleType, value){
			var style = {};

			for( var i = rectCoord.sy; i <= rectCoord.ey; i++ ){
				for (var j = rectCoord.sx; j <= rectCoord.ex; j++) {
					style = {};
					if ( i != rectCoord.ey ){
						style["borderBottom"+styleType] = value;
					}
					if ( j != rectCoord.ex ){
						style["borderRight"+styleType] = value;
					}
					$tx.setStyle(this.tdMatrix[i][j], style);
				}
			}
		},
		_changeOutBorderStyle: function(rectCoord, styleType, value){
			this._changeTopBorderStyle( rectCoord, styleType, value );
			this._changeBottomBorderStyle( rectCoord, styleType, value );
			this._changeLeftBorderStyle( rectCoord, styleType, value );
			this._changeRightBorderStyle( rectCoord, styleType, value );
		},
		_changeBorderStyle: function( coord, styleType, value, borderRange ){
			var rectCoord = this._getValidRectCoord( coord );
			this._removeTableBorderProperty();
			this._removeTableSpacingProperty();
			switch(borderRange){
				case "top":
					this._changeTopBorderStyle( rectCoord, styleType, value );
					break;
				case "bottom":
					this._changeBottomBorderStyle( rectCoord, styleType, value );
					break;
				case "left":
					this._changeLeftBorderStyle( rectCoord, styleType, value );
					break;
				case "right":
					this._changeRightBorderStyle( rectCoord, styleType, value );
					break;
				case "in":
					this._changeInBorderStyle( rectCoord, styleType, value );
					break;
				case "out":
					this._changeOutBorderStyle( rectCoord, styleType, value );
					break;
				case "all":
					this._changeInBorderStyle( rectCoord, styleType, value );
					this._changeOutBorderStyle( rectCoord, styleType, value );
					break;
				default:
					break;
			}
		},
		_getValidRectCoord: function(rectCoord){
			return {
				sy: (rectCoord.sy < 0)?0:rectCoord.sy,
				ex: (rectCoord.ex < 0)?this.colSize-1:rectCoord.ex,
				ey: (rectCoord.ey < 0)?this.rowSize-1:rectCoord.ey,
				sx: (rectCoord.sx < 0)?0:rectCoord.sx
			}
		},
		_removeTableBorderProperty: function(){
			var border = parseInt( this.elTable.getAttribute("border") );
			if ( border > 0 ){
				this.elTable.setAttribute("border","0");
				var templateWizard = new Trex.Tool.Table.TemplateWizard();
				templateWizard.applyStyle( this.elTable, 0 );
			}
		},
		_removeTableSpacingProperty: function(){
			this.elTable.setAttribute("cellSpacing","0");
		},
		changeBorderColor: function(rectCoord, value, range){
			this._changeBorderStyle(rectCoord, "Color", value, range );
		},
		changeBorderType: function(rectCoord, value, range){
			this._changeBorderStyle( rectCoord, "Style", value, range );
		},
		changeBorderWidth: function(rectCoord, value, range){
			var width = value.toPx();
			this._changeBorderStyle( rectCoord, "Width", width, range );
		},
		_changeCellStyle: function(rectCoord, name, value ){
			var coord = this._getValidRectCoord( rectCoord );
			var style = {};
			style[name] = value;

			for( var i = coord.sy; i <= coord.ey; i++ ){
				for( var j = coord.sx; j <= coord.ex; j++ ){
					$tx.setStyle(this.tdMatrix[i][j], style);
				}
			}
		},
		changeBackColor: function(rectCoord, colorValue){
			this._changeCellStyle(rectCoord, "backgroundColor", colorValue );
		},
		changeTextAlign: function(rectCoord, alignType){
			this._changeCellStyle(rectCoord, "textAlign", alignType );
		},
		changeTextValign: function(rectCoord, alignType){
			this._changeCellStyle(rectCoord, "verticalAlign", alignType );
		},
		applyTemplateStyle: function(templateIndex){
			this._removeTableBorderProperty();
			this._removeTableSpacingProperty();
			var templateWizard = new Trex.Tool.Table.TemplateWizard();
			templateWizard.applyStyle( this.elTable, templateIndex );
		},
		getTdMatrix: function(){
			return this.tdMatrix;
		},
		getTable: function(){
			return this.elTable;
		}
	});

	Trex.Menu.Table.TableEdit.PreviewTable = Trex.Class.create({
		$extend: Trex.Menu.Table.TableEdit.TableEditor,
		initialize: function(config){
			this.$super.initialize(config);
			this.tableConfig = {};
			this.countOfExcuteResizeToParentClientWidth = 0;

			this.boundary = Boundary;
			this.boundary.clear();
			this.refreshCoord();

			this.clearTable();
			this.eventBinding();
		},
		createTd: function(properties){
			return tx.td(properties, "+");
		},
		createTr: function(){
			var tr = tx.tr();
			for( var i = 0; i< this.colSize; i++){
				var td = this.createTd({});
				this.setTdBorderStyle(td, _FALSE, (i==0));
				tr.appendChild( td );
			}
			return tr;
		},
		createTable: function(table){
			if ($tx.msie || $tx.opera) {
				var div = tx.div();
				div.innerHTML = table.outerHTML;
				return div.firstChild;
			}else {
				return table.cloneNode(_TRUE);
			}
		},
		clearTable: function(){
			if ($tx.gecko) {
				$tx.setStyle(this.elTable, { borderCollapse: "separate" });
			}
			this.elTable.setAttribute("width","");

			for( var i = 0 ; i < this.rowSize; i++){
				for( var j = 0 ; j < this.colSize; j++){
					TdUtil.clearContent(this.tdMatrix[i][j]);
				}
			}
			this._resizeAllCellWidth();
		},
		clearSelection: function(){
			var coord = this.boundary;
			if ( coord.top < 0 || coord.left < 0 ){
				return;
			}

			for( var i = coord.top; i <= coord.bottom; i++){
				for( var j = coord.left; j <= coord.right; j++){
					TdUtil.setUnselect( this.tdMatrix[i][j] );
				}
			}
		},
		setSelection: function(){
			var coord = this.boundary;

			for( var i = coord.top; i <= coord.bottom; i++){
				for( var j = coord.left; j <= coord.right; j++){
					TdUtil.setSelect(this.tdMatrix[i][j]);
				}
			}
		},
		_clearCoord: function(){
			for( var i = 0; i < this.rowSize; i++){
				for( var j = 0; j < this.colSize; j++ ){
					TdUtil.clearCoords(this.tdMatrix[i][j]);
				}
			}
		},
		refreshCoord: function(){
			this._clearCoord();
			for( var i = 0; i < this.rowSize; i++){
				for( var j = 0; j < this.colSize; j++ ){
					var colClass = this.tdMatrix[i][j].getAttribute("colClass");
					if ( !colClass ){
						TdUtil.setCoords(this.tdMatrix[i][j], i, j);
					}
				}
			}
			this.resizeToParentClientWidth();
		},
		resizeToParentClientWidth: function() { //NOTE: #FTDUEDTR-1039
			var self, parentNode;
			self = this;
			parentNode = this.elTable.parentNode;
			if (parentNode && 0 < parentNode.clientWidth) {
				this.elTable.style.width = parentNode.clientWidth + "px";
			} else {
				if (this.countOfExcuteResizeToParentClientWidth < 30) {
					this.countOfExcuteResizeToParentClientWidth += 1;
					setTimeout(function(){
						self.resizeToParentClientWidth();
					}, 16);
					return;
				}
			}
			this.countOfExcuteResizeToParentClientWidth = 0;
		},
		getSelectedRectCoord: function(){
			return this.boundary.getRectCoord();
		},
		clearBoundary: function(){
			this.boundary.clear();
		},
		eventBinding: function(){
			var self = this;
			var previousElement = _NULL;

			var _mouseDownHandler = function(ev){
				var el = TdUtil.getEventElement(ev, _TRUE);
				if (el) {
					var coordMin = TdUtil.getMinCoord(el);
					var coordMax = TdUtil.getMaxCoord(el);
					self.clearSelection();
					self.boundary.init(coordMin.x - 1, coordMin.y - 1);
					self.boundary.changeBoundary(coordMax.x - 1, coordMax.y - 1);
					previousElement = el;
				}
			};

			var _mouseOverHandler = function(ev){
				if (previousElement) {
					var el = TdUtil.getEventElement(ev);
					if (el && previousElement != el) {
						var coord = TdUtil.getMinCoord(el);
						previousElement = el;
						self.clearSelection();
						self.boundary.changeBoundary(coord.x - 1, coord.y - 1);
						self.setSelection();
					}
				}
			};
			var _mouseupHandler = function(ev){
				$tx.stop(ev);
				var el = TdUtil.getEventElement(ev);
				if (previousElement) {
					if ( el == previousElement ){
						self.setSelection();
					}
					previousElement = _NULL;
				}
			};

			setTimeout(function(){
				var elContainertArea = $tom.collect( ".tx-table-edit-container" );
				var _mouseClickHandler = function(ev){
					var target = $tx.element(ev);
					if ( target && target.tagName ){
						var klass = target.className || "";
						var tagName = target.tagName.toLowerCase() || "";
						if (tagName == "div" && (klass.indexOf("tx-table-edit") > -1 || klass.indexOf("tx-preview") > -1)) {
							self.clearSelection();
							self.boundary.clear();
							$tx.stop(ev);
						}
					}
				};
				$tx.observe(elContainertArea, "click", _mouseClickHandler);

				var _mouseupHandler = function(){
					if (previousElement) {
						previousElement = _NULL;
					}
				};
				$tx.observe(elContainertArea, "mouseup", _mouseupHandler);
			}, 1000);


			$tx.observe(this.elTable, "mousedown", _mouseDownHandler);
			$tx.observe(this.elTable, "mouseover", _mouseOverHandler);
			$tx.observe(this.elTable, "mouseup", _mouseupHandler);
		}
	});
}());