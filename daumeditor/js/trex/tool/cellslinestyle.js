
TrexMessage.addMsg({
	'@cellslinestyle.subtitle1': '테두리 없음',
	'@cellslinestyle.subtitle2': '실선',
	'@cellslinestyle.subtitle3': '점선',
	'@cellslinestyle.subtitle4': '작은 점선'
});

TrexConfig.addTool(
	"cellslinestyle",
	{
		sync: _FALSE,
		status: _TRUE,
		options: [
			{ label: TXMSG('@cellslinestyle.subtitle1'), title: '테두리 없음', data: 'none', klass: 'tx-cellslinestyle-1' },
			{ label: TXMSG('@cellslinestyle.subtitle2'), title: '실선', data: 'solid', klass: 'tx-cellslinestyle-2' },
			{ label: TXMSG('@cellslinestyle.subtitle3'), title: '점선', data: 'dotted', klass: 'tx-cellslinestyle-3' },
			{ label: TXMSG('@cellslinestyle.subtitle4'), title: '작은 점선', data: 'dashed', klass: 'tx-cellslinestyle-4' }
		]
	}
);

Trex.Tool.Cellslinestyle = Trex.Class.create({
	$const: {
		__Identity: 'cellslinestyle'
	},
	$extend: Trex.Tool,
    oninitialized: function(config) {
        var self = this;
		self.createListStyleMap(config);
        self.weave(
			new Trex.Button.CellsLineStyledList(self.buttonCfg),
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
				processor.table.setBorderType(data);
			}
		});
    },
    getDefaultProperty: function() {
        return 1;
    }
});

Trex.Button.CellsLineStyledList = Trex.Class.create({
	$extend: Trex.Button.Select
});
