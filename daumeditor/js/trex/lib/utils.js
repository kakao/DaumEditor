(function(Trex) {
	/**
	 * @namespace
	 * @name Trex.Util
	 */
	Trex.Util = /** @lends Trex.Util */ {
		_dispElIds: [],
		getDispElId: function() {
			var _genId;
			do {
				_genId = "tx_entry_" + (Math.floor(Math.random() * 90000) + 10000) + "_"; //id: 10000~99999
			} while(Trex.Util._dispElIds.contains(_genId));
			Trex.Util._dispElIds.push(_genId);
			return _genId;
		},
		generateKey: function() {
			return parseInt(Math.random() * 100000000);
		},
		toStyleString: function(styles) {
			var _str = [];
			for(var _name in styles) {
				if(styles[_name]) {
					_str.push(_name.replace(/([A-Z])/g, "-$1").toLowerCase());
					_str.push(":");
					_str.push(styles[_name]);
					_str.push(";");
				}
			}
			return _str.join("");
		},
		toAttrString: function(attrs) {
			var _str = [];
			for(var _name in attrs) {
				if(attrs[_name]) {
					_str.push(" " + _name + "=\"" + attrs[_name] + "\"");
				}
			}
			return _str.join("");
		},
		getMatchValue: function(reg, html, inx) {
			var _matchs;
			if((_matchs = reg.exec(html)) != _NULL) {
				return _matchs[inx];
			} else {
				return _NULL;
			}
		},
		getAttachmentType: function(mimeType){
			mimeType = (mimeType || "").toLowerCase();

            var imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/tiff',
                'image/gif', 'image/bmp', 'image/x-jg', 'image/ief', 'image/pict',
                'jpg', 'bmp', 'gif', 'png'];

            if (imageMimeTypes.contains(mimeType)) {
                return 'image';
            }
            return 'file';
		},
		/**
		 * 확장자에 따는 thumbnail 이미지 url을 가져온다.
		 * @param {Object} ext
		 */
		thumburl: function(ext) {
			ext = (ext || "").toLowerCase();
			switch (ext) {
				case "doc":
				case "docx":
					return getIconPath("#iconpath/pn_word.gif");
				case "xls":
				case "xlsx":
					return getIconPath("#iconpath/pn_xls.gif");
				case "ppt":
				case "pptx":
					return getIconPath("#iconpath/pn_ppt.gif");
				case "pdf":
					return getIconPath("#iconpath/pn_pdf.gif");
				case "txt":
					return getIconPath("#iconpath/pn_txt.gif");
				case "hwp":
					return getIconPath("#iconpath/pn_hwp.gif");
				case "zip":
				case "alz":
					return getIconPath("#iconpath/pn_zip.gif");
				case "mp3":
				case "wav":
				case "ogg":
				case "wma":
				case "mp4":
				case "ape":
				case "ra":
				case "ram":
					return getIconPath("#iconpath/pn_mp3.gif");
				case "avi":
				case "mpeg":
				case "wmv":
				case "asf":
					return getIconPath("#iconpath/pn_movie.gif");
				case "swf":
					return getIconPath("#iconpath/pn_swf.gif");
				case "htm" :
				case "html":
					return getIconPath("#iconpath/pn_html.gif");
				case "jpg":
				case "gif":
				case "png":
				case "bmp":
					return getIconPath("#iconpath/pn_etc.gif");
				default:
					return getIconPath("#iconpath/pn_etc.gif");
			}
		},
		/**
		 * 확장자에 따는 preview 이미지 url을 가져온다.
		 * @param {Object} ext
		 */
		prevurl: function(ext) {
			ext = (ext || "").toLowerCase();
			switch (ext) {
				case "doc":
				case "docx":
					return getIconPath("#iconpath/p_word_s.gif");
				case "xls":
				case "xlsx":
					return getIconPath("#iconpath/p_xls_s.gif");
				case "ppt":
				case "pptx":
					return getIconPath("#iconpath/p_ppt_s.gif");
				case "pdf":
					return getIconPath("#iconpath/p_pdf_s.gif");
				case "txt":
					return getIconPath("#iconpath/p_txt_s.gif");
				case "hwp":
					return getIconPath("#iconpath/p_hwp_s.gif");
				case "zip":
				case "alz":
					return getIconPath("#iconpath/p_zip_s.gif");
				case "mp3":
				case "wav":
				case "ogg":
				case "wma":
				case "mp4":
				case "ape":
				case "ra":
				case "ram":
					return getIconPath("#iconpath/p_mp3_s.gif");
				case "avi":
				case "mpeg":
				case "wmv":
				case "asf":
					return getIconPath("#iconpath/p_movie_s.gif");
				case "swf":
					return getIconPath("#iconpath/p_swf_s.gif");
				case "htm" :
				case "html":
					return getIconPath("#iconpath/p_html_s.gif");
				case "jpg":
					return getIconPath("#iconpath/p_jpg_s.gif");
				case "gif":
					return getIconPath("#iconpath/p_gif_s.gif");
				case "png":
				case "bmp":
					return getIconPath("#iconpath/p_png_s.gif");
				default:
					return getIconPath("#iconpath/p_etc_s.gif");
			}
		},
		getMatchedClassName: function(element, classes){
			var matched = _FALSE;
			var _class = "";
			for(var i = 0; i < classes.length; i++){
				_class = classes[i];
				if($tx.hasClassName(element, _class)){
					matched = _class;
					break;
				}
			}
			return matched;
		},
		getAllAttributesFromEmbed: function(embedSrc){
			var map = {};
			embedSrc = embedSrc.replace(/<embed|>/ig,"");
			try {
				var regSplit = /(\w+)=((?:\")[^\"]+(?:\"|$)|(?:')[^']+(?:'|$)|(?:[^\"'][^ \n]+($| |\n)))/ig;
                var result;
				while( (result = regSplit.exec(embedSrc)) != _NULL ){
					map[result[1].trim().toLowerCase()] = result[2].replace(/^(\"|')/i,"").replace(/(\"|')$/i,"").trim();
				}
			}catch(e){ }

			return map;
		},
		getAllAttributes: function(source){
			var _map = {};
			var _matchsAttr;

			var _reg = /style="(?:\s*|(?:[^"]*(?:;\s*)))width\s*:\s*([0-9]+)px[^"]*"/ig;
			while ((_matchsAttr = _reg.exec(source)) != _NULL) {
				_map["width"] = _matchsAttr[1];
			}
			_reg = /style="(?:\s*|(?:[^"]*(?:;\s*)))height\s*:\s*([0-9]+)px[^"]*"/ig;
			while ((_matchsAttr = _reg.exec(source)) != _NULL) {
				_map["height"] = _matchsAttr[1];
			}
			_reg = new RegExp("\\s+([a-zA-Z\-]+)=\"([^\"]*)\"", "g");
			while ((_matchsAttr = _reg.exec(source)) != _NULL) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			_reg = new RegExp("\\s+([a-zA-Z\-]+)='([^']*)'", "g");
			while ((_matchsAttr = _reg.exec(source)) != _NULL) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			_reg = new RegExp("\\s+([a-zA-Z\-]+)=([^\\s>]*)", "g");
			while ((_matchsAttr = _reg.exec(source)) != _NULL) {
				if (!_map[_matchsAttr[1].toLowerCase()]) {
					_map[_matchsAttr[1].toLowerCase()] = _matchsAttr[2];
				}
			}
			return _map;
		}
	};

	/**
	 * @namespace
	 * @name Trex.HtmlCreator
	 */
	Trex.HtmlCreator = {
		/**
		 * Create Table Markup String
		 *
		 *  @example
		 *  var items =[
		 *  		{
		 *  			klass: 'klassName',
		 *  			image: 'image url', // can be omitted
		 *  			data: 'data'
		 *  		}
		 *  	]
		 *
		 *	var tableMarkup = Trex.HtmlCreator.createTableMarkup(row, col, item);
		 *
		 * @param {int} rows
		 * @param {int} cols
		 * @param {Object} items
		 *
		 */
		createTableMarkup: function(rows, cols, items){
			var _html = [];
			_html.push('<table unselectable="on">');
			_html.push('<tbody>');

			var _total = items.length;
			var _item;
            for (var row = 0; row < rows; row++) {
				_html.push('<tr>');
                for (var col = 0; col < cols; col++) {
                    if (row * cols + col < _total) {
                        _item = items[row * cols + col];
                        if (_item.image) {
                            var imageUrl = TrexConfig.getIconPath(_item.image); //글상자 > 직접선택 > 선스타일 이미지.
                            _html.push('<td class="tx-menu-list-item"><a href="javascript:;"><span class="' + (_item.klass || '') + '"><img src="' + imageUrl + '" data="' + _item.data + '"/></span></a></td>');
                        } else {
                            _html.push('<td class="tx-menu-list-item"><a href="javascript:;"><span class="' + (_item.klass || '') + '">' + _item.data + '</span></a></td>');
                        }
                    } else {
                        _html.push('<td class="tx-menu-list-item"><a href="javascript:;"><span class="">&nbsp;</span></a></td>');
                    }
                }
				_html.push('</tr>');
			}
			_html.push('</tbody>');
			_html.push('</table>');
			return _html.join("\n");
		}
	};

	Trex.String = {
		escapeQuot: function(str) {
			return str.replace(new RegExp('"', "g"), "&quot;").replace(new RegExp("'", "g"), "&#39;");
		},
		unescapeQuot: function(str) {
			return str.replace(new RegExp("&quot;", "gi"), '"').replace(new RegExp("&#39;", "g"), "'");
		},
		htmlspecialchars: function(str) {
			return Trex.String.escapeQuot(str.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;").replace(new RegExp(">", "g"), "&gt;"));
		},
		unHtmlspecialchars: function(str) {
			return Trex.String.unescapeQuot(str.replace(new RegExp("&amp;", "gi"), "&").replace(new RegExp("&lt;", "gi"), "<").replace(new RegExp("&gt;", "gi"), ">"));
		},
		parseAttribute: function(elStr, attrName){
			var regAttribute1 = new RegExp("(^|\\W)" + attrName + '="([^"]*)"', "gi");
			var regAttribute2 = new RegExp("(^|\\W)" + attrName + "='([^']*)'", "gi");
			var regAttribute3 = new RegExp("(^|\\W)" + attrName + "=([^\\s>]*)", "gi");
            var result;
			if (result = regAttribute1.exec(elStr)) {
				return result[2];
			}else if (result = regAttribute2.exec(elStr)) {
				return result[2];
			}else if (result = regAttribute3.exec(elStr)) {
				return result[2];
			}else {
				return "";
			}
		},
		changeAttribute: function(elStr, attrName, currentValue, value ){
			var regAttribute1 = new RegExp("(^|\\W)(" + attrName + '=")' + currentValue + '(")', "gi");
			var regAttribute2 = new RegExp("(^|\\W)(" + attrName + "=')" + currentValue + "(')", "gi");
			var regAttribute3 = new RegExp("(^|\\W)(" + attrName + "=)"+currentValue, "gi");
			var regAttribute4 = new RegExp("<([\\w]+\\s*)", "gi");
			var _exists = _FALSE;
			if (elStr.search(regAttribute1) > -1) {
				_exists = _TRUE;
				elStr = elStr.replace(regAttribute1, "$1$2"+value+"$3");
			}
			if (elStr.search(regAttribute2) > -1) {
				_exists = _TRUE;
				elStr = elStr.replace(regAttribute2, "$1$2"+value+"$3");
			}
			if (elStr.search(regAttribute3) > -1) {
				_exists = _TRUE;
				elStr = elStr.replace(regAttribute3, "$1$2"+value);
			}
			if(!_exists) {
				elStr = elStr.replace(regAttribute4, "<$1" + attrName + '=' + value + ' ');
			}
			return elStr;
		}
	};

	/*---- Trex.Validator ------------------------------------------------------*/
	Trex.Validator = Trex.Class.create({
		initialize: function() { },
		strip: function(content) {
			return content.stripTags().replace(/&nbsp;/g, "").replace(Trex.__WORD_JOINER_REGEXP, "").trim();
		},
		exists: function(content) {
			if(!content) {
				return _FALSE;
			}
			if(this.strip(content) == "") {
				if(content.search(/<(img|iframe|object|embed|table|hr|script|TXDB)/i) < 0) {
					return _FALSE;
				}
			}
			return _TRUE;
		},
		equals: function(content, text) {
			if(!content || !text) {
				return _FALSE;
			}
			if(content.search(/<(img|iframe|object|embed|table|hr|script|TXDB)/i) < 0) {
				if(this.strip(content) == this.strip(text)) {
					return _TRUE;
				}
			}
			return _FALSE;
		}
	});

	/*---- Trex.Repeater ------------------------------------------------------*/
	Trex.Repeater = Trex.Class.create({
		initialize: function(execHandler) {
			this.execHandler = execHandler;
		},
		start: function(term) {
			if(this.tItv) {
				this.clear();
			}
			this.tItv = _WIN.setInterval(this.onTimer.bind(this), term);
		},
		clear: function() {
			_WIN.clearInterval(this.tItv);
			this.tItv = _NULL;
		},
		onTimer: function() {
			if(this.execHandler != _NULL) {
				this.execHandler();
			}
		}
	});

	/*---- Trex.Timer ------------------------------------------------------*/
	Trex.Timer = Trex.Class.create({
		initialize: function(execHandler) {
			this.execHandler = execHandler;
		},
		start: function(term) {
			_WIN.setTimeout(this.onTimer.bind(this), term);
		},
		onTimer: function() {
			if(this.execHandler != _NULL) {
				this.execHandler();
			}
		}
	});

	/**
	 * Trex.Paging Class
	 * paging을 위한 class. Ajax나 fileter 등을 통한 dynamic data바인딩은 고려되지 않음. static array로만 사용이 가능
	 * @class
	 * @param {Array} data
	 * @param {Object} config
	  */
	Trex.Paging = Trex.Class.create({
		$const:{
			DEFAULT_PAGE_SIZE: 5,
			DEFAULT_BLOCK_SIZE:10
		},
		initialize: function(data, config ){
			this.data = data;
			this.currentpage = config.initPage || 1;
			this.totalrow = config.totalrow || this.getTotalRow();
			this.pagesize = config.pagesize || Trex.Paging.DEFAULT_PAGE_SIZE;
			this.blocksize = config.blocksize || Trex.Paging.DEFAULT_PAGE_SIZE;
			this.totalpage = Math.ceil( this.totalrow / this.pagesize );
			this.totalblock = Math.ceil( this.totalpage / this.blocksize );
		},
		getNextPage: function(){
			return (this.currentpage < this.totalpage)?this.currentpage+1:0;
		},
		getPrevPage: function(){
			return (this.currentpage > 1)?this.currentpage-1:0;
		},
		getNextBlock: function(){
			var _currentblock = Math.ceil(this.currentpage/this.blocksize);
			return ( _currentblock < this.totalblock)?_currentblock * this.blocksize + 1:0
		},
		getPrevBlock: function(){
			var _currentblock = Math.ceil(this.currentpage/this.blocksize);
			return (_currentblock > 1)?(_currentblock-2) * this.blocksize + 1:0;
		},
		getPageList: function(){
			var pages = [];
			var _startBlock = Math.ceil( this.currentpage / this.blocksize ) - 1;
			var _startPage = ( _startBlock * this.blocksize + 1 );
			var _endPage = Math.min( this.totalpage, (_startPage + this.blocksize - 1) );
			for ( var i = _startPage; i <= _endPage; i++ ){
				pages.push(i);
			}

			return pages;
		},
		movePage: function( page ){
			this.currentpage = page || this.currentpage;
		},
		getOnePageData: function(){
			var result = [];
			var _start = (this.currentpage-1) * this.pagesize;
			var _end = Math.min( this.currentpage * this.pagesize, this.totalrow ) ;
			for( var i = _start; i < _end; i++ ){
				result.push( this.data[i] );
			}

			return result;
		},
		getTotalRow: function(){
			return this.data.length;
		}
	});

	/**
	 * Trex.Slidebar Class
	 * slidebar 위젯. 마크업, CSS에 의존성이 있다.
	 * @class
	 * @param {Object} config
	  */
	Trex.Slidebar = Trex.Class.create({
		initialize: function(config){
			/* config = {
			 * 		handler: function, 슬라이드가 동작할때 실행될 함수
			 * 		elContext: 슬라이드가 제어될 영역, div등의 element
			 * 		knoWidth: knob element의 크기
			 * 		barSize: 슬라이드 element의 크기
			 * 		min: 최소값(논리적인 값, default 0)
			 *  	max: 최대값(논리적인 값, default 100)
			 *  	interval: 한번 클릭이나 마우스 드래그로 이동하는 값(논리적인 값, default 5)
			 * 		defaultValue: 초기 knob이 위치할 값
			 * }
			 */
			this.elContext = config.el;
			this.knobWidth =  config.knobWidth;
			this.isDisabled = _FALSE;
			this.handler = function(value){
				if (!this.isDisabled && typeof config.handler == "function") {
					config.handler(value);
				}
			};

			this.logicObj = {
				'interval': config.interval || 5 ,
				'min': config.min || 0,
				'max': config.max || 100
			};
			this.physicObj = {
				'min':0,
				'width': config.barSize || 100
			};
			this.physicObj.max = this.physicObj.width - this.knobWidth;
			this.physicObj.interval = this.logicObj.interval * this.physicObj.max / this.logicObj.max;

			this.startPos = 0;
			this.startX = 0;
			this.isDrag = _FALSE;
			this.result = 0;

			var elMenu = $tom.collect( this.elContext, "dd.tx-slide" );
			// 양끝단에 min값과 max값이 표시 될 수도 있다.
			$tom.collect( elMenu, "span.tx-slide-min" ).innerHTML = "";
			$tom.collect( elMenu, "span.tx-slide-max" ).innerHTML = "";

			/* default 값 셋팅하는 부분이 필요하다? */
			this.bindEvent();
			this.setKnobPosition(config.defaultValue || config.min || 0);
		},
		regenerate: function( value ){
			value = parseInt(value * this.physicObj.width / this.logicObj.max);
			this.setKnobPosition(value);
		},
		bindEvent: function(){
			var elMenu = $tom.collect( this.elContext, "dd.tx-slide" );
			var elPrev = $tom.collect( elMenu, "a.tx-slide-prev" );
			var elNext = $tom.collect( elMenu, "a.tx-slide-next" );
			var elBar = $tom.collect( elMenu, "div.tx-slide-bar" );
			var elKnob = this.elKnob = $tom.collect( elMenu, "div.tx-slide-knob" );

			$tx.observe( elKnob, "mousedown", function(ev){
				this.isDrag = _TRUE;
				this.startPos = this.getKnobPosition();
				this.startX = ev.clientX;
				$tx.stop(ev);
			}.bind(this));

			$tx.observe( elKnob, "mouseup", function(){
				this.isDrag = _FALSE;
			}.bind(this));

			$tx.observe( this.elContext, "mousemove", function(ev){
				if ( this.isDrag ){
					this.setKnobPosition( this.startPos +  ev.clientX - this.startX);
					$tx.stop(ev);
					this.handler( this.result );
				}
			}.bind(this));

			$tx.observe( elPrev, "click", function(ev){
				var count = Math.round(this.physicObj.interval) - 1;
				var that = this;
				var moveLeft = function(){
					var pos = that.getKnobPosition();
					that.setKnobPosition( pos - 1);
					if ( count-- > 0 ) {
						setTimeout(moveLeft, 10 );
					}else{
						that.handler(that.result);
					}
				};
				moveLeft();
				$tx.stop(ev);
			}.bind(this));

			$tx.observe( elNext, "click", function(ev){
				var count = Math.round(this.physicObj.interval);
				var that = this;
				var moveRight = function(){
					var pos = that.getKnobPosition();
					that.setKnobPosition( pos + 1);
					if ( --count > 0 ) {
						setTimeout(moveRight, 10 );
					}else{
						that.handler(that.result);
					}
				};
				moveRight();
				$tx.stop(ev);
			}.bind(this));

			$tx.observe( this.elContext, "mouseup", function(){
				if ( this.isDrag ) {
					this.isDrag = _FALSE;
				}
			}.bind(this));
			$tx.observe( elKnob, "click", function(ev){
				$tx.stop(ev);
			}.bind(this));

			$tx.observe( elBar, "click", function(ev){
				if ( !this.isDrag ) {
					var x = ev.layerX || ev.x;
					this.setKnobPosition( x - this.knobWidth / 2);
					this.handler( this.result );
				}
			}.bind(this));
		},
		getKnobPosition: function(){
			var pos = $tx.getStyle( this.elKnob, "left");
			return pos.parsePx();
		},
		setKnobPosition: function(value){
			value = (value < this.physicObj.max)?value:this.physicObj.max;
			value = (value > this.physicObj.min)?value:this.physicObj.min;
			$tx.setStyle( this.elKnob, {left: value.toPx()});

			this.result = Math.round( value * this.logicObj.interval / this.physicObj.interval );
		},
		setDisable: function(){
			this.isDisabled = _TRUE;
		},
		setEnable: function(){
			this.isDisabled = _FALSE;
		},
		getDisabled: function(){
			return this.isDisabled;
		}
	});


	/**
	 * Trex.DynamicSizer Class
	 * table의 가로세로 사이즈를 마우로 제어할 수 있는 위젯.
	 * @class
	 * @param {Object} config
	  */
	Trex.DynamicSizer = Trex.Class.create({
		initialize: function(config){
			/* config = {
			 * 		el: //다이나믹 사이저가 실릴 영역
			 * 		clickHandler : 클릭됐을때
			 * 		moveHandler: 사이즈가 변경됐을 때
			 */
			this.config = config;
			this.wrapper = config.el;
			this.elEventContext = tx.div({className:"tx-dynamic-sizer-context"});
			this.currentSize = {row: 0, col: 0};
			this.dynamicSizingEnabled = _TRUE;

			if( !config.moveHandler ){
				config.moveHandler = function(){}
			}
			if( !config.clickHandler ){
				config.clickHandler = function(){}
			}

			this.wrapper.appendChild( this.elEventContext );
			this.previewTable = new Trex.DynamicSizer.PreviewTable({
				parentEl: this.elEventContext,
				mouseOverHandler: this.changeSize.bind(this),
				mouseClickHandler: this.selectSize.bind(this)
			});
		},
		clear: function(){
			this.dynamicSizingEnabled = _TRUE;
			this.changeSize(0,0);
		},
		changeSize: function(row, col){
			if (this.dynamicSizingEnabled) {
				this.currentSize.row = row;
				this.currentSize.col = col;

				this._changeSelectionSize(row, col);
				this.config.moveHandler(row, col);
			}
		},
		_changeSelectionSize: function(row, col){
			this.previewTable.moveSelectionPos(row, col);
		},
		toggleDynamicSizing: function(){
			this.dynamicSizingEnabled = !this.dynamicSizingEnabled;
			if ( this.dynamicSizingEnabled ){
				this.selection.enableResize();
			}else{
				this.selection.disableResize();
			}
		},
		selectSize:function(ev){
			this.config.clickHandler( ev, this.currentSize);
		},
		getCurruentSize: function(){
			return this.currentSize;
		}
	});

    Trex.DynamicSizer.PreviewTable = Trex.Class.create({
        $const:{
            DEFAULT_TD_STYLE:{
            },
            DEFAULT_TABLE_PROPERTY:{
                cellpadding: "0",
                cellspacing: "1"
            },
            MAX_SIZE: { COL:10, ROW:10 }
        },
        initialize: function(config){
            this.config = config;
            this.elTable = _NULL;

            this.elTable = this.generateTable("tx-event");
            this.elSelection = tx.div( {className:"tx-selection"}, this.generateTable("tx-selection") );
            var tablePanel = this.generateTable("tx-panel");

            this.eventBinding();
            config.parentEl.appendChild( this.elTable );
            config.parentEl.appendChild( this.elSelection );
            config.parentEl.appendChild( tablePanel );

            var pos = $tom.getPosition( this.elTable );
            var PROPERTY = Trex.DynamicSizer.PreviewTable.MAX_SIZE;
            this.cellSize = { width: Math.round((pos.width - pos.x) / PROPERTY.COL),
                                height: (pos.height - pos.y) / PROPERTY.ROW }
        },
        generateTable: function(className){
            var tbody = tx.tbody();
            var PROPERTY = Trex.DynamicSizer.PreviewTable;
            for (var i = 0; i < PROPERTY.MAX_SIZE.ROW; i++) {
                var tr = tx.tr();
                for (var j = 0; j < PROPERTY.MAX_SIZE.COL; j++) {
                    var td = tx.td(tx.div( {
                        style: PROPERTY.DEFAULT_TD_STYLE
                    }));
                    td = this.setCoordToAttr(td, j+1, i+1);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            var table = tx.table(PROPERTY.DEFAULT_TABLE_PROPERTY);
            $tx.addClassName( table, className || "" );
            table.appendChild( tbody );
            return table;
        },
        moveSelectionPos: function(row,col){
            var width = ( col * this.cellSize.width).toPx();
            var height = ( row * this.cellSize.height).toPx();
            $tx.setStyle( this.elSelection, { width: width, height:height } );
        },
        setCoordToAttr: function(element, col, row){
            element.setAttribute("col", col);
            element.setAttribute("row", row);
            return element;
        },
        getCoordFromAttr: function(element){
            return {
                col: element.getAttribute("col") || 0,
                row: element.getAttribute("row") || 0
            }
        },
        eventBinding: function(){
            // 외부에서 받은 event핸들러들로 binding시킴
            this.mouseOverHandler = this.config.mouseOverHandler;
            this.mouseClickHandler = this.config.mouseClickHandler;
            var self = this;
            var _mouseOverHandler = function(ev){
                var element = $tx.element(ev) || {};
                var tagName = (element.tagName || "").toUpperCase();
                if (element && tagName == "TD" ) {
                    var coord = self.getCoordFromAttr(element);
                    self.mouseOverHandler(coord.row, coord.col);
                }
                $tx.stop(ev);
            };
            var _mouseClickHandler = function(ev){
                self.mouseClickHandler(ev);
            };
            $tx.observe(this.elTable, "mouseover", _mouseOverHandler);
            $tx.observe(this.elTable, "click", _mouseClickHandler);
        }
    });

    /*---- Trex.ImageScale ------------------------------------------------------*/
    Trex.ImageScale = Trex.Class.create({
        initialize: function(data, handler) {
            if(!data.imageurl) {
                return;
            }
            if(data.actualwidth) {
                return;
            }
            var _loadHandler = function(width, height) {
                data.actualwidth = width;
                data.actualheight = height;
                if(handler) {
                    handler(width, height);
                }
            };

            setTimeout(function() {
                var _tmpImage = new Image();
                _tmpImage.onerror = function() {
                    _tmpImage = _NULL;
                };
                if( _tmpImage.onreadystatechange ) { //IE
                    _tmpImage.onreadystatechange = function() {
                        if(this.readyState == "complete") {
                            _loadHandler(this.width, this.height);
                            _tmpImage = _NULL;
                        }
                    };
                } else {
                    _tmpImage.onload = function() {
                        _loadHandler(this.width, this.height);
                        _tmpImage = _NULL;
                    };
                }
                _tmpImage.src = data.imageurl;
            }, 10);
        }
    });

    function getIconPath(virtualPath) {
        var realPath = TrexConfig.getIconPath(virtualPath);
        return realPath + "";
    }

})(Trex);
