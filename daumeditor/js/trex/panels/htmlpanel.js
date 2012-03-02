/**
 * @fileOverview
 * Textarea (source, text) 영역의 컨텐츠를 수정, 관리하기 위한 HtmlPanel 관련 Source
 */

/**
 * HTML모드(소스모드)의 컨텐츠를 수정, 관리하기 위한 클래스
 *
 * @class
 * @extends Trex.Canvas.BasedPanel
 * @param {Object} canvas
 * @param {Object} config - canvas의 config
 */
Trex.Canvas.HtmlPanel = Trex.Class.create(/** @lends Trex.Canvas.HtmlPanel.prototype */{
	/** @ignore */
	$extend: Trex.Canvas.TextareaPanel,
	/** @ignore */
	$const: {
		/** @name Trex.Canvas.HtmlPanel.__MODE */
		__MODE: Trex.Canvas.__HTML_MODE
	},
	initialize: function(canvas, config) {
		this.$super.initialize(canvas, config);
		this.bindEvents();

		if($tx.msie_ver == '8') { //NOTE: #FTDUEDTR-963
			this.el.setAttribute('style', 'width: 500px; min-width: 100%; max-width: 100%;');
		}
        if (!config.styles.notApplyBgColorOnSourceMode) {
            if ( config.styles.backgroundColor ){
                $tx.setStyle( this.el, {
                    backgroundColor: config.styles.backgroundColor
                });
            }
            if ( config.styles.color ){
                $tx.setStyle( this.el, {
                    color: config.styles.color
                });
            }
        }
	},
	bindEvents: function() {
		var _handlers = {
			keydown: function(ev){
				this.canvas.fireJobs(Trex.Ev.__CANVAS_SOURCE_PANEL_KEYDOWN, ev);
			},
			keyup: function(){
				var processor = this.canvas.getProcessor();
				if (processor && processor.savePosition) {
					processor.savePosition();
				}
			},
			mousedown: function(ev){
				this.canvas.fireJobs(Trex.Ev.__CANVAS_SOURCE_PANEL_MOUSEDOWN, ev);
			},
			mouseup: function(){
				var processor = this.canvas.getProcessor();
				if (processor && processor.savePosition) {
					processor.savePosition();
				}
			},
			click: function(ev) {
				this.canvas.fireJobs(Trex.Ev.__CANVAS_SOURCE_PANEL_CLICK, ev);	
			}
		};
		for(var _eventType in _handlers){
			$tx.observe(this.el, _eventType, _handlers[_eventType].bind(this), _TRUE);
		}
	},
	/**
	 * panel 엘리먼트를 가지고 온다.
	 * @function
	 */
	getPanel: function(config) {
		var _initializedId = ((config.initializedId)? config.initializedId: "");
		return $must("tx_canvas_source" + _initializedId, "Trex.Canvas.HtmlPanel");
	},
	/**
	 * panel 엘리먼트를 감싸고 있는 wrapper 엘리먼트를 가지고 온다.
	 * @function
	 */
	getHolder: function(config) {
		var _initializedId = ((config.initializedId)? config.initializedId: "");
		return $must("tx_canvas_source_holder" + _initializedId, "Trex.Canvas.HtmlPanel");
	},
	/**
	 * 컨텐츠 영역의 컨텐츠를 주어진 문자열로 수정한다. 
	 * @function
	 * @param {String} content - 컨텐츠
	 */
	setContent: function(content) {
		var validator = new Trex.Validator();
		if (validator.exists(content)) {
			this.$super.setContent(content);
		} else {
			this.$super.setContent("");
		}
	}
});