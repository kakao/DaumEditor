(function() {
    Trex.Tool.Indent.Helper = {
        findBlocksToIndentFromRange: function(range, processor, savedCaret) {
            var startCaret = savedCaret.getCaret(_TRUE);
            var endCaret = savedCaret.getCaret(_FALSE);
            if (processor.isCollapsed()) {
                // getStartNode, getStartOffset 호출하지 않으면 오류가 발생한다.
                range.getStartNode();
                range.getStartOffset();
                var node = this.findBlockToIndent(startCaret, processor);
                var isEmptyParagraph = (node.tagName == "P" && node.firstChild == startCaret && node.lastChild == endCaret);
                if (isEmptyParagraph) {
                    processor.stuffNode(node);
                }
                // TODO : block을 create한 경우만 restoreInternal을 해야한다. tab press[P로 감싸여 있지 않은 텍스트에서 tab 누르기] 테스트케이스와 관련있음
                savedCaret.restoreInternal();
                return [ node ];
            } else {
                var iterator = new goog.dom.TextRangeIterator(startCaret, 0, endCaret, 0);
                return this.findBlocksToIndentFromIterator(processor, iterator);
            }
        },
        findBlocksToIndentFromIterator: function(processor, iterator) {
            var self = this;
            var allNodes = self.collectAllNodes(iterator);
            var leafNodes = self.selectLeafNodes(allNodes);
            var validLeafNodes = self.filterUnableToIndent(leafNodes);

            var blocksToIndent = validLeafNodes.map(function(node) {
                return self.findBlockToIndent(node, processor);
            });
            blocksToIndent = blocksToIndent.compact().uniq();
            return blocksToIndent;
        },
        collectAllNodes: function (iterator) {
            var allNodes = [];
            goog.iter.forEach(iterator, function(node) {
                if (!allNodes.contains(node)) {
                    allNodes.push(node);
                }
            });
            return allNodes;
        },
        selectLeafNodes: function (nodes) {
            var leafNodes = [];
            nodes.each(function(node) {
                if (node.childNodes.length == 0) {
                    leafNodes.push(node);
                }
            });
            return leafNodes;
        },
        filterUnableToIndent: function (nodes) {
            var result = [];
            nodes.each(function(node) {
                // indent를 하지 못하는 TextNode를 걸러낸다.
                if ($tom.kindOf(node, "ul,ol,dl")) {
                    $tom.removeListIfEmpty(node);
                } else if ($tom.kindOf(node.parentNode, "table") && $tom.isText(node)) {

                } else if ($tom.kindOf(node.parentNode, "thead,tbody,tfooter") && !$tom.kindOf(node, "tr")) {

                } else if ($tom.kindOf(node.parentNode, "tr") && !$tom.kindOf(node, "th,td")) {

                } else if ($tom.kindOf(node.parentNode, "ul,ol,dl") && !$tom.kindOf(node, "li,dd,dt")) {

                } else {
                    result.push(node);
                }
            });
            return result;
        },
        findBlockToIndent: function(node) {
            var block = this.findOrCreateBlockForNode(node);
            return this.findIndentableHigherBlock(block);
        },
        findOrCreateBlockForNode: function(node) {
            if ($tom.isText(node) || $tom.kindOf(node, "%inline,img")) {
                var blockAncestor = $tom.ancestor(node, "p,li,dd,dt,h1,h2,h3,h4,h5,h6,div");
                if (blockAncestor && $tom.children(blockAncestor, "%block").length == 0) {
                    return blockAncestor;
                } else {
                    blockAncestor = $tom.ancestor(node, "%paragraph,pre,noscript,form,hr,address,fieldset,blockquote");
                    return $tom.wrapInlinesWithP(node, blockAncestor);
                }
            } else {
                return node;
            }
        },
        findIndentableHigherBlock: function(block) {
            var foundNode = _NULL;
            var visitNode = block;
            while (visitNode && visitNode.tagName != "BODY") {
                if (!foundNode && $tom.kindOf(visitNode, "p,div,h1,h2,h3,h4,h5,h6")) {
                    foundNode = visitNode;
                } else if ($tom.kindOf(visitNode, "li,dd,dt")) {
                    return visitNode;
                } else if (foundNode && $tom.kindOf(visitNode, "td,th")) {
                    return foundNode;
                }
                visitNode = visitNode.parentNode;
            }
            return foundNode;
        },
        findAncestorTableCell: function(node) {
            return $tom.ancestor(node, "td,th");
        },
        findNextCell: function(node) {
            var currentCell = this.findCurrentCell(node);
            var nextCell = $tom.next(currentCell, "td,th");
            if (!nextCell) {
                var nextRow = $tom.next($tom.parent(currentCell), "tr");
                if (nextRow) {
                    nextCell = $tom.first(nextRow, "td,th");
                }
            }
            return nextCell;
        },
        findPreviousCell: function(node) {
            var currentCell = this.findCurrentCell(node);
            var prevCell = $tom.previous(currentCell, "td,th");
            if (!prevCell) {
                var prevRow = $tom.previous($tom.parent(currentCell), "tr");
                if (prevRow) {
                    prevCell = $tom.last(prevRow, "td,th");
                }
            }
            return prevCell;
        },
        findCurrentCell: function(node) {
            return $tom.kindOf(node, "td,th") ? node : this.findAncestorTableCell(node);
        },
        isCaretOnStartOf: function(node, range) {
            var startNode = range.getStartNode();
            var startOffset = range.getStartOffset();
            while ($tom.isElement(startNode) && startNode.childNodes.length > 0) {
                startNode = startNode.childNodes[startOffset];
                startOffset = 0;
            }
            if (!startNode) {
                return _TRUE;
            }
            var iterator = new goog.dom.TextRangeIterator(node, 0, startNode, startOffset);
            var hasContent = _FALSE;
            goog.iter.forEach(iterator, function(visiting) {
                if (visiting.nodeType == 3 && !$tom.kindOf(visiting.parentNode, "script,style")) {
                    var text = (visiting === startNode) ? visiting.nodeValue.substring(0, startOffset) : visiting.nodeValue;
                    text = text.replace(Trex.__WORD_JOINER_REGEXP, "");
                    hasContent = $tom.removeMeaninglessSpace(text).length > 0;
                } else if ($tom.isElement(visiting)) {
                    if ($tom.kindOf(visiting, "img,embed,iframe")) {
                        hasContent = _TRUE;
                    }
                }
                if (hasContent) {
                    throw goog.iter.StopIteration;
                }
            });
            return !hasContent;
        }
    };
    var indentHelper = Trex.Tool.Indent.Helper;

    var $caret_moved = {};
    // range 사용해서 indent할 block을 찾아서 chain handler 작업 지시한다.
    Trex.Tool.Indent.RangeIndenter = Trex.Class.create({
        initialize: function(handler) {
            this.handler = handler;
        },
        indent: function(processor) {
            var self = this;
            processor.executeUsingCaret(function(range, savedCaret) {
                var blockNodes = indentHelper.findBlocksToIndentFromRange(range, processor, savedCaret);
                blockNodes.each(function(node) {
                    try {
                        self.handler.handle(node, processor, range);
                    } catch (e) {
                        if (e == $caret_moved) {
                            savedCaret.dispose();
                        } else {
                            throw e;
                        }
                    }
                });
            });
        }
    });

    Trex.Tool.Indent.TableCellIndenter = Trex.Class.create({
        initialize: function(handler) {
            this.handler = handler;
        },
        indent: function(processor) {
            var self = this;
            var tableCells = (processor.table) ? processor.table.getTdArr() : [];
            tableCells.each(function(cell) {
                var iterator = new goog.dom.TagIterator(cell);
                var blockNodes = indentHelper.findBlocksToIndentFromIterator(processor, iterator);
                blockNodes.each(function(node) {
                    self.handler.handle(node, processor, _NULL);
                });
            });
        }
    });



    Trex.Tool.Indent.Judge = {
        ChildOfFirstTableCell: function(node) {
            var tableCell = indentHelper.findAncestorTableCell(node);
            return tableCell && !indentHelper.findPreviousCell(tableCell);
        },
        ChildOfLastTableCell: function(node) {
            var tableCell = indentHelper.findAncestorTableCell(node);
            return tableCell && !indentHelper.findNextCell(tableCell);
        },
        ChildOfTableCell: function(node) {
            return indentHelper.findAncestorTableCell(node);
        },
        ListItem: function(node) {
            return $tom.kindOf(node, "li") && $tom.kindOf(node.parentNode, "ol,ul");
        },
        OneDepthList: function(node) {
            if ($tom.kindOf(node, "li")) {
                // TODO: depth계산을 할 것이냐 부모/조상만 확인하여 return 할 것이냐 고민..
                var listBuilder = new Trex.Tool.StyledList.ListBuilder();
                if (listBuilder.countDepthOfList(node) == 1) {
                    return _TRUE;
                }
            }
            return _FALSE;
        },
        IndentedBlockNode: function(node) {
            return $tom.kindOf(node, "%block") && node.style && node.style.marginLeft != "";
        },
        BlockNode: function(node) {
            // TODO %block vs %paragraph
            return $tom.kindOf(node, "%block");
        },
        HeadOfParagraph: function(node, processor, range) {
            return indentHelper.isCaretOnStartOf(node, range);
        },
        And: function(judge1, judge2){
            return function() {
                return judge1.apply(this, arguments) && judge2.apply(this, arguments);
            }
        },
        AlwaysTrue: function() {
            return _TRUE;
        }
    };

    Trex.Tool.Indent.Operation = {
        /* indent */
        GoToBelowTable: function(node, processor) {
            var table = $tom.ancestor(node, 'table');
            processor.bookmarkToNext(table);
            throw $caret_moved;
        },
        GoToNextCell: function(node, processor) {
            var nextCell = indentHelper.findNextCell(node);
            if (nextCell) {
                processor.selectFirstText(nextCell);
                throw $caret_moved;
            }
        },
        IndentListItem: function(node) {
            var groupNode = $tom.ancestor(node, 'ul,ol,dl');
            if (groupNode) {
                var prevSibling = $tom.previous(node);
                var nextSibling = $tom.next(node);
                if ($tom.kindOf(prevSibling, "ul,ol,dl")) {
                    // move to previous Group
                    $tom.append(prevSibling, node);
                } else {
                    var newGroupNode = $tom.clone(groupNode);
                    $tom.applyStyles(newGroupNode, { marginLeft: _NULL, paddingLeft: _NULL });
                    $tom.wrap(newGroupNode, node);
                }
                // move next Siblings to same parent
                if ($tom.kindOf(nextSibling, "ul,ol,dl")) {
                    $tom.moveChild(nextSibling, node.parentNode);
                    $tom.remove(nextSibling);
                }
            }
        },
        getChildrenAsElement: function(node) {
            var blocks = [];
            var childNodes = node.childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                var child = childNodes[i];
                if ($tom.isText(child)) {
                    var wrappedChild = $tom.wrapInlinesWithP(child, node);
                    blocks.push(wrappedChild);
                } else if ($tom.isElement(child)) {
                    blocks.push(child);
                }
            }
            return blocks;
        },
        IndentBlockNode: function(node) {
            $tom.applyStyles(node, {marginLeft: "+2em"});
        },
//        AddFourSpaces: function(node, processor) {
//            processor.pasteContent("&nbsp;&nbsp;&nbsp;&nbsp;", _FALSE);
//        },
        /* outdent */
        GoToAboveTable: function(node, processor) {
            var table = $tom.ancestor(node, 'table');
            processor.bookmarkToPrevious(table);
            throw $caret_moved;
        },
        GoToPreviousCell: function(node, processor) {
            var previousCell = indentHelper.findPreviousCell(node);
            if (previousCell) {
                processor.moveCaretTo(previousCell, _TRUE);
                throw $caret_moved;
            }
        },
        OutdentListItem: function(node, processor) {
            var list = $tom.ancestor(node, 'ul,ol,dl');
            if (!list) {
                return;
            }
            var parentNode = list.parentNode;
            if ($tom.kindOf(parentNode, "li")) {
                $tom.unwrap(parentNode);
                parentNode = list.parentNode;
            }
            var grandParentList = $tom.kindOf(parentNode, 'ul,ol,dl') ? parentNode : _NULL;
            var newList;
            if (grandParentList) {
                newList = $tom.divideNode(list, $tom.indexOf(node));
                $tom.insertAt(node, newList);
            } else {
                newList = $tom.divideNode(list, $tom.indexOf(node));
                var cssText = $tom.getStyleText(node);
                // list의 스타일을 p에도 적용한다.
                var p = processor.newNode('p');
                $tom.setStyleText(p, cssText);
                $tom.replace(node, p);
                $tom.insertAt(p, newList);
            }
            $tom.removeListIfEmpty(list);
            $tom.removeListIfEmpty(newList);
        },
        OutdentBlockNode: function(node) {
            $tom.applyStyles(node, {marginLeft: "-2em"});
        },
        Propagate: function() {
            throw $propagate;
        }
    };
})();