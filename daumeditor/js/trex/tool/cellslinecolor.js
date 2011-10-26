/**
 * @fileoverview 
 * 글자색을 변경하기 위해 쓰이는 '글자색' Icon을 위해 필요한 source, 
 * Class Trex.Tool.Cellslinecolor 와 configuration을 포함	
 *  
 */
TrexConfig.addTool(
	"cellslinecolor",
	{ 
		defaultcolor: "#7c84ef",
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _TRUE,
		useFavorite: _TRUE,
		thumbs: Trex.__CONFIG_COMMON.thumbs,
		needRevert: _TRUE
	}
);

Trex.Tool.Cellslinecolor = Trex.Class.create({
	$const: {
		__Identity: 'cellslinecolor'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
		var canvas = this.canvas;
		var self = this;
		
		this.button = new Trex.Button(this.buttonCfg);
	  	
		var _toolHandler = function(color) {
			syncButton(color);
			canvas.query(function(processor){
				if (processor.table) {
					processor.table.setBorderColor(color);
				}
			});
		};
		
		var syncButton = function(color) {
			if (color) {
				try {
					$tx.setStyle(self.button.elButton, {
						'backgroundColor': color
					});
				} catch(e) {
					console.log(e);
				}
			}
		};
		syncButton(this.config.defaultcolor);
		
		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			self.button,
			/* menu */
			new Trex.Menu.ColorPallete(this.menuCfg),
			/* handler */
			_toolHandler
		);
	}
});


