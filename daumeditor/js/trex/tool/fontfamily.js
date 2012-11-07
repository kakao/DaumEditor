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
			{ label: TXMSG('@fontfamily.gulim')+' (<span class="tx-txt">가나다라</span>)', title: TXMSG('@fontfamily.gulim'), data: 'Gulim,굴림,AppleGothic,sans-serif', klass: 'tx-gulim' },
			{ label: TXMSG('@fontfamily.batang')+' (<span class="tx-txt">가나다라</span>)', title: TXMSG('@fontfamily.batang'), data: 'Batang,바탕,serif', klass: 'tx-batang' },
			{ label: TXMSG('@fontfamily.dotum')+' (<span class="tx-txt">가나다라</span>)', title: TXMSG('@fontfamily.dotum'), data: 'Dotum,돋움,sans-serif', klass: 'tx-dotum' },
			{ label: TXMSG('@fontfamily.gungsuh')+' (<span class="tx-txt">가나다라</span>)', title: TXMSG('@fontfamily.gungsuh'), data: 'Gungsuh,궁서,serif', klass: 'tx-gungseo' },
			{ label: 'Arial (<span class="tx-txt">abcde</span>)', title: 'Arial', data: 'Arial,sans-serif', klass: 'tx-arial' },
			{ label: 'Verdana (<span class="tx-txt">abcde</span>)', title: 'Verdana', data: 'Verdana,sans-serif', klass: 'tx-verdana' },
            { label: 'Courier New (<span class="tx-txt">abcde</span>)', title: 'Courier New', data: 'Courier New,monspace', klass: 'tx-courier-new' }
		]
	}
);
/* legacy fontfamily * 
{ label: ' 굴림 (<span class="tx-txt">가나다라</span>)', title: '굴림', data: 'Gulim,굴림,AppleGothic,sans-serif', klass: 'tx-gulim' },
{ label: ' 바탕 (<span class="tx-txt">가나다라</span>)', title: '바탕', data: 'Batang,바탕', klass: 'tx-batang' },
{ label: ' 돋움 (<span class="tx-txt">가나다라</span>)', title: '돋움', data: 'Dotum,돋움', klass: 'tx-dotum' },
{ label: ' 궁서 (<span class="tx-txt">가나다라</span>)', title: '궁서', data: 'Gungsuh,궁서', klass: 'tx-gungseo' },
{ label: ' Arial (<span class="tx-txt">abcde</span>)', title: 'Arial', data: 'Arial', klass: 'tx-arial' },
{ label: ' Verdana (<span class="tx-txt">abcde</span>)', title: 'Verdana', data: 'Verdana', klass: 'tx-verdana' },
{ label: ' Arial Black (<span class="tx-txt">abcde</span>)', title: 'Arial Black', data: 'Arial Black', klass: 'tx-arial-black' },
{ label: ' Book Antiqua (<span class="tx-txt">abcde</span>)', title: 'Book Antiqua', data: 'Book Antiqua', klass: 'tx-book-antiqua' },
{ label: ' Comic Sans MS (<span class="tx-txt">abcde</span>)', title: 'Comic Sans MS', data: 'Comic Sans MS', klass: 'tx-comic-sans-ms' },
{ label: ' Courier New (<span class="tx-txt">abcde</span>)', title: 'Courier New', data: 'Courier New', klass: 'tx-courier-new' }, 	
{ label: ' Georgia (<span class="tx-txt">abcde</span>)', title: 'Georgia', data: 'Georgia', klass: 'tx-georgia' },
{ label: ' Helvetica (<span class="tx-txt">abcde</span>)', title: 'Helvetica', data: 'Helvetica', klass: 'tx-helvetica' },
{ label: ' Impact (<span class="tx-txt">abcde</span>)', title: 'Impact', data: 'Impact', klass: 'tx-impact' },
{ label: ' Symbol (<span class="tx-txt">abcde</span>)', title: 'Symbol', data: 'Symbol', klass: 'tx-symbol' },
{ label: ' Tahoma (<span class="tx-txt">abcde</span>)', title: 'Tahoma', data: 'Tahoma', klass: 'tx-tahoma' },
{ label: ' Terminal (<span class="tx-txt">abcde</span>)', title: 'Terminal', data: 'Terminal', klass: 'tx-terminal' },
{ label: ' Times New Roman (<span class="tx-txt">abcde</span>)', title: 'Times New R..', data: 'Times New Roman', klass: 'tx-times-new-roman' },
{ label: ' Trebuchet MS (<span class="tx-txt">abcde</span>)', title: 'Trebuchet MS', data: 'Trebuchet MS', klass: 'tx-trebuchet-ms' },
{ label: ' Webdings (<span class="tx-txt">abcde</span>)', title: 'Webdings', data: 'Webdings', klass: 'tx-webdings' },
{ label: ' Wingdings (<span class="tx-txt">abcde</span>)', title: 'Wingdings', data: 'Wingdings', klass: 'tx-wingdings' }
 */
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
		var self = this, fontFamilyMap = {};
		this.fontFamilyMap = fontFamilyMap;
		usedFonts.each(function (option) {
			var fontNames, title, i, key;
			fontNames = option.data.split(",");
			title = option.title;
			for (i = 0; i < fontNames.length; i += 1) {
				key = self.preprocessFontFamily(fontNames[i]);
				fontFamilyMap[key] = title;
			}
			if (!fontFamilyMap[title.toLowerCase()]) {
				fontFamilyMap[title.toLowerCase()] = title;
			}
		});
	},
	createButton: function() {
		var button = new Trex.Button.Select(this.buttonCfg);
		this.button = button;
		button.setValue(this.getDefaultProperty());
		button.setText(this.getTextByValue(this.getDefaultProperty()));
		return button;
	},
	createMenu: function() {
		var self = this;
		var menu = new Trex.Menu.Select(TrexConfig.merge(self.menuCfg, {
			options: self.usedFonts
		}));
		this.menu = menu;
		//overwrite generateListItem
		menu.generateListItem = function (option) {
			var result = [], i, item, labalBackup;
			for(i = 0; i < option.length; i += 1) {
				item = option[i];
				labalBackup = item.label;
				item.label = item.label.replace(/<span class="tx\-txt">/, '<span class="tx-txt" style="font-family:' + item.data + ';">');
				result.push(Trex.MarkupTemplate.get("menu.select.item").evaluate(item));
				item.label = labalBackup;	
			}
			return result.join("");
		};
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
	preprocessFontFamily: function (name) {
		//브라우저에 따라 qoute 등으로 감싸주는 경우가 있음.
		//폰트 이름중에 _9 나 9 로 끝나는게 있어 문제가 있었다고 주석이 있었음.
		return name.toLowerCase().replace(/'|"/g, "").replace(/_?9$/, "");
	},
	getTextByValue: function(value) {
		if (value.include(",")) {
			value = value.split(",")[0];
		}
		value = this.preprocessFontFamily(value);
		return this.fontFamilyMap[value];
	}
});
