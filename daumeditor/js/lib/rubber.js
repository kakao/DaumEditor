/**
 * Rubber - Very Very Simple Popup Resize Function
 */
(function(){
	
	var __STATUSBAR_SIZE = 16 * 3;
	var __SCROLLBAR_SIZE = 16;

	var getContentWidth = function(docEl) {
		return (docEl.clientWidth == docEl.scrollWidth && docEl.scrollWidth != docEl.offsetWidth) ? docEl.offsetWidth : docEl.scrollWidth;	
	};
	
	var getContentHeight = function(docEl, wrapper) {
		if (wrapper) return wrapper.offsetHeight;
		return (docEl.clientHeight == docEl.scrollHeight && docEl.scrollHeight != docEl.offsetHeight) ? docEl.offsetHeight : docEl.scrollHeight;
	};
		
	var Rubber = function(width) {
		var _win = window.top;
		var _docEl = document.documentElement;
		var _screenHeight = top.screen.availHeight - __STATUSBAR_SIZE;
		
		var _initWidth = width || getContentWidth(_docEl);
		var _initHeight = getContentHeight(_docEl);
		var _shownVerScroll = false;
		
		if(_screenHeight < _initHeight) {
			_initHeight = _screenHeight;
			_win.resizeBy(0, _initHeight - _docEl.clientHeight);
		}
		
		this.resize = function(wrapper) {
			var _horOverflow = (_docEl.clientWidth < _docEl.scrollWidth);

			var _popWidth = _docEl.clientWidth;
			var _popHeight = _docEl.clientHeight;
			var _popLeft = (_win.screenLeft) ? _win.screenLeft : _win.screenX;
			var _popTop = (_win.screenTop) ? _win.screenTop : _win.screenY;

			var _contentWidth = getContentWidth(_docEl);
			var _contentHeight = getContentHeight(_docEl, wrapper);
			
			if (_screenHeight < _contentHeight) { //모니터가 컨텐츠보다 작으면 모니터 크기에 맞춰서
				_win.moveTo(_popLeft - ($tx.msie? 3:0), 0); //창 위치를 옮기고
				if ($tx.msie) {
					document.body.scroll = "yes";
				} 
				_win.resizeBy(0, _screenHeight - _popHeight);

				if(!_shownVerScroll) { // X->O
					//_win.resizeBy(__SCROLLBAR_SIZE, -__SCROLLBAR_SIZE);
					_win.resizeBy(0, -__SCROLLBAR_SIZE);
				}
				_shownVerScroll = true;
			} else { //모니터가 컨텐츠보다 크면 컨텐츠 크기에 맞춰서
				if ($tx.msie) {
					document.body.scroll = "no";
				}
				_win.resizeBy(0, _contentHeight - _popHeight);

				if(_shownVerScroll) { // O->X
					_win.resizeBy(-__SCROLLBAR_SIZE, 0);
				}
				if(_horOverflow) {
					_win.resizeBy(0, -__SCROLLBAR_SIZE);
				}
				_shownVerScroll = false;
			}
		};
	};
 
 	var _rubber;
	window.resizeHeight = function(width, wrapper) {
		if(!_rubber) {
			_rubber = new Rubber(width);
		}
		_rubber.resize(wrapper);
	};

})();
