function assertBoldExecution(expectedContent, expectedSelectedText, opt_fn) {
    if (typeof expectedContent == "object") {
        expectedContent =
            $tx.msie ? expectedContent.msie :
            $tx.webkit ? expectedContent.webkit :
            $tx.gecko ? expectedContent.gecko :
            $tx.opera ? expectedContent.opera : '';
    }
    assi.assertToolExecution("bold", null, function() {
        htmlEqual(assi.getContent(), expectedContent);
        var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
        regexpEqual(selectedText, expectedSelectedText);
        opt_fn && opt_fn();
    });
}

$tx.msie && (function() {
    module("bold collapsed");

    test("collapsed 상태에서 TextNode를 bold하기", function() {
        assi.setContent("<p>Hello</p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);
        var expectedContent = $tx.msie ?
        		'<P><STRONG>Hello</STRONG></P>'
        		:
    			'<p>He<span style="font-weight: bold; "></span>llo</p>';
		assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태이고 span에 포함된 TextNode에서 bold하기", function() {
        assi.setContent('<p><span style="font-style: italic; ">Hello</span></p>');
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 2, p.firstChild.firstChild, 2);

        var expectedContent = $tx.msie ?
        		'<P><SPAN style="FONT-STYLE: italic"><STRONG>Hello</STRONG></SPAN></P>'
        		:
    			'<p><span style="font-style: italic; ">He</span><span style="font-style: italic; font-weight: bold; "></span><span style="font-style: italic; ">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태이고, bold된 글자에서 bold를 하면 unbold로 된다.", function() {
        assi.setContent('<p><span style="font-weight: bold; ">Hello</span></p>');
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 2, p.firstChild.firstChild, 2);

        var expectedContent = $tx.msie ?
        		'<P><SPAN style="FONT-WEIGHT: bold">Hello</SPAN></P>'
        		:
    			'<p><span style="font-weight: bold; ">He</span><span></span><span style="font-weight: bold; ">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 2depth span[style]에서 bold", function() {
        assi.setContent('<p><span style="text-decoration: underline; ">Hello<span style="font-size: 12px; ">World</span></span></p>');
        var p = assi.doc.body.firstChild;
        var world = p.firstChild.childNodes[1].firstChild;
        assi.selectForNodes(world, 1, world, 1);

        var expectedContent = $tx.msie ?
        		'<P><SPAN style="TEXT-DECORATION: underline"><STRONG>Hello<SPAN style="FONT-SIZE: 12px">World</SPAN></STRONG></SPAN></P>'
        		:
    			'<p><span style="text-decoration: underline; ">Hello</span><span style="text-decoration: underline; font-size: 12px; ">W</span><span style="text-decoration: underline; font-size: 12px; font-weight: bold"></span><span style="text-decoration: underline; font-size: 12px; ">orld</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 B,U가 포함된 P에서 bold하기", function() {
        assi.setContent('<p><b>He<u id="u">llo</u></b></p>');
        assi.selectForNodes(assi.$("u").firstChild, 1, assi.$("u").firstChild, 1);
        var expectedContent = $tx.msie ?
    		'<P>He<U id=u>llo</U></P>'
    		:
    		'<p><span style="font-weight:bold">He</span>' +
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

        var expectedContent = $tx.msie ?
        		'<P><SPAN style="COLOR: red; FONT-SIZE: 20px"></SPAN></P>'
        		:
    			'<p><span style="font-size:20px; color:#ff0000; font-weight:bold;"></span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("collapsed 상태에서 스타일이 적용된 공백있는 span 내에서 bold", function() {
        assi.setContent('<p><span style="font-size:20px; color:#ff0000;">&nbsp;</span></p>');
        var span = assi.byTag("span");
        assi.selectForNodes(span.firstChild, 0, span.firstChild, 0);

        var expectedContent = $tx.msie ?
        		'<P><SPAN style="COLOR: red; FONT-SIZE: 20px">&nbsp;</SPAN></P>'
        		:
    			'<p><span style="font-size:20px; color:#ff0000; font-weight:bold;"></span><span style="font-size:20px; color:#ff0000;">&nbsp;</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("style이 적용된 p에서 bold하기", function() {
        assi.setContent("<p id='p' style='font-weight:bold'>Hello</p>");
        assi.selectForNodes(assi.$('p').firstChild, 2, assi.$('p').firstChild, 2);
        var expectedContent = $tx.msie ?
        		'<P id=p style="FONT-WEIGHT: bold">Hello</P>'
        		:
        		'<p id="p"><span style="font-weight:bold">He</span><span></span><span style="font-weight:bold">llo</span></p>';
        assertBoldExecution(expectedContent, "");
    });

    test("style이 적용된 div > p에서 bold하기", function() {
        var div = ax.div({style : {fontWeight: "bold"}}, ax.p("Hello", ax.span({style: {fontStyle: "italic"}}, "World")));
        assi.setContentElement(div);
        var p = assi.byTag('p');
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);
        var expectedContent = $tx.msie ?
        		'<DIV style="FONT-WEIGHT: bold">\n<P>Hello<SPAN style="FONT-STYLE: italic">World</SPAN></P></DIV>'
        		:	
    			'<div><p><span style="font-weight:bold">He</span><span></span><span style="font-weight:bold">llo</span><span style="font-weight:bold;font-style:italic;">World</span></p></div>';
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
        var expectedContent = {
            msie: '<p>He<strong>ll</strong>o</p>',
            webkit: '<p>He<b>ll</b>o</p>',
            gecko: '<p>He<b>ll</b>o</p>',
            opera: '<p>He<strong>ll</strong>o</p>'
        };
        assertBoldExecution(expectedContent, "ll");
    });

    test("span > blockquote 인 경우", function() {
        assi.setContent("<span>Hello<blockquote>World</blockquote>");
        assi.selectNodeContents(assi.doc.body);
        var expectedContent = {
            msie: '<SPAN><STRONG>Hello</STRONG>\n<BLOCKQUOTE><STRONG>World</STRONG></BLOCKQUOTE></SPAN>',
            webkit: '<SPAN><b>Hello<BLOCKQUOTE>World</BLOCKQUOTE></b></SPAN>',
            gecko: '<b><SPAN>Hello<BLOCKQUOTE>World</BLOCKQUOTE></SPAN></b>',
            opera: '<SPAN><STRONG>Hello</STRONG><BLOCKQUOTE><STRONG>World</STRONG></BLOCKQUOTE></SPAN>'
        };
        assertBoldExecution(expectedContent, "Hello\\s*World");
    });

    test("font: bold 14px dotum", function() {
        var content = '<p><A style="font: bold 14px dotum" href="about:blank"><SPAN>Hello</SPAN></A></p>';
        assi.setContent(content);
        var span = assi.byTag('span');
        assi.selectForNodes(span.firstChild, 1, span.firstChild, 2);
        var expectedContent = {
            msie: '<P><A href="about:blank" style="FONT: 14px dotum"><SPAN>Hello</SPAN></A></P>',
            webkit: '<p><a href="about:blank" style="font: bold 14px dotum"><span>H<span class="Apple-style-span" style="font-weight: normal">e</span>llo</span></a></p>',
            gecko: '<p><a href="about:blank" style="font: bold 14px dotum"><span>H<span style="font-weight: normal">e</span>llo</span></a></p>',
            opera: '<P><A href="about:blank" style="font: 14px dotum"><SPAN>Hello</SPAN></A></P>'
        };
        assertBoldExecution(expectedContent, "e");
    });

    test("strong unbold하기", function() {
        assi.setContent("<p><strong>Hello</strong></p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 0, p.firstChild.firstChild, 5);
        var expectedContent = '<p>Hello</p>';
        assertBoldExecution(expectedContent, "Hello");
    });

    test("b unbold하기", function() {
        assi.setContent("<p><b>Hello</b></p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 0, p.firstChild.firstChild, 5);
        var expectedContent = '<p>Hello</p>';
        assertBoldExecution(expectedContent, "Hello");
    });

    test("span[style='font-weight=bold'] unbold하기", function() {
        assi.setContent("<p><span style='font-weight:bold;'>Hello</span></p>");
        var p = assi.doc.body.firstChild;
        assi.selectForNodes(p.firstChild.firstChild, 0, p.firstChild.firstChild, 5);
        var expectedContent = '<p>Hello</p>';
        assertBoldExecution(expectedContent, "Hello");
    });

    test("table의 td를 두 개 걸쳐서 select bold", function() {
        var table = assi.getHTML(ax.table({border: '1'}, ax.tr(ax.td("Hello"), ax.td("World"))));
        assi.setContent(table);
        assi.selectForNodes(assi.byTag("td", 0).firstChild, 2, assi.byTag("td", 1).firstChild, 2);
        var expectedContent = {
            msie: assi.getHTML(ax.table({border:'1'}, ax.tr(ax.td("He", ax.strong("llo")), ax.td(ax.strong("Wo"), "rld")))),
            webkit: assi.getHTML(ax.table({border:'1'}, ax.tr(ax.td("He", ax.b("llo")), ax.td(ax.b("Wo"), "rld")))),
            gecko: assi.getHTML(ax.table({border:'1'}, ax.tr(ax.td("He", ax.b("llo")), ax.td(ax.b("Wo"), "rld")))),
            opera: assi.getHTML(ax.table({border:'1'}, ax.tr(ax.td("He", ax.strong("llo")), ax.td(ax.strong("Wo"), "rld"))))
        };
        assertBoldExecution(expectedContent, "llo\\s*Wo");
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
        var expectedContent = {
            msie: assi.getHTML(ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.strong("Hello")), ax.td(ax.strong("World")), ax.td("!!")))),
            webkit: assi.getHTML(ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.b("Hello")), ax.td(ax.b("World")), ax.td("!!")))),
            gecko: assi.getHTML(ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.b("Hello")), ax.td(ax.b("World")), ax.td("!!")))),
            opera: assi.getHTML(ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.strong("Hello")), ax.td(ax.strong("World")), ax.td("!!"))))
        };

        var originalGetTdArr = assi.processor.table.getTdArr;
        assi.processor.table.getTdArr = function() {
            return [assi.byTag("td", 0), assi.byTag("td", 1)];
        };
        assertBoldExecution(expectedContent, "", function() {
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });
})();

(function() {
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
})();
