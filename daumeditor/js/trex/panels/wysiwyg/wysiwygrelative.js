(function() {
    var __SCROLL_WIDTH = 16;
    /**
     * wysiwyg 영역에서의 특정 노드의 상대 위치를 계산하기 위한 클래스로 WysiwygPanel 내부에서만 사용된다.
     * @private
     * @class
     */
    Trex.WysiwygRelative = Trex.Class.create({
        initialize: function(iframe) {
            this.iframe = iframe;
        },
        getRelative: function(node) {
            var _relatives = { x:0, y:0, width:0, height:0 };
            var doc = this.iframe.contentWindow.document;
            if (node) {
                var _position = $tom.getPosition(node, _TRUE);
                var _frameHeight = $tom.getHeight(this.iframe);
                var _scrollTop = $tom.getScrollTop(doc);

                if (_position.y + _position.height < _scrollTop || _position.y > _scrollTop + _frameHeight) {
                    return _relatives;
                } else {
                    var _frameLeft = 0; //Holder 기준
                    var _frameTop = 0; //Holder 기준
                    var _frameWidth = $tom.getWidth(this.iframe);
                    var _scrollLeft = $tom.getScrollLeft(doc);

                    _relatives.x = _frameLeft + ((_scrollLeft > 0) ? 0 : _position.x);
                    _relatives.width = Math.min(_frameWidth - _position.x - __SCROLL_WIDTH, _position.width - ((_scrollLeft > 0) ? _scrollLeft - _position.x : 0));
                    _relatives.height = _position.height;
                    _relatives.y = _position.y - _scrollTop + _frameTop;
                }
            }
            return _relatives;
        }
    });
})();