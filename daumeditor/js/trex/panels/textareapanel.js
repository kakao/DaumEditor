/**
 * @fileOverview
 * 이 클래스는 BasedPanel 을 상속받는다.
 * 또한 TextPanel 과 HtmlPanel 가 이 클래스를 상속한다.
 */

/**
 * TextareaPanel
 *
 * @class
 * @extends Trex.Canvas.BasedPanel
 * @param {Object} canvas
 * @param {Object} config - canvas의 config
 */
Trex.Canvas.TextareaPanel = Trex.Class.create(/** @lends Trex.Canvas.TextareaPanel.prototype */{
	/** @ignore */
	$extend: Trex.Canvas.BasedPanel,
	/** @ignore */
	initialize: function(canvas, config) {
		this.$super.initialize(canvas, config);
		
		var _processor = new Trex.Canvas.TextAreaProcessor(this.el);
		/**
		 * 생성된 Processor 객체를 리턴한다.
		 * @function
		 * @returns {Object} Processor 객체
		 */
		this.getProcessor = function() {
			return _processor;
		};
		
		this.lastHeight = (this.lastHeight - 9*2).toPx();//"382px";
		if ( !!config.readonly ){
			this.setReadOnly();
		}
	},
	/**
	 * panel을 보이게한다.
	 * @function
	 */
	show: function() {
		this.$super.show();
		var _elHolder = this.elHolder;
		var _processor = this.getProcessor();
		setTimeout(function(){
			try {
				_processor.focusOnTop(); //모드 변경시 focus 제일 위로 가게함..
			} catch (ignore) {}
			if ($tx.msie6) { //NOTE: #FTDUEDTR-174
				_elHolder.style.padding = "1px";
				setTimeout(function(){
					_elHolder.style.padding = "0px";
				}, 0);
			}			
		}, 100);
	},
	/**
	 * 컨텐츠 영역의 컨텐츠를 주어진 문자열로 수정한다. 
	 * @function
	 * @param {String} content - 컨텐츠
	 */
	setContent: function(content) {
		this.el.value = content;
	},
	/**
	 * 컨텐츠 영역에 쓰여진 컨텐츠를 얻어온다. 
	 * @function
	 * @returns {String} 컨텐츠 문자열
	 */
	getContent: function() {
		return this.el.value;
	},
	/**
	 * panel 영역의 높이를 얻어온다.
	 * @function
	 * @returns {String} textarea 영역의 높이 (px)
	 */
	getPanelHeight: function() { 
		return ($tom.getHeight(this.el).parsePx() + 2).toPx(); 
	},
	/**
	 * panel 영역의 높이를 셋팅한다.
	 * @function
	 * @param {Number} width - textarea 영역의 넓이 (px)
	 */
	setPanelHeight: function(height) {
		this.$super.setPanelHeight((height.parsePx() - 2).toPx());
	},
	/**
	 * panel의 readonly를 속성을 setting함으로써 글쓰기를 제한한다.
	 * @function
	 */
	setReadOnly: function(){
		this.el.readOnly = _TRUE;
	}
});