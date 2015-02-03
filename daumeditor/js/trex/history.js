/*
 알려진 문제들
 -
 덜 중요한 문제들
 - layout에 여러 개의 이미지를 한꺼번에 올린 경우에,  saveHistory 하지 않음
 - table resize 를 한 후에 saveHistory 하지 않음 / modified+마우스클릭 조합일 때, saveHistory를 하는 로직으로 인해 saveHistory가 될 수 있는 경우가 있음, but 완벽하지 않음
 - backspace / delete 든 여러 번 눌렀을 때에 한 번만 saveHistory하고 싶다.
 */

Trex.I.History = {};
Trex.I.History.Standard = {
    getRangeData: function () {
        throw Error("Unimplemented abstract method");
    },
    restoreRange: function (rangeData){
        throw Error("Unimplemented abstract method");
    }
};

Trex.I.History.Webkit = {
    getRangeData: function() {
        var p = this.canvas.getProcessor(),
            txSel = p.getTxSel(),
            rangeCount = txSel.getSel().rangeCount;
        var start, end;

        if (rangeCount) {
            var range = txSel.getSel().getRangeAt(0);
            var preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(this.canvas.getCurrentPanel().getDocument().body);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            start = preSelectionRange.toString().length;
            end = start + range.toString().length;
        } else {
            start = 0;
            end = 0;
        }

        return {
            start: start,
            end: end
        };
    },
    restoreRange: function(savedSel){
        var win = this.canvas.getCurrentPanel().getWindow();
        var doc = win.document;
        var containerEl = doc.body;
        var charIndex = 0, range = doc.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        var nodeStack = [containerEl], node, foundStart = false, stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = win.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
};

Trex.I.History.Trident = {
    getRangeData: function() {
        var doc = this.canvas.getCurrentPanel().getDocument();
        var containerEl = doc.body;
        //refactory 필요.
        try{
            var selectedTextRange = doc.selection.createRange();
        }catch(e){
            return {
                start:0,
                end:0
            }
        }
        var preSelectionTextRange = doc.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        try {
            preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
            var start = preSelectionTextRange.text.length;

            return {
                start: start,
                end: start + selectedTextRange.text.length
            }
        }catch(e){

        }

        var onepoint = preSelectionTextRange.text.length;
        return {
            start: onepoint,
            end: onepoint
        }
    },
    restoreRange: function(savedSel) {
        var doc = this.canvas.getCurrentPanel().getDocument();
        var containerEl = doc.body;
        var textRange = doc.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd("character", savedSel.end);
        textRange.moveStart("character", savedSel.start);
        textRange.select();
    }
};

/**
 * @fileoverview default history class for redo/undo
 *
 * @author iamdanielkim
 */

/**
 * @namespace
 */
(function(){
    function keepMaxLength(list, maxLength) {
        while (list.length >= maxLength) {
            list.shift();
        }
    }

	var MAX_UNDO_COUNT = 20;

	/**
	 * @class
	 */
	Trex.History = Trex.Class.create({
        $mixins: [
            Trex.I.History.Standard,
            (($tx.msie_nonstd)? Trex.I.History.Trident: Trex.I.History.Webkit)
        ],
        maxUndoCount: MAX_UNDO_COUNT,
        canvas: _NULL,
        undoMementoList: _NULL,
        redoMementoList: _NULL,
        currentMemento: _NULL,
        contentModified: _FALSE,
        initialize: function(canvas){
            this.canvas = canvas;
            this.setupHistory();
            this.bindKeyEvent(canvas);
        },
        bindKeyEvent: function(canvas) {
            var self = this;
            canvas.observeJob('canvas.panel.undo', function() {
                self.undoHandler();
            });
            canvas.observeJob('canvas.panel.redo', function() {
                self.redoHandler();
            });
        },
        setupHistory: function() {
            this.initHistory({ content: $tom.EMPTY_PARAGRAPH_HTML, scrollTop: 0 });
        },
        canUndo: function() {
            return this.undoMementoList.length > 0;
        },
        canRedo: function() {
            return this.redoMementoList.length > 0;
        },
        setCurrentMemento: function(memento) {
            this.currentMemento = memento;
        },
        undoHandler: function() {
            var self = this;
            self.saveHistoryIfEdited();
            if (!self.canUndo()) {
                return;
            }

            var undoMemento = self.undoMementoList.pop();
            undoMemento.undo();
            self.redoMementoList.push(undoMemento);

            self.setCurrentMemento(undoMemento);
        },
        redoHandler: function() {
            var self = this;
            self.saveHistoryIfEdited();
            if (!self.canRedo()) {
                return;
            }

            var redoMemento = self.redoMementoList.pop();
            redoMemento.redo();
            self.undoMementoList.push(redoMemento);

            self.setCurrentMemento(redoMemento);
        },
        initHistory: function(data) {
            var self = this;
            self.undoMementoList = [];
            self.redoMementoList = [];

            var newMemento = new Memento();
            var initialData = Object.extend({ content: $tom.EMPTY_PARAGRAPH_HTML, scrollTop: 0 }, data);
            newMemento.addUndoData(initialData);
            newMemento.addHandler(self.getTextHandler());
            self.setCurrentMemento(newMemento);
        },
        saveHistory: function(before, after, handler) {
            var self = this;
            var undoMementoList = self.undoMementoList;
            var currentMemento = self.currentMemento;

            self.redoMementoList = [];

            if (arguments.length == 3) {
                currentMemento.addUndoRedData(before, after, handler);
            }
            var textData = self.getTextData();
            currentMemento.addRedoData(textData);
            keepMaxLength(undoMementoList, self.maxUndoCount);
            undoMementoList.push(currentMemento);

            var newMemento = new Memento();
            newMemento.addHandler(self.getTextHandler());
            newMemento.addUndoData(textData);
            self.setCurrentMemento(newMemento);

            self.contentModified = _FALSE;
        },
        injectHistory: function(before, after, handler) {
            if (!this.canUndo()) {
                return;
            }
            var undoMementoList = this.undoMementoList;
            var lastMemento = undoMementoList[undoMementoList.length - 1];
            lastMemento.addUndoRedData(before, after, handler);
        },
        saveHistoryIfEdited: function() {
            if (this.contentModified) {
                this.saveHistory();
            }
        },
        saveHistoryByKeyEvent: function(event) {
            var key = {
                code: event.keyCode,
                ctrl: event.ctrlKey || (event.keyCode === 17),
                alt: event.altKey || (event.keyCode === 18),
                shift: event.shiftKey || (event.keyCode === 16)
            };

            if (key.code == 229) {                // ignore mouse click in ff.
                return;
            }

            var self = this;
            if (key.code == Trex.__KEY.ENTER || key.code == Trex.__KEY.SPACE || key.code == Trex.__KEY.TAB) {
                self.saveHistoryIfEdited();
            } else if (key.code == Trex.__KEY.DELETE || key.code == Trex.__KEY.BACKSPACE) {
                self.saveHistory();
            } else if ((key.code == Trex.__KEY.PASTE || key.code == Trex.__KEY.CUT) && key.ctrl) {
                self.saveHistory();
            } else if (((key.code > 32 && key.code < 41) && key.shift) || (key.code == 65 && key.ctrl)) {   // shift + arrow,  home, end,  etc..  / select all
                self.saveHistoryIfEdited();
            } else if (key.ctrl || key.alt || (key.shift && key.code == 16)) {
                // content isn't modified
            } else {
                self.contentModified = _TRUE;
            }
        },
        getTextHandler: function() {
            var canvas = this.canvas;
            var self = this;
            return function(data) {
                canvas.setContent(data.content);

                var DEFAULT_RESRORE_RANGE = {start: 0, end: 0};
                var range = data.range || DEFAULT_RESRORE_RANGE;
                self.restoreRange(range);

                if ($tx.msie_nonstd) {
                    // #FTDUEDTR-1122
                    setTimeout(function() {
                        canvas.setScrollTop(data.scrollTop);
                    }, 0);
                }
            }
        },
        getTextData:function() {
            return {
                content: this.canvas.getContent(),
                scrollTop: this.canvas.getScrollTop(),
                range: this.getRangeData()
            }
        }
    });

    var Memento = Trex.Class.create({
        initialize: function() {
            this.before = {};
            this.after = {};
            this.handlers = [];
        },
        addUndoRedData: function(before, after, handler) {
            Object.extend(this.before, before);
            Object.extend(this.after, after);
            this.handlers.push(handler);
        },
        addHandler: function(handler) {
            this.handlers.push(handler);
        },
        addUndoData: function(data) {
            Object.extend(this.before, data);
        },
        addRedoData: function(data) {
            Object.extend(this.after, data);
        },
        undo: function() {
            var self = this;
            self.handlers.each(function(handler) {
                handler(self.before);
            });
        },
        redo: function() {
            var self = this;
            self.handlers.each(function(handler) {
                handler(self.after);
            });
        }
    });
})();