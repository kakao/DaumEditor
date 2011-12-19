/**
 * @fileoverview 
 *  글자 배경색을 적용 하기 위해 쓰이는, Toolbar의 글자배경색 Icon을 위해 필요한 
 *  configuration과 Class Trex.Tool.BackColor을/를 포함
 * 
 */
TrexConfig.addTool(
	"backcolor",
	{
		defaultcolor: "#9aa5ea",
		wysiwygonly: _TRUE, 
		sync: _FALSE,
		status: _TRUE,
		useFavorite: _TRUE,
		texts: {
			options: [
				{ color: '#ff0000', text: '#ffffff', label: '가나다' },
				{ color: '#e545d0', text: '#ffffff', label: '가나다' },
				{ color: '#000000', text: '#ffffff', label: '가나다' },
				{ color: '#ff5e00', text: '#ffffff', label: '가나다' },
				{ color: '#7c43b1', text: '#ffffff', label: '가나다' },
				{ color: '#848484', text: '#ffffff', label: '가나다' },
				{ color: '#ffbb00', text: '#ffffff', label: '가나다' },
				{ color: '#4673ff', text: '#ffffff', label: '가나다' },
				{ color: '#66e8ff', text: '#000000', label: '가나다' },
				{ color: '#ffe400', text: '#ffffff', label: '가나다' }, 
				{ color: '#1fafda', text: '#ffffff', label: '가나다' },
				{ color: '#8cfccb', text: '#000000', label: '가나다' },
				{ color: '#a8c40d', text: '#ffffff', label: '가나다' },
				{ color: '#009999', text: '#ffffff', label: '가나다' },
				{ color: '#ffffff', text: '#000000', label: '가나다' }
			]
		},
		thumbs: Trex.__CONFIG_COMMON.thumbs,
		needRevert: _TRUE,
		needTrans: _FALSE
	}
);

Trex.Tool.BackColor = Trex.Class.create({
	$const: {
		__Identity: 'backcolor'
	},
	$extend: Trex.Tool,
	$mixins: [Trex.I.CookieBaker, Trex.I.FontTool, Trex.I.MenuFontTool, Trex.I.WrappingSpanFontTool],
    beforeOnInitialized: function(config) {
        this.useFavorite = !!config.useFavorite;
        if (this.useFavorite) {
            this.initCookie('txBackColorFavorite');
        }
    },
    createButton: function() {
        var initialColor =  this.readCookie() || this.getDefaultProperty();

        var button = this.button = new Trex.Button.Splits(this.buttonCfg);
        button.setValue(initialColor);
        this.syncButton(initialColor);
        return button;
    },
    createMenu: function() {
        return new Trex.Menu.ColorPallete(this.menuCfg);
    },
    onAfterHandler: function(data) {
        this.syncButton(data);
        if (this.useFavorite) {
            this.writeCookie(data);
        }
    },
    getDefaultProperty: function() {
        return this.config.defaultcolor;
    },
    syncButton: function(data) {
        try {
            var color = data ? data.split("|")[0] : _NULL;
            if (color) {
                $tx.setStyle(this.button.elButton, {
                    backgroundColor: color
                });
            }
		} catch(e){
            console.log(e);
        }
    },
    getRelatedCssPropertyNames: function() {
        return ["color", this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "backgroundColor";
    },
    getQueryCommandName: function() {
        return ($tx.gecko || $tx.opera) ? "hilitecolor" : "backcolor";
    },
    computeNewStyle: function(data) {
        if (this.shouldRevert(data) || this.includeTextColor(data)) {
            var split = data ? data.split("|") : [];
            return {backgroundColor: split[0], color: split[1]};
        }
        return {backgroundColor: data};
    },
    shouldRevert: function(data) {
        return data == _NULL;
    },
    includeTextColor: function(data) {
        return data && (data.indexOf("|") > -1);
    }
});
