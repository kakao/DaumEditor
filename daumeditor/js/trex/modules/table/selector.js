/*jslint nomen: false*/
/*global Trex, $tom, $tx, _FALSE, _NULL, _TRUE */
Trex.Table.Selector = Trex.Class.create({
	SELECTED_CLASS_NAME: "tx_table_selected_cell",
	SELECTED_CSS_TEXT: "{background:#e9eeff !important}",
	initialize: function (editor/*, config*/) {
		this.canvas = editor.getCanvas();
		this.wysiwygPanel = this.canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
		this.htmlBody = this.getHtmlBody();
		this.isDragging = _FALSE;
		this.currentTable = _NULL;
		this.currentTd = _NULL;
		this.paintedTdArr = [];
		this.startCellBoundary = new Trex.TableUtil.Boundary();
		this.endCellBoundary = this.startCellBoundary;
		this.selectedBoundary = new Trex.TableUtil.Boundary();
		this.tableIndexer = _NULL;
		
		this.applyCss();
		this.observeEvent();
	},
	/**
	 * @private
	 * @return {Element}
	 */
	getHtmlBody: function () {
		var doc;
		doc = this.wysiwygPanel.getDocument();
		return doc.body;
	},
	/**
	 * @private
	 */
	applyCss: function () {
		var doc;
		doc = this.wysiwygPanel.getDocument();
		$tx.applyCSSText(doc, "." + this.SELECTED_CLASS_NAME + this.SELECTED_CSS_TEXT);
	},
	/**
	 * @private
	 * @param {Element} body
	 */
	observeEvent: function () {
		var self;
		self = this;
		this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function (e) {
			var elem;
			elem = $tx.element(e);
			self.onmousedown(elem);
		});
		$tx.observe(this.htmlBody, "mousemove", function (e) {
			var elem;
			elem = $tx.element(e);
			self.onmousemove(elem);
		});
		this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function (e) {
			self.onmouseup();
		});
        var _tempWinTop; // #FTDUEDTR-1426
        try {
            _tempWinTop = _WIN.top;
            var _tempWinDoc = _tempWinTop.document;
        } catch(e) {
            _tempWinTop = _WIN;
        }
		$tx.observe(_tempWinTop, "mouseup", function (e) {
			self.onmouseup();
		});
		this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_KEYDOWN, function (e) {
			if (self.isDragging) {
				$tx.stop(e);
				self.reset();
			} else {
				self.onkeydown(e.ctrlKey, e.keyCode);
			}
		});
		
		this.canvas.observeJob(Trex.Ev.__CANVAS_DATA_INITIALIZE, function (mode) {
			if (mode === Trex.Canvas.__WYSIWYG_MODE) {
				self.clearSelected();
			}
		});
	},
	/**
	 * @private
	 * @param {Element} elem
	 */
	onmousedown: function (elem) {
		var td, isTxInfo;
		this.reset();
		if (this.canvas.config.readonly === _FALSE) {
			td = Trex.TableUtil.getClosestByTagNames(["td", "th"], elem);
			isTxInfo = $tom.find(td, ".txc-info");
			if (td && !isTxInfo) {
				this.selectStart(td);
				this.turnOnDragging();
			}
		}
	},
	/**
	 * @private
	 * @param {Element} elem
	 */
	onmousemove: function (elem) {
		var td, table, notSelected;
		if (this.isDragging) {
			td = Trex.TableUtil.getClosestByTagNames(["td", "th"], elem);
			if (td) {
				table = Trex.TableUtil.getClosestByTagNames(["table"], td);
				if (table === this.currentTable && td !== this.currentTd) {
					this.selectEnd(td);
					this.applySelected();
					Trex.TableUtil.collapseCaret(this.wysiwygPanel, elem);
				}
			} else {
				notSelected = (this.endCellBoundary === this.startCellBoundary);
				if (this.currentTd && notSelected) {
					this.selectEnd(this.currentTd);
					this.applySelected();
					Trex.TableUtil.collapseCaret(this.wysiwygPanel, elem);
				}
			}
		}
	},
	/**
	 * @private
	 */
	onmouseup: function () {
		if (this.isDragging) {
			this.turnOffDragging();
		}
	},
	/**
	 * @private
	 */
	onkeydown: function (ctrlKey, keyCode) {
		var selectedTdArr, len, i;
		if (ctrlKey === _FALSE) {
			if (keyCode === $tx.KEY_DELETE) {
				selectedTdArr = this.getSelectedTdArr();
				len = selectedTdArr.length;
				for (i = 0; i < len; i += 1) {
					Trex.TableUtil.emptyTd(selectedTdArr[i]);
				}
			}
			this.reset();
		}
	},
	/**
	 * @private
	 * @param {Element} td
	 */
	selectStart: function (td) {
		this.currentTable = Trex.TableUtil.getClosestByTagNames(["table"], td);
		this.tableIndexer = new Trex.TableUtil.Indexer(this.currentTable);
		this.startCellBoundary = this.tableIndexer.getBoundary(td);
		this.endCellBoundary = this.startCellBoundary;
		this.currentTd = td;
	},
	/**
	 * @private
	 * @param {Element} td
	 */
	selectEnd: function (td) {
		this.endCellBoundary = this.tableIndexer.getBoundary(td);
		this.currentTd = td;
	},
	/**
	 * @private
	 */
	applySelected: function () {
		this.calculateSelectedBoundary();
		this.extendSelectedBoundary();
		this.paint();
	},
	/**
	 * @private
	 */
	calculateSelectedBoundary: function () {
		this.selectedBoundary = new Trex.TableUtil.Boundary();
		this.selectedBoundary.merge(this.startCellBoundary);
		this.selectedBoundary.merge(this.endCellBoundary);
	},
	/**
	 * @private
	 */
	extendSelectedBoundary: function () {
		var needExtend;
		needExtend = this.selectedBoundary.isValid();
		while (needExtend) {
			needExtend = this.oneTimeExtendBoundary();
		}
	},
	/**
	 * @private
	 * @return {boolean} wasExtended
	 */
	oneTimeExtendBoundary: function () {
		var selectedTdArr, i, len, extendedBoundary, wasExtended;
		selectedTdArr = this.tableIndexer.getTdArr(this.selectedBoundary);
		len = selectedTdArr.length;
		for (i = 0; i < len; i += 1) {
			extendedBoundary = this.tableIndexer.getBoundary(selectedTdArr[i]);
			wasExtended = this.selectedBoundary.merge(extendedBoundary);
			if (wasExtended) {
				return _TRUE;
			}
		}
		return _FALSE;
	},
	/**
	 * @private
	 */
	paint: function () {
		var tdArrToSelect, tdArrToUnselect;
		tdArrToSelect = this.tableIndexer.getTdArr(this.selectedBoundary);
		tdArrToUnselect = Array.prototype.without.apply(this.paintedTdArr, tdArrToSelect);
		
		this.paintSelected(tdArrToSelect);
		this.eraseSelected(tdArrToUnselect);
	},
	/**
	 * @private
	 * @param {Array} tdArr
	 */
	paintSelected: function (tdArr) {
		var self;
		self = this;
		this.paintedTdArr = [];
		tdArr.each(function (td) {
			$tx.addClassName(td, self.SELECTED_CLASS_NAME);
			self.paintedTdArr.push(td);
		});
	},
	/**
	 * @private
	 * @param {Array} tdArr
	 */
	eraseSelected: function (tdArr) {
		this.removeClassName(tdArr);
		this.paintedTdArr = Array.prototype.without.apply(this.paintedTdArr, tdArr);
	},
	/**
	 * @private
	 * @param {Array} tdArr
	 */
	removeClassName: function (tdArr) {
		var self;
		self = this;
		tdArr.each(function (td) {
			var removeAttrResult;
			$tx.removeClassName(td, self.SELECTED_CLASS_NAME);
			if (td.className === "") {
				removeAttrResult = td.removeAttribute("class");
				if (removeAttrResult === _FALSE) { //for IE6, IE7.
					td.removeAttribute("className");
				}
			}
		});
	},
	/**
	 * @private
	 */
	clearSelected: function () {
		var tdArr;
		tdArr = $tom.collectAll(this.htmlBody, "." + this.SELECTED_CLASS_NAME);
		this.removeClassName(tdArr);
		this.paintedTdArr = [];
	},
	/**
	 * @private
	 */
	resetBoundary: function () {
		this.startCellBoundary = new Trex.TableUtil.Boundary();
		this.endCellBoundary = this.startCellBoundary;
		this.selectedBoundary = new Trex.TableUtil.Boundary();
	},
	/**
	 * @private
	 */
	turnOnDragging: function () {
		this.isDragging = _TRUE;
	},
	/**
	 * @private
	 */
	turnOffDragging: function () {
		this.isDragging = _FALSE;
	},
	/**
	 * @private
	 */
	resetDragging: function () {
		this.isDragging = _FALSE;
		this.currentTable = _NULL;
		this.currentTd = _NULL;
	},
	/**
	 * isDuringSelection
	 * @return {boolean} isDragging
	 */
	isDuringSelection: function () {
		return this.isDragging;
	},
	/**
	 * getIndexer
	 * @return {Trex.TableUtil.Indexer} indexer
	 */
	getIndexer: function () {
		return this.tableIndexer;
	},
	/**
	 * getSelected
	 * @return {Trex.TableUtil.Boundary} boundary
	 */
	getSelected: function () {
		return this.selectedBoundary;
	},
	/**
	 * getSelectedTdArr
	 * @return {Array} tddArr
	 */
	getSelectedTdArr: function () {
		if (this.selectedBoundary.isValid()) {
			return this.tableIndexer.getTdArr(this.selectedBoundary);
		}
		return [];
	},
	/**
	 * selectByBoundary
	 * @param {Trex.TableUtil.Boundary} boundary
	 */
	selectByBoundary: function (boundary) {
		this.resetBoundary();
		this.selectedBoundary = boundary;
		this.paint();
	},
	/**
	 * selectByTd
	 * @param {Element} startTd
	 * @param {Element} endTd
	 */
	selectByTd: function (startTd, endTd) {
		this.selectStart(startTd);
		this.selectEnd(endTd);
		this.applySelected();
	},
	/**
	 * reset
	 */
	reset: function () {
		this.clearSelected();
		this.resetBoundary();
		this.resetDragging();
		this.reloadIndexer();
	},
	/**
	 * reloadIndexer
	 */
	reloadIndexer: function () {
		if (this.tableIndexer) {
			this.tableIndexer.reload();
		}
	},
	/**
	 * getSizeOfSelected
	 * @return {Object} size(width,height)
	 */
	getSizeOfSelected: function () {
		var selectedTdArr, firstTd, lastTd, firstTdPosition, lastTdPosition;
		selectedTdArr = this.getSelectedTdArr();
		if (0 < selectedTdArr.length) {
			firstTd = selectedTdArr[0];
			lastTd = selectedTdArr[selectedTdArr.length - 1];
			firstTdPosition = $tom.getPosition(firstTd);
			lastTdPosition = $tom.getPosition(lastTd);
			return {
				width: lastTdPosition.x + lastTdPosition.width - firstTdPosition.x,
				height: lastTdPosition.y + lastTdPosition.height - firstTdPosition.y
			};
		}
		return {
			width: 0,
			height: 0
		};
	}
});
