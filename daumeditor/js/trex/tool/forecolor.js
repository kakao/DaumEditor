/**
 * @fileoverview 
 * 글자색을 변경하기 위해 쓰이는 '글자색' Icon을 위해 필요한 source, 
 * Class Trex.Tool.ForeColor 와 configuration을 포함    
 *  
 */
TrexConfig.addTool(
	"forecolor",
	{ 
		defaultcolor: "#7c84ef",
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _TRUE,
		useFavorite: _TRUE,
		thumbs: Trex.__CONFIG_COMMON.thumbs,
		needRevert: _TRUE
	}
);

Trex.Tool.ForeColor = Trex.Class.create({
	$const: {
		__Identity: 'forecolor'
	},
	$extend: Trex.Tool,
	$mixins: [Trex.I.CookieBaker, Trex.I.FontTool, Trex.I.MenuFontTool],
    beforeOnInitialized: function(config) {
		this.useFavorite = !!config.useFavorite;
		if (this.useFavorite) {
			this.initCookie('txForeColorFavorite');
		}
    },
    createButton: function() {
        var initialColor = this.readCookie() || this.getDefaultProperty();

        var button = this.button = new Trex.Button.Splits(this.buttonCfg);
        button.setValue(initialColor);
        this.syncButton(initialColor);
        return button;
    },
    createMenu: function() {
        return new Trex.Menu.ColorPallete(this.menuCfg);
    },
    onAfterHandler: function(color) {
        this.syncButton(color);
        if (this.useFavorite) {
            this.writeCookie(color);
        }
    },
    getDefaultProperty: function() {
        return this.config.defaultcolor;
    },
    getRelatedCssPropertyNames: function() {
        return [this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "color";
    },
    getQueryCommandName: function() {
        return "forecolor";
    },
    legacyModeExecutor: function(processor, newStyle) {
        processor.execCommand(this.getQueryCommandName(), newStyle[this.getCssPropertyName()] || this.canvas.getStyleConfig('color'));
    },
    syncButton: function(color) {
        try {
            if (color) {
                $tx.setStyle(this.button.elButton, {'backgroundColor': color});
            }
        } catch(e) {
            console.log(e);
        }
    }
});


