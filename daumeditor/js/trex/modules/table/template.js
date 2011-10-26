Trex.Table.Template = Trex.Class.create({
	initialize: function(){
		this.currentTemplate = _NULL;
		this.loadTemplate();
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
	},
	
	loadTemplate: function(){
		var listseturl = TrexConfig.getUrl('#cdnhost/view/listset/5.1/tabletemplate.js');
        if (!(typeof getTableTemplateList == "function")) {
		    new (Trex.Class.create({
                $mixins: [Trex.I.JSRequester],
                initialize: function(){
					this.importScript(listseturl, 'utf-8', _DOC, function(){
						getTableTemplateList();
					});
                }
            }))();
            return;
        }
	}
});