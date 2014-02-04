/**
 * @fileoverview 
 * Toolbar의 Bold Icon을 위해 필요한 configuration과 Class Trex.Tool.Bold을/를 포함    
 *  
 */
TrexConfig.addTool(
	"bold", 
	{
		wysiwygonly: _TRUE,
		sync: _TRUE,
		status: _TRUE,
        hotKey: { // ctrl + b
            ctrlKey: _TRUE,
			keyCode: 66
        }
	}
);

Trex.Tool.Bold = Trex.Class.create({
	$const: {
		__Identity: 'bold'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.ButtonFontTool, Trex.I.WrappingDummyFontTool],
    getRelatedCssPropertyNames: function() {
        return ["font", this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "fontWeight";
    },
    getQueryCommandName: function() {
        return "bold";
    },
    isStyleApplied: function(node) {
        return ["bold", "700"].contains($tx.getStyle(node, "fontWeight"));
    }
});
