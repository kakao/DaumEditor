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

    test("두 개의 중첩된 div에서 findSpanContainableElements", function() {
        assi.setContent('<blockquote id="innerDiv"><span id="1">Hello<span style="font-style: italic">W<a id="2">orl</a>d</span></span></blockquote>');
        var blocks = FontTool.collectSpanContainableElements(assi.$("1").firstChild, 0, assi.$("2").firstChild, 0);
        deepEqual(blocks, [ assi.$("innerDiv"), assi.$("2")]);
    });

    test("td > #text에서 findSpanContainableElements", function() {
        var table = ax.table({border: "1"}, ax.tr(ax.td("Hello"), ax.td("World")));
        assi.setContent(assi.getHTML(table));
        var td = assi.byTag("td");
        var range = goog.dom.Range.createFromNodeContents(td);
        var startNode = range.getStartNode(), startOffset = range.getStartOffset();
        var endNode = range.getEndNode(), endOffset = range.getEndOffset();
        var elements = FontTool.collectSpanContainableElements(startNode, startOffset, endNode, endOffset);
        deepEqual(elements, [td]);
    });

    test("td > p*3 에서 findSpanContainableElements", function() {
        assi.setContent(assi.getHTML(table));

        var td1 = assi.byTag("td");
        var range = goog.dom.Range.createFromNodeContents(td1);
        var startNode = range.getStartNode(), startOffset = range.getStartOffset();
        var endNode = range.getEndNode(), endOffset = range.getEndOffset();
        var elements = FontTool.collectSpanContainableElements(startNode, startOffset, endNode, endOffset);
        deepEqual(elements, [assi.byTag("p", 0), assi.byTag("p", 1), assi.byTag("p", 2)]);
    });

    test("table안의 table에서 findSpanContainableElements", function() {
        assi.setContent(assi.getHTML(table));

        var td2 = assi.byTag("td", 1);
        var range = goog.dom.Range.createFromNodeContents(td2);
        var startNode = range.getStartNode(), startOffset = range.getStartOffset();
        var endNode = range.getEndNode(), endOffset = range.getEndOffset();
        var elements = FontTool.collectSpanContainableElements(startNode, startOffset, endNode, endOffset);
        deepEqual(elements, [assi.byTag("td", 2), assi.byTag("td", 3), assi.byTag("td", 1)]);
    });

    // <p>He<span id="caret"></span>llo</p>
    test("flattenSpanChild : He^llo", function() {
        var HTML = 'He<span id="caret"></span>llo';
        p.innerHTML = HTML;
        var caret = p.childNodes[1];
        FontTool.flattenSpanChild(caret);
        equal(p.childNodes.length, 3);
        htmlEqual(p.innerHTML, HTML);
    });

    test('flattenSpanChild : <span style="font-weight:bold ">He<span id="caret"></span>llo</span>', function() {
        p.innerHTML = '<span class="clazz" style="font-weight:bold;text-decoration:line-through">He<span id="caret" style="text-decoration:underline;"></span>llo</span>';
        var caret = p.childNodes[0].childNodes[1];
        FontTool.flattenSpanChild(caret);
        equal(p.childNodes.length, 3);
        htmlEqual(p.innerHTML, '<span class="clazz" style="font-weight:bold;text-decoration:line-through">He</span><span id="caret" style="font-weight:bold;text-decoration:underline line-through"></span><span class="clazz" style="font-weight:bold;text-decoration:line-through">llo</span>');
    });

    test("flattenSpanChild : P의 margin style은 span에 적용되지 않는다.", function() {
        $tom.applyStyles(p, { margin: "1px", fontWeight: "bold" });
        p.innerHTML = '<span>He<span id="caret"></span>llo</span>World';
        var caret = p.childNodes[0].childNodes[1];
        FontTool.flattenSpanChild(caret);
        equal(p.childNodes.length, 4);
        htmlEqual(p.innerHTML, '<span>He</span><span id="caret"></span><span>llo</span>World');
        equal(p.style.margin, "1px");
        equal(p.style.fontWeight, $tx.opera ? "700" : "bold");
    });

    test("flattenSpanChild : <span><span>Text</span></span> 인 경우에는 불필요한 node를 만들 필요가 없다.", function() {
        p.innerHTML = '<span class="clazz" style="font-weight:bold"><span id="caret"></span></span>';
        var caret = p.childNodes[0].childNodes[0];
        FontTool.flattenSpanChild(caret);
        equal(p.childNodes.length, 1);
        htmlEqual(p.innerHTML, '<span id="caret" style="font-weight:bold"></span>');
    });

    test("하위 span에 font css property가 포함된 경우", function() {
        var p = ax.p(ax.span({style: {fontWeight: "bold"}}, "Hello", ax.span({style: {font: "20px dotum"}}, "World")));
        assi.setContentElement(p);
        var innerSpan = assi.byTag("span", 1);
        FontTool.flattenSpanChild(innerSpan);
        equal(assi.getStyle(assi.byTag("span", 0), "fontWeight"), "bold");
        equal(assi.getStyle(assi.byTag("span", 1), "fontWeight"), "normal");
    });

    test("상위 span에 font css property가 포함된 경우", function() {
        var p = ax.p(ax.span({style: {font: "20px dotum"}}, "Hello", ax.span({style: {fontWeight: "bold"}}, "World")));
        assi.setContentElement(p);
        var innerSpan = assi.byTag("span", 1);
        FontTool.flattenSpanChild(innerSpan);
        equal(assi.getStyle(assi.byTag("span", 0), "fontWeight"), "normal");
        equal(assi.getStyle(assi.byTag("span", 1), "fontWeight"), "bold");
    });

    function presentationalTagToChildSpan(parent) {
        var iterator = new goog.dom.NodeIterator(parent);
        goog.iter.forEach(iterator, function(node) {
            iterator.node = FontTool.presentationalTagToSpan(node);
        });
    }
    test("tag converting : u -> span[style='text-decoration=underline']", function() {
        p.innerHTML = "<u>un<u style='font-weight:bold'>derli</u>ne</u><b>bold</b>";
        presentationalTagToChildSpan(p);
        htmlEqual(p.innerHTML, "<span style='text-decoration: underline; '>un<span style='font-weight: bold; text-decoration: underline; '>derli</span>ne</span><span style='font-weight:bold'>bold</span>");
    });

    test("tag converting : complex", function() {
        p.innerHTML = "<u>un<u style='font-weight:bold'>derli</u>ne</u><b>bold</b><em>emphasis</em><strong>strong</strong><i>italic</i>";
        presentationalTagToChildSpan(p);
        htmlEqual(p.innerHTML, "<span style='text-decoration: underline; '>un<span style='font-weight: bold; text-decoration: underline; '>derli</span>ne</span>" +
                                "<span style='font-weight:bold'>bold</span><span style='font-style:italic'>emphasis</span>" +
                                "<span style='font-weight:bold'>strong</span><span style='font-style:italic'>italic</span>");
    });

    test("tag converting : font[size,face,color] 태그 변환", function() {
        p.innerHTML = '<font color="#0000ff" face="궁서" size="3">font</font>';
        presentationalTagToChildSpan(p);
        htmlEqual(p.innerHTML, '<span style="color:blue; font-family:궁서; font-size:medium;">font</span>');
    });

    test("font태그의 size 값을 style의 font-size로 변환한다.", function() {
        var converter = FontTool.TAGS_FOR_PRESENTATION.FONT;
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

    test("addStylesForFont span[font-weight] + font", function() {
        node = ax.span("Hello");
        assi.setContentElement(node);
        node.style.cssText = "font-weight: bold";
        FontTool.addStylesForFont(node, { font: "10px gulim", color: "red" });
        !$tx.opera && styleEqual(FontTool.getFontStyles(node), { font: "bold 10px gulim", color: "red" });
        $tx.opera && styleEqual(FontTool.getFontStyles(node), {
            fontFamily: '"gulim"',
            fontStyle: "normal",
            fontSize: "10px",
            fontWeight: "bold",
            color: "red"
        });
    });

    test("addStylesForFont span[font] + font-weight", function() {
        var node = ax.span("Hello");
        assi.setContentElement(node);
        node.style.cssText = "font: 10px/1em dotum";
        FontTool.addStylesForFont(node, { fontWeight: "bold" });
        deepEqual(FontTool.getFontStyles(node), { font: "10px/1em dotum" });
    });

    test("addStylesForFont span[font-style] + font-weight", function() {
        var node = ax.span("Hello");
        assi.setContentElement(node);
        node.style.cssText = "font-style: italic";
        FontTool.addStylesForFont(node, { fontWeight: "bold" });
        styleEqual(FontTool.getFontStyles(node), { fontWeight: "bold", fontStyle: "italic" });
    });
})();

(function() {
    var FontTool = Trex.I.FontTool;

    module("getFontStyles");

    test("getFontStyles로 폰트 관련 style만 가져온다.", function() {
        var element = document.createElement("div");
        $tom.applyStyles(element, {
            fontWeight: "bold",
            color: "red",
            margin: "10px"
        });
        var result = FontTool.getFontStyles(element);
        var expected = $tx.opera ? { fontWeight: "700", color: "#ff0000" } : { fontWeight: "bold", color: "red" };
        deepEqual(result, expected);
    });

    test("font, font-weight 순서로 지정되면 font, font-weight가 return", function() {
        var div = document.createElement("div");
        div.style.cssText = "font: 10px gulim; font-weight: bold; ";
        deepEqual(FontTool.getFontStyles(div), { font: "bold 10px gulim" });
    });

    test("font-weight, font 순서로 지정되면 font만 return", function() {
        var div = document.createElement("div");
        div.style.cssText = "font-weight: bold; font: 10px gulim,dotum; ";
        regexpEqual(FontTool.getFontStyles(div).font, "10px gulim,\\s*dotum");
    });

    test("font tag에서 font style을 가져오기", function() {
        var font = ax.font({face: "굴림체"})
        var style = FontTool.getFontStyles(font);
        equal(style.fontFamily, "굴림체");
    });
})();

(function() {
    var FONT_STYLE = { style: { color: "red", backgroundColor: "blue" }};
    var FontTool = Trex.I.FontTool;
    module("fontTool - inheritFontStyle");

    test("div[style] > p", function() {
        var div = ax.div(FONT_STYLE, ax.p("Hello"), "World");
        var world = div.childNodes[1];
        world.splitText(2);
        assi.setContentElement(div);
        var p = assi.byTag("p");
        FontTool.inheritFontStyle(p, ["color", "backgroundColor"]);
        htmlEqual(assi.getBodyHTML(), '<div style="background-color: blue;"><p><span style="color:red;">Hello</span></p><span style="color:red;">World</span></div>');
    });

    test("div[style=font,font-weight] > div[style=font] : 상위 div의 font,font-weight는 하위로 전파", function() {
        assi.setContent('<div style="font:16px gulim; font-weight:bold">Hello<div style="font: 20px dotum">World</div></div>');
        var div = assi.byTag("div");
        FontTool.inheritFontStyle(div, ["font", "fontWeight"]);
        equal(assi.byTag("div", 0).style.cssText, "");  //firefox getStyle하면 bold가 나온다.
        equal(assi.getStyle(assi.byTag("span", 0), "fontWeight"), "bold");
        equal(assi.getStyle(assi.byTag("div", 1), "fontWeight"), "normal");
    });

    test("div[style=font] > div[style=font-weight] : 하위 div의 font-weight는 유지된다.", function() {
        assi.setContent('<div style="font:16px gulim; ">Hello<div style="font-weight:bold">World</div></div>');
        var div = assi.byTag("div");
        FontTool.inheritFontStyle(div, ["font", "fontWeight"]);
        equal(assi.getStyle(assi.byTag("span", 0), "fontWeight"), "normal");
        equal(assi.getStyle(assi.byTag("div", 1), "fontWeight"), "bold");
    });

    test("normalizeText", function() {
        var p = ax.p("HelloWorld!!");
        var textNode = p.firstChild;
        textNode.splitText(10);
        textNode.splitText(5);
        equal(p.childNodes.length, 3);
        FontTool.normalizeText(p);
        equal(p.childNodes.length, 1);
        equal(p.innerHTML, "HelloWorld!!");
    });

    test("span[바탕] > font[굴림] arrangeMarkup", function() {
        assi.setContent('<p><span style="font-family: 바탕"><font face="굴림체">동물보호법</font></span></p>');
        var p = assi.byTag("p")
        FontTool.flattenChildren(p);
        htmlEqual(assi.getBodyHTML(), '<p><span style="font-family: 굴림체">동물보호법</span></p>')
    });
})();