Trex.install("editor.addTool & editor.addPlugInTool",
	function(editor, toolbar, sidebar, canvas, config){
		editor.addTool = function( name, toolConfig ){
			if (toolbar.tools[name]) {
				return;
			}
			
			var _cfg = config.toolbar[name] = Object.extend({
				status: _FALSE,
				sync : _FALSE,
				wysiwygonly: _TRUE,
				initializedId: config.initializedId,
				handler: function() { }
			}, toolConfig);
			
			var _cls = Trex.Tool[name.capitalize()] = Trex.Class.create({
				$const: {
					__Identity: name
				},
				$extend: Trex.Tool,
				oninitialized: function(config) {

					/* button & menu weave */
					this.weave.bind(this)(
						/* button */
						new Trex.Button(this.buttonCfg),
						/* menu */
						_cfg.menuId ? new Trex.Menu(TrexConfig.merge(this.menuCfg, {
							id: config.menuId
						})) : _NULL,
						/* handler */
						config.handler
					);
				}
			});
			var available = function(config, name) {
				if(!config) {
					return _FALSE;
				}
				if(config.hidden == _TRUE) {
					return (config.use == _TRUE);
				} else {
					return ($tx(name) != _NULL);
				}
			};
			if(available(toolConfig, _cfg.elementId + _cfg.initializedId)) {
				toolbar.tools[name] = new _cls(editor, toolbar, _cfg);
			}
			return toolbar.tools[name];
		};
		
		editor.addPlugInTool = editor.addTool;
});