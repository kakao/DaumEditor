
Trex.MarkupTemplate.add(
'cellsline.preview', [
	'<table width="#{width}" cellPadding="0" style="line-height:0"><tbody><tr>',
	'<td valign="center" height="#{height}">',
	'<div style="border-bottom:#{value};width:#{width}px;height:2px;overflow:hidden;"></div>',
	'</td>',
	'</tr></tbody></table>'
].join('')
);

TrexConfig.addTool(
"cellslinepreview", {
	sync: _FALSE,
	status: _TRUE,
	options: [{
		label: Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: '1pt solid #ccc',
			width: 70,
			height: 14
		}), 
		title: '1pt solid #ccc', 
		data: '#ccc 1 solid'
	}, {
		label: Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: '2pt solid #c54', 
			width: 70,
			height: 14
		}),
		title: '2pt solid #c54', 
		data: '#c54 2 solid'
	}, {
		label: Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: '2pt solid #67f', 
			width: 70,
			height: 14
		}),
		title: '2pt solid #67f', 
		data: '#67f 2 solid'
	}, {
		label: Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: '3pt solid #000', 
			width: 70,
			height: 14
		}),
		title: '3pt solid #000', 
		data: '#000 3 solid'
	}, {
		label: Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: '1pt dashed #d4c', 
			width: 70,
			height: 14
		}),
		title: '1pt dashed #d4c', 
		data: '#d4c 1 dashed'
	}]
}
);

Trex.Tool.Cellslinepreview = Trex.Class.create({
	$const: {
		__Identity: 'cellslinepreview'
	},
	$extend: Trex.Tool,
    oninitialized: function(config) {
        var self = this;
		
		this.data = {
			color: '',
			height: 0,
			type: ''
		};
		
        this.weave(
		new Trex.Button.CellslinepreviewList(this.buttonCfg),
		new Trex.Menu.Select(this.menuCfg), 
		this.handler);
		
		this.toolbar.observeJob(Trex.Ev.__TOOL_CELL_LINE_CHANGE, function(data){
			self.setData(data);
			self.refreshPreview();
		});
	},
	setData: function(data){
		if ("color" in data) {
			this.data.color = data.color;
		}
		if ("height" in data) {
			this.data.height = data.height;
		}
		if ("type" in data) {
			this.data.type = data.type;
		}
	},
	refreshPreview: function(){
		var data;
		data = this.data;
		text = data.height + "pt " + data.type + " " + data.color;
		this.setPreview(text);
	},
	setPreview: function(value){
		this.button.elText.innerHTML = Trex.MarkupTemplate.get('cellsline.preview').evaluate({
			value: value,
			width: 43,
			height: 14
		});
	},
	addBorderHistory: function(data){
		this.setData(data);
		this.refreshPreview();
	},
	handler: function(data, title){
		var self = this, canvas = self.canvas;
        canvas.execute(function(processor) {
			var datas;
			if (processor.table) {
				datas = data.split(" ");
				processor.table.setBorderButtons(datas[0], datas[1], datas[2]);
			}
        });
	}
});

Trex.Button.CellslinepreviewList = Trex.Class.create({
	$extend: Trex.Button.Select,
	setText: function(text) {
		this.tool.setPreview(text);
	}
});