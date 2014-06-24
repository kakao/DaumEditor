/*jslint nomen: false*/
/*global Trex, $tom, $tx, _FALSE, _NULL, _TRUE */
Trex.Table.Selector = Trex.Class.create({
	SELECTED_CLASS_NAME: "tx_table_selected_cell",
    SELECTED_CSS_TEXT: "{background:#D8E9FD !important;background:rgba(179, 212, 253, 0.5) !important;}",
	initialize: function (editor/*, config*/) {
		this.canvas = editor.getCanvas();
		this.wysiwygPanel = this.canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
		this.htmlBody = this.getHtmlBody();
		this.isDragging = _FALSE;
        this.isSelectMode = _FALSE;
		this.currentTable = _NULL;
		this.currentTd = _NULL;
		this.paintedTdArr = [];
		this.startCellBoundary = new Trex.TableUtil.Boundary();
		this.endCellBoundary = this.startCellBoundary;
		this.selectedBoundary = new Trex.TableUtil.Boundary();
		this.tableIndexer = _NULL;

        this.selectModeKeyObserver = new (Trex.Class.create({$mixins: [Trex.I.KeyObservable], initialize: function(){}}));
        this.normalModeKeyObserver = new (Trex.Class.create({$mixins: [Trex.I.KeyObservable], initialize: function(){}}));

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
				self.onkeydown(e);
			}
		});
		
		this.canvas.observeJob(Trex.Ev.__CANVAS_DATA_INITIALIZE, function (mode) {
			if (mode === Trex.Canvas.__WYSIWYG_MODE) {
				self.clearSelected();
			}
		});

        function getTdFromElement(elem){
            var td, isTxInfo;
            if (self.canvas.config.readonly === _FALSE) {
                td = Trex.TableUtil.getClosestByTagNames(["td", "th"], elem);
                isTxInfo = $tom.find(td, ".txc-info");
                if (td && !isTxInfo) {
                    return td
                }
            }
            return _NULL;
        }

        this.canvas.observeKey({
            shiftKey: true,
            keyCode:35
        }, function (e){
            var elem, td;
            elem = self.canvas.getProcessor().getNode();
            td = getTdFromElement(elem);
            if(!td) return;
            self.isSelectMode = _TRUE;
            self.selectStart(td);
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, elem);
        });

        function selectByArrowKey(f){
            var b = self.tableIndexer.getBoundary(self.currentTd);
            var pos = f(b);
            var elem = self.tableIndexer.getTd(pos.top, pos.left);
            if(!elem) return;
            self.selectEnd(elem);
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, elem);

        }
        //왼쪽 화살표
        this.selectModeKeyObserver.observeKey({
            keyCode: 37
        }, function(e){
            selectByArrowKey(function(pos){
                return {top:pos.top, left:pos.left - 1}
            });
        });
        //위 화살표
        this.selectModeKeyObserver.observeKey({
            keyCode: 38
        }, function(e){
            selectByArrowKey(function(pos){
                return {top:pos.top - 1, left:pos.left}
            });
        });
        //오른쪽 화살표
        this.selectModeKeyObserver.observeKey({
            keyCode: 39
        }, function(e){
            selectByArrowKey(function(pos){
                return {top:pos.top, left:pos.right+1};
            });
        });
        //아래 화살표
        this.selectModeKeyObserver.observeKey({
            keyCode: 40
        }, function(e){
            selectByArrowKey(function(pos){
                return {top:pos.bottom+1, left:pos.left};
            });
        });
        //esc누르면 table변경 모드에서 빠져 나온다.
        this.selectModeKeyObserver.observeKey({
            keyCode: 27
        }, function(e){
            self.reset();
        });
        //del키를 누르면 내용을 지운다.
        this.selectModeKeyObserver.observeKey({
            keyCode: 46
        }, function(e){
            self.deleteContents();
        });
        //ctrl + shiftKey + m 표를 병합한다.
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            shiftKey: _TRUE,
            keyCode: 77
        }, function(e){
            self.canvas.execute(function(processor){
                processor.table.merge(self)
            });
        });
        //ctrl + shiftKey + s 표를 분할한다.
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            shiftKey: _TRUE,
            keyCode: 83
        }, function(e){
            self.canvas.execute(function(processor){
                processor.table.resetMerge(self)
            });
        });

        //shift + 오른쪽 화살표
        this.selectModeKeyObserver.observeKey({
            shiftKey: _TRUE,
            keyCode: 39
        }, function(e){
            self.selectRow(self.currentTd, 'RIGHT');
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, self.currentTd);
        });

        //shift + 왼쪽 화살표
        this.selectModeKeyObserver.observeKey({
            shiftKey: _TRUE,
            keyCode: 37
        }, function(e){
            self.selectRow(self.currentTd, 'LEFT');
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, self.currentTd);
        });

        //shift + 윗쪽 화살표
        this.selectModeKeyObserver.observeKey({
            shiftKey: _TRUE,
            keyCode: 38
        }, function(e){
            self.selectCol(self.currentTd, 'TOP');
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, self.currentTd);
        });

        //shift + 아랫쪽 화살표
        this.selectModeKeyObserver.observeKey({
            shiftKey: _TRUE,
            keyCode: 40
        }, function(e){
            self.selectCol(self.currentTd, 'BOTTOM');
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, self.currentTd);
        });

        //ctrl + 오른쪽 화살표
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            keyCode: 39
        }, function(e){
            self.canvas.getProcessor().table.resize({width: 5}, _TRUE);
        });
        //ctrl + 왼쪽 화살표
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            keyCode: 37
        }, function(e){
            self.canvas.getProcessor().table.resize({width: -5}, _TRUE);
        });
        //ctrl + 윗쪽 화살표
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            keyCode: 38
        }, function(e){
            self.canvas.getProcessor().table.resize({height: -5}, _TRUE);
        });
        //ctrl + 아랫쪽 화살표
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            keyCode: 40
        }, function(e){
            self.canvas.getProcessor().table.resize({height: 5}, _TRUE);
        });
        //ctrl + a
        this.selectModeKeyObserver.observeKey({
            ctrlKey: _TRUE,
            keyCode: 65
        }, function(e){
            self.selectTable();
            self.applySelected();
            Trex.TableUtil.collapseCaret(self.wysiwygPanel, self.currentTd);
        });

        //ie9이상 동작함.
        function collapseTableAround(isStart){
            var rng = self.canvas.getProcessor().getRange();
            rng[(isStart?'setEndBefore':'setEndAfter')](self.currentTable);
            rng.collapse(_FALSE);
            goog.dom.Range.createFromBrowserRange(rng).select();
        }

        /**
         * @desc 위아래 버튼을 눌러서 td간에 이동이 발생예측하여 발생하면 true를 반환한다.
         * @param {Boolean} isBefore
         * @returns {boolean}
         */
        function isDifferent(isBefore){
            var rng = self.canvas.getProcessor().getRange();
            rng.collapse(_FALSE);
            var _node = rng.startContainer;
            var _offset = rng.startOffset;
            if(_node.nodeType==1 && _node.tagName.toUpperCase() == 'TD'){
                _node = _node.childNodes[_offset];
            }
            while(_node && (_node.nodeType == 3 || _node.tagName.toUpperCase() != 'TD')){
                var t = _node[isBefore?'previousSibling':'nextSibling'];
                if(t&&(
                    (t.nodeType == 1 && t.tagName.toUpperCase() != 'BR')
                    ||(t.nodeType == 3 && t.length)))
                    return false;
                _node = _node.parentNode;
            }
            return true;
        }

        //normalMode
        $tx.chrome&&this.normalModeKeyObserver.observeKey({
            keyCode:38
        }, function(e){
            var elem, td;
            elem = self.canvas.getProcessor().getNode();
            td = getTdFromElement(elem);
            if(!td) return;
            if(!isDifferent(_TRUE))
                return;
            $tx.stop(e);
            if(!self.currentTable){
                self.setTable(td);
            }
            var b = self.tableIndexer.getBoundary(td);
            td = self.tableIndexer.getTd(b.top-1, b.left);
            if(!td){
                collapseTableAround(_TRUE);
            }else
                Trex.TableUtil.collapseLastCaret(self.wysiwygPanel, td);

        });
        $tx.chrome&&this.normalModeKeyObserver.observeKey({
            keyCode:40
        }, function(e){
            var elem, td;
            elem = self.canvas.getProcessor().getNode();
            td = getTdFromElement(elem);
            if(!td) return;
            if(!isDifferent(_FALSE))
                return;
            $tx.stop(e);
            if(!self.currentTable){
                self.setTable(td);
            }
            var b = self.tableIndexer.getBoundary(td);
            td = self.tableIndexer.getTd(b.bottom+1, b.left);
            if(!td){
                collapseTableAround(_FALSE);
            }else
                Trex.TableUtil.collapseCaret(self.wysiwygPanel, td);
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
                    this.isSelectMode = _TRUE;
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
	onkeydown: function (e) {
        var keyCode = e.keyCode;
        var ctrlKey = e.ctrlKey;
        var shiftKey = e.shiftKey;

        if (this.isSelectMode){
            //표 hotkey
            $tx.stop(e);
            this.selectModeKeyObserver.fireKeys(e);
        }else if (ctrlKey === _FALSE) {
            this.normalModeKeyObserver.fireKeys(e, _TRUE);
            this.reset();

        }
	},

    deleteContents: function(){
        var selectedTdArr, len, i;
        selectedTdArr = this.getSelectedTdArr();
        len = selectedTdArr.length;
        for (i = 0; i < len; i += 1) {
            Trex.TableUtil.emptyTd(selectedTdArr[i]);
        }
    },
    /**
     * @private
     * @param {Element} td
     */
    setTable : function (td) {
        this.currentTable = Trex.TableUtil.getClosestByTagNames(["table"], td);
        this.tableIndexer = new Trex.TableUtil.Indexer(this.currentTable);
    },
	/**
	 * @private
	 * @param {Element} td
	 */
	selectStart: function (td) {
        this.setTable(td);
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
     * selectStart가 선행되어야 한다.
     * @param {Element} td
     * @param {String} mode
     */
    selectRow: function(td, mode){
        this.currentTd = td;
        var b = this.tableIndexer.getBoundary(td);
        var start = _NULL,  end= _NULL;
        if(mode == 'RIGHT'){
            end = this.tableIndexer.getTd(b.top, this.tableIndexer.getColSize()-1);
        }else if(mode == 'LEFT'){
            end = this.tableIndexer.getTd(b.top, 0);
        }else {
            start = this.tableIndexer.getTd(b.top, 0);
            end = this.tableIndexer.getTd(b.top, this.tableIndexer.getColSize()-1);
            this.startCellBoundary = this.tableIndexer.getBoundary(start);
        }
        this.endCellBoundary = this.tableIndexer.getBoundary(end);
        this.currentTd = end;
    },
    /**
     * selectStart가 선행되어야 한다.
     * @param {Element} td
     * @param {String} mode
     */
    selectCol: function(td, mode){
        this.currentTd = td;
        var b = this.tableIndexer.getBoundary(td);
        var start = _NULL,  end= _NULL;
        if(mode == 'BOTTOM'){
            end = this.tableIndexer.getTd(this.tableIndexer.getRowSize()-1, b.left);
        }else if(mode == 'TOP'){
            end = this.tableIndexer.getTd(0, b.left);
        }else {
            start = this.tableIndexer.getTd(0, b.left);
            end = this.tableIndexer.getTd(this.tableIndexer.getRowSize()-1, b.left);
            this.startCellBoundary = this.tableIndexer.getBoundary(start);
        }

        this.endCellBoundary = this.tableIndexer.getBoundary(end);
        this.currentTd = end;
    },
    /**
     * selectStart가 선행되어야 한다.
     */
    selectTable: function(){
        var start = this.tableIndexer.getTd(0, 0);
        var end = this.tableIndexer.getTd(this.tableIndexer.getRowSize()-1, this.tableIndexer.getColSize()-1);
        this.startCellBoundary = this.tableIndexer.getBoundary(start);
        this.endCellBoundary = this.tableIndexer.getBoundary(end);
        this.currentTd = end;
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
	},
    resetSelectMode: function(){
        this.isSelectMode = _FALSE;
    },
    resetData: function(){
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
        this.resetSelectMode();
        this.resetData();
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
