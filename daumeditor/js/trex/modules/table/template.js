(function() {

    Trex.Table.TemplateLoader = Trex.Class.create({
        initialize: function() {
            this.templateList = _NULL;
        },
        getTemplate: function(index, callback) {
            if (isNaN(index)) {
                return;
            }

            if (this.templateList) {
                callback(new TableTemplate(this.templateList[index]));
            } else {
                var self = this;
                this.loadTemplate(function (templateList) {
                    self.templateList = templateList;
                    callback(new TableTemplate(self.templateList[index]));
                });
            }
        },
        loadTemplate: function(onLoadComplete) {
            var url = this.getJSBasePath() + "trex/modules/table/async/template_data.js";
            if (EditorJSLoader.getOption('environment') == 'development') {
                url += '?dummy=' + (new Date()).getTime();
            }
            EditorJSLoader.asyncLoadModule({
                url: TrexConfig.getUrl(url),
                callback: function() {
                    var templateList = getTableTemplateList();
                    onLoadComplete(templateList);
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


    var TableTemplate = Trex.Class.create({
        initialize: function(templateData) {
            this.templateData = templateData;
        },
        apply: function(table) {
            var tableMatrixer = new Trex.Tool.Table.TableCellMatrixer(table);
            var tdMatrix = tableMatrixer.getTdMatrix();
            var self = this;

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
        },
        setCellStyle: function(elTd, truthMap) {
            var t = this.templateData;
            var style = Object.extend({}, t['common']);
            Object.extend(style, (truthMap.isEvenRow) ? t['evenRow'] : t['oddRow']);
            Object.extend(style, (truthMap.isFirstRow) ? t['firstRow'] : (truthMap.isLastRow) ? t['lastRow'] : {});
            Object.extend(style, (truthMap.isLastCol) ? t['lastCol'] : {});
            Object.extend(style, (truthMap.isFirstCol) ? t['firstCol'] : {});
            txlib.setStyle(elTd, style);
        }
    });
})();