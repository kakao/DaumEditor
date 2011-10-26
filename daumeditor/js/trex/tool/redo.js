/**
 * @fileoverview 
 * Tool 'Redo' Source,
 * Class Trex.Tool.ReDo 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"redo",
	{
		sync: _FALSE,
		status: _FALSE
	}
);

Trex.Tool.ReDo = Trex.Class.create({
	$const: {
		__Identity: 'redo'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
			var _canvas = this.canvas;

			var _toolHandler = function() {
				_canvas.getProcessor().blur();
				_canvas.focus();	
					
				setTimeout( function(){
					_canvas.fireJobs('canvas.panel.redo');	
				}, 0);	
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

			this.bindKeyboard({ // ctrl + y - 다시실행
				ctrlKey: _TRUE,
				keyCode: 89
			}, function() {
				_canvas.fireJobs('canvas.panel.redo');
				_canvas.triggerQueryStatus();
			});
		}
	
});
