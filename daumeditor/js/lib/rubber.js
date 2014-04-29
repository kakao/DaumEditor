/**
 * Rubber - Very Very Simple Popup Resize Function
 */
(function(){

    var getScrollBarSize = function() {
        var scrollDiv = document.createElement('div');
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';

        document.body.appendChild(scrollDiv);

        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        var scrollbarHeight = scrollDiv.offsetHeight - scrollDiv.clientHeight;

        document.body.removeChild(scrollDiv);

        return {
            width: scrollbarWidth,
            height: scrollbarHeight
        }
    }

    var getScreenMargin = function() {
        if(!$tx.msie) {
            return {left: 0, top: 0};
        }
        var _win = window.top;
        var prevLeft = (_win.screenLeft) ? _win.screenLeft : _win.screenX;
        var prevTop = (_win.screenTop) ? _win.screenTop : _win.screenY;

        _win.moveTo(0, 0);

        var marginLeft = (_win.screenLeft) ? _win.screenLeft : _win.screenX;
        var marginTop = (_win.screenTop) ? _win.screenTop : _win.screenY;

        _win.moveTo(prevLeft - marginLeft, prevTop - marginTop);

        return {
            left: marginLeft,
            top: marginTop
        }
    }

    var Rubber = function() {
        var _win = window.top;
        var _docEl = document.documentElement;
        var _screenHeight = top.screen.availHeight;
        var _screenWidth = top.screen.availWidth;

        var _scrollbarSize = getScrollBarSize();
        var _screenMargin = getScreenMargin();

        this.resize = function(wrapper) {
            if ($tx.msie) {
                document.body.scroll = "no";
            }

            var popLeft = (_win.screenLeft) ? _win.screenLeft : _win.screenX;
            var popTop = (_win.screenTop) ? _win.screenTop : _win.screenY;

            var deltaHeight = 0, deltaWidth = 0;

            //content size
            if (window.outerHeight === 0) {
                setTimeout(function () {
                    _rubber.resize(wrapper);
                }, 100);
                return;
            }
            else if (window.outerHeight) {
                deltaWidth = window.outerWidth - window.innerWidth;
                deltaHeight = window.outerHeight - window.innerHeight;
            }
            else if(_docEl.clientWidth) {
                var fakeOuterWidth = _docEl.clientWidth;
                var fakeOuterHeight = _docEl.clientHeight;

                _win.resizeTo(fakeOuterWidth, fakeOuterHeight);

                var fakeInnerWidth = _docEl.clientWidth;
                var fakeInnerHeight = _docEl.clientHeight;

                deltaWidth = fakeOuterWidth - fakeInnerWidth;
                deltaHeight = fakeOuterHeight - fakeInnerHeight;
            }
            else {
                throw 'browser does not support';
            }

            var contentWidth = wrapper.clientWidth + deltaWidth;
            var contentHeight = wrapper.clientHeight + deltaHeight;

            //scrollbar
            if (contentWidth > _screenWidth) {
                if ($tx.msie) {
                    document.body.scroll = "yes";
                }

                contentWidth = _screenWidth;
                contentHeight += _scrollbarSize.height;
            }

            if(contentHeight > _screenHeight) {
                if ($tx.msie) {
                    document.body.scroll = "yes";
                }
                contentHeight = _screenHeight;
                contentWidth += _scrollbarSize.width;

                if (contentWidth > _screenWidth) {
                    contentWidth = _screenWidth;
                }
            }

            //position
            if (contentWidth + popLeft > _screenWidth) {
                popLeft = 0;

            }
            if (contentHeight + popTop > _screenHeight) {
                popTop = 0;
            }

            _win.moveTo(popLeft - _screenMargin.left, popTop - _screenMargin.top);
            _win.resizeTo(contentWidth, contentHeight);
        };
    };

    var _rubber;
    window.resizeHeight = function(width, wrapper) {
        console.log("rubber");

        if(!_rubber) {
            _rubber = new Rubber(0);
        }

        _rubber.resize(wrapper);
    };
})();
