/**
 * @fileoverview 
 * 'Italic' Icon Source,
 * Class Trex.Tool.Italic과 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"italic",
	{
		wysiwygonly: _TRUE,
		sync: _TRUE,
		status: _TRUE,
        hotKey: {
            // ctrl + i - 기울임
			ctrlKey: _TRUE,
			keyCode: 73
		}
	}
);

Trex.Tool.Italic = Trex.Class.create({
	$const: {
		__Identity: 'italic'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.ButtonFontTool, Trex.I.WrappingDummyFontTool],
    getRelatedCssPropertyNames: function() {
        return ["font", this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "fontStyle";
    },
    getQueryCommandName: function() {
        return "italic";
    },
    isStyleApplied: function(node) {
        return $tx.getStyle(node, "fontStyle") == "italic";
    }
});