/**
 * @fileoverview 
 * 테이블 셀의 색을 변경하기 위해 쓰임
 *  
 */
TrexConfig.addTool(
	"tablebackcolor",
	{ 
		defaultcolor: "#9aa5ea",
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _TRUE,
		useFavorite: _TRUE,
		thumbs: Trex.__CONFIG_COMMON.thumbs,
		needRevert: _TRUE
	}
);

Trex.Tool.Tablebackcolor = Trex.Class.create({
	$const: {
		__Identity: 'tablebackcolor'
	},
	$extend: Trex.Tool,
	
    oninitialized: function() {
        var _canvas = this.canvas;
		var self = this;
		
		self.button = new Trex.Button(this.buttonCfg);
		
        var _toolHandler = function(color) {
			_canvas.query(function(processor){
				if (processor.table) {
					processor.table.tableBackground(color);
				}
			});
			syncButton(color);
		};

       var syncButton = function(color) {
	        try {
	            if (color) {
	                $tx.setStyle(self.button.elButton, {'backgroundColor': color});
	            }
	        } catch(e) {
	            console.log(e);
	        }
	    }

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


