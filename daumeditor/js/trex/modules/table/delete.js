/*jslint nomen: false*/
/*global Trex, $tom, $tx, _FALSE, _NULL, _TRUE */
Trex.Table.Delete = Trex.Class.create({
	initialize: function (editor/*, config*/) {
		var canvas;
		canvas = editor.getCanvas();
		
		this.wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
	},
	/**
	 * deleteRow
	 * @param {Trex.Table.Selector} tableSelector
	 */
	deleteRow: function (tableSelector) {
		var boundary;
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			this.deleteRowOneByOne(tableSelector);
			tableSelector.reset();
			this.deleteEmptyTableByTableSelector(tableSelector);
		}
	},
	/**
	 * @private
	 * @param {Trex.Table.Selector} tableSelector
	 */
	deleteRowOneByOne: function (tableSelector) {
		var deleteStartIndex, count, boundary, indexer;
		boundary = tableSelector.getSelected();
		deleteStartIndex = boundary.top;
		count = boundary.bottom - boundary.top + 1;
		while (0 < count) {
			tableSelector.reloadIndexer();
			indexer = tableSelector.getIndexer();
			this.deleteRowByIndex(indexer, deleteStartIndex);
			count -= 1;
		}
		if (deleteStartIndex === 0) {
			this.drawTopBorder(tableSelector);
		}
	},
	drawTopBorder: function (tableSelector) {
		var indexer, tdArr, len, i, td;
		tableSelector.reloadIndexer();
		indexer = tableSelector.getIndexer();
		tdArr = indexer.getTdArrHasTop(0);
		len = tdArr.length;
		for (i = 0; i < len; i += 1) {
			td = tdArr[i];
			if (td.style.borderTop === "" && td.style.borderBottom !== "") {
				td.style.borderTop = td.style.borderBottom;
			}
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Indexer} indexer
	 * @param {number} index
	 */
	deleteRowByIndex: function (indexer, index) {
		var tdArr, hasTopTdArr, len, tr;
		tdArr = this.getTdArrByRowIndex(indexer, index);
		hasTopTdArr = this.getTdArrByHasTop(indexer, index);
		len = tdArr.length;
		if (0 < len) {
			tr = $tom.parent(tdArr[0]);
			this.deleteTdInDeleteRow(tdArr, hasTopTdArr, tr, indexer);
			$tom.remove(tr);
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Indexer} indexer
	 * @param {number} index
	 */
	getTdArrByRowIndex: function (indexer, index) {
		return indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: index,
			right: indexer.getColSize() - 1,
			bottom: index,
			left: 0
		}));
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Indexer} indexer
	 * @param {number} index
	 */
	getTdArrByHasTop: function (indexer, index) {
		return indexer.getTdArrHasTop(index);
	},
	/**
	 * 
	 * @param {Array} tdArr
	 * @param {Array} hasTopTdArr
	 * @param {Element} tr
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	deleteTdInDeleteRow: function (tdArr, hasTopTdArr, tr, indexer) {
		var len, i, td;
		len = tdArr.length;
		for (i = 0; i < len; i += 1) {
			td = tdArr[i];
			if (1 < td.rowSpan) {
				td.rowSpan -= 1;
				this.reduceHeightAsRow(td, tr);
				if (hasTopTdArr.contains(td)) {
					this.shiftRowOfTd(td, indexer);
				}
			} else {
				$tom.remove(td);
			}
		}
	},
	reduceHeightAsRow: function (td, tr) {
		var styleHeight, newHeight;
		if (td.style.height) {
			styleHeight = parseInt(td.style.height, 10);
			newHeight = styleHeight - tr.offsetHeight;
			if (0 < newHeight) {
				$tom.setStyles(td, {
					height: newHeight + "px"
				}, _TRUE);
			}
		}
	},
	/**
	 * @private
	 * @param {Eelement} td
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	shiftRowOfTd: function (td, indexer) {
		var tr, trForInsert, tdForInsert;
		tr = $tom.parent(td);
		trForInsert = $tom.next(tr, "tr");
		tdForInsert = this.getTdForInsert(td, trForInsert, indexer);
		if (tdForInsert) {
			$tom.insertAt(td, tdForInsert);
		} else {
			$tom.append(trForInsert, td);
		}
	},
	/**
	 * @private
	 * @param {Element} td
	 * @param {Element} trForInsert
	 * @param {Trex.TableUtil.Indexer} indexer
	 */
	getTdForInsert: function (td, trForInsert, indexer) {
		var currentBoundary, colForInsert, cells, len, i, cell, cellBoundary;
		currentBoundary = indexer.getBoundary(td);
		colForInsert = currentBoundary.left;
		cells = trForInsert.cells;
		len = cells.length;
		for (i = 0; i < len; i += 1) {
			cell = cells[i];
			cellBoundary = indexer.getBoundary(cell);
			if (colForInsert <= cellBoundary.left) {
				return cell;
			}
		}
		return _NULL;
	},
	/**
	 * @private
	 * @param {Trex.Table.Selector} tableSelector
	 */
	deleteEmptyTableByTableSelector: function (tableSelector) {
		var indexer, table;
		indexer = tableSelector.getIndexer();
		table = indexer.table;
		if (table.rows.length === 0) {
			$tom.remove(table);
		}
	},
	/**
	 * deleteCol
	 * @param {Trex.Table.Selector} tableSelector
	 */
	deleteCol: function (tableSelector) {
		var boundary;
		boundary = tableSelector.getSelected();
		if (boundary.isValid()) {
			this.deleteColOneByOne(tableSelector);
			tableSelector.reset();
			this.deleteEmptyTableByTableSelector(tableSelector);
		}
	},
	/**
	 * @private
	 * @param {Trex.Table.Selector} tableSelector
	 */
	deleteColOneByOne: function (tableSelector) {
		var deleteStartIndex, count, boundary, indexer;
		boundary = tableSelector.getSelected();
		deleteStartIndex = boundary.left;
		count = boundary.right - boundary.left + 1;
		while (0 < count) {
			tableSelector.reloadIndexer();
			indexer = tableSelector.getIndexer();
			this.deleteColByIndex(indexer, deleteStartIndex);
			count -= 1;
		}
		if (deleteStartIndex === 0) {
			this.drawLeftBorder(tableSelector);
		}
	},
	drawLeftBorder: function (tableSelector) {
		var indexer, tdArr, len, i, td;
		tableSelector.reloadIndexer();
		indexer = tableSelector.getIndexer();
		tdArr = indexer.getTdArrHasLeft(0);
		len = tdArr.length;
		for (i = 0; i < len; i += 1) {
			td = tdArr[i];
			if (td.style.borderLeft === "" && td.style.borderRight !== "") {
				td.style.borderLeft = td.style.borderRight;
			}
		}
	},
	/**
	 * @private
	 * @param {Trex.TableUtil.Indexer} indexer
	 * @param {number} index
	 */
	deleteColByIndex: function (indexer, index) {
		var tdArr, len, i, td;
		tdArr = this.getTdArrByColIndex(indexer, index);
		len = tdArr.length;
		for (i = 0; i < len; i += 1) {
			td = tdArr[i];
			if (1 < td.colSpan) {
				td.colSpan -= 1;
				//TODO.azki width 조절..?
			} else {
				$tom.remove(td);
			}
		}
	},
	getTdArrByColIndex: function (indexer, index) {
		return indexer.getTdArr(new Trex.TableUtil.Boundary({
			top: 0,
			right: index,
			bottom: indexer.getRowSize() - 1,
			left: index
		}));
	}
});
