(function() {
    var WEBFONT_EMBEDDED_HTML = "<span style='font-family: RixKidD;'>hello</span>";

    var loader;
    var config = {
        styles: {},
        webfont: {
            use: true,
            options: [
                { label: '릭스꼬꼬마 <span class="tx-txt">(가나다라)</span>',		title: '릭스꼬꼬마',		data: 'RixKidD',			klass: 'tx-RixKidD',			url: 'RixKidD.css' },
                { label: '릭스일요일맑음 <span class="tx-txt">(가나다라)</span>',	title: '릭스일요일맑음',	data: 'RixShinySundayD',	klass: 'tx-RixShinySundayD',	url: 'RixShinySundayD.css' }
            ]
        }
    };

    module("WebfontLoader", {
        setup: function() {
            this.originalIsIEFlag = $tx.msie;
            loader = new Trex.WebfontLoader(document, config);
        },
        teardown: function() {
            $tx.msie = this.originalIsIEFlag;
        }
    });

    test("load() method should be ignored unless IE", function() {
        expect(1);
        $tx.msie = false;

        loader.imports = function() {
            ok(false, "should not be invoked");
        };
        loader.load(WEBFONT_EMBEDDED_HTML);
        stop();
        setTimeout(function() {
            ok(true);
            start();
        }, 50);
    });

    test("getUsed() should return empty array unless IE", function() {
        expect(1);
        $tx.msie = false;
        loader.useWebfont = true;
        loader.webfontCfg.options[0].url = null;
        deepEqual(loader.getUsed(), [], "empty array");
    });

})();