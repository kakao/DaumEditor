/*
    indent가 되는 element 종류는? : p, div, ... 
    <div style="margin-left: 4em"><div>Hello</div></div> 에서의 outdent라면?
    handler 생성 부분 refactoring
    
 */
(function() {
    function oneSpaceIfIE() {
        return ($tx.msie ? ' ' : '');
    }
    var INDENT_ONCE = "2em";
    var SAMPLE_TABLE, SAMPLE_LIST;
    var indentHelper = Trex.Tool.Indent.Helper;
    module("indent", {
        setup: function() {
            // TODO : ax를 통해서 DOM 만드는 것 수정
            SAMPLE_TABLE = assi.getHTML(ax.table({border: 1}, ax.tr(ax.td({id: "c1"}, ax.p({id: "p"}, "1-1")), ax.td({id: "c2"}, "1-2")), ax.tr(ax.td({id: "c3"}, "2-1"), ax.td({id: "c4"}))));
            SAMPLE_LIST = ax.ol({id: "ol1"}, ax.li({id: "item1"}, "item1"), ax.ol({id: "ol2"}, ax.li({id: "item2"}, "item2")));
        }
    });

    test("다음 cell 찾기", function() {
        assi.setContent(SAMPLE_TABLE);
        equal(indentHelper.findNextCell(assi.$("c1")), assi.$("c2"));
        equal(indentHelper.findNextCell(assi.$("c2")), assi.$("c3"));
        equal(indentHelper.findNextCell(assi.$("c4")), null);
    });

    test("th와 td가 있는 테이블에서 다음 cell 찾기", function() {
        assi.setContent('<table border="1"><tr><th>cell-th</th><td>cell-td</td></tr></table>');
        equal(indentHelper.findNextCell(assi.byTag("th")), assi.byTag("td"));
        equal(indentHelper.findNextCell(assi.byTag("td")), null);
    });

    test("td 안에서 tab키를 눌러서 다음 cell로 이동하기", function() {
        assi.setContent(SAMPLE_TABLE);
        var p = assi.$('p');
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok($tom.include(assi.$("c2"), range.getStartNode()));
            ok(range.isCollapsed());
            equal(range.getStartOffset(), 0);
        });
    });

    test("비어있는 다음 cell로 이동하기", function() {
        assi.setContent(SAMPLE_TABLE);
        var td = assi.$('c3');
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok($tom.include(assi.$("c4"), range.getStartNode()));
            ok(range.isCollapsed());
            equal(range.getStartOffset(), 0);
        });
    });

    test("마지막 td에서 tab키를 눌러서 table뒤로 빠져나가기", function() {
        assi.setContent('<table border="1"><tr><td id="td">World</td></tr></table><p id="p">Hello</p>');
        var td = assi.$('td');
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok(range.isCollapsed());
            ok($tom.include(assi.$("p"), range.getStartNode()));
            equal(range.getStartOffset(), 0);
        });
    });

    ignore_test &&
    test("table > tr > td > table + #textNode + table 에서 tab키를 누르기", function() {
        var border = {border: 1};
        var table = ax.table(border, ax.tr(ax.td(ax.table(border, ax.tr(ax.td("innerTable1"))), "   ", ax.table(border, ax.tr(ax.td("innerTable2"))))));
        assi.setContent(assi.getHTML(table));

        var td = assi.byTag("td", 1);
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
           var range = assi.createGoogRange();
            ok(range.isCollapsed());
            ok($tom.include(assi.byTag("td", 2), range.getStartNode()));
        });
    });

    test("table > table 에서 tab키를 눌러 이동하기", function() {
        var border = {border: 1};
        var table1 = ax.table(border, ax.tr(ax.td({id: "in"}, "innerCell")));
        var table2 = ax.table(border, ax.tr(ax.td({id: "out-1"}, "outerCell-1", table1), ax.td({id: "out-2"}, "outerCell-2")));
        assi.setContent(assi.getHTML(table2));

        var td = assi.$("out-1");
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok(range.isCollapsed());
            var startNode = range.getStartNode();
            var container = startNode.nodeType == 3 ? startNode.parentNode : startNode;
            equal(container.id, "out-2");
        });
    });

    test("첫번째 list item에서 tab키를 눌러서 indent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item1");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol1"));

        assi.pressTab();
        assi.delayedAssertion(function() {
            equal(item.parentNode.nodeName, "OL");
            equal(item.parentNode.parentNode, assi.$("ol1"));
        });
    });

    test("첫번째 list item에서 indent 버튼을 눌러서 indent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item1");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol1"));

        assi.assertToolExecution("indent", null, function() {
            equal(item.parentNode.nodeName, "OL");
            equal(item.parentNode.parentNode, assi.$("ol1"));
        });
    });

    test("list item에서 tab키를 눌러서 indent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item2");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol2"));

        assi.pressTab();
        assi.delayedAssertion(function() {
            equal(item.parentNode.tagName, "OL");
            equal(item.parentNode.parentNode, assi.$("ol2"));
        });
    });

    test("list item에서 indent 버튼을 눌러서 indent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item2");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol2"));

        assi.assertToolExecution("indent", null, function() {
            equal(item.parentNode.tagName, "OL");
            equal(item.parentNode.parentNode, assi.$("ol2"));
        });
    });

    test("문단 처음에서 tab키를 눌러서 indent하기", function() {
        var p = ax.p("Hello", {id: 'p'});
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            equal(p.style.marginLeft, INDENT_ONCE);
        });
    });

    test("문단 중간에서 tab키를 눌러서 공백넣기", function() {
        var p = ax.p("Hello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 1, p.firstChild, 1);

        assi.pressTab();
        assi.delayedAssertion(function() {
            htmlEqual(p.innerHTML, 'H&nbsp;&nbsp;&nbsp;&nbsp;ello');
        });
    });

    test("문단 중간에서 indent 버튼을 눌러서 indent하기", function() {
        var p = ax.p("Hello", {id: 'p'});
        assi.setContentElement(p);
        assi.selectForNodes(assi.$("p").firstChild, 2, assi.$("p").firstChild, 2);

        assi.assertToolExecution("indent", null, function() {
            equal(p.style.marginLeft, INDENT_ONCE);
        });
    });

    test("P태그로 감싸여있지 않는 TextNode에서 tab키 누르기", function() {
        assi.setContent("Hello<span>World</span>");
        assi.selectForNodes(assi.doc.body.firstChild, 0, assi.doc.body.firstChild, 0);

        assi.pressTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<p style="margin-left:' + INDENT_ONCE + '">Hello<span>World</span></p>');
        });
    });

    test("P태그로 감싸여있지 않는 TextNode에서 indent", function() {
        assi.setContent("<span>Hello</span>");
        assi.selectForNodes(assi.doc.body.firstChild, 0, assi.doc.body.firstChild, 0);

        assi.assertToolExecution("indent", null, function() {
            htmlEqual(assi.getBodyHTML(), '<p style="margin-left:' + INDENT_ONCE + '"><span>Hello</span></p>');
        });
    });

    test("div>p+text+p 형태에서 가운데 TextNode 맨앞에서 indent", function() {
        var div = ax.div(ax.p("Hello"), "World", ax.p("!!"));
        assi.setContentElement(div);
        assi.selectForNodes(div.childNodes[1], 0, div.childNodes[1], 0);

        assi.assertToolExecution("indent", null, function() {
            htmlEqual(assi.getBodyHTML(), '<div><p>Hello</p><p style="margin-left:' + INDENT_ONCE + '">World</p><p>!!</p></div>');
        });
    });

    test("div>text+p+text 형태에서 첫번째 TextNode 맨앞에서 indent", function() {
        var div = ax.div("Wow", ax.p("Hello"), "World");
        assi.setContentElement(div);
        assi.selectForNodes(div.firstChild, 0, div.firstChild, 0);

        assi.assertToolExecution("indent", null, function() {
            htmlEqual(assi.getBodyHTML(), '<div><p style="margin-left:' + INDENT_ONCE + '">Wow' + oneSpaceIfIE() + '</p><p>Hello</p>World</div>');
        });
    });

    test("blockquote > text 형태에서 indent", function() {
        var blockQuote = ax.blockquote("Hello");
        assi.setContentElement(blockQuote);
        assi.selectForNodes(blockQuote.firstChild, 0, blockQuote.firstChild, 0);
        assi.assertToolExecution("indent", null, function() {
            htmlEqual(assi.getBodyHTML(), '<blockquote><p style="margin-left:' + INDENT_ONCE + '">Hello</p></blockquote>');
        });
    });
})();
(function() {
    function oneSpaceIfIE() {
        return ($tx.msie ? ' ' : '');
    }
    var indentHelper = Trex.Tool.Indent.Helper;
    var INDENT_ONCE = "2em";
    var SAMPLE_TABLE, SAMPLE_LIST;
    var DOUBLE_PARAGRAPH = "<p id='p1'>Hello</p><p id='p2'>Welcom</p><p id='p3'>World<span id='s1'>!!!!</span></p>";
    module("selection indent", {
        setup: function() {
            SAMPLE_TABLE = assi.getHTML(
                    ax.table({border: 1},
                        ax.tr(ax.td({id: "td1"}, ax.ol(ax.li({id: "li1"}, ax.p({id: "p1"}, "item1")),ax.li({id: "li2"}, ax.p({id: "p2"}, "item2")))), ax.td({id: "td2"}, "Hello")),
                        ax.tr(ax.td({id: "td3"}, ax.p({id: "p3"}, "1-1")), ax.td({id: "td4"}, "1-2")), ax.tr(ax.td({id: "td5"}, "2-1"), ax.td({id: "td6"}, "2-2"))));
            SAMPLE_LIST = SAMPLE_LIST = ax.ol({id: "ol1"}, ax.li({id: "item1"}, "item1"), ax.ol({id: "ol2"}, ax.li({id: "item2"}, "item2")));
        }
    });

    test("P태그 일부를 선택하고 indent", function() {
        var p = ax.p("Hello", {id: 'p'});
        assi.setContentElement(p);
        assi.selectForNodes(assi.$("p").firstChild, 2, assi.$("p").firstChild, 3);

        assi.assertToolExecution("indent", null, function() {
            equal(p.style.marginLeft, INDENT_ONCE);
        });
    });

    test("두 개의 P를 선택하고 indent", function() {
        assi.setContent(DOUBLE_PARAGRAPH);
        assi.selectForNodes(assi.$("p1").firstChild, 2, assi.$("p3").firstChild, 3);

        assi.assertToolExecution("indent", null, function() {
            equal(assi.$('p1').style.marginLeft, INDENT_ONCE);
            equal(assi.$('p2').style.marginLeft, INDENT_ONCE);
        });
    });

    test("list item 2개를 선택하고 tab키를 눌러서 indent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item1 = assi.$("item1");
        var item2 = assi.$("item2");
        assi.selectForNodes(item1.firstChild, 0, item2.firstChild, 5);

        equal(item1.parentNode, assi.$("ol1"));
        equal(item2.parentNode, assi.$("ol2"));

        assi.pressTab();
        assi.delayedAssertion(function() {
            equal(item1.parentNode.tagName, "OL");
            equal(item1.parentNode.parentNode, assi.$("ol1"));
            equal(item2.parentNode.tagName, "OL");
            equal(item2.parentNode.parentNode.parentNode, assi.$("ol1"));
            regexpEqual(assi.getText(), "item1\\s*item2");
        });
    });

    test("div에 포함된 P+Text를 선택해서 indent", function() {
        assi.setContent('<div id="div">Hey<p id="p">Hello</p>World<p>!!</p></div>');
        var p = assi.$('p');
        var div = assi.$('div');
        assi.selectForNodes(p.firstChild, 2, div.childNodes[2], 2);

        assi.pressTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<div id="div">Hey' + oneSpaceIfIE() + '<p id="p" style="margin-left:' +
                    INDENT_ONCE + '">Hello</p><p style="margin-left:' + INDENT_ONCE + '">World</p><p>!!</p></div>');
        });
    });

    test("DIV > DIV : 중첩된 div를 포함해서 indent", function() {
        assi.setContent('<p id="p1">Hello</p><div id="div1"><div id="div2">World</div></div><p id="p2">!!</p>');
        assi.selectForNodes(assi.$('p1').firstChild, 0, assi.$('p2').firstChild, 2);
        assi.assertToolExecution("indent", null, function() {
            equal(assi.$('p1').style.marginLeft, INDENT_ONCE);
            equal(assi.$('p2').style.marginLeft, INDENT_ONCE);
            equal(assi.$('div1').style.marginLeft, "");
            equal(assi.$('div2').style.marginLeft, INDENT_ONCE);
        });
    });

    test("table안에서 inline만 포함하는 td 두개 선택 후에 indent tool을 실행 하면, inline을 P로 감싸고 margin-left +2em", function() {
        assi.setContent(SAMPLE_TABLE);
        assi.selectForNodes(assi.$('p3').firstChild, 1, assi.$('td4').firstChild, 1);
        assi.assertToolExecution("indent", null, function() {
            equal(assi.$('p3').style.marginLeft, INDENT_ONCE);
            equal(assi.$('td4').firstChild.tagName, "P");
            equal(assi.$('td4').firstChild.style.marginLeft, INDENT_ONCE);
        });
    });

    test("table에 포함된 li의 맨앞에서 indent : List Indent 실행되어야 함", function() {
        assi.setContent(SAMPLE_TABLE);
        var p1 = assi.$('p1'), p2 = assi.$('p2');
        var li1 = assi.$('li1'), li2 = assi.$('li2');

        assi.selectForNodes(p1.firstChild, 1, p2.firstChild, 1);
        assi.pressTab();

        var range = assi.processor.createGoogRange();
        var blocks = indentHelper.findBlocksToIndentFromIterator(assi.processor, range);
        deepEqual(blocks, [li1, li2]);
    });


    test("list item과 textnode를 포함하는 div에서 textnode를 선택하여 indent : list는 ListIndent 되고 textnode는 P로 감싸여서 BlockIndent", function() {
        var html = '<div id="div"><ul><li>Hi</li></ul>Hello</div>';
        assi.setContent(html);
        var div = assi.$("div");
        var textNode = div.childNodes[1];
        assi.selectForNodes(textNode, 0, textNode, 1);

        assi.assertToolExecution("indent", null, function() {
            equal(div.style.marginLeft, "", "div에 margin이 들어가면 안된다");
            var range = assi.createGoogRange();
            var startNode = range.getStartNode();
            equal($tx.gecko ? startNode.tagName : startNode.parentNode.tagName, "P", "textnode가 p로 감싸져야 한다.");
        });
    });
})();

(function() {
    var indentHelper = Trex.Tool.Indent.Helper;

    function findBlockToIndent(node) {
        return indentHelper.findBlockToIndent(node, assi.processor);
    }
    
    module("findBlockToIndent");

    test("body > #text", function() {
        assi.setContent("Hello");
        var text = assi.doc.body.firstChild;
        var block = findBlockToIndent(text);
        equal(block.tagName, "P");
        equal(block.parentNode, assi.doc.body);
    });

    test("p > #text", function() {
        var p = ax.p("Hello");
        assi.setContentElement(p);
        equal(findBlockToIndent(p.firstChild), p);
    });

    test("ol > ol", function() {
        var innerOL = ax.ol();
        var ol = ax.ol(innerOL);
        assi.setContentElement(ol);
        equal(findBlockToIndent(innerOL), null);
    });

    test("ol > li > #text", function() {
        var li = ax.li("Hello");
        var ol = ax.ol(li);
        assi.setContentElement(ol);
        equal(findBlockToIndent(li.firstChild), li);
    });

    test("ol > li > p > #text", function() {
        var p = ax.p("Hello");
        var li = ax.li(p);
        var ol = ax.ol(li);
        assi.setContentElement(ol);
        equal(findBlockToIndent(p.firstChild), li);
    });

    test("ol > li > table > tr > td > #text", function() {
        var ol = ax.ol(ax.li(ax.table({border: "1"}, ax.tr(ax.td("Hello")))));
        assi.setContent(assi.getHTML(ol));
        var td = assi.byTag("td");
        var block = findBlockToIndent(td.firstChild);
        equal(block.tagName, "P");
        equal(block.parentNode, td);
    });

    test("ol > li > td > ol > li > p > #text", function() {
        var p = ax.p("Hello");
        var innerLI = ax.li(p);
        var ol = ax.ol(ax.li(ax.table({border: "1"}, ax.tr(ax.td(ax.ol(innerLI))))));
        assi.setContentElement(ol);
        equal(findBlockToIndent(p.firstChild), innerLI);
    });

    test("div > p + (#text) + p", function() {
        // <div><p>Hello</p>World<p>!!</p></div>
        var div = ax.div(ax.p("Hello"), "World", ax.p("!!"));
        assi.setContentElement(div);

        var text = div.childNodes[1];
        var block = findBlockToIndent(text);

        equal(block.tagName, "P");
        equal(block.parentNode, div);
    });
})();

(function() {
    var indentHelper = Trex.Tool.Indent.Helper;
    var DOUBLE_PARAGRAPH = "<p id='p1'>Hello</p><p id='p2'>Welcom</p><p id='p3'>World<span id='s1'>!!!!</span></p>";
    module("findBlocksToIndentFromRange");

    function findBlocksToIndentFromRange() {
        var range = assi.processor.createGoogRange();
        var savedCaret = range.saveUsingCarets();
        var blocks = indentHelper.findBlocksToIndentFromRange(range, assi.processor, savedCaret);
        savedCaret.restore();
        return blocks;
    }

    function assertFindBlocks(expectedBlocks) {
        deepEqual(findBlocksToIndentFromRange(), expectedBlocks);
    }

    test("비어있는 본문 + collapsed 상태", function() {
        assi.emptyContent();
        assi.selectForNodes(assi.doc.body, 0, assi.doc.body, 0);
        var blocks = findBlocksToIndentFromRange();
        equal(blocks.length, 1);
        var block = blocks[0];
        equal(block.tagName, "P");
        equal(block.parentNode, assi.doc.body);
    });

    test("p 한 개", function() {
        assi.setContent(DOUBLE_PARAGRAPH);
        assi.selectForNodes(assi.$("p1").firstChild, 2, assi.$("p1").firstChild, 3);

        assertFindBlocks([assi.$('p1')]);
    });

    test("p 세 개", function() {
        assi.setContent(DOUBLE_PARAGRAPH);
        assi.selectForNodes(assi.$("p1").firstChild, 2, assi.$("s1").firstChild, 3);

        assertFindBlocks([assi.$('p1'), assi.$('p2'), assi.$('p3')]);
    });

    test("P를 포함하는 LI", function() {
        var list = ax.ol(ax.li({id: "li1"}, ax.p({id: "p1"}, "Hello")), ax.li({id: "li2"}, ax.p({id: "p2"}, "World")));
        assi.setContentElement(list);
        assi.selectForNodes(assi.$("p1").firstChild, 2, assi.$("p2").firstChild, 3);

        assertFindBlocks([assi.$('li1'), assi.$('li2')]);
    });

    test("<p><span>Hello</span>World</p>", function() {
        var p = ax.p({id: "p"}, ax.span("Hello"), "World");
        assi.setContentElement(p);
        assi.selectForNodes(p.childNodes[0].firstChild, 1, p.childNodes[1], 2);
        assertFindBlocks([p]);
    });

    test("<span>Hello</span>World", function() {
        assi.setContent('<span>Hello</span>World');
        var body = assi.doc.body;
        assi.selectForNodes(body.childNodes[0].firstChild, 1, assi.doc.body.childNodes[1], 2);
        var blocks = findBlocksToIndentFromRange();
        deepEqual(blocks, [body.firstChild]);
        htmlEqual(body.innerHTML, '<p><span>Hello</span>World</p>');
        regexpEqual(assi.getText(), "ello\\s*Wo")
    });

    test("table에 걸쳐서 선택후 findBlocksToIndentFromRange", function() {
        assi.setContent('<p id="p1">paragraph1</p><table id="table"><tr><td id="td1">td1</td><td id="td2">td2</td></tr></table><p id="p2">paragraph2</p>');
        var table = assi.$("table"), td1 = assi.$("td1"), td2 = assi.$("td2");
        var p1 = assi.$("p1"), p2 = assi.$("p2");

        assi.selectForNodes(td1.firstChild, 1, td2.firstChild, 1);
        var blocks = findBlocksToIndentFromRange();
        deepEqual(blocks, [td1.firstChild, td2.firstChild]);

        assi.selectForNodes(p1.firstChild, 1, td2.firstChild, 1);
        assertFindBlocks([p1, td1.firstChild, td2.firstChild]);

        assi.selectForNodes(td2.firstChild, 1, p2.firstChild, 1);
        assertFindBlocks([td2.firstChild, p2]);

        assi.selectForNodes(p1.firstChild, 1, p2.firstChild, 1);
        assertFindBlocks([p1, td1.firstChild, td2.firstChild, p2]);
    });

    test("table안에 li가 있는 경우", function() {
        var table = ax.table(ax.tr(ax.td({id: "td1"}, ax.ol(ax.li({id: "li1"}, ax.p({id: "p1"}, "item1")),ax.li({id: "li2"}, ax.p({id: "p2"}, "item2")))), ax.td({id: "td2"}, "Hello")));
        assi.setContent(assi.getHTML(table));
        var p1 = assi.$('p1'), p2 = assi.$('p2');
        var li1 = assi.$('li1'), li2 = assi.$('li2');
        var td1 = assi.$('td1'), td2 = assi.$('td2');

        assi.selectForNodes(p1.firstChild, 1, p2.firstChild, 1);
        assertFindBlocks([li1, li2]);

        assi.selectForNodes(p1.firstChild, 1, td2.firstChild, 1);
        var blocks = findBlocksToIndentFromRange();
        deepEqual(blocks, [li1, li2, td2.firstChild]);
    });

    test("p + (div > ol > li * 2) + p 에서 p ~ p 까지 선택", function() {
        var html = "<p id='p1'>dddd</p><div id='div'><ol><li id='li1'>Hello</li><li id='li2'>World</li></ol></div><p id='p2'>!!</p>";
        assi.setContent(html);
        var p1 = assi.$('p1'), p2 = assi.$('p2'), div = assi.$('div');
        var li1 = assi.$('li1'), li2 = assi.$('li2');
        assi.selectForNodes(p1.firstChild, 1, p2.firstChild, 1);
        assertFindBlocks([p1, li1, li2, p2]);
    });

    test("p + (div > ol > li * 2) + p 에서 두번째 li ~ p 까지 선택", function() {
        var html = "<p id='p1'>dddd</p><div id='div'><ol><li id='li1'>Hello</li><li id='li2'>World</li></ol></div><p id='p2'>!!</p>";
        assi.setContent(html);
        var p1 = assi.$('p1'), p2 = assi.$('p2'), div = assi.$('div');
        var li1 = assi.$('li1'), li2 = assi.$('li2');
        assi.selectForNodes(li2.firstChild, 1, p2.firstChild, 1);
        assertFindBlocks([li2, p2]);
    });

    test("ul 전체 선택", function() {
        var li1 = ax.li("item1");
        var li2 = ax.li("item2");
        var ul = ax.ul(li1, li2);
        assi.setContentElement(ul);
        assi.selectForNodes(ul, 0, ul, 2);
        assertFindBlocks([li1, li2]);
    });

})();

(function() {
    var indentHelper = Trex.Tool.Indent.Helper;
    module("saveUsingCaret");
    test("saveUsingCaret 실행후 startContainer/endContainer는 실행전과 같아야 한다.", function() {
        var div = ax.div(ax.span({id: "span"}, "Hello"), ax.p({id : "p"}, "World"));
        assi.setContentElement(div);
        var p = assi.$('p');
        var span = assi.$('span');
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.processor.executeUsingCaret(function() {
        });
        var range = assi.createGoogRange();
        ok(range.isCollapsed());
        ok(indentHelper.isCaretOnStartOf(p, range));
    });
})();

(function() {
    module("getChildrenAsElement");
    // #1 주어진 node 의 child 를 추출
    // #2 node 의 child 중 text node 를 P로 wrapping
    test("Indent.Operation.getChildrenAsElement", function() {
		var p = ax.p(ax.span("Hello"), "World");
		
		var children = Trex.Tool.Indent.Operation.getChildrenAsElement(p, assi.processor);
		equal(children.length, 2);
		equal(children[0].tagName, "SPAN");
		equal(children[1].tagName, "P", "textnode should be wrapped with P");
    });
    
    test("Indent.Operation.getChildrenAsElement #2 - not linear", function() {
		var p = ax.div("hi?", ax.p(ax.p(ax.span("Hello"), "World")));
		
		var children = Trex.Tool.Indent.Operation.getChildrenAsElement(p, assi.processor);
		equal(children.length, 2);
		equal(children[0].tagName, "P", "textnode should be wrapped with P");
		equal(children[1].tagName, "P");
    });
})();

(function() {
    var indentHelper = Trex.Tool.Indent.Helper;
    module("isCaretOnStartOf");

    test("P의 텍스트 처음에 커서가 있는 경우", function() {
        var p = ax.p("\ufeffHello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 1, p.firstChild, 1);
        ok(indentHelper.isCaretOnStartOf(p, assi.createGoogRange()));
    });

    test("두개의 span 사이에 커서가 있는 경우", function() {
        var html = '<p><span id="b">Hi</span><span>Hi</span></p>';
        assi.setContent(html);
        assi.selectForNodes(assi.$('b').firstChild, 2, assi.$('b').firstChild, 2);
        ok(!indentHelper.isCaretOnStartOf(assi.byTag("p"), assi.createGoogRange()));
    });

    test("split된 텍스트의 가운데 있는 경우", function() {
        var p = ax.p("Hello");
        assi.setContentElement(p);
        p.firstChild.splitText(2);

        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);
        ok(!indentHelper.isCaretOnStartOf(p, assi.createGoogRange()));
        assi.selectForNodes(p.lastChild, 0, p.lastChild, 0);
        ok(!indentHelper.isCaretOnStartOf(p, assi.createGoogRange()));
    });

    test("P > script + #text : script 다음에 caret이 있는 경우 -> true", function() {
        var html = '<p id="p"><script>var a = 0;</script>Hello</p>';
        assi.setContent(html);
        var p = assi.$("p");
        assi.selectForNodes(p.childNodes[1], 0, p.childNodes[1], 0);
        ok(indentHelper.isCaretOnStartOf(p, assi.createGoogRange()));
    });
})();


(function() {
    var INDENT_ONCE = "2em";
    var TABLE_BORDER_1 = {border: "1"};
    module("indent - table cell");

    test("P와 text가 각각 들어있는 TD를 선택한 상태에서 indent", function() {
        var table = ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.p("Hello")), ax.td("World"), ax.td(ax.p("!!"))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution("indent", null, function() {
            htmlEqual(cell1, '<p style="margin-left:' + INDENT_ONCE + '">Hello</p>');
            htmlEqual(cell2, '<p style="margin-left:' + INDENT_ONCE + '">World</p>');
            htmlEqual(assi.byTag("td", 2), '<p>!!</p>');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

    test("List가 들어있는 TD 두 개를 선택한 상태에서 indent", function() {
        var table = ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.ol(ax.li("list1"), ax.li("list2"))), ax.td(ax.ul(ax.li("listItem"))), ax.td("!!")));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution("indent", null, function() {
            htmlEqual(cell1, '<ol><ol><li>list1</li><li>list2</li></ol></ol>');
            htmlEqual(cell2, '<ul><ul><li>listItem</li></ul></ul>');
            htmlEqual(assi.byTag("td", 2), '!!');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

})();
(function() {
    module("tab press");

    test("P로 감싸여 있지 않은 텍스트에서 tab 누르기", function() {
        assi.setContent("Hello");
        var textNode = assi.doc.body.firstChild;
        assi.selectForNodes(textNode, 1, textNode, 1);
        assi.pressTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getContent(), "<p>H&nbsp;&nbsp;&nbsp;&nbsp;ello</p>");
        });
    });
})();