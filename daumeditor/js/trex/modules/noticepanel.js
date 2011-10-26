Trex.module("Add layer to display notice message on editor area before editing", //NOTE: #FTDUEDTR-18
	function(editor, toolbar, sidebar, canvas, config){
		if ( config.initializedMessage ) {
			canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE,  function(){
				var _noticeDiv = tx.div({ id: "tx-canvas-notice", className: "tx-canvas-notice"}, config.initializedMessage);
				$tx("tx_canvas").insertBefore( _noticeDiv, $tx("tx_loading") );
				
				var _noticeDivHandler = function(){
					if ($tx("tx-canvas-notice")) {
						$tx("tx_canvas").removeChild(_noticeDiv);
						if (editor.focus) {
							editor.focus();
						}
					}
				};
				
				$tx.observe(_noticeDiv, "click", _noticeDivHandler);
				canvas.observeJob(Trex.Ev.__CANVAS_DATA_INITIALIZE, _noticeDivHandler);
				toolbar.observeJob(Trex.Ev.__TOOL_CLICK,  _noticeDivHandler);
			});
		
		}
		
	}
);
