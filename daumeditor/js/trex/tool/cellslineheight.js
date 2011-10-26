
TrexMessage.addMsg({
	'@cellslineheight.subtitle1': '1pt',
	'@cellslineheight.subtitle2': '2pt',
	'@cellslineheight.subtitle3': '3pt',
	'@cellslineheight.subtitle4': '4pt',
	'@cellslineheight.subtitle5': '5pt'
});

TrexConfig.addTool(
	"cellslineheight",
	{
		sync: _FALSE,
		status: _TRUE,
		options: [
			{ label: TXMSG('@cellslineheight.subtitle1'), title: '1pt', data: 1, klass: 'tx-cellslineheight-1' },
			{ label: TXMSG('@cellslineheight.subtitle2'), title: '2pt', data: 2, klass: 'tx-cellslineheight-2' },
			{ label: TXMSG('@cellslineheight.subtitle3'), title: '3pt', data: 3, klass: 'tx-cellslineheight-3' },
			{ label: TXMSG('@cellslineheight.subtitle4'), title: '4pt', data: 4, klass: 'tx-cellslineheight-4' },
			{ label: TXMSG('@cellslineheight.subtitle5'), title: '5pt', data: 5, klass: 'tx-cellslineheight-5' }
		]
	}
);

Trex.Tool.Cellslineheight = Trex.Class.create({
	$const: {
		__Identity: 'cellslineheight'
	},
	$extend: Trex.Tool,
    oninitialized: function(config) {
        var self = this;
		
		self.createListStyleMap(config);
        self.weave(
			new Trex.Button.CellslineheightList(self.buttonCfg),
			new Trex.Menu.Select(self.menuCfg),
			self.handler
		);

	},
    createListStyleMap: function(config) {
        var listStyleMap = this.listStyleMap = {};
		config.options.each(function(option) {
			listStyleMap[option.data] = {
				type: option.type,
				klass: option.klass
			};
		});
    },
    handler: function(data) {
        var self = this;
        if (!self.listStyleMap[data]) {
            return;
        }
		// 실제 로직은 여기부분 입니다.
		self.canvas.query(function(processor){
			if (processor.table) {
				processor.table.setBorderHeight(data);
			}
		});
    },
	getButtonClassByValue: function(value) {
        var listStyleMap = this.listStyleMap;
		if(listStyleMap[value]) {
            return listStyleMap[value].klass;
        } else {
            return listStyleMap[this.getDefaultProperty()].klass;
        }
    }
});

Trex.Button.CellslineheightList = Trex.Class.create({
	$extend: Trex.Button.Select
});

