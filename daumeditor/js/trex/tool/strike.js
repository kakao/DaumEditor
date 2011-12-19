/**
 * @fileoverview 
 *  Tool '취소선' Source,
 * Class Trex.Tool.Strike 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"strike",
	{
		wysiwygonly: _TRUE,
		sync: _TRUE,
		status: _TRUE,
        hotKey: {
            // ctrl + d
			ctrlKey: _TRUE,
			keyCode: 68
		}
	}
);

Trex.Tool.Strike = Trex.Class.create({
	$const: {
		__Identity: 'strike'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.ButtonFontTool],
    getRelatedCssPropertyNames: function() {
        return [this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "textDecoration";
    },
    getQueryCommandName: function() {
        return "strikethrough";
    },
    isStyleApplied: function(node) {
        return $tx.getStyle(node, "textDecoration").include("line-through");
    }
});