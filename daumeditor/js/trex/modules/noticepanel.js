Trex.module("Add layer to display notice message on editor area before editing", //NOTE: #FTDUEDTR-18
	function (editor, toolbar, sidebar, canvas, config) {
		if (config.initializedMessage) {
			canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function () {
				var _noticeDiv = tx.div({ id:"tx-canvas-notice", className:"tx-canvas-notice"}, config.initializedMessage);
				$tx("tx_canvas").insertBefore(_noticeDiv, $tx("tx_loading"));

				var disappeared = false;
				var _noticeDivHandler = function () {
					if (!disappeared && $tx("tx-canvas-notice")) {
						disappeared = true;
						$tx("tx_canvas").removeChild(_noticeDiv);
						canvas.focus();
					}
				};

				setTimeout(function () {
					$tx.observe(canvas.getPanel('html').getWindow(), 'focus', _noticeDivHandler);
				}, 30);
				$tx.observe(_noticeDiv, "click", _noticeDivHandler);
				canvas.observeJob(Trex.Ev.__CANVAS_DATA_INITIALIZE, _noticeDivHandler);
				toolbar.observeJob(Trex.Ev.__TOOL_CLICK, _noticeDivHandler);
			});
		}
	}
);
