Trex.Table.Template = Trex.Class.create({
	initialize: function(){
		this.currentTemplate = _NULL;
        this.templateList = _NULL;
	},
	applyStyle: function(table, templateIndex, callback){
		
		if ( isNaN( templateIndex ) ){
			return ;
		}
		
		var tableMatrixer = new Trex.Tool.Table.TableCellMatrixer(table);
		var tdMatrix = tableMatrixer.getTdMatrix();

        var self = this;
        this.onLoadTemplateList(function(templateList) {
            self.currentTemplate = templateList[templateIndex];
            for (var i = 0; i < tdMatrix.length; i++) {
                for (var j = 0; j < tdMatrix[i].length; j++) {
                    self.setCellStyle(tdMatrix[i][j], {
                        isEvenRow: (i % 2) == 1,
                        isFirstRow: i == 0,
                        isLastRow: i == tdMatrix.length - 1,
                        isFirstCol: j == 0,
                        isLastCol: (j == tdMatrix[i].length - 1)
                    });
                }
            }
            callback();
        });

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

    onLoadTemplateList: function(fn) {
        if (this.templateList) {
            fn(this.templateList);
        } else {
            var self = this;
            this.loadTemplate(function (templateList) {
                self.templateList = templateList;
                fn(templateList);
            });
        }
    },

    loadTemplate: function(fn) {
        var url = this.getJSBasePath() + "trex/modules/table/async/template_data.js";
        EditorJSLoader.asyncLoadModule({
            url: TrexConfig.getUrl(url),
            callback: function() {
                var templateList = getTableTemplateList();
                fn(templateList);
            }
        });
    },

    getJSBasePath: function() {
        var basePath;
        try {
            basePath = EditorJSLoader.getJSBasePath("editor.js");
        } catch (e) {
            basePath = EditorJSLoader.getJSBasePath();
        }
        return basePath;
    }
});