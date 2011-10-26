/**
 * @fileOverview
 * Textarea (source, text) 영역의 컨텐츠를 수정, 관리하기 위한 TextPanel 관련 Source
 */

/**
 * 텍스트모드의 컨텐츠를 수정, 관리하기 위한 클래스
 *
 * @class
 * @extends Trex.Canvas.BasedPanel
 * @param {Object} canvas
 * @param {Object} config - canvas의 config
 */
Trex.Canvas.TextPanel = Trex.Class.create(/** @lends Trex.Canvas.TextPanel.prototype */{
	/** @ignore */
	$extend: Trex.Canvas.TextareaPanel,
	/** @ignore */
	$const: {
		/** @name Trex.Canvas.TextPanel.__MODE */
		__MODE: Trex.Canvas.__TEXT_MODE
	},
	initialize: function(canvas, config) {
		this.$super.initialize(canvas, config);
		this.bindEvents();
	},
	bindEvents: function() {
		var _handlers = {
			keydown: function(){},
			keyup: function(){},
			mousedown: function(){},
			mouseup: function(){},
			click: function(ev) {
				this.canvas.fireJobs(Trex.Ev.__CANVAS_TEXT_PANEL_CLICK, ev);
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
		return $must("tx_canvas_text" + _initializedId, "Trex.Canvas.TextPanel");
	},
	/**
	 * panel 엘리먼트를 감싸고 있는 wrapper 엘리먼트를 가지고 온다.
	 * @function
	 */
	getHolder: function(config) {
		var _initializedId = ((config.initializedId)? config.initializedId: "");
		return $must("tx_canvas_text_holder" + _initializedId, "Trex.Canvas.TextPanel");
	}
});

Trex.module("interrupt enter key action @ text panel",
	function(editor, toolbar, sidebar, canvas) {
		var _newlinepolicy = canvas.config.newlinepolicy;
		var _insertbr = canvas.config.insertbr;
		if (_newlinepolicy == "br" && _insertbr) {
			canvas.observeJob(Trex.Ev.__CANVAS_SOURCE_PANEL_KEYDOWN, function(ev){
				if (canvas.isWYSIWYG()) {
					return;
				}
				canvas.getProcessor().controlEnter(ev);
			});
		}	
	}
);
