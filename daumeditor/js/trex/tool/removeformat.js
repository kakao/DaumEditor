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
        hotKey: { // ctrl + shiftKey+ x
            ctrlKey: _TRUE,
            shiftKey: _TRUE,
			keyCode: 88
        }
	}
);

Trex.Tool.Removeformat = Trex.Class.create({
	$const: {
		__Identity: 'removeformat'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.ButtonFontTool],
    getQueryCommandName: function() {
        return "removeformat";
    },
    isStyleApplied: function(node) {
        return false;
    }
});
