(function(){
	TrexConfig.addTool(
		"fullscreen", {
			wysiwygonly: _FALSE,
			status: _FALSE,
			switched: _FALSE,
			minHeight: 200,
			minWidth: 766,
			asyncUrl: "trex/tool/async/fullscreen.js"
		}
	);
	
	Trex.Tool.FullScreen = Trex.Class.create({
		$const: {
			__Identity: 'fullscreen'
		},
		$extend: Trex.AsyncTool,
		oninitialized: function(config) {
			this.weave.bind(this)(
				new Trex.Button(this.buttonCfg), 
				_NULL,
				this.onLoadModule // define in Trex.AsyncTool
			);
		}
	});
})();