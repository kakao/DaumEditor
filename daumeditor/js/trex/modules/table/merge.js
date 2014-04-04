/*jslint nomen: false*/
/*global Trex, $tom, $tx, _FALSE, _NULL, _TRUE, TXMSG */
TrexMessage.addMsg({
    '@table.merge.confirm': '셀을 병합하면 맨 위쪽 셀에 있는 값만 남고 나머지 값은 잃게 됩니다.',
    '@table.merge.more.select.cells': '두 개 이상의 셀을 선택해주세요.'
});

Trex.Table.Merge = Trex.Class.create({
	initialize: function (editor/*, config*/) {
		var canvas;
		canvas = editor.getCanvas();
		
		this.wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
	},
	/**
	 * merge
	 * @param {Trex.Table.Selector} tableSelector
	 */
	merge: function (tableSelector) {
		var tdArr, td, selectedSize;
		tableSelector.reloadIndexer();
		tdArr = tableSelector.getSelectedTdArr();
		if (1 < tdArr.length) {
            var isExistContent = this.isExistContents(tdArr, 1);// 0번째는 merge시 남겨지는 데이터이므로 무시한다.
            if (isExistContent && confirm(TXMSG('@table.merge.confirm')) == _FALSE) {
                return;
            }

			selectedSize = tableSelector.getSizeOfSelected();
			td = tdArr[0];
			
			this.deleteCellForMerge(tdArr);
			this.extendCellForMerge(td, tableSelector, selectedSize);

			tableSelector.reset();
			tableSelector.selectByTd(td, td);
			Trex.TableUtil.collapseCaret(this.wysiwygPanel, td);
		} else {
			alert(TXMSG('@table.merge.more.select.cells'));
		}
	},
    isExistContents: function(tdArr, startIndex) {
        startIndex = startIndex || 0;// default 0
        var flag = _TRUE;
        for(var i= startIndex, max=tdArr.length; i<max; i++) {
            var entry = tdArr[i] || "";
            var html = entry.innerHTML.trim().toLowerCase().replace(/(&nbsp;|\s)/g, '');
            var equalBogusType1 = (html == "<p></p>"),// &nbsp; 는 치환하므로 존재할 수 없음
                equalBogusType2 = (html == "<p><br></p>"),
                equalEmpty = (html == "");

            if (equalBogusType1 || equalBogusType2 || equalEmpty) {
                flag = _FALSE;
                break;
            }
        }
        return flag;
    },
	/**
	 * @private
	 * @param {Array} tdArr
	 */
	deleteCellForMerge: function (tdArr) {
		var data, trimedData, i, len;
		data = tdArr[0].innerHTML;
		len = tdArr.length;
		for (i = 1; i < len; i += 1) {
			trimedData = data.replace(Trex.__WORD_JOINER_REGEXP, "").trim();
			if (trimedData === "" || trimedData === "&nbsp;") {
				data = tdArr[i].innerHTML;
			}
			$tom.remove(tdArr[i]);
		}
		tdArr[0].innerHTML = data;
	},
	/**
	 * @private
	 * @param {Element} td
	 * @param {Trex.Table.Selector} tableSelector
	 * @param {Object} selectedSize
	 */
	extendCellForMerge: function (td, tableSelector, selectedSize) {
		var selectedBoundary;
		selectedBoundary = tableSelector.getSelected();
		td.colSpan = selectedBoundary.right - selectedBoundary.left + 1;
		td.rowSpan = selectedBoundary.bottom - selectedBoundary.top + 1;
		if (td.style.width) {
			$tom.setWidth(td, selectedSize.width + "px");
		}
		if (td.style.height) {
			$tom.setHeight(td, selectedSize.height + "px");
		}
	},
	/**
	 * resetMerge
	 * @param {Trex.Table.Selector} tableSelector
	 */
	resetMerge: function (tableSelector) {
		//TODO.azki cancel -> reset 으로 바꿀까!?
		var colResult, rowResult;
		tableSelector.reloadIndexer();
		colResult = this.splitCol(tableSelector);
		tableSelector.reloadIndexer();
		rowResult = this.splitRow(tableSelector);
		if (colResult === _FALSE && rowResult === _FALSE) {
			alert("이미 합쳐진 셀만 분할 가능합니다.");
		} else {
			tableSelector.reloadIndexer();
		}
	},
	/**
	 * @private
	 * @param {Trex.Table.Selector} tableSelector
	 * @return {boolean} changed
	 */
	splitCol: function (tableSelector) {
		var changed, tdArr, td, i, len, splitTdResult;
		changed = _FALSE;
		tdArr = tableSelector.getSelectedTdArr();
		len = tdArr.length;
		if (0 < len) {
			for (i = 0; i < len; i += 1) {
				td = tdArr[i];
				splitTdResult = this.splitTdByColSpan(td);
				changed = changed || splitTdResult;
			}
		}
		return changed;
	},
	/**
	 * @private
	 * @param {Trex.Table.Selector} tableSelector
	 * @return {boolean} changed
	 */
	splitRow: function (tableSelector) {
		var changed, tdArr, td, i, len, splitTdResult;
		changed = _FALSE;
		tdArr = tableSelector.getSelectedTdArr();
		len = tdArr.length;
		if (0 < len) {
			for (i = 0; i < len; i += 1) {
				td = tdArr[i];
				splitTdResult = this.splitTdByRowSpan(td);
				changed = changed || splitTdResult;
			}
		}
		return changed;
	},
	/**
	 * @private
	 * @param {Element} td
	 * @return {boolean} changed
	 */
	splitTdByColSpan: function (td) {
		var newTdCount, newTd, changed;
		newTdCount = td.colSpan - 1;
		changed = 0 < newTdCount;
		Trex.TableUtil.splitWidthByColSpan(td);
		td.colSpan = 1;
		while (0 < newTdCount) {
			newTd = Trex.TableUtil.cloneNodeForEmptyTd(td);
			//TODO.azki set border top/left.
			$tom.insertNext(newTd, td);
			newTdCount -= 1;
		}
		return changed;
	},
	/**
	 * @private
	 * @param {Element} td
	 * @return {boolean} changed
	 */
	splitTdByRowSpan: function (td) {
		var changed, newTdCount;
		newTdCount = td.rowSpan - 1;
		changed = 0 < newTdCount;
		Trex.TableUtil.splitHeightByRowSpan(td);
		while (0 < newTdCount) {
			this.splitTdOneByOne(td);
			newTdCount -= 1;
		}
		return changed;
	},
	/**
	 * @private
	 * @param {Element} td
	 */
	splitTdOneByOne: function (td) {
		var trForInsert, tdForInsert, newTd;
		trForInsert = this.getTrForInsert(td);
		tdForInsert = this.getTdForInsert(td, trForInsert);
		newTd = Trex.TableUtil.cloneNodeForEmptyTd(td);
		newTd.rowSpan = 1;
		td.rowSpan -= 1;
		if (tdForInsert) {
			$tom.insertAt(newTd, tdForInsert);
		} else {
			$tom.append(trForInsert, newTd);
		}
	},
	/**
	 * @private
	 * @param {Element} td
	 */
	getTrForInsert: function (td) {
		var i, len, trForInsert;
		trForInsert = $tom.parent(td);
		len = td.rowSpan - 1;
		for (i = 0; i < len; i += 1) {
			trForInsert = $tom.next(trForInsert, "tr");
		}
		return trForInsert;
	},
	/**
	 * @private
	 * @param {Element} td
	 * @param {Element} trForInsert
	 */
	getTdForInsert: function (td, trForInsert) {
		var tableIndexer, currentBoundary, colForInsert, cells, len, i, cell, cellBoundary;
		tableIndexer = Trex.TableUtil.getTableIndexerFromTd(td);
		currentBoundary = tableIndexer.getBoundary(td);
		colForInsert = currentBoundary.left;
		cells = trForInsert.cells;
		len = cells.length;
		for (i = 0; i < len; i += 1) {
			cell = cells[i];
			cellBoundary = tableIndexer.getBoundary(cell);
			if (colForInsert <= cellBoundary.left) {
				return cell;
			}
		}
		return _NULL;
	}
});
