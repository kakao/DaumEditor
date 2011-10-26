Trex.module("add drop-down menu button if extra buttons exist.", 
	function (editor, toolbar, sidebar, canvas) {
		canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
			var _elButtonList = $tom.collectAll(editor.getWrapper(), 'li.tx-list-extra div.tx-extra');
			if (_elButtonList.length == 0) {
				return;
			}
			_elButtonList.each(function(elButton) {
				var elMenu = $tom.next(elButton, '.tx-extra-menu');
				if (!elMenu) {
					return;
				}
				
				toolbar.makeWidget(
					new Trex.Button({
						el: elButton,
						sync: _FALSE,
						status: _TRUE
					}), 
					new Trex.Menu({
						el: elMenu
					}), 
					function() { /*dummy handler*/ }
				);
			});
		});
	}
);

