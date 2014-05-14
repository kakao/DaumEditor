(function() {
    Trex.WysiwygEventBinder = Trex.Class.create({
        initialize: function(win, doc, canvas) {
            this.win = win;
            this.doc = doc;
            this.canvas = canvas;
        },

        bindEvents : function() {
            this.translateDocumentEventToCanvas("keyup", 'onKeyUp');
            this.translateDocumentEventToCanvas('keydown', 'onKeyDown');
            this.translateDocumentEventToCanvas('mouseover', 'onMouseOver');
            this.translateDocumentEventToCanvas('mousemove', 'onMouseMove');
            this.translateDocumentEventToCanvas('mouseout', 'onMouseOut');
            this.translateDocumentEventToCanvas('click', 'onClick');
            this.translateDocumentEventToCanvas('dblclick', 'onDoubleClick');
            this.translateDocumentEventToCanvas('mousedown', 'onMouseDown');
            this.translateDocumentEventToCanvas('mouseup', 'onMouseUp');
            this.translateWindowEventToCanvas('scroll', 'onScroll');
			this.translateBodyEventToCanvas('paste', 'onPaste');

            this.triggerQueryStatusWhenTenConsecutiveKeyPressesDetected();
        },

        translateDocumentEventToCanvas: function(eventName, canvasMethodName) {
            this.translateEventToCanvas(this.doc, eventName, canvasMethodName);
        },

        translateWindowEventToCanvas: function(eventName, canvasMethodName) {
            this.translateEventToCanvas(this.win, eventName, canvasMethodName);
        },
		
		translateBodyEventToCanvas: function(eventName, canvasMethodName) {
            this.translateEventToCanvas(this.doc.body, eventName, canvasMethodName);
        },
		
        translateEventToCanvas: function(element, eventName, canvasMethodName) {
            var canvas = this.canvas;
            $tx.observe(element, eventName, function(e) {
                canvas[canvasMethodName](e);
            }, _FALSE);
        },

        triggerQueryStatusWhenTenConsecutiveKeyPressesDetected: function() {
            var canvas = this.canvas;
            observeTenConsecutiveKeyPresses(this.doc, function() {
                canvas.triggerQueryStatus();
            });
        }
    });

    var observeTenConsecutiveKeyPresses = function(element, handler) {
        var count = 0, previousKeyCode = -1,
                keyPressEvent = 'keydown';//($tx.msie || $tx.webkit) ? "keydown" : "keypress";

        $tx.observe(element, keyPressEvent, function(event) {
            var newKeyCode = event.keyCode;
            if (!shouldIgnore(newKeyCode) && previousKeyCode !== newKeyCode) {
                if (count >= 9) {
                    handler();
                    count = 0;
                } else {
                    count++;
                }
                previousKeyCode = newKeyCode;
            }
        }, _FALSE);
    };

    var shouldIgnore = function(keyCode) {
        return QUERY_TRIGGER_IGNORE_KEYCODES.contains(keyCode);
    };

    var QUERY_TRIGGER_IGNORE_KEYCODES = new $tx.Set(8, 16, 17, 18, 32, 33, 34, 37, 38, 39, 40, 46, 229/* hangul */);

})();
