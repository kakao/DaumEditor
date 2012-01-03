/**
 * @fileOverview
 * 각 panel의 컨텐츠를 수정, 관리하기 위한 추상 클래스 관련 Source
 */

/**
 * 각 panel의 컨텐츠를 수정, 관리하기 위한 클래스로 <br/>
 * WysiwygPanel, HtmlPanel, TextPanel에서 상속받아 사용한다. <br/>
 *
 * @abstract
 * @class
 * @param {Object} canvas
 * @param {Object} config - canvas의 config
 */
Trex.Canvas.BasedPanel = Trex.Class.draft(/** @lends Trex.Canvas.BasedPanel.prototype */{
	initialize: function(canvas, config) {
		this.config = config;
		this.canvas = canvas;
		
		this.elHolder = this.getHolder(config);
		this.el = this.getPanel(config);
		if(!this.el) {
			throw new Error("[Exception]Trex.Canvas.Panel : panel element is not founded");
		}

		var _name = this.constructor.__MODE;
		/**
		 * panel의 이름을 리턴한다. 
		 * @function
		 * @returns {String} 'html'
		 */
		this.getName = function() { return _name; };
		
		this.lastHeight = _NULL;
	},
	/**
	 * 컨텐츠 영역에 포커스를 준다.
	 * @function
	 */
	focus: function() {
		this.el.focus();
	},
	/**
	 * panel을 보이게한다.
	 * @function
	 */
	show: function() {
		try{
			$tx.show(this.elHolder);
		}catch(e){}
	},
	/**
	 * panel을 감춘다.
	 * @function
	 */
	hide: function() {
		try{
			$tx.hide(this.elHolder);
		}catch(e){}
	},
	/**
	 * 스타일명으로 컨텐츠 영역의 스타일 값을 얻어온다.
	 * @function
	 * @param {String} name - 스타일명
	 * @returns {String} 해당 스타일 값
	 */
	getStyle: function(name) {
		if(this.el.style[name]) {
			return this.el.style[name];
		} else {
			return _NULL;
		}
	},
	/**
	 * 컨텐츠 영역에 스타일을 적용한다.
	 * @function
	 * @param {Object} styles - 적용할 스타일
	 */
	addStyle: function(styles) {
		for(var name in styles) {
			if(this.el.style[name]) {
				this.el.style[name] = styles[name];
			}
		}
	},
	/**
	 * panel 영역의 x,y 위치와 넓이, 높이 값을 얻어온다.
	 * @function
	 * @returns {Object} position 객체 = {
	 *								x: number,
	 *								y: number,
	 *								width: number,
	 *								height: number
	 *						}
	 */
	getPosition: function(){
		return $tom.getPosition(this.el);
	},
	/**
	 * panel 영역의 높이를 얻어온다.
	 * @function
	 * @returns {String} textarea 영역의 높이 (px)
	 */
	getPanelHeight: function() { 
		return $tom.getHeight(this.el).toPx(); 
	},
	/**
	 * panel 영역의 높이를 셋팅한다.
	 * @function
	 * @param {Number} height - textarea 영역의 넓이 (px)
	 */
	setPanelHeight: function(height) {
		height = height.toPx();
		if(this.lastHeight == height) {
			return;
		}
		$tom.setHeight(this.el, height);
		this.lastHeight = height;
	}
});
