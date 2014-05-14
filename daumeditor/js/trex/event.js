/**
 * @fileoverview  
 * 사용자 정의 이벤트를 미리 정의
 */

(function(Trex) {
	/**
	 *  @namespace 
	 *  @name Trex.Ev
	 */
	Trex.Ev = /** @lends Trex.Ev */ {
		/** wysiwyg mode */
		__EDITOR_PANEL_MOUSEDOWN: 'editor.panel.mousedown',
        /**
         * Editor에 데이터의 셋팅이 시작되면 발생하는 이벤트
         * @example
         * 	editor.observeJob(Trex.Ev.__EDITOR_LOAD_DATA_BEGIN, function(ev) {
		 *	});
         */
        __EDITOR_LOAD_DATA_BEGIN: 'editor.load.data.begin',
        /**
         * Editor에 데이터의 셋팅이 완료되면 발생하는 이벤트
         * @example
         * 	editor.observeJob(Trex.Ev.__EDITOR_LOAD_DATA_END, function(ev) {
		 *	});
         */
        __EDITOR_LOAD_DATA_END: 'editor.load.data.end',
		/**
		 * wysiwyg 영역에 발생하는 keydown 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_KEYDOWN, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_KEYDOWN: 'canvas.panel.keydown',
		/** 
		 * wysiwyg 영역에 발생하는 keyup 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_KEYUP, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_KEYUP: 'canvas.panel.keyup',
		/** 
		 * wysiwyg 영역에 발생하는 mousedown 이벤트<br/>
		 * Element Observer 보다 늦게 실행되며, mouseclick 보다 앞서 실행된다.
		 * 경우에 따라 상위 엘리먼트까지 탐색하여 실행하는 Element Observer를 사용한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(ev) {
		 *		//execute function
		 *	});
		 *  canvas.observeElement({ tag: "img", klass: "txc-image" }, function(element) {
		 *		//execute function with element
		 *	});
		 */
		__CANVAS_PANEL_MOUSEDOWN: 'canvas.panel.mousedown',
		/** 
		 * wysiwyg 영역에 발생하는 mouseup 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_MOUSEUP: 'canvas.panel.mouseup',
		/** 
		 * wysiwyg 영역에 발생하는 mouseover 이벤트<br/>
		 * wysiwyg 영역에서 마우스를 움직일 때마다 발생하므로 과하게 사용하지 않도록 한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEOVER, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_MOUSEOVER: 'canvas.panel.mouseover',
		/** 
		 * wysiwyg 영역에 발생하는 mouseout 이벤트<br/>
		 * wysiwyg 영역에서 마우스를 움직일 때마다 발생하므로 과하게 사용하지 않도록 한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEOUT, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_MOUSEOUT: 'canvas.panel.mouseout',
        /**
         * wysiwyg 영역에 발생하는 movemove 이벤트<br/>
         * wysiwyg 영역에서 마우스를 움직일 때마다 발생하므로 과하게 사용하지 않도록 한다.
         * @example
         * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEMOVE, function(ev) {
		 *	});
         */
        __CANVAS_PANEL_MOUSEMOVE: 'canvas.panel.mousemove',
		/** 
		 * wysiwyg 영역에 발생하는 click 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_CLICK, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_CLICK: 'canvas.panel.click',
		/** 
		 * wysiwyg 영역에서 발생하는 더블클릭 이벤트<br/>
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DBLCLICK, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_DBLCLICK: 'canvas.panel.dbclick',
		/** 
		 * wysiwyg 영역에서 발생하는 붙여넣기 이벤트<br/>
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_PASTE, function() {
		 *	});
		 */
		__CANVAS_PANEL_PASTE: 'canvas.panel.paste',
		/** 
		 * wysiwyg 영역에서 발생하는 스크롤 변경 이벤트<br/>
		 * 이 이벤트는 wysiwyg 영역의 스크롤 높이가 변경되거나 위치가 변경될 경우 발생한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_SCROLLING, function(ev) {
		 *	});
		 */
		__CANVAS_PANEL_SCROLLING: 'canvas.panel.scrolling',
		/** 
		 * wysiwyg 영역이 로드되었을 경우 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(ev) {
		 *	});
		 */
		__IFRAME_LOAD_COMPLETE: 'iframe.load.complete',
        /**
         * wysiwyg 영역이 loading 되기까지 걸린시간을 알리는 이벤트
         */
        __IFRAME_LOADING_TIME: 'iframe.loading.time',
		/** 
		 * HTML모드(소스모드) 영역에서 발생하는 click 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_CLICK, function(ev) {
		 *	});
		 */
		__CANVAS_SOURCE_PANEL_CLICK: 'canvas.source.panel.click',
		/** 
		 * HTML모드(소스모드) 영역에서 발생하는 keydown 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_KEYDOWN, function(ev) {
		 *	});
		 */
		__CANVAS_SOURCE_PANEL_KEYDOWN: 'canvas.source.panel.mousedown',
		/** 
		 * HTML모드(소스모드) 영역에서 발생하는 mousedown 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_MOUSEDOWN, function(ev) {
		 *	});
		 */
		__CANVAS_SOURCE_PANEL_MOUSEDOWN: 'canvas.source.panel.mousedown',
		/** 
		 * 텍스트모드 영역에서 발생하는 click 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_TEXT_PANEL_CLICK, function(ev) {
		 *	});
		 */
		__CANVAS_TEXT_PANEL_CLICK: 'canvas.text.panel.click',
		/** 
		 * 모드가 변경될 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function(from, to) {
		 *		//from - 변경되기 전 모드
		 *		//to - 변경되고난 후 모드
		 *	});
		 */
		__CANVAS_MODE_CHANGE: 'canvas.mode.change',
        /**
         * 전체화면용 canvas로 변경 시 발생
         */
        __CANVAS_FULL_SCREEN_CHANGE: 'canvas.fullscreen.change',
        /**
         * 일반화면용 canvas로 변경 시 발생
         */
        __CANVAS_NORMAL_SCREEN_CHANGE: 'canvas.normalscreen.change',
		/**
		 * 툴바의 버튼이 눌렸을 경우 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__TOOL_CLICK, function(identity) {
		 *		//identity - tool의 Identity(bold, aligncenter...)
		 *	});
		 */
		__TOOL_CLICK: 'toolbar.button.click',
        /**
         * 툴이 단축키에 의해 실행 되었을 경우 발생
         */
        __TOOL_SHORTCUT_KEY: 'toolbar.shortcut',
		/** 
		 * Editor.save()가 호출되었을 경우 발생하는 사용자 정의 이벤트<br/>
		 * 실제 form이 submit이 되기 전에 발생한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__ON_SUBMIT, function(editor) {
		 *		//editor - editor 객체
		 *	});
		 */
		__ON_SUBMIT: "editor.submit",
		/** 
		 * 에디터 래퍼의 너비가 변경된 후 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_WRAP_WIDTH_CHANGE, function() {
		 *	});
		 */
		__CANVAS_WRAP_WIDTH_CHANGE: 'canvas.wrap.width.change',
		/** 
		 * 에디터의 높이가 변경된 후 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(height) {
		 *		//height - 변경된 높이
		 *	});
		 */
		__CANVAS_HEIGHT_CHANGE: 'canvas.height.change',
		/** 
		 * wysiwyg 영역에서 키이벤트나 마우스이벤트가 발생할 경우 발생하는 사용자 정의 이벤트<br/>
		 * 주로 툴바 버튼의 상태를 표시할 때에 사용한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
		 *	});
		 */
		__CANVAS_PANEL_QUERY_STATUS: 'canvas.panel.style.change',
		/** 
		 * wysiwyg 영역에서 delete 키가 눌렸을 경우 발생하는 사용자 정의 이벤트<br/>
		 * 주로 컨텐츠와 동기화를 맞추기 위해 사용한다.
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DELETE_SOMETHING, function() {
		 *	});
		 */
		__CANVAS_PANEL_DELETE_SOMETHING: 'canvas.panel.delkey.press',
		/** 
		 * Entry Box에 Entry가 추가되었을 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, function(entry) {
		 *		//생성된 entry 객체를 인자로 받는다.
		 *	});
		 */
		__ENTRYBOX_ENTRY_ADDED: 'entrybox.entryadded',
        /**
         * wysiwyg 영역에서 backspace 키가 눌렸을 경우 발생하는 사용자 정의 이벤트<br/>
         * 테이블 삭제를 위해 사용한다.
         * @example
         * 	canvas.observeJob(Trex.Ev.__CANVAS_PANEL_BACKSPACE_TABLE, function() {
		 *	});
         */
        __CANVAS_PANEL_BACKSPACE_TABLE: 'canvas.panel.backspace.table',
		/** 
		 * Entry Box의 Entry가 수정되었을 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_MODIFIED, function(entry) {
		 *		//수정된 entry 객체를 인자로 받는다.
		 *	});
		 */
		__ENTRYBOX_ENTRY_MODIFIED: 'entrybox.entrymodified',
		/** 
		 * Entry Box에서 Entry가 제거되었을 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, function(entry) {
		 *		//삭제될 entry 객체를 인자로 받는다.
		 *	});
		 */
		__ENTRYBOX_ENTRY_REMOVED: 'entrybox.entryremoved',
		/** 
		 * Entry Box에서 모든 Entry가 제거되었을 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ENTRYBOX_ALL_ENTRY_REMOVED, function() {
		 *	});
		 */
		__ENTRYBOX_ALL_ENTRY_REMOVED: 'entrybox.removed.all.perfectly',
        /**
		 * Entry Box에서 Entry의 추가/수정/삭제로 capacity가 변경 될 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ENTRYBOX_CAPACITY_UPDATE, function(capacity) {
		 *	});
		 */
		__ENTRYBOX_CAPACITY_UPDATE: 'entrybox.capacity.update',
		/** 
		 * Attach Box가 보여질 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ATTACHBOX_SHOW, function() {
		 *	});
		 */
		__ATTACHBOX_SHOW: 'attachbox.show',
		/** 
		 * Attach Box가 감춰질 때 발생하는 사용자 정의 이벤트
		 * @example
		 * 	attachbox.observeJob(Trex.Ev.__ATTACHBOX_HIDE, function() {
		 *	});
		 */
		__ATTACHBOX_HIDE: 'attachbox.hide',
        /**
         * fullscreen 상태에서 Attach Box가 보여질 때 발생하는 사용자 정의 이벤트
         * @example
         * 	attachbox.observeJob(Trex.Ev.__ATTACHBOX_FULLSCREEN_SHOW, function() {
		 *	});
         */
        __ATTACHBOX_FULLSCREEN_SHOW: 'attachbox.fullscreen.show',
        /**
         * fullscreen 상태에서 Attach Box가 감춰질 때 발생하는 사용자 정의 이벤트
         * @example
         * 	attachbox.observeJob(Trex.Ev.__ATTACHBOX_FULLSCREEN_HIDE, function() {
		 *	});
         */
        __ATTACHBOX_FULLSCREEN_HIDE: 'attachbox.fullscreen.hide',
		/** 
		 * 에디터 페이지를 벗어나기 전에 발생하는 사용자 정의 이벤트
		 * @example
		 * 	canvas.observeJob(Trex.Ev.__CANVAS_BEFORE_UNLOAD, function() {
		 *	});
		 */
		__CANVAS_BEFORE_UNLOAD: 'canvas.unload',
		/** 
		 * 각 첨부가 추가될 때 발생하는 사용자 정의 이벤트<br/>
		 * entry가 생성되고 본문에 삽입이 완료되고 호출된다.
		 * 실제로는 entry 부분이 첨부의 Identity(image, movie, media...)로 대체된다.
		 * @abstract
		 * @example
		 * 	canvas.observeJob('canvas.movie.added', function(entry) {
		 *		//생성된 entry 객체를 인자로 받는다.
		 *	});
		 */
		__CANVAS_ENTRY_ADDED: 'canvas.entry.added',
		/** 
		 * 툴을 이용해 wysiwyg에 요소가 삽입이 될 때 발생하는 사용자 정의 이벤트
		 * @abstract
		 * @example
		 * 	toolbar.observeJob('cmd.textbox.added', function(node) {
		 *		//필요에 따라 만들어진 요소 엘리먼트
		 *	});
		 */
		__COMMAND_NODE_ADDED: 'cmd.entry.added',
		/** 
		 * 왼쪽 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_LEFT: 'align.left',
		/** 
		 * 가운데 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_CENTER: 'align.center',
		/** 
		 * 오른쪽 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_RIGHT: 'align.right',
		/** 
		 * 양쪽 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_FULL: 'align.full',
		/** 
		 * 이미지 왼쪽 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_IMG_LEFT: 'align.img.left',
		/** 
		 * 이미지 가운데 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_IMG_CENTER: 'align.img.center',
		/** 
		 * 이미지 왼쪽흐름 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_IMG_FLOAT_LEFT: 'align.img.floatleft',
		/** 
		 * 이미지 오른쪽흐름 정렬을 실행하고서 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CMD_ALIGN_IMG_FLOAT_RIGHT: 'align.img.floatright',
        /**
         * 툴바의 축소를을 실행하고 발생하는 사용자 정의 이벤트
         */
        __CMD_ADVANCED_FOLD: 'toolbar.advanced.fold',
        /**
         * 툴바의 확장을 실행하고 발생하는 사용자 정의 이벤트
         */
        __CMD_ADVANCED_SPREAD: 'toolbar.advanced.spread',
		/**
		 * table 의 border 를 조정하는 세가지 속성중에 한가지가 변경될 때 발생함.
		 * border 의 세가지 속성: cellslinecolor, cellslineheight, cellslinestyle.
		 * @private
		 */
		__TOOL_CELL_LINE_CHANGE: 'tool.cell.line.change',
		/** 
		 * 에디터 로딩할 때 현재 모드와 config의 모드가 다를 때 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CANVAS_MODE_INITIALIZE: 'canvas.mode.initialize',
		/** 
		 * 에디터 로딩할 때 컨텐츠를 초기화한 후 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__CANVAS_DATA_INITIALIZE: 'canvas.load.data',
		/** 
		 * Attach Box의 ENTRY의 상태가 변경될 때 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__ENTRYBOX_ENTRY_REFRESH: 'entrybox.entryrefresh',
		/** 
		 * 정보첨부가 삽입될 때 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__PASTE_SEARCHRESULT: 'trex.paste.info',
		/** 
		 * 에디터에서 런타임에러가 났을 때 발생하는 사용자 정의 이벤트
		 * @private
		 */
		__RUNTIME_EXCEPTION: "editor.runtime.exception",
		/** 
		 * 에디터 장애 로그를 남길 때 발생하는 사용자 정의 이벤트<br/>
		 * 로그를 전송한 후 실행 된다.
		 * @private
		 */
        __REPORT_TO_MAGPIE: "editor.report.magpie",
        /**
         * 자동저장 리스트를 열 때 발생하는 사용자 정의 이벤트
         * @private
         */
        __SHOULD_CLOSE_MENUS: "editor.shouldclosemenus",
        /**
         * wysiwyg 영역에서 발생하는 이미지의 더블클릭 이벤트<br/>
         * @example
         * 	canvas.observeJob(Trex.Ev.__CANVAS_IMAGE_PLACEHOLDER_DBLCLICK, function(ev) {
		 *	});
         */
        __CANVAS_IMAGE_PLACEHOLDER_DBLCLICK: 'canvas.image.placeholder.dbclick',
        /**
         * 툴바의 레이어형 메뉴가 화면에 표시되면 호출.
         */
        __MENU_LAYER_SHOW: 'menu.layer.show',
        /**
         * 툴바의 레이어형 메뉴가 화면에 사라지면 호출.
         */
        __MENU_LAYER_HIDE: 'menu.layer.hide',
        /**
         * 툴바의 레이어형 메뉴의 크기가 변경되면 호출.
         */
        __MENU_LAYER_CHANGE_SIZE: 'menu.layer.change.size'

	};
})(Trex);

/** @namespace */
var TrexEvent = {
	/**
	 * fires observer for target element 
	 * @param {Object} el
	 * @param {Object} handles
	 */
	fire: function(el, handles){
		if (el && el.tagName) {
			var fn = handles[el.tagName.toLowerCase()];
			if (fn) {
				fn(el, handles);
			}else {
				TrexEvent.propagateToParent(el, handles);
			}
		}else {
			console.log("Not Supported Type : " + el);
		}
	},
	propagateToParent : function(element, handles){
		var _el = element.parentNode;
		if(_el && _el.tagName && _el.tagName.toLowerCase ){
			var fn = handles[_el.tagName.toLowerCase()];
			if(fn){
				fn(_el, handles);
			}else{
				TrexEvent.propagateToParent(_el, handles);
			}
		}
	},
	stopPropagation : function(){ }
};

