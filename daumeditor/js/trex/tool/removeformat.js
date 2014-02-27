/**
 * @fileoverview 
 *  
 */
TrexConfig.addTool(
	"removeformat", 
	{
		wysiwygonly: _TRUE,
		sync: _TRUE,
		status: _FALSE,
        hotKey: { // ctrl + shift + x
            ctrlKey: _TRUE,
            shiftKey: _TRUE,
			keyCode: 88
        }
	}
);

Trex.I.FontToolForRemoveformat = Trex.Mixin.create({
    oninitialized: function(config) {
        this.bindKeyboard(config.hotKey, this.handler.bind(this));
    },
    computeNewStyle: function() {
        return _NULL;
    },
    rangeExecutor: function(processor) {
        processor.execCommand(this.getQueryCommandName());
    }
});

Trex.Tool.Removeformat = Trex.Class.create({
	$const: {
		__Identity: 'removeformat'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.FontToolForRemoveformat],
    getQueryCommandName: function() {
        return "removeformat";
    },
    isStyleApplied: function(node) {
        return false;
    }
});

Trex.module('initialize removeformat without toolbar button', function(editor, toolbar, sidebar, canvas/*, config*/) {
    if (!$tx('tx_removeformat')) {
        var cfg = TrexConfig.getTool('removeformat');
        var el = _DOC.createElement('div');
        el.id = 'tx_removeformat';
        _DOC.body.appendChild(el);
        new Trex.Tool.Removeformat(editor, toolbar, cfg);
    }
});