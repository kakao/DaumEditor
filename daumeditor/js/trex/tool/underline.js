/**
 * @fileoverview 
 *  Tool 'Underline' Source,
 *  Class Trex.Tool.Underline  configuration 을 포함 하고있다.    
 * 
 */
TrexConfig.addTool(
	"underline",
	{
		wysiwygonly: _TRUE,
		sync: _TRUE,
		status: _TRUE,
        hotKey: {
            // ctrl + u
			ctrlKey: _TRUE,
			keyCode: 85
		}
	}
);

Trex.Tool.Underline = Trex.Class.create({
	$const: {
		__Identity: 'underline'
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
        return "underline";
    },
    isStyleApplied: function(node) {
        return $tx.getStyle(node, "textDecoration").include("underline");
    }
});