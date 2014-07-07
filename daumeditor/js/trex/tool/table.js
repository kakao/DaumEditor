/**
 * @fileoverview
 *  Table을 삽입하는 기능을 가진 Tool 'table' Source,
 *  Class Trex.Tool.Table,Trex.Menu.Table,Trex.Menu.Table.TableEdit와 configuration 을 포함 하고있다.
 */

TrexConfig.addTool(
	"table",
	{
		borderStyle: "1px solid #ccc",
		sync: _FALSE,
		status: _TRUE
	},
	function(root){
		var bgc = TrexConfig.get("canvas",root).styles.backgroundColor;
		if (bgc != "transparent") {
			TrexConfig.getTool("table",root).bgcolor = bgc;
		}
	}
);

TrexMessage.addMsg({
	'@table.alert': "1 이상 99 이하의 숫자만 입력 가능합니다."
});

Trex.Tool.Table = Trex.Class.create({
	$const: {
		__Identity: 'table',
		__DEFAULT_TABLE_PROPERTY:{
			"cellSpacing": 0,
			"cellPadding": 1,
			"border": 0,
			"style": {
				border: "none",
				borderCollapse:"collapse"
			}
		},
		__DEFAULT_TABLE_PROPERTY_STR: "cellspacing=\"0\" cellpadding=\"0\" border=\"0\"",
		__DEFAULT_TABLE_STYLE: "border:none;border-collapse:collapse;",
		__DEFAULT_TABLE_CLASS: "txc-table",
        __DEFAULT_TABLE_CELL_HEIGHT: 24
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		this.tableSize = { row: 0, col:0 };

		var _canvas = this.canvas;

		var _toolHandler = this.handler = function(data) {
			_canvas.execute(function(processor) {
                // get table width
                var tableWidth = '100%';
                processor.executeUsingCaret(function(range, savedCaret){
                    var endCaret = savedCaret.getCaret(_FALSE);
                    if (!$tom.ancestor(endCaret, 'table')) {
                        tableWidth = _self.getDefaultTableWidth();
                    }
                });

                // insert empty table
                var table = _self.makeEmptyTable(data.row, data.col, tableWidth);
                var _tNode = processor.pasteContent(table, _TRUE);
                processor.bookmarkInto(_tNode);

                // open advanced toolbar
				if (_self.toolbar.tools.advanced) {
					_self.toolbar.tools.advanced.forceOpen();
				}
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			new Trex.Menu.Table(this.menuCfg),
			/* handler */
			_toolHandler
		);
	},
	makeEmptyTable: function(row, col, tableWidth){
		var tableStringArr = [];

        tableStringArr.push("<table class=\""+Trex.Tool.Table.__DEFAULT_TABLE_CLASS+"\"");
        tableWidth && tableStringArr.push(' width="' + tableWidth + '"');
		tableStringArr.push(Trex.Tool.Table.__DEFAULT_TABLE_PROPERTY_STR);
		tableStringArr.push(" style=\"");
		tableStringArr.push(Trex.Tool.Table.__DEFAULT_TABLE_STYLE);
		tableStringArr.push(";font-family:");
		tableStringArr.push( this.editor.canvas.getStyle("fontFamily") );
		tableStringArr.push(";font-size:");
		tableStringArr.push( this.editor.canvas.getStyle("fontSize") );
		tableStringArr.push("\"><tbody>");

		var borderStyleText = this.config.borderStyle;
		var tdWidth = this.getDefaultCellWidth(col, tableWidth),
            tdHeight = this.getDefaultCellHeight(row);
		var basicBorder = ["border-bottom:",borderStyleText,";border-right:",borderStyleText,";"].join("");

		for( var i = 0; i < row; i++ ){
			tableStringArr.push("<tr>");
			for( var j = 0; j < col; j++ ){
				var border = [basicBorder];
				tableStringArr.push("<td style=\"width:");
				tableStringArr.push(tdWidth);
				tableStringArr.push(";");
				tableStringArr.push("height:",tdHeight,";");
				tableStringArr.push(basicBorder);
				if ( i == 0 ){
					tableStringArr.push("border-top:",borderStyleText,";");
				}
				if ( j == 0 ){
					tableStringArr.push("border-left:",borderStyleText,";");
				}
				tableStringArr.push(";\"><p>" + $tom.EMPTY_BOGUS + "</p></td>");
			}
			tableStringArr.push("</tr>")
		}
		tableStringArr.push("</tbody></table>");
		return tableStringArr.join("");
	},
    getDefaultCellWidth: function(columnCount, tableWidth) {
        var width;
        tableWidth = tableWidth || '100%';
        if (tableWidth.toString().indexOf('%') !== -1) {
            width = (100 / columnCount) + '%';
        } else {
            width = parseInt(parseInt(tableWidth,10)/columnCount, 10);
            if (isNaN(width)) {
                width = 0;
            }
            width = width.toPx();
        }
        return width;
    },
    getDefaultCellHeight: function(rowCount) {
        return Trex.Tool.Table.__DEFAULT_TABLE_CELL_HEIGHT.toPx();
    },
	getDefaultTableWidth: function(){ //NOTE: #FTDUEDTR-905
		var tableWidth = this.config.tableWidth;
		if (!tableWidth) {
            tableWidth = this.getCanvasInnerWidth();
		}
		return tableWidth;
	},
    getCanvasInnerWidth: function() {
        var padding = this.canvas.getSizeConfig().contentPadding || 8;
        return (this.canvas.getSizeConfig().contentWidth || 600) - padding * 2 - 20;
    }
});


Trex.Tool.Table.TemplateWizard = Trex.Class.create({
	initialize: function(){
		this.templateList = (typeof getTableTemplateList == "function")? getTableTemplateList() : [{
			klass: "ex1",
			common: {
			backgroundColor:"transparent",
			borderTop:"none",
			borderLeft:"none",
			borderRight: "1px solid #d9d9d9",
			borderBottom: "1px solid #d9d9d9"
		},
		firstRow: {
			borderTop: "1px solid #000"
		},
		firstCol: {
			borderLeft: "1px solid #000"
		},
		lastCol: {
			borderRight: "1px solid #000"
		},
		lastRow: {
			borderBottom: "1px solid #000"
		},
		evenRow: {},
		oddRow: {}
		}];
		this.currentTemplate = _NULL;
	},
	applyStyle: function(table, templateIndex){
		if ( isNaN( templateIndex ) ){
			return ;
		}

		var tableMatrixer = new Trex.Tool.Table.TableCellMatrixer(table);
		var tdMatrix = tableMatrixer.getTdMatrix();

		this.currentTemplate = this.templateList[templateIndex];
		for( var i = 0; i < tdMatrix.length; i++){
			for( var j = 0; j < tdMatrix[i].length; j++){
				this.setCellStyle(tdMatrix[i][j], {
					isEvenRow: (i % 2) == 1,
					isFirstRow: i == 0,
					isLastRow: i == tdMatrix.length - 1,
					isFirstCol: j == 0,
					isLastCol: (j == tdMatrix[i].length - 1)
				});
			}
		}
	},
	setCellStyle: function(elTd, truthMap){
		var t = this.currentTemplate;
		var style = Object.extend({}, t['common']);
		Object.extend(style, (truthMap.isEvenRow)?t['evenRow'] : t['oddRow']);
		Object.extend(style, (truthMap.isFirstRow)?t['firstRow'] : (truthMap.isLastRow)?t['lastRow'] : {});
		Object.extend(style, (truthMap.isLastCol)?t['lastCol'] : {});
		Object.extend(style, (truthMap.isFirstCol)?t['firstCol'] : {});
		txlib.setStyle(elTd, style);
	},
	getTemplateList: function(){
		return this.templateList;
	}
});
Trex.Tool.Table.TableCellMatrixer = Trex.Class.create({
	initialize: function(table){
		this.rowSize = this.initRowSize(table);
		this.colSize = this.initColSize(table);
		var context = $tom.first(table,"tbody") || table;
		this.tdMatrix = this.createTdMatrix(context);
		//this.table = table;

		for (var i = 0; i < this.tdMatrix.length; i++) {
			for (var j = 0; j < this.tdMatrix[i].length; j++) {
				var td = this.tdMatrix[i][j];
				if (td.cols > 1) {
					td.cols--;
					this.tdMatrix[i].splice(j+1, 0, td);
				}
			}
		}
		for( var i = 0; i< this.tdMatrix.length; i++ ){
			for( var j = 0; j < this.tdMatrix[i].length; j++ ){
				var td = this.tdMatrix[i][j];
				if ( td.rows > 1 ){
					td.rows--;
					this.tdMatrix[i + 1].splice(j, 0, td);
				}
			}
		}
	},

	createTdMatrix: function(tbody){
		var tdMatrix = [];

		var trArr = $tom.children(tbody, "tr");
		for( var i = 0, len = trArr.length; i < len; i++ ){
			tdMatrix.push(this.createTdArray(trArr[i]));
		}

		return tdMatrix;
	},
	createTdArray: function(tr){
		var tdArr = [];

		var tds = $tom.children(tr, "td");
		for( var i = 0, len = tds.length; i < len; i++ ){
			tdArr.push( this.decorateSingleTd( tds[i] ) );
		}
		return tdArr;
	},
	decorateSingleTd: function(td){
		var cols = parseInt( td.getAttribute("colSpan") || 1);
		var rows = parseInt( td.getAttribute("rowSpan") || 1);
		td.cols = cols;
		td.rows = (rows-1) * cols + 1;

		return td;
	},
	initRowSize: function(table){
		return table.rows.length;
	},
	initColSize: function(table){
		var colSize = 0;
		var tdArr = $tom.children( $tom.collect(table, "tr"), "td");
		tdArr.each(function(td){
            colSize += parseInt(td.getAttribute("colSpan") || 1);
		});

		return colSize;
	},
	getRowSize: function(){
		return this.rowSize;
	},
	getColSize: function(){
		return this.colSize;
	},
	getTdMatrix: function(){
		return this.tdMatrix;
	}
});

TrexMessage.addMsg({
	'@table.title.insert': '표삽입 &nbsp;',
	'@table.title.setDirectly': '표 직접설정',
	'@table.title.row': '열 개수',
	'@table.title.col': '행 개수'
});
Trex.MarkupTemplate.add(
	'menu.table.direct', [
		'<div>@table.title.setDirectly</div>',
		'<div class="tx-table-input-area">',
		'<div class="tx-field tx-col-field">@table.title.row<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">@table.title.row+</a><a class="tx-btn tx-btn-sub" href="javascript:;">@table.title.row-</a></div>',
		'<div class="tx-field tx-row-field">@table.title.col<input type="text" value="1"><a class="tx-btn tx-btn-add" href="javascript:;">@table.title.col+</a><a class="tx-btn tx-btn-sub" href="javascript:;">@table.title.col-</a></div>',
		'</div>'
	].join("")
);
/* Trex.Menu.Table ************************************************************************************/
Trex.Menu.Table = Trex.Class.create({
	$const:{
		MAX_ROW:99,
		MAX_COL:99
	},
	$extend: Trex.Menu,
	ongenerated: function() {
		this.rowSize = 1;
		this.colSize = 1;

		this.elInnerPreview = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-preview');
		this.dynamicSizer = this.generateDynamicSizer(this.elInnerPreview);

		this.elInnerRowCol = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-rowcol');
		this.generateTextSizer(this.elInnerRowCol);

		this.elButtonArea = $tom.collect(this.elMenu, 'div.tx-menu-inner .tx-menu-enter');
		this.generateButtonArea(this.elButtonArea);
	},
	onregenerated: function() {
		this.showDynamicSizer();
	},
	showDynamicSizer: function(){
		this.dynamicSizer.clear();
		$tx.show( this.elInnerPreview );
		$tx.hide( this.elInnerRowCol );
		$tx.hide( this.elButtonArea );
	},
	showTextSizer: function(){
		$tx.hide(this.elInnerPreview);
		$tx.show(this.elInnerRowCol);
		$tx.show(this.elButtonArea);
	},
	generateDynamicSizer: function(elPreivewContext){
		var _self = this;
		var elRowCol= tx.span();
		var elDisplay = tx.div({className:"tx-dynamic-sizer-display"}, TXMSG('@table.title.insert'), elRowCol);
		elPreivewContext.appendChild( elDisplay );

		var dynamicSizer = new Trex.DynamicSizer({
			el: elPreivewContext,
			clickHandler: this.onSelect.bind(this),
			moveHandler: function(row, col){
				elRowCol.innerHTML = row + 'x' +col;
			}
		});

		var _elA = tx.a({href:"javascript:;"}, TXMSG('@table.title.setDirectly'));
		$tx.observe( _elA, "click", function(ev){
			_self.showTextSizer();
			$tx.stop(ev);
            _self.fireJobs(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, {
                detail: {
                    menu: _self
                }
            });
		});

		var _elButton = tx.div({className:"tx-more-button"});
		_elButton.appendChild(_elA);
		elPreivewContext.appendChild( _elButton );

		return dynamicSizer;
	},
	generateTextSizer: function(elContext) {
		var _self = this;

		Trex.MarkupTemplate.get('menu.table.direct').evaluateToDom({}, elContext);

		var calculator = {
			calculate: function(value, max, operand){
				value = parseInt(value);
				if ( value + operand > max || value + operand< 1){
					alert( TXMSG("@table.alert") );
					return value;
				}else{
					return value + operand;
				}
			},
			getValidValue:function(value, previousValue, max){
				if ( value <= 0 || value > max  ){
					alert( TXMSG("@table.alert") );
					return previousValue;
				}else{
					return value;
				}

			}
		};

		var colInput = $tom.collect(elContext, "div.tx-col-field input");
		$tx.observe(colInput, "blur", function(){
			colInput.value = _self.colSize = calculator.getValidValue(colInput.value, _self.colSize, Trex.Menu.Table.MAX_COL);
		});
		$tx.observe( $tom.collect(elContext, "div.tx-col-field a.tx-btn-add"), "click", function(e){
			colInput.value = _self.colSize = calculator.calculate(_self.colSize, Trex.Menu.Table.MAX_COL, 1);
            $tx.stop(e);
			return _FALSE;
		});
		$tx.observe($tom.collect(elContext, "div.tx-col-field a.tx-btn-sub"), "click", function(e){
			colInput.value = _self.colSize = calculator.calculate(_self.colSize, Trex.Menu.Table.MAX_COL, -1);
            $tx.stop(e);
            return _FALSE;
		});

		var rowInput = $tom.collect(elContext, "div.tx-row-field input");
		$tx.observe(rowInput, "blur", function(){
			rowInput.value = _self.rowSize = calculator.getValidValue(rowInput.value, _self.rowSize, Trex.Menu.Table.MAX_ROW);
		});
		$tx.observe($tom.collect(elContext, "div.tx-row-field a.tx-btn-add"), "click", function(e){
			rowInput.value = _self.rowSize = calculator.calculate(_self.rowSize, Trex.Menu.Table.MAX_ROW, 1);
            $tx.stop(e);
			return _FALSE;
		});
		$tx.observe($tom.collect(elContext, "div.tx-row-field a.tx-btn-sub"), "click", function(e){
			rowInput.value = _self.rowSize = calculator.calculate(_self.rowSize, Trex.Menu.Table.MAX_ROW, -1);
            $tx.stop(e);
			return _FALSE;
		});
	},
	generateButtonArea: function(elContext){
		var _self = this;
		var elDiv = tx.div();
		var elAConfirm = tx.a({href:"javascript:;", className:"tx-btn-confirm"}, "확인");
		var elACancel = tx.a({href:"javascript:;", className:"tx-btn-cancel"}, "취소");

		$tx.observe( elAConfirm, "click", function(ev){
			_self.onSelect(ev, {
				row: _self.rowSize,
				col: _self.colSize
			});
		});

		$tx.observe(elACancel, "click", function(e) {
            $tx.stop(e);
			this.onCancel();
			return _FALSE;
		}.bindAsEventListener(this));

		elDiv.appendChild(elAConfirm);
		elDiv.appendChild(elACancel);
		elContext.appendChild(elDiv);
	}
});