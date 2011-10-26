(function() {

    var WEBFONT_EMBEDDED_HTML = "<span style='font-family: MD_diary;'>hello</span>";

    var loader;
    var config = {
        styles: {},
        webfont: {
            use: true,
            options: [
                { label: 'MD다이어리 <span class="tx-txt">(가나다라)</span>', title: 'MD다이어리', data: 'MD_diary', klass: 'tx-MD_diary', url: 'MD_diary.css' }
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
        expect(0);
        $tx.msie = false;

        loader.load(WEBFONT_EMBEDDED_HTML)
        loader.imports = function() {
            ok(false, "should not be invoked");
        };
        QUnit.stop(1000);
        setTimeout(function() {
            QUnit.start();
        }, 20);
    });

    test("load() method should be ignored unless IE", function() {
        expect(0);
        $tx.msie = false;

        loader.load(WEBFONT_EMBEDDED_HTML);
        loader.imports = function() {
            ok(false, "should not be invoked");
        };
        QUnit.stop(1000);
        setTimeout(function() {
            QUnit.start();
        }, 20);
    });

    test("getUsed() should return empty array unless IE", function() {
        expect(1);
        $tx.msie = false;
        loader.useWebfont = true;
        loader.webfontCfg.options[0].url = null;
        deepEqual(loader.getUsed(), [], "empty array");
    });

})();