/**
 * @fileoverview 
 *  wysiwyg, source 두 모드의 변경을 가능하게하는 checkbox형식의 tool 'SwitcherToggle' Source,
 * Class Trex.Tool.SwitcherToggle 와 configuration을 포함    
 *     
 */

TrexConfig.addTool(
	"switchertoggle", 
	{
		wysiwygonly: _FALSE,
		sync: _TRUE,
		status: _TRUE,
		options: [
			{ label: '에디터', title: "에디터", data: 'html' }, 
			{ label: 'HTML', title: "HTML", data: 'source' }
		]
	}
);

Trex.Tool.SwitcherToggle = Trex.Class.create({
	$const: {
		__Identity: 'switchertoggle'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
		var _canvas = this.canvas;
		
		var _toolHandler = function() {
			switch(_canvas.mode){
				case 'html':   
					_canvas.changeMode('source');
					break;
				case 'source':
					_canvas.changeMode('html');
					break;					
			}
			return _FALSE;
		};
		
		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button.Toggle(TrexConfig.merge(this.buttonCfg, {
				borderClass: 'tx-switchtoggle'
			})),
			/* menu */
			_NULL,
			/* handler */
			_toolHandler
		);
			
		var _toggleCheckbox = function(from, to) {
			this.button.setValue(to == 'source');
		}.bind(this);
		_canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, _toggleCheckbox);
		_canvas.observeJob(Trex.Ev.__CANVAS_MODE_INITIALIZE, _toggleCheckbox);
	}
	
});

