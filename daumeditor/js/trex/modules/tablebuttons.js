Trex.MarkupTemplate.add('table.hover.button', '<div class="tx-table-btn-layer"><a href="javascript:;" class="tx-table-edit-layout">표편집</a><a href="javascript:;" class="tx-table-edit-template">표서식</a><a href="javascript:;" class="tx-table-remove">삭제</a></div>');
(function(){
	
    var _listseturl = TrexConfig.getUrl('#cdnhost/view/listset/5.1/tabletemplate.js');
    function _showTableEdit(config, layerNumber){
        if (!(typeof getTableTemplateList == "function")) {
            new (Trex.Class.create({
                $mixins: [Trex.I.JSRequester],
                initialize: function(){
                    this.importScript(_listseturl, 'utf-8', _DOC, function(){
                        _showTableEdit(config, layerNumber);
                    });
                }
            }))();
            return;
        }
        var tableEdit = new Trex.Menu.Table.TableEdit(config);
		if (layerNumber) {
            tableEdit.showMenu(layerNumber);
        }
    }
	
    Trex.module("show button for action of table object", function(editor, toolbar, sidebar, canvas){
        if (!toolbar.tools['table']) {
            return;
        }
        
        var _BUTTON_OFFSET = 20;
        var _hoverdTableNode = _NULL;
        var _elBtn = Trex.MarkupTemplate.get("table.hover.button").evaluateAsDom({});
		
        $tom.insertFirst(canvas.wysiwygEl, _elBtn);
		
		var _eventBinding = function(){
            var elALayout = $tom.collect(_elBtn, "a.tx-table-edit-layout");
            $tx.observe(elALayout, "click", function(){
                if (_hoverdTableNode) {
                    _showTableEdit({
                        editor: editor,
                        table: _hoverdTableNode
                    });
                }
                return _FALSE;
            });
            
            var elATemplate = $tom.collect(_elBtn, "a.tx-table-edit-template");
            $tx.observe(elATemplate, "click", function(){
                if (_hoverdTableNode) {
                    _showTableEdit({
                        editor: editor,
                        table: _hoverdTableNode
                    }, 2);
                }
                return _FALSE;
            });
            
            var elADelete = $tom.collect(_elBtn, "a.tx-table-remove");
            $tx.observe(elADelete, "click", function(){
                if (_hoverdTableNode) {
                    if (!confirm("테이블을 삭제하시겠습니까?")) {
                        return _FALSE;
                    }
                    $tom.remove(_hoverdTableNode);
                    canvas.history.saveHistory();
                }
                return _FALSE;
            });
        };

        var _showButton = function(nodePos){
            if (canvas.getConfig().readonly) {
                return;
            }
            if (nodePos.width > 0 && nodePos.height > 0 && nodePos.y > 0 && canvas.getIframeHeight() - nodePos.y) {
                var top = nodePos.y + canvas.getIframeTop() - _BUTTON_OFFSET;
                if (top < 0) {
                    top = -6;
                }
                $tx.setStyle(_elBtn, {
                    top: top.toPx(),
                    left: (nodePos.x).toPx()
                });
                $tx.show(_elBtn);
            }
            else {
                $tx.hide(_elBtn);
            }
        };
        
        toolbar.tools['table'].availableButton = function(node){
            var klass = node.className;
            if (klass.indexOf("txc-table") > -1) {
                return _TRUE;
            }
            if (klass.indexOf("txc-") > -1 || klass.indexOf("tx-") > -1) {
                return _FALSE;
            }
            return _FALSE;
        };
        
		
        canvas.observeMouseover("table", function(node, nodePos){
            if (!node) {
                return;
            }

            if (toolbar.tools['table'].availableButton(node)) {
                _hoverdTableNode = node;
                _showButton(nodePos);
              
            }
            else {
                _hoverdTableNode = _NULL;
                $tx.hide(_elBtn);
				
            }
            throw $stop;
        }, function(){
            _hoverdTableNode = _NULL;
            $tx.hide(_elBtn);
        });
        
		canvas.observeJob(Trex.Ev.__CANVAS_PANEL_SCROLLING, function(){
            if (_hoverdTableNode) {
                var _nodePos = this.getPositionByNode(_hoverdTableNode);
                _showButton(_nodePos);
            }
        });
        _eventBinding();
    });
})();

