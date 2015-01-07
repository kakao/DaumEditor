Trex.module("Add layer to display notice message on editor area before editing", //NOTE: #FTDUEDTR-18
	function (editor, toolbar, sidebar, canvas, config) {
		if (config.initializedMessage) {
			canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function () {
				var _initializedId = config.initializedId;
				var _noticeDiv = tx.div({ id:"tx-canvas-notice"+_initializedId, className:"tx-canvas-notice"}, config.initializedMessage);
                var txLoading = $tx("tx_loading"+_initializedId);
                var txLoadingParent = txLoading.parentNode;
                txLoadingParent.insertBefore(_noticeDiv, txLoading);

				var disappeared = false;
				var _noticeDivHandler = function () {
					if (!disappeared && $tx("tx-canvas-notice"+_initializedId)) {
						disappeared = true;
                        txLoadingParent.removeChild(_noticeDiv);
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
