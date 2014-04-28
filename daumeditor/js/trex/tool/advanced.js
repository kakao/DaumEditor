/**
 * @fileoverview 
 *  toolbar의 접힌 부분을 열고닫는 '더보기' Icon을 위해 필요한 configuration과 Class Trex.Tool.Advanced 를 포함    
 * 
 */
TrexConfig.addTool(
	"advanced",
	{
		sync: _FALSE,
		status: _TRUE,
		opened: _FALSE
	}
);

/**
 * Trex.Tool.Advanced
 * 
 * @class
 * @extends  Trex.Tool
 */
Trex.Tool.Advanced = Trex.Class.create({
	$const: {
		__Identity: 'advanced'
	},
	$extend: Trex.Tool,
	/**
	 * instance가 생성될 때 실행되며 필요한 UI Component 및 Event handler를 생성한다.  
	 * 
	 * @memberOf Trex.Tool.Advanced.prototype 
	 * @param {Object} config
	 */
	oninitialized: function(config) {
		var self = this;
		var _toolbar = this.toolbar;

		var _elBasic = _toolbar.el;
		self.opened = _FALSE;
		var _elAdvanced = $tom.collect(_elBasic.parentNode, 'div.tx-toolbar-advanced');
		if(!_elAdvanced) {
			return;
		}

		_toolbar.observeJob(Trex.Ev.__CMD_ADVANCED_FOLD, function() {
			
			$tx.hide(_elAdvanced);
			$tx.removeClassName(_elBasic, 'tx-toolbar-basic-open');
		});

		_toolbar.observeJob(Trex.Ev.__CMD_ADVANCED_SPREAD, function() {
			
			$tx.show(_elAdvanced);
			$tx.addClassName(_elBasic, 'tx-toolbar-basic-open');
		});

		var _toolHandler = function() {
			if(self.opened) {
				_toolbar.fireJobs(Trex.Ev.__CMD_ADVANCED_FOLD);
			} else {
				_toolbar.fireJobs(Trex.Ev.__CMD_ADVANCED_SPREAD);
			}
			self.opened = !self.opened;
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

		if(config.opened == _TRUE) {
			this.forceOpen();
		}
	},
	forceOpen: function(){
		this.button.pushedState();
		this.toolbar.fireJobs(Trex.Ev.__CMD_ADVANCED_SPREAD);
		this.opened = _TRUE;
	}
});
