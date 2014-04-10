(function() {
    var p, table;
    var FontTool = Trex.I.FontTool;
    module("fontTool", {
        setup: function() {
            p = ax.p();
            table = ax.table({border: "1"}, ax.tr(
                ax.td(ax.p("Hello1"), ax.p("Hello2"), ax.p("Hello3")),
                ax.td(ax.table({border: "1"}, ax.tr(ax.td("World1"), ax.td("World2"))), "World3")));
        }
    });

    test("font태그의 size 값을 style의 font-size로 변환한다.", function() {
        var converter = FontCssProperty.TAGS_FOR_PRESENTATION.FONT;
        var node = document.createElement("font");
        assertFontTagSize(7, "xx-large");
        assertFontTagSize(6, "xx-large");
        assertFontTagSize(5, "x-large");
        assertFontTagSize(3, "medium");
        assertFontTagSize(1, "x-small");
        assertFontTagSize(0, "x-small");
        assertFontTagSize("10pt", $tx.msie ? "xx-large" : "10pt");

        function assertFontTagSize(size, expected) {
            node.size = size;
            deepEqual(converter(node), { fontSize: expected });
        }
    });
})();

(function() {
    var p;
    module("queryStyle", {
        setup: function() {
            var html = '<p><b>123123123</b></p>' +
                '<p><b><span style="font-size: 18pt;">234234234</span></b></p>' +
                '<p><b><span style="font-size: 18pt;"><u>3453434534</u></span></b></p>' +
                '<p><b><span style="font-size: 18pt;"><u><i>456456456</i></u></span></b></p>' +
                '<p><b><span style="font-size: 18pt;"><u><i><strike>567567657657</strike></i></u></span></b></p>' +
                '<p><b><span style="font-size: 18pt;"><u><i><strike><span style="color: rgb(206, 242, 121);">345345345345</span></strike></i></u></span></b></p>' +
                '<p><b><span style="font-size: 18pt;"><u><i><strike><span style="color: rgb(206, 242, 121);"><span style="color: rgb(51, 51, 51);">﻿345345345345</span></span></strike></i></u></span></b></p>' +
                '<p><span style="font-size: 18pt;"><u><i><strike><span style="color: rgb(206, 242, 121);"><span style="color: rgb(51, 51, 51);">1232132113</span></span></strike></i></u></span></p>' +
                '<p><span style="font-size: 18pt;"><i><strike><span style="color: rgb(206, 242, 121);"><span style="color: rgb(51, 51, 51);">234234234</span></span></strike></i></span></p>' +
                '<p><span style="font-size: 18pt;"><strike><span style="color: rgb(206, 242, 121);"><span style="color: rgb(51, 51, 51);">345345345</span></span></strike></span></p>' +
                '<p><span style="font-size: 18pt;"><span style="color: rgb(206, 242, 121);"><span style="color: rgb(51, 51, 51);">45646456546</span></span></span><br></p>';

            assi.setContent(html);
            p = assi.$$('p');
        }
    });

    test("underline for old gecko (= less than ver.20)", function() {
        var QueryStyleClass = Trex.Mixin.toClass(Trex.I.Tool.QueryStyle.Gecko);
        var queryStyle = new QueryStyleClass();
        underlineTestGroup(queryStyle);
    });

    test("strike for old gecko (= less than ver.20)", function() {
        var QueryStyleClass = Trex.Mixin.toClass(Trex.I.Tool.QueryStyle.Gecko);
        var queryStyle = new QueryStyleClass();
        strikeTestGroup(queryStyle);
    });

    function underlineTest(queryStyle, currentNode, expect, msg) {
        var cssPropertyName = 'textDecoration';
        var queryCommandName = 'underline';
        var matchTagName = 'u';

        var result = queryStyle.queryNodeStyle(currentNode, cssPropertyName, queryCommandName, matchTagName);
        equal(result, expect, msg);
    }

    function strikeTest(queryStyle, currentNode, expect, msg) {
        var cssPropertyName = 'textDecoration';
        var queryCommandName = 'strikethrough';
        var matchTagName = 'strike';

        var result = queryStyle.queryNodeStyle(currentNode, cssPropertyName, queryCommandName, matchTagName);
        equal(result, expect, msg);
    }

    function underlineTestGroup(queryStyle) {
        underlineTest(queryStyle, assi.$$('b'       , p[0])[0]  , false, 'p > bold');
        underlineTest(queryStyle, assi.$$('span'    , p[1])[0]  , false, 'p > bold > span');
        underlineTest(queryStyle, assi.$$('u'       , p[2])[0]  , true, 'p > bold > span > u');
        underlineTest(queryStyle, assi.$$('i'       , p[3])[0]  , true, 'p > bold > span > u > i');
        underlineTest(queryStyle, assi.$$('strike'  , p[4])[0]  , true, 'p > bold > span > u > i > strike');
        underlineTest(queryStyle, assi.$$('span'    , p[5])[1]  , true, 'p > bold > span > u > i > strike > span');
        underlineTest(queryStyle, assi.$$('span'    , p[6])[2]  , true, 'p > bold > span > u > i > strike > span > span');
        underlineTest(queryStyle, assi.$$('span'    , p[7])[2]  , true, 'p > span > u > i > strike > span > span');
        underlineTest(queryStyle, assi.$$('span'    , p[8])[2]  , false, 'p > span > i > strike > span > span');
        underlineTest(queryStyle, assi.$$('span'    , p[9])[2]  , false, 'p > span > strike > span > span');
        underlineTest(queryStyle, assi.$$('span'    , p[10])[2] , false, 'p > span > span > span');
    }

    function strikeTestGroup(queryStyle) {
        strikeTest(queryStyle, assi.$$('b'       , p[0])[0]  , false, 'p > bold');
        strikeTest(queryStyle, assi.$$('span'    , p[1])[0]  , false, 'p > bold > span');
        strikeTest(queryStyle, assi.$$('u'       , p[2])[0]  , false, 'p > bold > span > u');
        strikeTest(queryStyle, assi.$$('i'       , p[3])[0]  , false, 'p > bold > span > u > i');
        strikeTest(queryStyle, assi.$$('strike'  , p[4])[0]  , true, 'p > bold > span > u > i > strike');
        strikeTest(queryStyle, assi.$$('span'    , p[5])[1]  , true, 'p > bold > span > u > i > strike > span');
        strikeTest(queryStyle, assi.$$('span'    , p[6])[2]  , true, 'p > bold > span > u > i > strike > span > span');
        strikeTest(queryStyle, assi.$$('span'    , p[7])[2]  , true, 'p > span > u > i > strike > span > span');
        strikeTest(queryStyle, assi.$$('span'    , p[8])[2]  , true, 'p > span > i > strike > span > span');
        strikeTest(queryStyle, assi.$$('span'    , p[9])[2]  , true, 'p > span > strike > span > span');
        strikeTest(queryStyle, assi.$$('span'    , p[10])[2] , false, 'p > span > span > span');
    }

})();