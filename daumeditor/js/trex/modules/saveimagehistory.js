
Trex.module("in order to save history for image resizing on IE",
	function(editor, toolbar, sidebar, canvas/*, config*/){
		var _history = canvas.history;
		var _prevImageStatus = {};
		var _imageNode = _NULL;
		 
		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(ev){
			var node = $tx.element(ev);
			if ( node && node.tagName && node.tagName.toLowerCase() == "img" ){
				_imageNode = node;
				_prevImageStatus = $tom.getPosition(node);
			}
		});
	
		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function() {
			if ( _imageNode ) {
				var isChanged = _FALSE;
				try {
					var _curImageStatus = $tom.getPosition(_imageNode);
					for(var _name in _curImageStatus ){
						if ( _curImageStatus[_name] != _prevImageStatus[_name] ){
							isChanged = _TRUE;
						}					
					}
					if ( isChanged ){
						_history.saveHistory();
					}
				} catch(e){
				} finally{
					_imageNode = _NULL;	
				}
			}
		});
	}
);
