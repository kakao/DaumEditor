/**
 * @fileoverview 
 * 설정에서 지정된 여러 fontsize들을 선택할 수 있는 메뉴를 포함하는 tool인 '글자크기' Icon을 위한 source로,
 * Class Trex.Tool.FontSize, configuration 을 포함    
 * 
 *   
 */
TrexConfig.addTool(
	"fontsize", 
	{
		sync: _TRUE,
		status: _TRUE,
		options: [
			{ label: '가나다라마바사 (8pt)', title: '8pt', data: '8pt', klass: 'tx-8pt' },
			{ label: '가나다라마바사 (9pt)', title: '9pt', data: '9pt', klass: 'tx-9pt' },
			{ label: '가나다라마바사 (10pt)', title: '10pt', data: '10pt', klass: 'tx-10pt' },
			{ label: '가나다라마바사 (11pt)', title: '11pt', data: '11pt', klass: 'tx-11pt' },
			{ label: '가나다라마바사 (12pt)', title: '12pt', data: '12pt', klass: 'tx-12pt' },
			{ label: '가나다라마바사 (14pt)', title: '14pt', data: '14pt', klass: 'tx-14pt' },
			{ label: '가나다라마바사 (18pt)', title: '18pt', data: '18pt', klass: 'tx-18pt' },
			{ label: '가나다라마 (24pt)', title: '24pt', data: '24pt', klass: 'tx-24pt' },
			{ label: '가나다 (36pt)', title: '36pt', data: '36pt', klass: 'tx-36pt' }
		]
	}
);

Trex.Tool.FontSize = Trex.Class.create({
	$const: {
		__Identity: 'fontsize'
	},
	$extend: Trex.Tool,
    $mixins: [Trex.I.FontTool, Trex.I.MenuFontTool, Trex.I.WrappingSpanFontTool],
    beforeOnInitialized: function(config) {
        this.createFontSizeMap(config);
    },
    createButton: function() {
        var defaultProperty = this.getDefaultProperty();
        var button = this.button = new Trex.Button.Select(this.buttonCfg);
        button.setValue(defaultProperty);
        button.setText(this.getTextByValue(defaultProperty));
        return button;
    },
    createMenu: function() {
        return new Trex.Menu.Select(this.menuCfg);
    },
    createFontSizeMap: function(config) {
        var fontSizeMap = this.fontSizeMap = {};
        config.options.each(function(option) {
            fontSizeMap[option.data] = option.title;
        });
        [
            //NOTE: font tag의 속성으로 글자 크기를 지정했을 경우
            { title: '8pt', data: '1' },
            { title: '10pt', data: '2' },
            { title: '12pt', data: '3' },
            { title: '14pt', data: '4' },
            { title: '18pt', data: '5' },
            { title: '24pt', data: '6' },
            { title: '36pt', data: '7' },
            { title: '7.5pt', data: '10px'},
            { title: '8pt', data: '11px' },
            { title: '9pt', data: '12px' },
            { title: '10pt', data: '13px' },
            { title: '11pt', data: '15px' },
            { title: '12pt', data: '16px' },
            { title: '14pt', data: '19px' },
            { title: '18pt', data: '24px' },
            { title: '24pt', data: '32px' },
            { title: '36pt', data: '48px' },
            { title: '8pt', data: 'x-small' },
            { title: '10pt', data: 'small' },
            { title: '12pt', data: 'medium' },
            { title: '14pt', data: 'large' },
            { title: '18pt', data: 'x-large' },
            { title: '24pt', data: 'xx-large' },
            { title: '36pt', data: '-webkit-xxx-large' } //NOTE: webkit 계열에서 사용하는 글자 크기
        ].each(function(option) {
            fontSizeMap[option.data] = option.title;
        });
    },
    reliableQueriedValue: function(value) {
    	return $tx.webkit === false;
    },
    getTextByValue: function(value) {
        var matchedText = this.fontSizeMap[value];
        if (!matchedText) {
            var round = Math.round(parseFloat(value)).toPx();
            matchedText = this.fontSizeMap[round];
        }
        return matchedText;
    },
    getRelatedCssPropertyNames: function() {
        return ["font", this.getCssPropertyName()];
    },
    getCssPropertyName: function() {
        return "fontSize";
    },
    getQueryCommandName: function() {
        return "fontsize";
    },
    getDefaultProperty: function() {
        return this.canvas.getStyleConfig().fontSize;
    },
    getFontTagAttribute: function() {
        return "size";
    }
});
