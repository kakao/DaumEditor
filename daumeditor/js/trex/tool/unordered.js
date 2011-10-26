/**
 * @fileoverview 
 * UL을 삽입하는 '글머리 기호' Source,
 * Class Trex.Tool.UnorderedList 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"unordered",
	{
		sync: _TRUE,
		status: _TRUE
	}
);

Trex.Tool.UnorderedList = Trex.Class.create({
	$const: {
		__Identity: 'unordered'
	},
	$extend: Trex.Tool,
	$mixins: [Trex.I.ListExecution],
	oninitialized: function() {
		var _tool = this;
		var _canvas = this.canvas;
		var _toolbar = this.toolbar;
		
		var _toolHandler = function() {
			_toolbar.tools["ordered"].button.normalState();
			/*if(_toolbar.tools["unordered"].button.isPushed()){
				return _FALSE;
			}*/
			
			_canvas.execute(function(processor) {
				var _bNode = processor.findNode('%listhead');
				if (_bNode) {
					if ($tom.kindOf(_bNode, "ul")) {
						_tool.executeOffList(processor);
					} else {
						_tool.executeToList(processor, "ul", {});
					}
				} else {
					_tool.executeToList(processor, "ul", {});
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
				return processor.queryCommandState('insertunorderedlist');
			});
			if(_cachedProperty == _data) {
				return;
			}
			_tool.button.setState(_data);
			_cachedProperty = _data;
		});
		
		this.bindKeyboard({ // ctrl + u
			ctrlKey: _TRUE,
			altKey: _TRUE,
			keyCode: 85
		}, _toolHandler);
	}
});