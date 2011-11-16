/**
 * @fileoverview 
 * Tool '인용구' Source,
 * Class Trex.Tool.Quote 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"quote",
	{
		sync: _FALSE,
		status: _TRUE,
		rows: 2,
		cols: 3,
		options: [
			{ type: 'image', data: 'tx-quote1', image: '#iconpath/quote/citation01.gif?v=2' },
			{ type: 'image', data: 'tx-quote2', image: '#iconpath/quote/citation02.gif?v=2' },
			{ type: 'image', data: 'tx-quote3', image: '#iconpath/quote/citation03.gif?v=2' },
			{ type: 'image', data: 'tx-quote4', image: '#iconpath/quote/citation04.gif?v=2' },
			{ type: 'image', data: 'tx-quote5', image: '#iconpath/quote/citation05.gif?v=2' },
			{ type: 'cancel', data: 'tx-quote6', image: '#iconpath/quote/citation06.gif?v=2' }
		]
	},
	function(root){
		var _config = TrexConfig.getTool("quote", root);
		_config.options.each(function(option) {
			option.image = TrexConfig.getIconPath(option.image, 'quote'); 
		});
	}
);

Trex.Tool.Quote = Trex.Class.create({
	$const: {
		__Identity: 'quote'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _tool = this; 
			var _canvas = this.canvas;

			var _map = {};
			config.options.each(function(option) {
				_map[option.data] = {
					type: option.type
				};
			});

			var _toolHandler = function(data) {
				if(!_map[data]) {
					return;
				}
				var _type = _map[data].type;
				var _tag = "blockquote";
				var _attributes = { "className": data };

				if(_canvas.isWYSIWYG()) {
					_canvas.execute(function(processor) {
						var _bNode = processor.findNode(_tag);
						if (_bNode) {
							if(_type == "cancel") {
								processor.unwrap(_bNode);
							} else {
								processor.apply(_bNode, _attributes);
							}
						} else {
							if(_type != "cancel") {
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
								processor.wrap(_nodes, _tag, _attributes);	
							}
						}	
					});
				} else {
					_canvas.execute(function(processor) {
						processor.insertTag('<blockquote>','</blockquote>');
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

			var _popdownHandler = function(ev) {
				_tool.button.onMouseDown(ev);
			};
			this.bindKeyboard({ // ctrl + q
				ctrlKey: _TRUE,
				keyCode: 81
			}, _popdownHandler);
		}
	
});

