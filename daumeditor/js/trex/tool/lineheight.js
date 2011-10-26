/**
 * @fileoverview 
 * '줄간격' Icon Source,
 * Class Trex.Tool.LineHeight configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"lineheight",
	{
		sync: _FALSE,
		status: _TRUE,
		options: [
			{ label: '50%', title: '50%', data: '0.5' },
			{ label: '80%', title: '80%', data: '0.8' },
			{ label: '100%', title: '100%', data: '1.0' },
			{ label: '120%', title: '120%', data: '1.2' },
			{ label: '150%', title: '150%', data: '1.5' },
			{ label: '180%', title: '180%', data: '1.8' },
			{ label: '200%', title: '200%', data: '2.0' }
		]
	}
);

Trex.Tool.LineHeight = Trex.Class.create({
	$const: {
		__Identity: 'lineheight'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _canvas = this.canvas;

		var _defaultProperty = _canvas.getStyleConfig().lineHeight;
		var _optionz = (config.options || []);
		var _map = {};
		_optionz.each(function(option) {
			_map[option.data] = option.title;
		});

		var _toolHandler = function(command) {
			_canvas.execute(function(processor) {
				var _nodes = processor.blocks(function() {
					return '%paragraph';
				});
				processor.apply(_nodes, { 
					'style': {
						'lineHeight': command
					}
				});	
			});
		};
		
		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button.Select(TrexConfig.merge(this.buttonCfg, {
				selectedValue: _defaultProperty
			})),
			/* menu */
			new Trex.Menu.Select(this.menuCfg),
			/* handler */
			_toolHandler);
	}
});

