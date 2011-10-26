/**
 * @fileoverview 
 *  Tool 'UnDo' Source,
 *  Class Trex.Tool.UnDo 와  configuration 을 포함 하고있다.    
 * 
 */
TrexConfig.addTool(
	"undo",
	{
		sync: _FALSE,
		status: _FALSE
	}
);

Trex.Tool.UnDo = Trex.Class.create({
	$const: {
		__Identity: 'undo'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
			var _canvas = this.canvas;

			var _toolHandler = function() {
				_canvas.getProcessor().blur();
				_canvas.focus();	
					
				setTimeout( function(){
					_canvas.fireJobs('canvas.panel.undo');	
				}, 20);
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

			this.bindKeyboard({ // ctrl + z - 실행취소
				ctrlKey: _TRUE,
				keyCode: 90
			}, function() {
				_canvas.fireJobs('canvas.panel.undo');
				_canvas.triggerQueryStatus();
			});
		}
	
});
