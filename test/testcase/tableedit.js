var tableSelect, tableMerge, testTable;
module("merge", {
	setup: function(){
		var canvas, wysiwygPanel, doc;
		tableSelect = new Trex.Table.Selector(Editor, Editor.getConfig());
		tableMerge = new Trex.Table.Merge(Editor, Editor.getConfig());
		tableInsert = new Trex.Table.Insert(Editor, Editor.getConfig());
		tableDelete = new Trex.Table.Delete(Editor, Editor.getConfig());
		
		Editor.modify({
			content: '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>'
		});
		canvas = Editor.getCanvas();
		wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
		doc = wysiwygPanel.getDocument();
		testTable = doc.getElementById("test");
	}
});
//////////////////////////////////////////////
test("original check", function(){
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("merge col", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[1]);
	tableMerge.merge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="2">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("merge row", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[0]);
	tableMerge.merge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="2" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("merge rect", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="2" colspan="2">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("merge rect 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[2].cells[2]);
	tableMerge.merge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="3" colspan="3">1</td>\
</tr>\
<tr>\
</tr>\
<tr>\
</tr>\
</tbody>\
</table>');
});

test("cancel merge col", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[1]);
	tableMerge.merge(tableSelect);
	tableMerge.resetMerge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">1</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("cancel merge row", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[0]);
	tableMerge.merge(tableSelect);
	tableMerge.resetMerge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("cancel merge row 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[2]);
	tableMerge.merge(tableSelect);
	tableMerge.resetMerge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">1</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">&nbsp;</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("cancel merge row 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[1].cells[2]);
	tableMerge.merge(tableSelect);
	tableMerge.resetMerge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">2</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
<td class=" tx_table_selected_cell"  rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("cancel merge row 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[2].cells[1], testTable.rows[2].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[2].cells[1]);
	tableMerge.resetMerge(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">1</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">2</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">4</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">&nbsp;</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">7</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">8</td>\
<td class=" tx_table_selected_cell" rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row above", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertRowAbove(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row above 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[0]);
	tableInsert.insertRowAbove(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row above 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableInsert.insertRowAbove(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="2">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="2">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="2" colspan="2">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row below", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertRowBelow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row below 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[0]);
	tableInsert.insertRowBelow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row below 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableInsert.insertRowBelow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="2" colspan="2">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="2">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="2">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert row below 4", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[0].cells[1]);
	tableInsert.insertRowBelow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="3" colspan="2">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert col left", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertColLeft(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert col left 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[2].cells[0], testTable.rows[2].cells[1]);
	tableInsert.insertColLeft(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="2" colspan="1">&nbsp;</td>\
<td rowspan="2" colspan="1">&nbsp;</td>\
<td rowspan="2" colspan="3">1</td>\
</tr>\
<tr>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert col right", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertColRight(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert col right 2", function(){
	tableSelect.selectByTd(testTable.rows[1].cells[0], testTable.rows[1].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertColRight(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="4">4</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("insert col right 3", function(){
	tableSelect.selectByTd(testTable.rows[1].cells[0], testTable.rows[2].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableInsert.insertColRight(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">&nbsp;</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="2" colspan="3">4</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete col", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableDelete.deleteCol(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete col 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[1].cells[0], testTable.rows[1].cells[0]);
	tableDelete.deleteCol(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete col 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[2].cells[1], testTable.rows[2].cells[1]);
	tableDelete.deleteCol(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete col 4", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[2].cells[1], testTable.rows[2].cells[1]);
	tableDelete.deleteCol(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="2" colspan="1">1</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete row", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableDelete.deleteRow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete row 2", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[1]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[0].cells[1]);
	tableDelete.deleteRow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="2">1</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete row 3", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[1].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableDelete.deleteRow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="2">2</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table>');
});

test("delete row 4", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[2].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[0].cells[0]);
	tableDelete.deleteRow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="2" colspan="2">2</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
</tr>\
</tbody>\
</table>');
});

test("delete row 5", function(){
	tableSelect.selectByTd(testTable.rows[0].cells[1], testTable.rows[2].cells[2]);
	tableMerge.merge(tableSelect);
	tableSelect.selectByTd(testTable.rows[0].cells[0], testTable.rows[1].cells[0]);
	tableDelete.deleteRow(tableSelect);
	htmlEqual(Editor.getContent(), '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="2">2</td>\
</tr>\
</tbody>\
</table>');
});
