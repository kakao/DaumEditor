Trex.module("table resize dragger", function(editor, toolbar, sidebar, canvas) {
    canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {

        var wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        var doc = wysiwygPanel.getDocument();
        var win = wysiwygPanel.getWindow();
        var body = doc.body;
        var MIN_WIDTH = 20;
        var w3cBoxModelWorks;

        var colDragger = $tom.collect(canvas.wysiwygEl, ".tx-table-col-resize-dragger");
        var rowDragger = $tom.collect(canvas.wysiwygEl, ".tx-table-row-resize-dragger");

        var isDragging = _FALSE;

        var currentTable, currentTD, currentLeftTD, currentRightTD;
        var currentLeftTDWidth, currentRightTDWidth, currentTDHeight;
        var currentTableWidth, currentPointX, currentPointY;

        var currentNode, currentDragger;
        var movingX, movingY;
        var leftTdArray, rightTdArray, topTdArray;
        var leftWidthArr, rightWidthArr, topHeightArr;

        var posiX, posiY, elem;

        var EDGE_TYPE = {
            TOP: "EDGE_TOP",
            BOTTOM: "EDGE_BOTTOM",
            LEFT: "EDGE_LEFT",
            RIGHT: "EDGE_RIGHT",
            NONE: "NONE"
        };

        var edgeType = EDGE_TYPE.NONE;

        var initDragger = function() {

            isDragging = _FALSE;
            currentNode = _NULL;
            currentDragger = _NULL;

            currentTable = currentTD = _NULL;
            currentLeftTD = currentRightTD = _NULL;

            rightTdArray = leftTdArray = topTdArray = _NULL;
            leftWidthArr = rightWidthArr = topHeightArr = _NULL;

            movingX = movingY = 0;
            currentTableWidth = currentPointX = currentPointY = 0;
            currentLeftTDWidth = currentRightTDWidth = currentTDHeight = 0;
        };

        var mouseDownHandler = function() {
            currentTable = $tom.find(currentNode, "table");
            if (currentTable == _NULL) {
                return _NULL;
            }
            isDragging = _TRUE;
            currentTableWidth = currentTable.offsetWidth;

            if (edgeType != EDGE_TYPE.NONE) {
                $tx.stop(elem);
                showDragger();
            }

            switch (edgeType) {
                case EDGE_TYPE.LEFT:
                    makeTDArrForLeftEdge();
                    startResizeCol();
                    break;
                case EDGE_TYPE.RIGHT:
                    makeTDArrForRightEdge();
                    startResizeCol();
                    break;
                case EDGE_TYPE.TOP:
                    makeTDArrForTopEdge();
                    startResizeRow();
                    break;
                case EDGE_TYPE.BOTTOM:
                    makeTDArrForBottomEdge();
                    startResizeRow();
                    break;
            }
        };

        var makeTDArrForLeftEdge = function() {
            var indexer = new Trex.TableUtil.Indexer(currentTable);
            var curBoundery = indexer.getBoundary(currentNode);

            if (curBoundery.left > 0) {
                leftTdArray = indexer.getTdArrHasRight(curBoundery.left - 1);
                rightTdArray = indexer.getTdArrHasLeft(curBoundery.left);
            }
        };

        var makeTDArrForRightEdge = function() {
            var indexer = new Trex.TableUtil.Indexer(currentTable);
            var curBoundery = indexer.getBoundary(currentNode);
            var colSize = indexer.getColSize();

            leftTdArray = indexer.getTdArrHasRight(curBoundery.right);

            if (curBoundery.right < colSize - 1) {
                rightTdArray = indexer.getTdArrHasLeft(curBoundery.right + 1);
            }
        };

        var makeTDArrForTopEdge = function() {
            var indexer = new Trex.TableUtil.Indexer(currentTable);
            var curBoundery = indexer.getBoundary(currentNode);

            topTdArray = indexer.getTdArrHasBottom(curBoundery.top - 1);
        };

        var makeTDArrForBottomEdge = function() {
            var indexer = new Trex.TableUtil.Indexer(currentTable);
            var curBoundery = indexer.getBoundary(currentNode);

            topTdArray = indexer.getTdArrHasTop(curBoundery.bottom);
        };

        var mouseupHandler = function() {
            switch (edgeType) {
                case EDGE_TYPE.LEFT:
                case EDGE_TYPE.RIGHT:
                    stopResizeCol();
                    break;
                case EDGE_TYPE.TOP:
                case EDGE_TYPE.BOTTOM:
                    stopResizeRow();
                    break;
            }
        };

        var mousemoveHandler = function() {
            if (isDragging) {
                currentDragger = getDragger();
                moveDraggingAction();
            }
            else {
                moveUnDraggingAction();
            }
        };

        var moveDraggingAction = function() {
            switch (edgeType) {
                case EDGE_TYPE.LEFT:
                case EDGE_TYPE.RIGHT:
                    moveCalcResizeCol();
                    break;
                case EDGE_TYPE.TOP:
                case EDGE_TYPE.BOTTOM:
                    moveCalcResizeRow();
                    break;
            }
        };

        var moveUnDraggingAction = function() {
			var td = $tom.find($tx.element(elem), "td");
			var isTxInfo = $tom.find(td, ".txc-info");
			if (td && !isTxInfo) {
                currentNode = td;
                edgeType = getEdgeType(currentNode);
                showDragger();
            }
            else {
                edgeType = EDGE_TYPE.NONE;
                showDragger();
            }
        };

        var getDragger = function() {
            var dragger = _NULL;
            switch (edgeType) {
                case EDGE_TYPE.LEFT:
                case EDGE_TYPE.RIGHT:
                    dragger = colDragger;
                    break;
                case EDGE_TYPE.TOP:
                case EDGE_TYPE.BOTTOM:
                    dragger = rowDragger;
                    break;
            }
            return dragger;
        };

        var startResizeCol = function() {
            isDragging = _TRUE;
            leftWidthArr = [];
            rightWidthArr = [];
            var i = 0;

            if (leftTdArray) {
                for (i = 0; i < leftTdArray.length; i++) {
                    leftWidthArr.push(leftTdArray[i].offsetWidth);
                }
                currentLeftTDWidth = minimumOfArray(leftWidthArr);
                for (i = 0; i < leftTdArray.length; i++) {
                    if (currentLeftTDWidth == leftWidthArr[i]) {
                        currentLeftTD = leftTdArray[i];
                        break;
                    }
                }
            }
            if (rightTdArray) {
                for (i = 0; i < rightTdArray.length; i++) {
                    rightWidthArr.push(rightTdArray[i].offsetWidth);
                }
                currentRightTDWidth = minimumOfArray(rightWidthArr);
                for (i = 0; i < rightTdArray.length; i++) {
                    if (currentRightTDWidth == rightWidthArr[i]) {
                        currentRightTD = rightTdArray[i];
                        break;
                    }
                }
            }
            currentPointX = $tx.getCoordsTarget(currentDragger).left;
        };

        var moveCalcResizeCol = function() {
            if (isDragging) {
                var distX = parseInt(posiX - $tom.getScrollLeft(doc) - currentPointX);
                var left;

                if (currentLeftTD && currentRightTD) {
                    left = calcMiddleCol(currentLeftTD, distX);
                }

                if (currentLeftTD && currentRightTD == _NULL) {
                    left = calcLeft(currentLeftTD, distX)
                }

                if (currentLeftTD == _NULL && currentRightTD) {
                    left = calcRight(currentRightTD, distX);
                }
                if (left) {
                    $tx.setStyle(currentDragger, {
                        "left": left.toPx()
                    });
                }
            }
        };

        var calcMiddleCol = function(currentLeftTD, distX) {
            var bothWidth, movingLeftWidth, movingRightWidth, tdRect, left;
            bothWidth = currentLeftTDWidth + currentRightTDWidth;
            movingLeftWidth = currentLeftTDWidth + distX;
            movingRightWidth = currentRightTDWidth - distX;

            tdRect = $tx.getCoordsTarget(currentLeftTD);
            if (movingLeftWidth >= MIN_WIDTH && movingRightWidth >= MIN_WIDTH) {
                left = posiX - $tom.getScrollLeft(doc);
            }
            else if (movingLeftWidth <= MIN_WIDTH) {
                movingLeftWidth = MIN_WIDTH;
                movingRightWidth = bothWidth - movingLeftWidth;
                left = tdRect.left - $tom.getScrollLeft(doc) + movingLeftWidth;
            }
            else if (movingRightWidth <= MIN_WIDTH) {
                movingRightWidth = MIN_WIDTH;
                movingLeftWidth = bothWidth - movingRightWidth;
                left = tdRect.left - $tom.getScrollLeft(doc) + movingLeftWidth;
            }

            movingX = movingLeftWidth - currentLeftTDWidth;
            return left;
        };

        var calcLeft = function(currentLeftTD, distX) {

            var movingLeftWidth, tdRect, left;
            movingLeftWidth = currentLeftTDWidth + distX;
            tdRect = $tx.getCoordsTarget(currentLeftTD);
            if (movingLeftWidth < MIN_WIDTH) {
                movingLeftWidth = MIN_WIDTH;
            }

            left = tdRect.left - $tom.getScrollLeft(doc) + movingLeftWidth;
            movingX = movingLeftWidth - currentLeftTDWidth;
            return left;
        };

        var calcRight = function(currentRightTD, distX) {

            var movingRightWidth, tdRect, left;
            movingRightWidth = currentRightTDWidth - distX;
            tdRect = $tx.getCoordsTarget(currentRightTD);
            if (movingRightWidth < MIN_WIDTH) {
                movingRightWidth = MIN_WIDTH;
            }

            left = tdRect.left + movingRightWidth;
            movingX = currentRightTDWidth - movingRightWidth;
            return left;
        };

        var stopResizeCol = function() {
            resizeWidth();
            initDragger();
			moveUnDraggingAction();
            saveHistory();
        };

        var resizeWidth = function() {
            var i;
            if (leftTdArray) {
                for (i = 0; i < leftTdArray.length; i++) {
                    leftTdArray[i].style.width = (leftWidthArr[i] + movingX).toPx();
                }
            }
            if (rightTdArray) {
                for (i = 0; i < rightTdArray.length; i++) {
                    rightTdArray[i].style.width = (rightWidthArr[i] - movingX ).toPx();
                }
            }
            if (leftTdArray && rightTdArray == _NULL) {
                resizeTableWidth();
            }
        };

        var startResizeRow = function() {
            isDragging = _TRUE;
            currentTDHeight = currentNode.offsetHeight;
            topHeightArr = [];

            if (topTdArray) {
                var i;
                for (i = 0; i < topTdArray.length; i++) {
                    topHeightArr.push(parseInt(topTdArray[i].offsetHeight));
                }
                currentTDHeight = minimumOfArray(topHeightArr);
                for (i = 0; i < topTdArray.length; i++) {
                    if (currentTDHeight == topHeightArr[i]) {
                        currentTD = topTdArray[i];
                    }
                }
            }
            currentPointY = $tx.getCoordsTarget(currentDragger).top;
        };

        var moveCalcResizeRow = function() {
            if (isDragging) {
                var distY = posiY - $tom.getScrollTop(doc) - currentPointY;
                var movingHeight = currentTDHeight + parseInt(distY);
                var tdRect = $tx.getCoordsTarget(currentTD);
                var top = _NULL;
                if (movingHeight < 0) {
                    movingHeight = 0;
                    top = tdRect.top + movingHeight - $tom.getScrollTop(doc);
                }
                else {
                    top = posiY - $tom.getScrollTop(doc);
                }

                if (top) {
                    $tx.setStyle(currentDragger, {
                        "top": top.toPx()
                    });
                }
                movingY = movingHeight - currentTDHeight;
            }
        };

        var stopResizeRow = function() {
            resizeHeight();
            initDragger();
			moveUnDraggingAction();
            saveHistory();
        };

        var resizeHeight = function() {
            if (topTdArray) {
                for (var i = 0; i < topTdArray.length; i++) {
                    var height = topHeightArr[i] + movingY;
                    if (height < 0) {
                        height = 20;
                    }
                    topTdArray[i].style.height = height.toPx();
                }
            }
        };
        
        (function checkW3cBoxModel() {
			var div = doc.createElement( "div" );
			body.appendChild(div);
			div.style.width = div.style.paddingLeft = "1px";
			w3cBoxModelWorks = div.offsetWidth === 2;
			body.removeChild(div);
        })();

        var getEdgeType = function(node) {
            var rect, edgeType = EDGE_TYPE.NONE;
			//HISTORY. 아래 코드는 jQuery 1.6.4 에서 훔쳐옴..
			//버그 재현 코드
			/*
<TABLE><TBODY><TR><TD style="BORDER-TOP: #ff8b16 50px solid">
여기에 테이블 삽입.
</TD></TR></TBODY></TABLE>
			*/
			if ("getBoundingClientRect" in document.documentElement) {
				try {
					var doc = node.ownerDocument,
						docElem = doc.documentElement,
						body = doc.body;
					var box = node.getBoundingClientRect(),
						win = doc.defaultView || doc.parentWindow,
						clientTop  = docElem.clientTop  || body.clientTop  || 0,
						clientLeft = docElem.clientLeft || body.clientLeft || 0,
						scrollTop  = win.pageYOffset || w3cBoxModelWorks && docElem.scrollTop  || body.scrollTop,
						scrollLeft = win.pageXOffset || w3cBoxModelWorks && docElem.scrollLeft || body.scrollLeft,
						top  = box.top  + scrollTop  - clientTop,
						left = box.left + scrollLeft - clientLeft;
					rect = {
						top: top,
						left: left,
						bottom: top + node.offsetHeight,
						right: left + node.offsetWidth
					};
				} catch (e) {
					rect = _NULL;
				}
			}
			//기존 코드는 fallback.
			if (!rect) {
				rect = $tx.getCoordsTarget(node);
			}
            if ((posiX - rect.left) < 5 && node.cellIndex != 0) {
                edgeType = EDGE_TYPE.LEFT;
            }
            else if ((rect.right - 5) < posiX) {
                edgeType = EDGE_TYPE.RIGHT;
            }
            else if ((posiY - rect.top) < 5 && node.parentNode.rowIndex != 0) {
                edgeType = EDGE_TYPE.TOP;
            }
            else if ((rect.bottom - 5) < posiY) {
                edgeType = EDGE_TYPE.BOTTOM;
            }
            return edgeType;
        };

        var showDragger = function() {
            canvas.query(function(processor) {
                if (processor.table) {
                    if (processor.table.isDuringSelection() || canvas.config.readonly) {
                        edgeType = EDGE_TYPE.NONE;
                    }
                    switch (edgeType) {
                        case EDGE_TYPE.LEFT:
                        case EDGE_TYPE.RIGHT:
                            $tx.hide(rowDragger);
                            $tx.show(colDragger);
                            makeColDragger(colDragger);
                            currentDragger = colDragger;
                            break;
                        case EDGE_TYPE.TOP:
                        case EDGE_TYPE.BOTTOM:
                            $tx.hide(colDragger);
                            $tx.show(rowDragger);
                            makeRowDragger(rowDragger);
                            currentDragger = rowDragger;
                            break;
                        case EDGE_TYPE.NONE:
                            $tx.hide(colDragger);
                            $tx.hide(rowDragger);
                            break;
                    }
                }
            });
        };

        var makeColDragger = function(dragger) {
            if (dragger == _NULL) return;
            var left;

            if (isDragging) {
                left = $tx.getCoordsTarget(dragger).left;
                $tx.setStyle(dragger, {
                    "width": "2px",
                    "height": wysiwygPanel.el.clientHeight.toPx(),
                    "border": "1px dotted #81aFFC",
                    "background":"",
                    "left": left.toPx()
                });
                $tx.setOpacity(colDragger, 1);

            }
            else {
                left = posiX - $tom.getScrollLeft(doc);
                $tx.setStyle(dragger, {
                    "width": "2px",
                    "height": wysiwygPanel.el.clientHeight.toPx(),
                    "border": "",
                    "background":"#fff",
                    "left": left.toPx()
                });
                $tx.setOpacity(colDragger, 0);
            }
        };

        var makeRowDragger = function(dragger) {
            if (dragger == _NULL) return;
            var top = _NULL;

            if (isDragging) {
                top = $tx.getCoordsTarget(dragger).top;
                $tx.setStyle(dragger, {
                    "height": "2px",
                    "border": "1px dotted #81aFFC",
                    "background":"",
                    "top": top.toPx()
                });
                $tx.setOpacity(rowDragger, 1);
            }
            else {
                top = posiY - $tom.getScrollTop(doc);
                $tx.setStyle(dragger, {
                    "height": "2px",
                    "border": "",
                    "background":"#fff",
                    "top": top.toPx()
                });
                $tx.setOpacity(rowDragger, 0);
            }
        };

        /**
         * when I pasted MS office table, delete width or width style.
         */
        var resizeTableWidth = function() {
            var movingWidth = 0;
            if (currentTableWidth) {
                movingWidth = parseInt(currentTableWidth) + movingX;
                currentTable.width = movingWidth.toPx();
                currentTable.style.width = movingWidth.toPx();
            }
        };

        /**
         * dragger event binding
         */
        var eventBinding = function() {
            $tx.observe(_DOC.body, "mouseup", function(ev) {
                initElement(ev);
                mouseupHandler();
            });

            if ($tx.msie) {
                $tx.observe(body, "mousemove", function(ev) {
                    initElement(ev);
                    mousemoveHandler();
                });

                $tx.observe(body, "mouseup", function(ev) {
                    initElement(ev);
                    mouseupHandler();
                });
            }
            else {
                $tx.observe(win, "mousemove", function(ev) {
                    initElement(ev);
                    mousemoveHandler();
                });

                $tx.observe(win, "mouseup", function(ev) {
                    initElement(ev);
                    mouseupHandler();
                });
            }

            if ($tx.safari) {
                $tx.observe(_DOC.body, "mousemove", function(ev) {
                    if (isDragging) {
                        initElementForSafari(ev);
                        mousemoveHandler();
                    }
                });
            }

            $tx.observe(colDragger, "mousedown", function(ev) {
                initElement(ev);
                mouseDownHandler();
            });

            $tx.observe(rowDragger, "mousedown", function(ev) {
                initElement(ev);
                mouseDownHandler();
            });
        };

        var initElement = function(ev) {
            elem = ev;
            posiX = posX(elem);
            posiY = posY(elem);
        };

        var initElementForSafari = function(ev) {
            elem = ev;
            posiX = posX(elem) - $tx.getCoords(canvas.wysiwygEl).left + doc.body.scrollLeft;
            posiY = posY(elem) - $tx.getCoords(canvas.wysiwygEl).top + doc.body.scrollTop;
        };

        // tabledragger 에서 추가된 utility, check!!
        var posX = function(e) {
            var posx = 0;
            e = e || win.event;
            if (e.pageX) {
                posx = e.pageX;
            }
            else
            if (e.clientX) {
                posx = e.clientX + doc.body.scrollLeft + doc.documentElement.scrollLeft;
            }
            return posx;
        };

        var posY = function(e) {
            var posy = 0;
            e = e || win.event;
            if (e.pageY) {
                posy = e.pageY;
            }
            else
            if (e.clientY) {
                posy = e.clientY + doc.body.scrollTop + doc.documentElement.scrollTop;
            }
            return posy;
        };

        function minimumOfArray(array) {
            return Math.min.apply(Math, array);
        }

        function saveHistory() {
            console.log("saveHistory");
            canvas.history.saveHistory();
        }

        initDragger();
        eventBinding();
    });
});
