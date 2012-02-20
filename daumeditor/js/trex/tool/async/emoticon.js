(function() {
    /**
     * @fileoverview
     * emoticon을 입력 할 수 있는 메뉴를 포함하는 tool인 'Emoticon' Icon을 위한 source로
     * 필요한 configuration과 Class Trex.Tool.Emoticon을/를 포함
     *
     */
	
	var _DOC = document,
	_WIN = window,
	_DOC_EL = _DOC.documentElement,
	_FALSE = false,
	_TRUE = true,
	_NULL = null,
	_UNDEFINED;
    
    Trex.Class.overwrite(Trex.Tool.Emoticon, {
        oninitialized: function(/*config*/) {
            var _canvas = this.canvas;

            var _toolHandler = this.handler = function(value) {
                if(!value || value.trim().length == 0) {
                    return;
                }
                _canvas.execute(function(processor) {
                    var _node = processor.win.img({ 'src': value, 'border': "0", 'className' : 'txc-emo' });
                    processor.pasteNode(_node, _FALSE);
                });
            };

            /* button & menu weave */
            this.resetWeave();
            this.weave.bind(this)(
                /* button */
                new Trex.Button(this.buttonCfg),
                /* menu */
                new Trex.Menu.Matrix(this.menuCfg),
                /* handler */
                _toolHandler
            );
        }
    
    });
    
	var thisToolName = 'emoticon';
	Editor.forEachEditor(function (editor) {
		editor.getTool()[thisToolName].oninitialized();
	});
	Editor.editorForAsyncLoad.getTool()[thisToolName].forceActivate();
})();