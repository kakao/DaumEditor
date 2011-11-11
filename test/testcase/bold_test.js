function assertBoldExecution(expectedContent, expectedSelectedText, opt_fn) {
    assi.assertToolExecution("bold", null, function() {
        htmlEqual(assi.getContent(), expectedContent);
        var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
        regexpEqual(selectedText, expectedSelectedText);
        opt_fn && opt_fn();
    });
}

!($tx.os_win && $tx.safari) && (function() {
    module("bold collapsed");

    test("collapsed 상태에서 TextNode를 bold하기", function() {
        assi.setContent("<p>Hello</p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);
        assertBoldExecution('<p>He<span style="font-weight: bold; "></span>llo</p>', "");
    });

    test("collapsed 상태이고 span에 포함된 TextNode에서 bold하기", function() {
        assi.setContent('<p><span style="font-style: italic; ">Hello</span></p>');
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 2, p.firstChild.firstChild, 2);

        var expectedContent = '<p><span style="font-style: italic; ">He</span><span style="font-style: italic; font-weight: bold; "></span><span style="font-style: italic; ">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태이고, bold된 글자에서 bold를 하면 unbold로 된다.", function() {
        assi.setContent('<p><span style="font-weight: bold; ">Hello</span></p>');
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 2, p.firstChild.firstChild, 2);

        var expectedContent = '<p><span style="font-weight: bold; ">He</span><span></span><span style="font-weight: bold; ">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 2depth span[style]에서 bold", function() {
        assi.setContent('<p><span style="text-decoration: underline; ">Hello<span style="font-size: 12px; ">World</span></span></p>');
        var p = assi.doc.body.firstChild;
        var world = p.firstChild.childNodes[1].firstChild;
        assi.selectForNodes(world, 1, world, 1);

        var expectedContent = '<p><span style="text-decoration: underline; ">Hello</span><span style="text-decoration: underline; font-size: 12px; ">W</span><span style="text-decoration: underline; font-size: 12px; font-weight: bold"></span><span style="text-decoration: underline; font-size: 12px; ">orld</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 B,U가 포함된 P에서 bold하기", function() {
        assi.setContent('<p><b>He<u id="u">llo</u></b></p>');
        assi.selectForNodes(assi.$("u").firstChild, 1, assi.$("u").firstChild, 1);
        var expectedContent = '<p><span style="font-weight:bold">He</span>' +
            '<span style="text-decoration:underline; font-weight:bold">l</span>' +
            '<span style="text-decoration:underline"></span>' +
            '<span style="text-decoration:underline; font-weight:bold">lo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 스타일이 적용된 dummy가 있는 span내에서  bold", function() {
        var span = ax.span({style: {fontSize: "20px", color: "#ff0000"}}, assi.processor.newDummy());
        var p = ax.p(span);
        assi.setContentElement(p);
        assi.selectForNodes(span.firstChild, 0, span.firstChild, 0);

        var expectedContent = '<p><span style="font-size:20px; color:#ff0000; font-weight:bold;"></span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 스타일이 적용된 공백있는 span 내에서 bold", function() {
        assi.setContent('<p><span style="font-size:20px; color:#ff0000;">&nbsp;</span></p>');
        var span = assi.byTag("span");
        assi.selectForNodes(span.firstChild, 0, span.firstChild, 0);

        var expectedContent = '<p><span style="font-size:20px; color:#ff0000; font-weight:bold;"></span><span style="font-size:20px; color:#ff0000;">&nbsp;</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("style이 적용된 p에서 bold하기", function() {
        assi.setContent("<p id='p' style='font-weight:bold'>Hello</p>");
        assi.selectForNodes(assi.$('p').firstChild, 2, assi.$('p').firstChild, 2);
        var expectedContent = '<p id="p"><span style="font-weight:bold">He</span><span></span><span style="font-weight:bold">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("style이 적용된 div > p에서 bold하기", function() {
        var div = ax.div({style : {fontWeight: "bold"}}, ax.p("Hello", ax.span({style: {fontStyle: "italic"}}, "World")));
        assi.setContentElement(div);
        var p = assi.byTag('p');
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);
        var expectedContent = '<div><p><span style="font-weight:bold">He</span><span></span><span style="font-weight:bold">llo</span><span style="font-weight:bold;font-style:italic;">World</span></p></div>';
        assertBoldExecution(expectedContent, "");
    });
})();

(function() {
    module("bold selected");

    // He~ll~o -> He<span style="font-weight: bold">ll</span>
    test("TextNode 중 일부분Select해서 bold하기", function() {
        assi.setContent("<p>Hello</p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 4);
        var expectedContent = '<p>He<span style="font-weight: bold; ">ll</span>o</p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("span > blockquote 인 경우", function() {
        assi.setContent("<span>Hello<blockquote>World</blockquote>");
        assi.selectNodeContents(assi.doc.body);
        var expectedContent = "<p><span style='font-weight: bold'>Hello</span>" + ($tx.msie ? " " : "") + "<blockquote><span style='font-weight: bold;'>World</span></blockquote></p>";
        assertBoldExecution(expectedContent, "Hello\\s*World");
    });

    test("blockquote 안에 있는 닫히지 않은 span", function() {
        assi.setContent("<blockquote><span>Hello</blockquote>World");
        assi.fix();
        assi.selectNodeContents(assi.doc.body);
        var expectedContent = "<blockquote><span style='font-weight: bold'>Hello</span></blockquote><p><span style='font-weight: bold;'>World</span></p>";
        assertBoldExecution(expectedContent, "Hello\\s*World");
    });

    test("span 안의 일부를 Select해서 bold하기", function() {
        assi.setContent('<p><span id="s" style="font-style: italic; ">Hello</span></p>');
        var span = assi.$('s');
        assi.selectForNodes(span.firstChild, 2, span.firstChild, 4);
        var expectedContent = '<p><span id="s" style="font-style: italic; ">He</span><span style="font-style: italic; font-weight: bold; ">ll</span><span style="font-style: italic; ">o</span></p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("font: bold 14px dotum", function() {
        var content = '<p><A style="font: normal normal bold 14px/normal dotum" href="about:blank"><SPAN>Hello</SPAN></A></p>';
        assi.setContent(content);
        var span = assi.byTag('span');
        assi.selectForNodes(span.firstChild, 1, span.firstChild, 2);
        var affectedNode = ax.div(ax.span("H", {style: {font: "bold 14px dotum"}}), ax.span("e", {style: {font: "14px dotum"}}), ax.span("llo", {style: {font: "bold 14px dotum"}}));
        var affectedHTML = affectedNode.innerHTML;
        var expectedContent = '<p><a href="about:blank">' + affectedHTML + '</a></p>';
        assertBoldExecution(expectedContent, "e");
    });


    test("unbold하기", function() {
        assi.setContent("<p><span style='font-weight:bold;'>Hello</span></p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 0, p.firstChild.firstChild, 5);
        var expectedContent = '<p>Hello</p>';
        assertBoldExecution(expectedContent, "Hello");
    });

    test("2개의 span에 걸쳐 selection하고 bold", function() {
        assi.setContent("<p><span>He</span><span>llo</span></p>");
        var span1 = assi.doc.body.childNodes[0].childNodes[0];
        var span2 = assi.doc.body.childNodes[0].childNodes[1];
        assi.selectForNodes(span1.firstChild, 1, span2.firstChild, 1);
        var expectedContent = '<p><span>H</span><span style="font-weight: bold; ">e</span><span style="font-weight: bold; ">l</span><span>lo</span></p>';
        assertBoldExecution(expectedContent, "el");
    });

    // TODO 테스트 케이스에 추가하기
    // <span>He</span><a href="target">ll</a><span>o</span>
    // <span>He<a href="target">ll</a>o</span>
    // <span>He<a href="target"><img src="img"></a>llo</span>
    // <span>He<a href="target"><span>l</span>l</a>o</span>

    test("a tag의 안의 일부 Text를 bold", function() {
        assi.setContent('<p><a>Hello</a></p>');
        var p = assi.doc.body.firstChild;
        var a = p.firstChild;
        assi.selectForNodes(a.firstChild, 2, a.firstChild, 4);
        var expectedContent = '<p><a>He<span style="font-weight: bold; ">ll</span>o</a></p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("a tag의 안의 일부 Text를 unbold", function() {
        assi.setContent('<p><a style="font-weight:bold">Hello</a></p>');
        var p = assi.doc.body.firstChild;
        var a = p.firstChild;
        assi.selectForNodes(a.firstChild, 2, a.firstChild, 4);
        var expectedContent = '<p><a><span style="font-weight:bold;">He</span>ll<span style="font-weight:bold;">o</span></a></p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("a와 span 걸쳐서 select하고 bold", function() {
        assi.setContent('<p><a>Hello</a><span>World</span></p>');
        var p = assi.doc.body.firstChild;
        var a = p.firstChild;
        var span = p.childNodes[1];
        assi.selectForNodes(a.firstChild, 2, span.firstChild, 2);
        var expectedContent = '<p><a>He<span style="font-weight: bold; ">llo</span></a><span style="font-weight: bold; ">Wo</span><span>rld</span></p>';
        assertBoldExecution(expectedContent, "lloWo");
    });

    test("두 개의 %paragraph(p,div)를 걸쳐서 select하고 bold", function() {
        assi.setContent('<p><span>Hello</span></p><div>World</div>');
        var p1 = assi.doc.body.childNodes[0];
        var p2 = assi.doc.body.childNodes[1];
        assi.selectForNodes(p1.firstChild.firstChild, 2, p2.firstChild, 2);
        var expectedContent = '<p><span>He</span><span style="font-weight: bold; ">llo</span></p><div><span style="font-weight: bold; ">Wo</span>rld</div>';
        assertBoldExecution(expectedContent, "llo\\s*Wo");
    });

    test("P로 감싸여지지 않은 텍스트 노드에 대한 selected bold 처리", function() {
        assi.setContent("Hello");
        var body = assi.doc.body;
        assi.selectForNodes(body.firstChild, 2, body.firstChild, 4);
        var expectedContent = '<p>He<span style="font-weight: bold; ">ll</span>o</p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("P로 감쎠여지지 않은 span에 대한 selected bold 처리", function() {
        var span = ax.span("Hello");
        assi.setContentElement(span);
        assi.selectForNodes(span.firstChild, 2, span.firstChild, 4);
        var expectedContent = '<p><span>He</span><span style="font-weight: bold; ">ll</span><span>o</span></p>';
        assertBoldExecution(expectedContent, "ll");
    });

    test("flatten되지 않은 두 개의 P,DIV를 선택해서 bold", function() {
        assi.setContent('<p><span id="first">Hello<span>World</span></span></p><div><span>Hello<span id="second">World</span></span></div>');
        assi.selectForNodes(assi.$("first").firstChild, 2, assi.$("second").firstChild, 3);
        var expectedContent = '<p><span id="first">He</span><span style="font-weight:bold">llo</span><span style="font-weight:bold">World</span></p><div><span style="font-weight:bold">Hello</span><span id="second" style="font-weight:bold">Wor</span><span>ld</span></div>';
        assertBoldExecution(expectedContent, "lloWorld\\s*HelloWor");
    });

    test("두 개의 block 중첩", function() {
        assi.setContent('<div><div><span id="1">Hello<span style="font-style: italic">W<a id="2">orl</a>d</span></span></div></div>');
        assi.selectForNodes(assi.$("1").firstChild, 1, assi.$("2").firstChild, 2);
        var expectedContent = '<div><div><span id="1">H</span><span style="font-weight:bold">ello</span><span style="font-style:italic; font-weight:bold">W</span><a id="2"><span style="font-style:italic; font-weight:bold">or</span><span style="font-style:italic">l</span></a><span style="font-style:italic">d</span></div></div>';
        assertBoldExecution(expectedContent, "elloWor");
    });

    test("B,U가 포함된 P에서 select해서 bold하기", function() {
        assi.setContent('<p><b>He<u id="u">llo</u></b></p>');
        assi.selectForNodes(assi.$("u").firstChild, 1, assi.$("u").firstChild, 2);
        var expectedContent = '<p><span style="font-weight:bold">He</span>' +
            '<span style="text-decoration:underline; font-weight:bold">l</span>' +
            '<span style="text-decoration:underline">l</span>' +
            '<span style="text-decoration:underline; font-weight:bold">o</span></p>';
        assertBoldExecution(expectedContent, "l");
    });

    ignore_test &&
    test("strong > p", function() {
        var p = ax.p(ax.strong(ax.p({id: "p"}, "Hello")));
        //    "<p><strong><p>Hello</p></strong></p>"
        assi.setContentElement(p);
        assi.selectForNodes(assi.$('p').firstChild, 1, assi.$('p').firstChild, 2);
        var expectedContent = "";
        assertBoldExecution(expectedContent, "e");
    });

    $tx.webkit &&
    test("table의 td를 두 개 걸쳐서 select bold", function() {
        var table = assi.getHTML(ax.table({border: '1'}, ax.tr(ax.td("Hello"), " ", ax.td("World"))));
        assi.setContent(table);
        assi.selectForNodes(assi.byTag("td", 0).firstChild, 2, assi.byTag("td", 1).firstChild, 2);
        var expectedContent = assi.getHTML(ax.table({border:'1'}, ax.tr(ax.td("He", ax.span({style: {fontWeight: "bold"}}, "llo")), ($tx.webkit ? "" : " "), ax.td(ax.span({style: {fontWeight: "bold"}}, "Wo"), "rld"))));
        assertBoldExecution(expectedContent, "llo\\s*Wo");
    });

    test("comment가 포함된 본문을 bold하기 - 한메일의 답장쓰기 ", function() {
        var html = "<span>Hello<div><!-- Comment Here --></div>World</span>";
        assi.setContent(html);
        var spanChild = assi.byTag("span", 0).childNodes;
        assi.selectForNodes(spanChild[0], 2, spanChild[2], 2);
        var expectedContent = '<p><span>He</span><span style="font-weight: bold; ">llo</span>' + ($tx.msie ? '\n' : '') + '<div><!-- Comment Here --></div><span style="font-weight: bold; ">Wo</span><span>rld</span></p>';
        assertBoldExecution(expectedContent, "llo\\s*Wo");
    });

    test("style이 본문 하단에 있는 경우 bold하기", function() {
        var html = "<p>Hello</p><style></style>\r\n";
        assi.setContent(html);
        assi.selectNodeContents(assi.doc.body);
        var expectedContent;
        expectedContent = '<p><span style="font-weight: bold">Hello</span></p>' + ($tx.msie ? '<span style="font-weight: bold;"></span>' : '') + '<style></style>';
        assertBoldExecution(expectedContent, $tx.msie ? "Hello\\s*\\ufeff\\s*" : "Hello\\s*");
        expectedContent = '<p>Hello</p>' + ($tx.msie ? '<span></span>' : '') + '<style></style>';
        assertBoldExecution(expectedContent, $tx.msie ? "Hello\\s*\\ufeff\\s*" : "Hello\\s*");
    });

    test("strong > p 형태의 이상한 구조에서 bold하기", function() {
        assi.setContentElement(ax.strong(ax.p("Hello")));
        assi.selectNodeContents(assi.doc.body);
        var expectedContent = "<p>Hello</p>";
        assertBoldExecution(expectedContent, "Hello");
    });

    test("too deep span을 선택해서 bold", function() {
        var html = "Hello\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span>\n" +
            "<span><span><span><span><span><span><span><span><span><span id='last'>\n" +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "</span></span></span></span></span></span></span></span></span></span>\n" +
            "World";
        assi.setContent(html);
        var span = assi.$('last');
        assi.selectForNodes(span.firstChild, 1, span.firstChild, 9);
        var startedAt = new Date().getTime();
//        assi.assertToolExecution("bold", null, function() {
//            console.log(new Date().getTime() - startedAt);
//        });
    });
})();

(function() {
    module("bold - table cell");

    test("TD 두 개를 선택한  상태에서 bold", function() {
        var TABLE_BORDER_1 = {border: "1"};
        var BOLD_STYLE = {style: {fontWeight: "bold"}};

        var table = ax.table(TABLE_BORDER_1, ax.tr(ax.td("Hello"), ax.td("World"), ax.td("!!")));
        assi.setContent(assi.getHTML(table));
        var td = assi.byTag('td', 0);
        td.firstChild.splitText(2);
        var third_td = assi.byTag("td", 2);
        assi.selectForNodes(third_td, 0, third_td, 0);
        var expectedContent = assi.getHTML(ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.span(BOLD_STYLE, "Hello")), ax.td(ax.span(BOLD_STYLE, "World")), ax.td("!!"))));

        var originalGetTdArr = assi.processor.table.getTdArr;
        assi.processor.table.getTdArr = function() {
            return [assi.byTag("td", 0), assi.byTag("td", 1)];
        };
        assertBoldExecution(expectedContent, "", function() {
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });
})();

module("bold queryCurrentStyle");

test("b태그 안에서collapsed상태에서 queryCurrentStyle", function() {
    assi.setContent("<p><b id='b'>bold</b></p>");
    assi.selectForNodes(assi.$('b').firstChild, 2, assi.$('b').firstChild, 2);
    var range = assi.createGoogRange();
    var state = assi.getTool('bold').queryCurrentStyle(range);
    equal(state, true);
});

test("b태그 안에서selected상태에서 queryCurrentStyle", function() {
    assi.setContent("<p><b id='b'>bold</b></p>");
    assi.selectForNodes(assi.$('b').firstChild, 0, assi.$('b').firstChild, 2);
    var range = assi.createGoogRange();
    var state = assi.getTool('bold').queryCurrentStyle(range);
    equal(state, true);
});
