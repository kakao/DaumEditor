/**
 * @fileoverview 
 *  글상자를 삽입하는 기능을 가진 Tool '글상자' Source,
 *  Class Trex.Tool.TextBox와  configuration 을 포함 하고있다.    
 * 
 */
TrexConfig.addTool(
	"textbox",
	{
		sync: _FALSE,
		status: _TRUE,
		rows: 4,
		cols: 6,
		options: Trex.__CONFIG_COMMON.textbox.options
	}
);

Trex.Tool.TextBox = Trex.Class.create({
	$const: {
		__Identity: 'textbox'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _canvas = this.canvas;
		var _toolbar = this.toolbar;
		
		var _map = {};
		config.options.each(function(option) {
			_map[option.data] = option.style;
		});

		var _toolHandler = function(data) {
			if(!_map[data]) {
				return;
			}
			var _style = _map[data];
			if (_canvas.isWYSIWYG()) {
				var _tag = "div";
				var _attributes = {
					'className': 'txc-textbox',
					'style': _style
				};
				_canvas.execute(function(processor) {
					var _nodes = processor.blocks(function() {
						return '%wrapper,%paragraph';
					});
					_nodes = _nodes.findAll(function(node) {
						if($tom.kindOf(node, "%innergroup")) {
							processor.wrap($tom.children(node), _tag, _attributes);	
							return _FALSE;
						} else {
							return _TRUE;
						}
					});
					var _bNode = processor.wrap(_nodes, _tag, _attributes);	
					_toolbar.fireJobs('cmd.textbox.added', _bNode);
				});
			} else {
				_canvas.execute(function(processor) {
					processor.insertTag('<div class="txc-textbox">','</div>'); //TODO:
				});
			}
		};
		
		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			new Trex.Menu.List(this.menuCfg),
			/* handler */
			_toolHandler
		);
	}
});

