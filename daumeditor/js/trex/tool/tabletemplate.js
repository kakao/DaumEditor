/**
 * @fileoverview 
 * Tool '서식' Source,
 *     
 */
TrexConfig.addTool(
	"tabletemplate",
	{
		sync: _FALSE,
		status: _TRUE,
		rows: 5,
		cols: 9,
		options: [
			{ label: 'image', data: 1 , klass: 'tx-tabletemplate-1' },
			{ label: 'image', data: 2 , klass: 'tx-tabletemplate-2' },
			{ label: 'image', data: 3 , klass: 'tx-tabletemplate-3' },
			{ label: 'image', data: 4 , klass: 'tx-tabletemplate-4' },
			{ label: 'image', data: 5 , klass: 'tx-tabletemplate-5' },
			{ label: 'image', data: 6 , klass: 'tx-tabletemplate-6' },
			{ label: 'image', data: 7 , klass: 'tx-tabletemplate-7' },
			{ label: 'image', data: 8 , klass: 'tx-tabletemplate-8' },
			{ label: 'image', data: 9 , klass: 'tx-tabletemplate-9' },
			
			{ label: 'image', data: 10 , klass: 'tx-tabletemplate-10' },
			{ label: 'image', data: 11 , klass: 'tx-tabletemplate-11' },
			{ label: 'image', data: 12 , klass: 'tx-tabletemplate-12' },
			{ label: 'image', data: 13 , klass: 'tx-tabletemplate-13' },
			{ label: 'image', data: 14 , klass: 'tx-tabletemplate-14' },
			{ label: 'image', data: 15 , klass: 'tx-tabletemplate-15' },
			{ label: 'image', data: 16 , klass: 'tx-tabletemplate-16' },
			{ label: 'image', data: 17 , klass: 'tx-tabletemplate-17' },
			{ label: 'image', data: 18 , klass: 'tx-tabletemplate-18' },
			
			{ label: 'image', data: 19 , klass: 'tx-tabletemplate-19' },
			{ label: 'image', data: 20 , klass: 'tx-tabletemplate-20' },
			{ label: 'image', data: 21 , klass: 'tx-tabletemplate-21' },
			{ label: 'image', data: 22 , klass: 'tx-tabletemplate-22' },
			{ label: 'image', data: 23 , klass: 'tx-tabletemplate-23' },
			{ label: 'image', data: 24 , klass: 'tx-tabletemplate-24' },
			{ label: 'image', data: 25 , klass: 'tx-tabletemplate-25' },
			{ label: 'image', data: 26 , klass: 'tx-tabletemplate-26' },
			{ label: 'image', data: 27 , klass: 'tx-tabletemplate-27' },
			
			{ label: 'image', data: 28 , klass: 'tx-tabletemplate-28' },
			{ label: 'image', data: 29 , klass: 'tx-tabletemplate-29' },
			{ label: 'image', data: 30 , klass: 'tx-tabletemplate-30' },
			{ label: 'image', data: 31 , klass: 'tx-tabletemplate-31' },
			{ label: 'image', data: 32 , klass: 'tx-tabletemplate-32' },
			{ label: 'image', data: 33 , klass: 'tx-tabletemplate-33' },
			{ label: 'image', data: 34 , klass: 'tx-tabletemplate-34' },
			{ label: 'image', data: 35 , klass: 'tx-tabletemplate-35' },
			{ label: 'image', data: 36 , klass: 'tx-tabletemplate-36' },
			
			{ label: 'image', data: 37 , klass: 'tx-tabletemplate-37' },
			{ label: 'image', data: 38 , klass: 'tx-tabletemplate-38' },
			{ label: 'image', data: 39 , klass: 'tx-tabletemplate-39' },
			{ label: 'image', data: 40 , klass: 'tx-tabletemplate-40' },
			{ label: 'image', data: 41 , klass: 'tx-tabletemplate-41' },
			{ label: 'image', data: 42 , klass: 'tx-tabletemplate-42' },
			{ label: 'image', data: 43 , klass: 'tx-tabletemplate-43' },
			{ label: 'image', data: 44 , klass: 'tx-tabletemplate-44' },
			{ label: 'image', data: 45 , klass: 'tx-tabletemplate-45' }
			
		]
	}

);

Trex.Tool.Tabletemplate = Trex.Class.create({
	$const: {
		__Identity: 'tabletemplate'
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
			
			var _table = _NULL;
			_canvas.execute(function(processor) {
				if (processor.table) {
					_table = processor.findNode('table');
					processor.table.setTemplateStyle(_table, data);
				}
			});
			
			
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

