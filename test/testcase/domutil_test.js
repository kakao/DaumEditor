(function() {
    var p, div;
    module("domutil", {
        setup: function() {
            p = document.createElement("p");
            div = document.createElement("div");
            document.body.appendChild(p);
            document.body.appendChild(div);
        },
        teardown: function() {
            document.body.removeChild(p);
            document.body.removeChild(div);
        }
    });

    test("TextNode를 divideText로 3조각 만들기", function() {
        var textNode = document.createTextNode("Hello");
        p.appendChild(textNode);

        var split = $tom.divideText(textNode, 4);

        equal(p.innerHTML, "Hello");
        equal(p.childNodes.length, 2);
        equal(p.firstChild, textNode);
        equal(textNode.nextSibling, split);
        equal(Sizzle.getText(textNode), "Hell");
        equal(Sizzle.getText(textNode.nextSibling), "o");

        $tom.divideText(p.firstChild, 1);

        equal(p.innerHTML, "Hello");
        equal(p.childNodes.length, 3);
        equal(Sizzle.getText(textNode), "H");
        equal(Sizzle.getText(textNode.nextSibling), "ell");
        equal(Sizzle.getText(textNode.nextSibling.nextSibling), "o");
    });

    test("IE에서는 splitText를 두 번 해도3조각이 되지 않는다.", function() {
        p.innerHTML = "Hello";
        var textNode = p.firstChild;

        textNode.splitText(1);
        p.childNodes[1].splitText(1);

        if ($tx.msie) {
            equal(p.childNodes.length, 2, "document.documentMode != 7에서는 splitText를 2번 해서, 3조각이 되었는데도 childNodes.length가 2가 나온다");
        } else {
            equal(p.childNodes.length, 3, "splitText 2번 해서, 3조각");
        }
        equal(p.innerHTML, "Hello", "그래도 innerHTML하면 Hello가 나온다");
    });

    test("addStyles로 해당 node에 없는 스타일만 추가한다", function() {
        p.innerHTML = "<span style='text-decoration:underline;font-weight:normal;'></span>";
        $tom.addStyles(p.firstChild, { textDecoration: "line-through", fontWeight: "bold", fontStyle: "italic" });
        htmlEqual(p.innerHTML, '<span style="font-weight:normal;text-decoration:underline line-through;font-style:italic"></span>');
    });

    test("applyStyles로 fontWeight:bold 추가", function() {
        p.innerHTML = "<span>Hello</span>";
        var span = p.firstChild;

        $tom.applyStyles(span, { fontWeight: "bold", fontStyle: "italic" });
        htmlEqual(p.innerHTML, '<span style="font-weight: bold; font-style: italic; ">Hello</span>');
    });

    test("applyStyles로 fontWeight:bold 없애기", function() {
        p.innerHTML = '<span style="font-weight: bold; font-style: italic; ">Hello</span>';
        var span = p.firstChild;

        $tom.applyStyles(span, { fontWeight: null });
        htmlEqual(p.innerHTML, '<span style="font-style: italic; ">Hello</span>');

        $tom.applyStyles(span, { fontStyle: "" });
        htmlEqual(p.innerHTML, '<span>Hello</span>');
    });

    test("removeStyles로 fontWeight:bold 없애기", function() {
        p.innerHTML = '<span style="font-weight: bold; ">Hello</span>';
        var span = p.firstChild;

        $tom.removeStyles(span, { fontWeight: null });
        htmlEqual(p.innerHTML, '<span>Hello</span>');
    });


    test('paragraph element 인지 판단한다.', function() {
        assertParagraph('p');
        assertParagraph('div');
        assertParagraph('li');
        assertParagraph('h5');
        assertParagraph('td');
        assertParagraph('caption');
    });

    var assertParagraph = function (tagName) {
        ok($tom.isParagraph(document.createElement(tagName)), tagName);
    }

})();

(function() {
    module("divideTree");

    test("div > p > #text + span + #text", function() {
        var p = ax.p("Hello", ax.span(), "World");
        var div = ax.div(p);
        assi.setContentElement(div);
        var marker = assi.byTag("span");
        var divided = $tom.divideTree(div, marker);
        htmlEqual(div.innerHTML, "<p>Hello</p>");
        htmlEqual(divided.innerHTML, "<p><span></span>World</p>");
        equal(divided.tagName, "DIV");
        equal(div.nextSibling, divided);
    });

    test("setStyleText", function() {
        var node = ax.span("Hello");
        assi.setContentElement(node);
        $tom.setStyleText(node, "font-weight: bold");
        equal(assi.getStyle(node, "fontWeight"), "bold");
    });
})();

(function() {
    var div, p, text;
    module("domutil - kindOf", {
        setup: function() {
            div = ax.div({className: "class1 class2", id: "id"}, "Hello");
            text = div.firstChild;
            assi.setContentElement(div);
        }
    });

    test("element", function() {
        ok($tom.kindOf(div, "div"), "div");
        ok($tom.kindOf(div, "%element"), "%element");
        ok($tom.kindOf(div, "p,div"), "p,div");
        ok($tom.kindOf(div, '.class1'), ".class1");
        ok($tom.kindOf(div, 'div.class1'), "div.class1");
        ok($tom.kindOf(div, '#id'), "#id");
        ok($tom.kindOf(div, 'div#id'), "div#id");
        ok(!$tom.kindOf(div, "%text"), "%text");
    });

    test("text", function() {
        ok($tom.kindOf(text, "%text"), "%text");
        ok(!$tom.kindOf(text, "div"), "div");
    });
})();

(function() {
    module("domutil - replace");

    test("잘못 닫힌 태그에서 replace", function() {
        assi.setContent('<P><SPAN style="FONT-SIZE: 12pt"><SPAN style="COLOR: #f50909; FONT-SIZE: large">\
<P><SPAN>\
<P><FONT id=articleBody class=b-txt2><SPAN style="FONT-SIZE: 12pt"><FONT color=#f50909 size=4><FONT id=articleBody class=b-txt2><SPAN id=goog_12018829></SPAN></P>\
<P><FONT color=#f91010 size=4><FONT color=#000000></P>\
<P align=left></FONT></FONT>&nbsp;</P>\
<P style="LINE-HEIGHT: 130%; MARGIN-TOP: 5px; MARGIN-BOTTOM: 5px; MARGIN-LEFT: 5px" align=left><FONT id=articleBody class=b-txt2>&nbsp;&nbsp;</P></FONT></FONT></FONT></SPAN>\
<P align=left><A href="http://cafe.daum.net/SOLBARAM" target=_blank><IMG border=0 src="http://fimg.daum-img.net/tenth/img/g/b/m/a/qDZn/510/90ab56-48582-d1.jpg"><FONT color=#444444> 솔바람산악회. </FONT></A></P></FONT></SPAN></P></SPAN></P></SPAN>FT');
        var font = assi.byTag('font');
        var span = ax.span({id: "new"});
        $tom.replace(font, span);
        ok(assi.getContent().indexOf("솔바람") >= 0);
    });
})();

(function() {
    module("domutil");

    test("nested span", function() {
        assi.setContent("<p><span id='s1'><span id='s2'>A</span></span></p>");
        var p = assi.byTag('p');
        var spans = $tom.descendants(p, "span");
        equal(spans.length, 1);
        equal(spans[0].id, "s1");
    });

    test("applyAttributes", function() {
        assi.setContent("<span style='font-size: 10pt'>10pt<span style='font-size: 12pt'>12pt</span></span>");

        var firstSpan = assi.byTag('span');
        var secondSpan = assi.byTag('span', 1);

        equal(firstSpan.style.fontSize, "10pt");
        equal(secondSpan.style.fontSize, "12pt");

        $tom.applyAttributes(firstSpan, {
            style: {fontSize: null}
        });

        equal(firstSpan.style.fontSize, "");
        equal(secondSpan.style.fontSize, "12pt");
    });

    test("inlines", function() {
        assi.setContent("<span style='font-size: 10pt'>10pt<span style='font-size: 11pt'><span style='font-size: 12pt'>12pt</span></span></span>");
        var spans = assi.$$('span');
        var processor = assi.processor;
        assi.selectForNodes(spans[0].firstChild, 2, spans[2], 1);
        var inlines = processor.inlines(function(type) {
            if (type === 'control') {
                return 'img,hr,table';
            }
            return '%text,span,font';
        });
        console.log(inlines);
    });
})();