/**
 * @fileoverview 
 * OL을 삽입하는 '번호매기기' Source,
 * Class Trex.Tool.OrderedList와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"ordered",
	{
		sync: _TRUE,
		status: _TRUE
	}
);

Trex.Tool.OrderedList = Trex.Class.create({
	$const: {
		__Identity: 'ordered'
	},
	$extend: Trex.Tool,
	$mixins: [Trex.I.ListExecution],
	oninitialized: function() {
		var _tool = this;
		var _canvas = this.canvas;
		var _toolbar = this.toolbar;

		var _toolHandler = function() {
			_toolbar.tools["unordered"].button.normalState();
			/*if(_toolbar.tools["ordered"].button.isPushed()){
				return _FALSE;
			}*/
			
			_canvas.execute(function(processor) {
				var _bNode = processor.findNode('%listhead');
				if (_bNode) {
					if ($tom.kindOf(_bNode, "ol")) {
						_tool.executeOffList(processor);
					} else {
						_tool.executeToList(processor, "ol", {});
					}
				} else {
					_tool.executeToList(processor, "ol", {});
				}
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			_NULL,
			/* handler */
			_toolHandler
		);

		var _cachedProperty = _NULL;
		_canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
			var _data = _canvas.query(function(processor) {
				return processor.queryCommandState('insertorderedlist');
			});
			if(_cachedProperty == _data) {
				return;
			}
			_tool.button.setState(_data);
			_cachedProperty = _data;
		});
		
		this.bindKeyboard({ // ctrl + o
			ctrlKey: _TRUE,
			altKey: _TRUE,
			keyCode: 79
		}, _toolHandler);
	}
	
});