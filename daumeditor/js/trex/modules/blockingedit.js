
Trex.module("Register an eventhandler in order to resize block and edit search results & some images in wysiwig panel.",
	function(editor, toolbar, sidebar, canvas) {
		
		if ($tx.msie_nonstd) {
			var _blockResizeHandler = function(element) {
				if (element.onresizestart == _NULL) {
					element.onresizestart = function() {
						return _FALSE;
					};
				}
			};
			canvas.observeElement({ tag: "img", klass: "tx-unresizable" }, _blockResizeHandler);
			canvas.observeElement({ tag: "img", klass: "tx-entry-attach" }, _blockResizeHandler);
			canvas.observeElement({ tag: "img", klass: "txc-footnote" }, _blockResizeHandler);
			canvas.observeElement({ tag: "iframe", klass: "txc-map" }, _blockResizeHandler); 
		}
		
		var _blockSelectHandler;
		if ($tx.msie_nonstd) {
			_blockSelectHandler = function(element) {
				element.setAttribute("unselectable", "on");
				$A(element.getElementsByTagName("*")).each(function(child) {
					if (child.nodeName.charAt(0) != "/") {
						child.setAttribute("unselectable", "on");
					}
				});
				var _processor = canvas.getProcessor();
				_processor.selectControl(element);
			};
		} else {
			_blockSelectHandler = function(element) {
				var _processor = canvas.getProcessor();
				_processor.selectControl(element);
				throw $stop;
			};
		}
		canvas.observeElement({ tag: "button" }, _blockSelectHandler);
		canvas.observeElement({ tag: "img" }, function(element) {
			var _button = $tom.find(element, 'button');
			if(_button) {
				_blockSelectHandler(_button);
				throw $stop;
			} 
		});
	}
);	
