/**
 * Rubber - Very Very Simple Popup Resize Function
 */
(function(){

    var targetWindow;
    try {
        targetWindow = top;
    } catch(e) {
        targetWindow = _WIN;
    }

    var getScrollBarSize = function() {
        var scrollDiv = _DOC.createElement('div');
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';

        _DOC.body.appendChild(scrollDiv);

        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        var scrollbarHeight = scrollDiv.offsetHeight - scrollDiv.clientHeight;

        _DOC.body.removeChild(scrollDiv);

        return {
            width: scrollbarWidth,
            height: scrollbarHeight
        }
    };

    var getScreenMargin = function() {
        if(!$tx.msie) {
            return {left: 0, top: 0};
        }
        var prevLeft = (_WIN.screenLeft) ? _WIN.screenLeft : _WIN.screenX;
        var prevTop = (_WIN.screenTop) ? _WIN.screenTop : _WIN.screenY;

        targetWindow.moveTo(0, 0);

        var marginLeft = (_WIN.screenLeft) ? _WIN.screenLeft : _WIN.screenX;
        var marginTop = (_WIN.screenTop) ? _WIN.screenTop : _WIN.screenY;

        targetWindow.moveTo(prevLeft - marginLeft, prevTop - marginTop);

        return {
            left: marginLeft,
            top: marginTop
        }
    };

    var Rubber = function() {
        var _docEl = _DOC.documentElement;
        var _screenHeight = _WIN.screen.availHeight;
        var _screenWidth = _WIN.screen.availWidth;

        var _scrollbarSize = getScrollBarSize();
        var _screenMargin = getScreenMargin();

        this.resize = function(wrapper) {
            if ($tx.msie) {
                _DOC.body.scroll = "no";
            }

            var popLeft = (_WIN.screenLeft) ? _WIN.screenLeft : _WIN.screenX;
            var popTop = (_WIN.screenTop) ? _WIN.screenTop : _WIN.screenY;

            var deltaHeight = 0, deltaWidth = 0;

            //content size
            if (targetWindow.outerHeight === 0) {
                setTimeout(function () {
                    _rubber.resize(wrapper);
                }, 100);
                return;
            }
            else if (targetWindow.outerHeight) {
                deltaWidth = targetWindow.outerWidth - targetWindow.innerWidth;
                deltaHeight = targetWindow.outerHeight - targetWindow.innerHeight;
            }
            else if(_docEl.clientWidth) {
                var fakeOuterWidth = _docEl.clientWidth;
                var fakeOuterHeight = _docEl.clientHeight;

                targetWindow.resizeTo(fakeOuterWidth, fakeOuterHeight);

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
                    _DOC.body.scroll = "yes";
                }

                contentWidth = _screenWidth;
                contentHeight += _scrollbarSize.height;
            }

            if(contentHeight > _screenHeight) {
                if ($tx.msie) {
                    _DOC.body.scroll = "yes";
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

            targetWindow.moveTo(popLeft - _screenMargin.left, popTop - _screenMargin.top);
            targetWindow.resizeTo(contentWidth, contentHeight);
        };
    };

    var _rubber;
    _WIN.resizeHeight = function(width, wrapper) {
        if(!_rubber) {
            _rubber = new Rubber(0);
        }

        _rubber.resize(wrapper);
    };
})();
