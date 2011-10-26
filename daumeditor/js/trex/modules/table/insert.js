/*jslint nomen: false*/
/*global Trex, $tom, $tx, _FALSE, _NULL, _TRUE */
Trex.Table.Insert = Trex.Class.create({
	COL_DIRECTION: {
		LEFT: "left",
		RIGHT: "right"
	},
	
	initialize: function (editor/*, config*/) {
		var canvas;
		canvas = editor.getCanvas();
		
		this.wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
	},
	/**
	 * insertRowAbove
	 * @param {Trex.Table.Selector} tableSelector
	 */
	insertRowAbove: function (tableSelector) {
		var boundary, indexer;
		tableSelector.reloadIndexer();
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			indexer = tableSelector.getIndexer();
			this.insertRowAboveByBoundary(boundary, indexer);
			tableSelector.reset();
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Boundary} boundary
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	insertRowAboveByBoundary: function (boundary, indexer) {
		var table, rowCount, insertIndex, tdArrAtBoundaryLine, tdArrForClone;
		table = indexer.table;
		rowCount = boundary.bottom - boundary.top + 1;
		insertIndex = boundary.top;
		tdArrAtBoundaryLine = indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: boundary.top,
			right: indexer.getColSize() - 1,
			bottom: boundary.top,
			left: 0
		}));
		tdArrForClone = indexer.getTdArrHasTop(boundary.top);
		this.addRow(table, rowCount, insertIndex, tdArrAtBoundaryLine, tdArrForClone);
	},
	/**
	 * addRow
	 * @param {Element} table
	 * @param {number} rowCount
	 * @param {number} insertIndex
	 * @param {Array} tdArrAtBoundaryLine
	 * @param {Array} tdArrForClone
	 */
	addRow: function (table, rowCount, insertIndex, tdArrAtBoundaryLine, tdArrForClone) {
		var fn, i, tr_closure;
		fn = function (td) {
			var newTd;
			if (tdArrForClone.contains(td)) {
				newTd = Trex.TableUtil.cloneNodeForEmptyTd(td);
				Trex.TableUtil.splitHeightByRowSpan(newTd);
				//TODO.azki left / top 보더 세팅이 필요할지도.?
				newTd.rowSpan = 1;
				tr_closure.appendChild(newTd); //tr_closure is closure variable.
			} else {
				td.rowSpan += 1;
			}
		};
		for (i = 0; i < rowCount; i += 1) {
			tr_closure = table.insertRow(insertIndex);
			tdArrAtBoundaryLine.each(fn);
		}
	},
	/**
	 * insertRowBelow
	 * @param {Trex.Table.Selector} tableSelector
	 */
	insertRowBelow: function (tableSelector) {
		var boundary, indexer;
		tableSelector.reloadIndexer();
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			indexer = tableSelector.getIndexer();
			this.insertRowBelowByBoundary(boundary, indexer);
			tableSelector.reset();
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Boundary} boundary
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	insertRowBelowByBoundary: function (boundary, indexer) {
		var table, rowCount, insertIndex, tdArrAtBoundaryLine, tdArrForClone;
		table = indexer.table;
		rowCount = boundary.bottom - boundary.top + 1;
		insertIndex = boundary.bottom + 1;
		tdArrAtBoundaryLine = indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: boundary.bottom,
			right: indexer.getColSize() - 1,
			bottom: boundary.bottom,
			left: 0
		}));
		tdArrForClone = indexer.getTdArrHasBottom(boundary.bottom);
		this.addRow(table, rowCount, insertIndex, tdArrAtBoundaryLine, tdArrForClone);
	},
	/**
	 * insertColLeft
	 * @param {Trex.Table.Selector} tableSelector
	 */
	insertColLeft: function (tableSelector) {
		var boundary, indexer;
		tableSelector.reloadIndexer();
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			indexer = tableSelector.getIndexer();
			this.insertColLeftByBoundary(boundary, indexer);
			tableSelector.reset();
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Boundary} boundary
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	insertColLeftByBoundary: function (boundary, indexer) {
		var colCount, tdArrAtBoundaryLine, tdArrForClone;
		colCount = boundary.right - boundary.left + 1;
		tdArrAtBoundaryLine = indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: 0,
			right: boundary.left,
			bottom: indexer.getRowSize() - 1,
			left: boundary.left
		}));
		tdArrForClone = indexer.getTdArrHasLeft(boundary.left);
		this.addCol(colCount, tdArrAtBoundaryLine, tdArrForClone, this.COL_DIRECTION.LEFT);
	},
	/**
	 * addCol
	 * @param {number} colCount
	 * @param {Array} tdArrAtBoundaryLine
	 * @param {Array} tdArrForClone
	 * @param {Trex.Table.Insert.COL_DIRECTION} direction
	 */
	addCol: function (colCount, tdArrAtBoundaryLine, tdArrForClone, direction) {
		var self, fn, i;
		self = this;
		fn = function (td) {
			var newTd;
			if (tdArrForClone.contains(td)) {
				newTd = Trex.TableUtil.cloneNodeForEmptyTd(td);
				Trex.TableUtil.splitWidthByColSpan(newTd);
				//TODO.azki left / top 보더 세팅이 필요할지도.?
				newTd.colSpan = 1;
				if (direction === self.COL_DIRECTION.LEFT) {
					$tom.insertAt(newTd, td);
				} else {
					$tom.insertNext(newTd, td);
				}
			} else {
				td.colSpan += 1;
			}
		};
		for (i = 0; i < colCount; i += 1) {
			tdArrAtBoundaryLine.each(fn);
		}
	},
	/**
	 * insertColRight
	 * @param {Trex.Table.Selector} tableSelector
	 */
	insertColRight: function (tableSelector) {
		var boundary, indexer;
		tableSelector.reloadIndexer();
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			indexer = tableSelector.getIndexer();
			this.insertColRightByBoundary(boundary, indexer);
			tableSelector.reset();
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Boundary} boundary
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	insertColRightByBoundary: function (boundary, indexer) {
		var colCount, tdArrAtBoundaryLine, tdArrForClone;
		colCount = boundary.right - boundary.left + 1;
		tdArrAtBoundaryLine = indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: 0,
			right: boundary.right,
			bottom: indexer.getRowSize() - 1,
			left: boundary.right
		}));
		tdArrForClone = indexer.getTdArrHasRight(boundary.right);
		this.addCol(colCount, tdArrAtBoundaryLine, tdArrForClone, this.COL_DIRECTION.RIGHT);
	}
});
