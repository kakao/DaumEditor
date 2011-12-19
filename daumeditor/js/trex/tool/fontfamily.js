/**
 * @fileoverview 
 * 설정에서 지정된 여러 글꼴들을 선택할 수 있는 메뉴를 포함하는 tool인 '글꼴' Icon을 위한 source로, 
 * 필요한 configuration과 Class Trex.Tool.FontFamily을/를 포함    
 * 
 *   
 */

TrexMessage.addMsg({
	'@fontfamily.gulim': '굴림',
	'@fontfamily.batang': '바탕',
	'@fontfamily.dotum': '돋움',
	'@fontfamily.gungsuh': '궁서'
});

TrexConfig.addTool(
	"fontfamily", 
	{
		sync: _TRUE,
		status: _TRUE,
		useFavorite: _TRUE,
		options: [
			{ label: TXMSG('@fontfamily.gulim')+'<span class="tx-txt">(가나다라)</span>', title: TXMSG('@fontfamily.gulim'), data: 'Gulim,굴림', klass: 'tx-gulim' },
			{ label: TXMSG('@fontfamily.batang')+'<span class="tx-txt">(가나다라)</span>', title: TXMSG('@fontfamily.batang'), data: 'Batang,바탕', klass: 'tx-batang' },
			{ label: TXMSG('@fontfamily.dotum')+'<span class="tx-txt">(가나다라)</span>', title: TXMSG('@fontfamily.dotum'), data: 'Dotum,돋움', klass: 'tx-dotum' },
			{ label: TXMSG('@fontfamily.gungsuh')+' <span class="tx-txt">(가나다라)</span>', title: TXMSG('@fontfamily.gungsuh'), data: 'Gungsuh,궁서', klass: 'tx-gungseo' },
			{ label: 'Arial <span class="tx-txt">(abcde)</span>', title: 'Arial', data: 'Arial', klass: 'tx-arial' },
			{ label: 'Verdana <span class="tx-txt">(abcde)</span>', title: 'Verda..', data: 'Verdana', klass: 'tx-verdana' }
		]
	}
);

Trex.Tool.FontFamily = Trex.Class.create({
	$const: {
		__Identity: 'fontfamily'
	},
	$extend: Trex.Tool,
	$mixins: [Trex.I.CookieBaker, Trex.I.FontTool, Trex.I.MenuFontTool, Trex.I.WrappingSpanFontTool],
    beforeOnInitialized: function(config) {
        function findAvailableFonts(config) {
            self.usedWebFonts = (($tx.msie && config.webfont && config.webfont.use) ? config.webfont.options : []);
            self.usedFonts = config.options.concat(self.usedWebFonts);
        }

        function setUseFavoriteFont(config) {
            if (config.useFavorite && self.usedWebFonts.length > 0) {
                self.useFavorite = _TRUE;
                self.initCookie('txFontFamilyFavorite');
            } else {
                self.useFavorite = _FALSE;
            }
        }

        var self = this;
        self.focusLoosed = _FALSE;

        findAvailableFonts(config);
        setUseFavoriteFont(config);

        self.createFontFamilyMap(self.usedFonts);
    },
    createFontFamilyMap: function(usedFonts) {
        var fontFamilyMap = this.fontFamilyMap = {};
        usedFonts.each(function(option) {
            var fontNames = option.data.split(",");
            var title = option.title;
            for( var i = 0; i < fontNames.length; i++){
                fontFamilyMap[fontNames[i].toLowerCase()] = title;
            }
            if (!fontFamilyMap[title.toLowerCase()]) {
                fontFamilyMap[title.toLowerCase()] = title;
            }
        });
    },
    createButton: function() {
        var button = this.button = new Trex.Button.Select(this.buttonCfg);
        button.setValue(this.getDefaultProperty());
        button.setText(this.getTextByValue(this.getDefaultProperty()));
        return button;
    },
    createMenu: function() {
        var self = this;
        var menu = self.menu = new Trex.Menu.Select(TrexConfig.merge(self.menuCfg, {
            options: self.usedFonts
        }));
        if (self.usedWebFonts.length > 0) {
            $tx.addClassName(menu.elMenu, "tx-fontfamily-webfont-menu");
            var elDummyForFocus = tx.input({'type': 'text', 'className': 'tx-dummyfocus'});
            $tom.append(menu.elMenu, elDummyForFocus);
            $tx.observe(menu.elMenu, 'mousedown', function(ev) {
                if (ev.offsetX < self.menu.elMenu.clientWidth) { //not scrollbar
                    return;
                }
                elDummyForFocus.style.top = ev.offsetY.toPx();
                if (!self.focusLoosed) {
                    elDummyForFocus.focus();
                    elDummyForFocus.blur();
                    self.menu.elMenu.focus();
                    self.focusLoosed = _TRUE;
                }
            });
        }
        return menu;
    },
    menuInitHandler: function() {
        var self = this;
        var menu = self.menu;
        self.focusLoosed = _FALSE;
        if(!self.useFavorite) {
            return [];
        }
        menu.elMenu.scrollTop = 0;
        var elGroup = $tom.collect(menu.elMenu, "ul.tx-menu-favlist");
        if(elGroup) {
            $tom.remove(elGroup);
        }
        var favorite = self.extractOptions(self.usedFonts, self.readCookie());
        elGroup = menu.generateList(favorite);
        $tom.insertFirst(menu.elMenu, elGroup);
        $tx.addClassName(elGroup, 'tx-menu-favlist');
        return favorite;
    },
    onBeforeHandler: function(data) {
        this.canvas.includeWebfontCss("font-family: " + data);
    },
    onAfterHandler: function(data) {
        var self = this;
        if (self.useFavorite) {
            self.writeCookie(self.mergeValues(self.readCookie(), data));
        }
    },
    getDefaultProperty: function() {
        return this.canvas.getStyleConfig().fontFamily;
    },
    getRelatedCssPropertyNames: function() {
        return ["font", this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "fontFamily";
    },
    getQueryCommandName: function() {
        return "fontname";
    },
    getFontTagAttribute: function() {
        return "face";
    },
    getTextByValue: function(value) {
        if (value.include(",")) {
            value = value.split(",")[0];
        }
        var fontFamilyMap = this.fontFamilyMap;
        if (fontFamilyMap[value.toLowerCase()]) {
            return fontFamilyMap[value.toLowerCase()];
        } else {
            // 왜 replace를 하는 것일까? => webfont 중에 9나 _9로 끝나는 것들이 몇개 있다
            value = value.replace("_9", "").replace("9", "");
            if (fontFamilyMap[value.toLowerCase()]) {
                return fontFamilyMap[value.toLowerCase()];
            } else {
                return fontFamilyMap[this.getDefaultProperty()];
            }
        }
    }
});