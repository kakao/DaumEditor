Trex.I.FontTool = Trex.Mixin.create({
    initialize: function(editor, toolbar, config) {
        this.$super.initialize(editor, toolbar, config);
    },
    handler: function(data) {
        this.onBeforeHandler(data);
        this.doHandle(data);
        this.onAfterHandler(data);
    },
    onBeforeHandler: function() {
    },
    doHandle: function(data) {
        var self = this,
            range, newStyle = self.computeNewStyle(data);
        self.canvas.execute(function(processor) {
            var selectedCells = (processor.table) ? processor.table.getTdArr() : [];
            if (selectedCells.length > 0) {
                range = goog.dom.Range.createFromNodeContents(selectedCells[0]);
                processor.executeUsingCaret(function() {
                    self.tableCellsExecutor(processor, newStyle, selectedCells);
                });
            } else {
                range = processor.createGoogRange();
                if (range) {
                    self.rangeExecutor(processor, newStyle, range);
                }
            }
        });
    },
    onAfterHandler: function() {
    },
    tableCellsExecutor: function(processor, newStyle, cells) {
        var self = this;
        cells.each(function(cell) {
            var range = goog.dom.Range.createFromNodeContents(cell);
            range.select();
            self.rangeExecutor(processor, newStyle, range);
        });
    },
    findQueryingNode: function(goog_range) {
        if (goog_range) {
			var textNode;
			try {
	            textNode = this.findFirst(goog_range.__iterator__(), function(node) {
	                return node.nodeType == 3 && node.nodeValue.trim();
	            });
			} catch (ignore4ie678) {}
            if (textNode) {
                return textNode.parentNode;
            } else {    // fallback condition
                var startNode = goog_range.getStartNode();
                if (startNode && startNode.nodeType == 3) {
                    return startNode.parentNode;
                }
                return startNode;
            }
        }
    },
    findFirst: function(iterator, condition) {
        try {
            return goog.iter.filter(iterator, condition).next();
        } catch(e) {
            return null;
        }
    }
});

Trex.I.WrappingSpanFontTool = Trex.Mixin.create({
    wrapTextAsStyledSpan: function(processor, newStyle, range) {
        var affectedNodes;
        if (processor.isCollapsed()) {
            var startNode = range.getStartNode();
            if (startNode.nodeType == 3) {
                startNode = startNode.parentNode;
            }
            var targetNode = this.findOrCreateDummySpan(startNode, processor, range);
            var wordJoiner = targetNode.firstChild;
            processor.createGoogRangeFromNodes(wordJoiner, wordJoiner.length, wordJoiner, wordJoiner.length).select();
            affectedNodes = [ targetNode ];
        } else {
            processor.executeUsingCaret(function(range, savedCaret) {
                var iterator = createTextRangeIterator(savedCaret);
                var textNodes = collectTextNodes(iterator);
                affectedNodes = collectTextOnlySpans(textNodes);
            });
        }
        processor.apply(affectedNodes, {
            style: newStyle
        });

        function createTextRangeIterator(savedCaret) {
            var startCaret = savedCaret.getCaret(_TRUE),
                endCaret = savedCaret.getCaret(_FALSE);
            return new goog.dom.TextRangeIterator(startCaret, 0, endCaret, 0);
        }

        // Known Issue : <p>&nbsp;</p>에 대해 p의 childNodes.length === 0 이라  적용이 안된다.
        function collectTextNodes(iterator) {
            var result = [];
            goog.iter.forEach(iterator, function(node) {
                // 잘못된 위치의 TextNode는 제외
                if (node.nodeType == 3 && !$tom.kindOf(node.parentNode, "table,thead,tbody,tr,ul,ol")) {
                    result.push(node);
                }
            });
            return result;
        }

        function collectTextOnlySpans(textNodes) {
            var result = [];
            textNodes.each(function(node) {
                var parentNode = node.parentNode;
                if (parentNode.nodeName == "SPAN" && hasOnlyOneChild(parentNode)) {
                    result.push(parentNode);
                } else {
                    var newSpan = processor.create("span");
                    $tom.wrap(newSpan, node);
                    result.push(newSpan);
                }
            });
            return result;
        }

        function hasOnlyOneChild(node) {
            var childNodes = node.childNodes;
            var childCount = childNodes.length;
            if (childCount > 3) {   // early return
                return _FALSE;
            }
            for (var i = 0, len = childCount; i < len; i++) {
                if ($tom.isGoogRangeCaret(childNodes[i])) {
                    childCount = childCount - 1;
                }
            }
            return childCount == 1;
        }
    },
    /**
     * collapsed 일 때에 style을 적용할 수 있는 span을 찾거나, 새로 span을 만든다.
     */
    findOrCreateDummySpan: function(node, processor, goog_range) {
        var reuseExistNode = (node.tagName == "SPAN" && node.childNodes.length == 1 && node.firstChild.nodeType == 3 && node.firstChild.nodeValue == Trex.__WORD_JOINER);
        if (reuseExistNode) {
            return node;
        } else {
            return this.createDummySpan(node, processor, goog_range);
        }
    },
    createDummySpan: function (parentNode, processor, goog_range) {
        var newNode = null;
        if (parentNode.tagName == "SPAN") {
            newNode = $tom.clone(parentNode);
        } else {
            newNode = processor.create('span');
        }
        newNode.appendChild(processor.newDummy());
        newNode = goog_range.insertNode(newNode);    // NOTE: IE에서는 return된 value를 사용해야 한다.

        // insertNode로 인해 빈 TextNode가 생긴 경우, 바로 삭제해준다.
        $tom.removeEmptyTextNode(newNode.previousSibling);
        $tom.removeEmptyTextNode(newNode.nextSibling);
        return newNode;
    }
});

Trex.I.WrappingDummyFontTool = Trex.Mixin.create({
    wrapDummy: function(processor, range) {
        var targetNode = this.createDummySpan(processor, range);
        var wordJoiner = targetNode.firstChild;
        $tom.unwrap(targetNode);
        processor.createGoogRangeFromNodes(wordJoiner, 0, wordJoiner, wordJoiner.length).select();
        return wordJoiner;
    },
    createDummySpan: function (processor, goog_range) {
        var newNode = null;
        newNode = processor.create('span');
        newNode.appendChild(processor.newDummy());
        newNode = goog_range.insertNode(newNode);    // NOTE: IE에서는 return된 value를 사용해야 한다.
        // insertNode로 인해 빈 TextNode가 생긴 경우, 바로 삭제해준다.
        $tom.removeEmptyTextNode(newNode.previousSibling);
        $tom.removeEmptyTextNode(newNode.nextSibling);
        return newNode;
    }
});