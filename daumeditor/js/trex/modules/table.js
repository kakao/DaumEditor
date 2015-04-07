/*jslint onevar: false, nomen: false*/
/*global Trex, TrexMessage, TXMSG, $tom, $tx, _FALSE, _NULL, _TRUE */
Trex.MarkupTemplate.add('table.col.resize.dragger', '<div class="tx-table-col-resize-dragger" style="position:absolute; overflow:hidden; top: 0; left: 0; width: 3px; height: 100%; cursor:col-resize;"><\/div>');
Trex.MarkupTemplate.add('table.row.resize.dragger', '<div class="tx-table-row-resize-dragger" style="position:absolute; overflow:hidden; top: 0; left: 0; width: 100%; height: 3px; cursor:row-resize;"><\/div>');

TrexMessage.addMsg({
	'@table.noselect.alert': "테이블을 선택하신 후 사용가능합니다."
});

Trex.Table = {};
Trex.module("table selector", function (editor, toolbar, sidebar, canvas, config) {
	var initDragger;
	initDragger = function (canvas) {
		var colDragger, rowDragger, wysiwygEl;
		colDragger = Trex.MarkupTemplate.get("table.col.resize.dragger").evaluateAsDom({});
		rowDragger = Trex.MarkupTemplate.get("table.row.resize.dragger").evaluateAsDom({});
		wysiwygEl = canvas.wysiwygEl;
		$tom.insertFirst(wysiwygEl, colDragger);
		$tom.insertFirst(wysiwygEl, rowDragger);
		$tx.hide(colDragger);
		$tx.hide(rowDragger);
	};
    canvas.observeJob(Trex.Ev.__CANVAS_PANEL_BACKSPACE_TABLE, function(node) {
        $tom.remove(node);
    });
	canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function () {
		var tableSelect, tableMerge, tableInsert, tableDelete, tableBorder, tableTemplateLoader;
	
		tableSelect = new Trex.Table.Selector(editor, config);
		tableMerge = new Trex.Table.Merge(editor, config);
		tableInsert = new Trex.Table.Insert(editor, config);
		tableDelete = new Trex.Table.Delete(editor, config);
		tableBorder = new Trex.Table.Border(editor, config);
        tableTemplateLoader = new Trex.Table.TemplateLoader();

		initDragger(canvas);
		
		var wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
		var processor = wysiwygPanel.getProcessor();
		/**
		 * selectCellByCaret
		 * 캐럿의 위치에 해당하는 cell 을 선택한다.
		 */
		var selectCellByCaret = function () {
			var node, td;
			if (tableSelect.getSelected().isValid() === _FALSE) {
				node = processor.getNode();
				td = Trex.TableUtil.getClosestByTagNames(["td", "th"], node);
				if (td) {
					tableSelect.selectByTd(td, td);
				}
			}
		};
		/**
		 * table 을 선택하면 advanced 가 열림.
		 * //CHECK: 
		 * table 버튼들의 위치가 advanced 라고 가정하고 있음.
		 */
		canvas.observeElement({
			tag: 'table'
		}, function (elem) {
			if (toolbar.tools.advanced) {
				toolbar.tools.advanced.forceOpen();
			}
		});
		/**
		 * border 를 적용하기 위한 4가지 옵션값.
		 */
		var borderProperty = {
			range: "all",
			color: "",
			height: 1,
			type: "solid"
		};
		var setDefaultBorderProperty = function () {
			var tool = toolbar.tools.cellslinecolor;
			if (tool) {
				borderProperty.color = tool.config.defaultcolor;
			}
		};
		setDefaultBorderProperty();
		
		var alertFromNoSelect = function () {
			alert(TXMSG('@table.noselect.alert'));
		};
		
		processor.table = {
			/**
			 * getTdArr
			 * 선택한 cell 들의 array. 
			 * //CHECK: getSelectedCells ?
			 * 지금보니 이름이 마음에 들지 않네...
			 * @return {Array}
			 */
			getTdArr: function () {
				return tableSelect.getSelectedTdArr();
			},
			/**
			 * isDuringSelection
			 * 선택을 하고 있는 중인지 여부(선택을 위한 드래그 중).
			 * @return {boolean}
			 */
			isDuringSelection: function () {
				return tableSelect.isDuringSelection();
			},
			
			execute: function (fn, noCaretSelect) {
				if (! noCaretSelect) {
					selectCellByCaret();
				}
				if (tableSelect.getSelected().isValid()) {
					fn();
					canvas.history.saveHistory();
				} else {
					alertFromNoSelect();
				}
			},
			
			merge: function () {
				this.execute(function () {
					tableMerge.merge(tableSelect);
				}, _TRUE);
			},
			resetMerge: function () {
				this.execute(function () {
					tableMerge.resetMerge(tableSelect);
				});
			},
			insertRowAbove: function () {
				this.execute(function () {
					tableInsert.insertRowAbove(tableSelect);
				});
			},
			insertRowBelow: function () {
				this.execute(function () {
					tableInsert.insertRowBelow(tableSelect);
				});
			},
			insertColLeft: function () {
				this.execute(function () {
					tableInsert.insertColLeft(tableSelect);
				});
			},
			insertColRight: function () {
				this.execute(function () {
					tableInsert.insertColRight(tableSelect);
				});
			},
			deleteRow: function () {
				this.execute(function () {
					tableDelete.deleteRow(tableSelect);
				});
			},
			deleteCol: function () {
				this.execute(function () {
					tableDelete.deleteCol(tableSelect);
				});
			},
			
			setBorderRange: function (outlineType) {
				borderProperty.range = outlineType;
			},
			setBorderColor: function (color) {
				borderProperty.color = color;
				toolbar.fireJobs(Trex.Ev.__TOOL_CELL_LINE_CHANGE, {
					color: color
				});
			},
			setBorderHeight: function (height) {
				borderProperty.height = height;
				toolbar.fireJobs(Trex.Ev.__TOOL_CELL_LINE_CHANGE, {
					height: height
				});
			},
			setBorderType: function (type) {
				borderProperty.type = type;
				toolbar.fireJobs(Trex.Ev.__TOOL_CELL_LINE_CHANGE, {
					type: type
				});
			},
			setNoBorder: function () {
				var self = this;
				this.execute(function () {
					tableBorder.setTableSelect(tableSelect);
					tableBorder.setBorderRange("all");
					tableBorder.changeBorderColor(self.getTdArr(), "");
					tableBorder.changeBorderHeight(self.getTdArr(), "0");
					tableBorder.changeBorderType(self.getTdArr(), "none");
				});
			},
			setBorderButtons: function (color, height, type) {
				var tool;
				tool = toolbar.tools.cellslinecolor;
				if (tool) {
					tool.execute(color);
				}
				tool = toolbar.tools.cellslineheight;
				if (tool) {
					tool.execute(height);
				}
				tool = toolbar.tools.cellslinestyle;
				if (tool) {
					tool.execute(type);
				}
			},
			getBorderProperty: function () {
				return {
					color: borderProperty.color,
					height: borderProperty.height,
					type: borderProperty.type
				};
			},
			applyBorder: function () {
				var self = this;
				this.execute(function () {
					tableBorder.setTableSelect(tableSelect);
					tableBorder.setBorderRange(borderProperty.range);
					tableBorder.changeBorderColor(self.getTdArr(), borderProperty.color);
					tableBorder.changeBorderHeight(self.getTdArr(), borderProperty.height);
					tableBorder.changeBorderType(self.getTdArr(), borderProperty.type);
					self.addBorderHistory();
				});
			},
			addBorderHistory: function () {
				var tool;
				tool = toolbar.tools.cellslinepreview;
				if (tool) {
					tool.addBorderHistory(borderProperty);
				}
			},

			tableBackground: function (value) {
				var self = this;
                value = value || 'transparent';
				this.execute(function () {
					var style, tdArr, i, len;
					style = {
						"backgroundColor": value
					};
					tdArr = self.getTdArr();
					len = tdArr.length;
					for (i = 0; i < len; i += 1) {
						$tx.setStyle(tdArr[i], style);
					}
					tableSelect.reset();
				});
			},
			
			setTemplateStyle: function (table, templateIndex) {
				if (table) {
                    var self = this;
                    tableTemplateLoader.getTemplate(templateIndex, function(template) {
                        template.apply(table);
                        self._applyTemplateOutline(table, template.templateData);
                        tableSelect.reset();
                    });
				} else {
					alertFromNoSelect();
				}
			},
            /**
             * 테이블 템플릿을 적용해도 테두리에 대한 정확한 적용이 되지않아 흰색 혹은 none의 상태가 된다.
             * 이를 보완하기 위해서 테이블 기본 기능을 이용해서 테두리를 재설정 한다.
             *
             * @param table
             * @param templateData
             * @private
             */
            _applyTemplateOutline: function(table, templateData) {
                var item = templateData;
                var self = this;
                var outlineBorder = {
                    top: this._parseBorderStyle(item.firstRow.borderTop),
                    right: this._parseBorderStyle(item.lastCol.borderRight || item.common.borderRight),
                    bottom: this._parseBorderStyle(item.lastRow.borderBottom || item.common.borderBottom),
                    left: this._parseBorderStyle(item.firstCol.borderLeft)
                };

                var tableMatrixer = new Trex.Tool.Table.TableCellMatrixer(table);
                var tdMatrix = tableMatrixer.getTdMatrix();
                var rowSize = tableMatrixer.getRowSize();
                var colSize = tableMatrixer.getColSize();

                if (tdMatrix && tdMatrix.length) {
                    tableSelect.selectByTd(tdMatrix[0][0], tdMatrix[rowSize-1][colSize-1]);
                    tableBorder.setTableSelect(tableSelect);

                    var direction = ['top', 'right', 'bottom', 'left'];
                    direction.each(function(dir){
                        tableBorder.setBorderRange(dir);
                        tableBorder.changeBorderColor(self.getTdArr(), outlineBorder[dir]['color']);
                        tableBorder.changeBorderHeight(self.getTdArr(), outlineBorder[dir]['height']);
                        tableBorder.changeBorderType(self.getTdArr(), outlineBorder[dir]['type']);
                    });
                }
            },
            /**
             * border style을 파싱해서 object로 반환한다.
             *
             * ex1. "1px solid red"
             * ex2. "none"
             *
             * @param styleString
             * @returns {object}
             * @private
             */
            _parseBorderStyle: function(styleString) {
                styleString = styleString.trim().toLowerCase();
                if (styleString === 'none') {
                    return {
                        height: 'none',
                        type: 'solid',
                        color: 'transparent'
                    };
                } else {
                    var parts = styleString.split(' ');
                    if (parts.length != 3) {
                        parts = ['1px', 'solid', '#000'];
                    }
                    return {
                        height: parts[0].parsePx() || 1,
                        type: parts[1],
                        color: parts[2]
                    };
                }
            }
		};
		
		toolbar.fireJobs(Trex.Ev.__TOOL_CELL_LINE_CHANGE, {
			color: borderProperty.color,
			height: borderProperty.height,
			type: borderProperty.type,
			fromInit: _TRUE
		});
		
		toolbar.observeJob(Trex.Ev.__TOOL_CLICK, function (identity) {
			if ([
				"fontfamily",
				"fontsize",
				"bold",
				"underline",
				"italic",
				"strike",
				"forecolor",
				"backcolor",
	            "indent",
	            "outdent",
				"alignleft",
				"aligncenter",
				"alignright",
				"alignfull",
				"mergecells",
				"splitcells",
				"insertcells",
				"deletecells",
				"cellsoutline",
				"cellslinecolor",
				"cellslineheight",
				"cellslinestyle",
				"cellslinepreview",
				"tablebackcolor",
				"tabletemplate"
			].contains(identity) === _FALSE) {
				tableSelect.reset();
			}
			if (identity === "tablebackcolor") {
				selectCellByCaret();
			}
		});
	});
});
