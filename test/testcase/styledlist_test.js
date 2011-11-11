(function() {
    module("styledlist (collapsed insert)");

    test("비어 있는 상태에서 새로운 list 생성하기", function() {
        assi.emptyContent();
        assi.selectForNodes(assi.doc.body, 0, assi.doc.body, 0);

        assi.assertToolExecution('styledlist', 'decimal', function() {
            var li = ax.li($tx.msie ? "" : ax.br());
            var ol = ax.ol({style: {listStyleType: "decimal"}}, li);
            var expectedHTML = assi.getHTML(ol);
            htmlEqual(assi.getBodyHTML(), expectedHTML);
            var range = assi.createGoogRange();
            ok(range.isCollapsed());
            ok(Trex.Tool.Indent.Helper.isCaretOnStartOf(li, range));
        });
    });

    test("collapsed 상태에서 ul>li*2에서 ol로 변경하기, ul에서 ol로 된다.", function() {
        var ul = ax.ul(ax.li("Hello"), ax.li("World"));
        assi.setContentElement(ul);
        var li = assi.byTag("li");
        assi.selectForNodes(li.firstChild, 1, li.firstChild, 1);

        assi.assertToolExecution('styledlist', 'decimal', function() {
            htmlEqual(assi.getBodyHTML(), '<ol style="list-style-type:decimal;"><li>Hello</li></ol><ul><li>World</li></ul>');
        });
    });

    test("collapsed 상태에서 list-style-type을 square에서 disc로 변경하기, 현재 위치한 ul의 list-style-type만 변경된다.", function() {
        var ul = ax.ul({style: {listStyleType: "square"}},
                    ax.li("Hello"),
                    ax.li("World"),
                    ax.ul({style: {listStyleType: "square"}},
                       ax.li("!!")));
        assi.setContentElement(ul);
        var li = assi.byTag("li");
        assi.selectForNodes(li.firstChild, 1, li.firstChild, 1);

        assi.assertToolExecution('styledlist', 'disc', function() {
            htmlEqual(assi.getBodyHTML(), '<ul style="list-style-type:disc;"><li>Hello</li></ul><ul style="list-style-type:square;"><li>World</li><ul style="list-style-type:square;"><li>!!</li></ul></ul>');
        });
    });

    test("ul + p + ul 에서 p에서 새로운 ul 추가.", function() {
        var html = assi.getHTML(ax.ul(ax.li("item1")), ax.p("Hello"), ax.ul(ax.li("item2")));
        assi.setContent(html);
        var p = assi.byTag('p');
        assi.selectForNodes(p.firstChild, 1, p.firstChild, 1);

        assi.assertToolExecution('styledlist', 'disc', function() {
            htmlEqual(assi.getBodyHTML(), '<ul><li>item1</li></ul><ul style="list-style-type:disc;"><li>Hello</li></ul><ul><li>item2</li></ul>');
        });
    });

    test("2depth ol에서 ul로 변경", function() {
        var ol = ax.ol(ax.ol(ax.li("item")));
        assi.setContentElement(ol);
        var li = assi.byTag("li", 0);
        assi.selectForNodes(li.firstChild, 0, li.firstChild, 0);
        assi.assertToolExecution('styledlist', 'disc', function() {
            htmlEqual(assi.getBodyHTML(), '<ol><ul style="list-style-type:disc"><li>item</li></ul></ol>');
        });
    });

    module("styledlist (selection insert)");

    test("p 태그 + selected 상태에서  새로운 ordered list 생성하기", function() {
        var html = assi.getHTML(ax.p("Hello", {style: {"margin-left": "4em", "color": "#0000ff"}}), ax.p("World"), ax.p("!!"));
        assi.setContent(html);
        var p1 = assi.byTag('p', 0);
        var p2 = assi.byTag('p', 1);
        assi.selectForNodes(p1.firstChild, 0, p2.firstChild, 5);

        assi.assertToolExecution('styledlist', 'decimal', function() {
            var expected = '<ol style="list-style-type:decimal;"><li><p style="color:#0000ff">Hello</p></li><li>World</li></ol><p>!!</p>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "Hello\\s*World");
        });
    });

    test("ul > li * 3 에서 li 두 개를 선택후 ol로 변경", function() {
        var ul = ax.ul(ax.li("Hello"), ax.li("World"), ax.li("!!"));
        assi.setContentElement(ul);
        var li1 = assi.byTag('li', 0), li2 = assi.byTag('li', 1);
        assi.selectForNodes(li1.firstChild, 0, li2.firstChild, 5);

        assi.assertToolExecution('styledlist', 'decimal', function() {
            var expected = '<ol style="list-style-type:decimal;"><li>Hello</li><li>World</li></ol><ul><li>!!</li></ul>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "Hello\\s*World");
        });
    });

    test("ul[disc] > li * 3 에서 li 두 개를 선택후 ul[square]로 변경", function() {
        var ul = ax.ul({style:{listStyleType: "disc"}}, ax.li("Hello"), ax.li("World"), ax.li("!!"));
        assi.setContentElement(ul);
        var li1 = assi.byTag('li', 0), li2 = assi.byTag('li', 1);
        assi.selectForNodes(li1.firstChild, 0, li2.firstChild, 5);

        assi.assertToolExecution('styledlist', 'square', function() {
            var expected = '<ul style="list-style-type:square;"><li>Hello</li><li>World</li></ul><ul style="list-style-type:disc;"><li>!!</li></ul>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "Hello\\s*World");
        });
    });

    test("ol > li + li + ol > li + li에서 가운데 부분 li 2개를 선택 후, ul로 변경", function() {
        var html = assi.getHTML(ax.ol(ax.li("item1"), ax.li("item2"), ax.ol(ax.li("item3-1"), ax.li("item3-2"))));
        assi.setContent(html);
        var li2 = assi.byTag('li', 1);
        var li3 = assi.byTag('li', 2);
        assi.selectForNodes(li2.firstChild, 1, li3.firstChild, 1);

        assi.assertToolExecution('styledlist', 'disc', function() {
            var expected = '<ol><li>item1</li></ol><ul style="list-style-type:disc"><li>item2</li><ul style="list-style-type:disc"><li>item3-1</li></ul></ul><ol><ol><li>item3-2</li></ol></ol>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "tem2\\s*i");
        });
    });

    test("ol[decimal] > li + li + ol[decimal] > li + li에서 가운데 부분 li 2개를 선택 후, upper-alpha로 변경", function() {
        var html = assi.getHTML(ax.ol({style:{listStyleType: "decimal"}}, ax.li("item1"), ax.li("item2"), ax.ol({style:{listStyleType: "decimal"}}, ax.li("item3-1"), ax.li("item3-2"))));
        assi.setContent(html);
        var li2 = assi.byTag('li', 1);
        var li3 = assi.byTag('li', 2);
        assi.selectForNodes(li2.firstChild, 1, li3.firstChild, 1);

        assi.assertToolExecution('styledlist', 'upper-alpha', function() {
            var expected = '<ol style="list-style-type:decimal"><li>item1</li></ol><ol style="list-style-type:upper-alpha"><li>item2</li><ol style="list-style-type:upper-alpha"><li>item3-1</li></ol></ol><ol style="list-style-type:decimal"><ol style="list-style-type:decimal"><li>item3-2</li></ol></ol>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "tem2\\s*i");
        });
    });

    test("p + ol[decimal] > li에서 p와 li를 선택하고 ol[upper-alpha]로 변경", function() {
        var html = assi.getHTML(ax.p("Hello"), ax.ol({style: {listStyleType: "decimal"}}, ax.li("item1"), ax.li("item2")));
        assi.setContent(html);
        var p = assi.byTag('p', 0);
        var li1 = assi.byTag('li', 0);
        assi.selectForNodes(p.firstChild, 1, li1.firstChild, 1);

        assi.assertToolExecution('styledlist', 'upper-alpha', function() {
            var expected = '<ol style="list-style-type:upper-alpha;"><li>Hello</li><li>item1</li></ol><ol style="list-style-type:decimal;"><li>item2</li></ol>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "ello\\s*i");
        });
    });

    test("p + ol[decimal] > li에서 p와 li를 선택하고 ul[disc]로 변경", function() {
        var html = assi.getHTML(ax.p("Hello"), ax.ol({style: {listStyleType: "decimal"}}, ax.li("item1"), ax.li("item2")));
        assi.setContent(html);
        var p = assi.byTag('p', 0);
        var li1 = assi.byTag('li', 0);
        assi.selectForNodes(p.firstChild, 1, li1.firstChild, 1);

        assi.assertToolExecution('styledlist', 'disc', function() {
            var expected = '<ul style="list-style-type:disc;"><li>Hello</li><li>item1</li></ul><ol style="list-style-type:decimal;"><li>item2</li></ol>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "ello\\s*i");
        });
    });

    test("p+table+p를 선택후 ul추가", function() {
        var html = assi.getHTML(ax.p("Hello"), ax.table({border: 1}, ax.tr(ax.td("cell1"), ax.td("cell2"))), ax.p("World"));
        assi.setContent(html);
        var p1 = assi.byTag("p", 0);
        var p2 = assi.byTag("p", 1);
        assi.selectForNodes(p1.firstChild, 0, p2.firstChild, 5);
        assi.assertToolExecution('styledlist', 'disc', function() {
            var expected = assi.getHTML(
                    ax.ul({style:{listStyleType:"disc"}}, ax.li("Hello")),
                    ax.table({border:"1"}, ax.tr(ax.td(ax.ul({style:{listStyleType:"disc"}}, ax.li("cell1"))), ax.td(ax.ul({style:{listStyleType:"disc"}}, ax.li("cell2"))))),
                    ax.ul({style:{listStyleType:"disc"}}, ax.li("World")));
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "\\s*Hello\\s*cell1\\s*cell2\\s*World");
        });
    });

    test("sublist 변경시 상위list가 끊어어지지 않아야 한다.", function() {
        var ol = ax.ol(ax.li("a"), ax.ol(ax.li("a-1"), ax.li("a-2")), ax.li("b"));
        assi.setContentElement(ol);
        var li = assi.byTag("li", 2);
        assi.selectForNodes(li, 0, li, 0);
        assi.assertToolExecution("styledlist", "disc", function() {
            var expected = '<ol><li>a</li><ol><li>a-1</li></ol><ul style="list-style-type: disc; "><li>a-2</li></ul><li>b</li></ol>';
            htmlEqual(assi.getBodyHTML(), expected);
        });
    });

    test("테이블을 포함해서 ul 추가", function() {
        var html = assi.getHTML(ax.p("Hello"), ax.p(ax.table(ax.tr(ax.td("cell1"), ax.td("cell2")))), ax.p(ax.br()));
        assi.setContent(html);
        var p0 = assi.byTag("p", 0);
        var p2 = assi.byTag("p", 2);
        assi.selectForNodes(p0, 0, p2, 1);

        assi.assertToolExecution('styledlist', 'disc', function() {
            var expected = assi.getHTML(
                    ax.ul({style: {listStyleType:"disc"}}, ax.li("Hello")),
                    ax.p(ax.table(ax.tr(ax.td(ax.ul({style: {listStyleType:"disc"}}, ax.li("cell1"))), ax.td(ax.ul({style: {listStyleType:"disc"}}, ax.li("cell2")))))),
                    ax.ul({style: {listStyleType:"disc"}}, ax.li(ax.br())));
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "\\s*Hello\\s*cell1\\s*cell2\\s*");
        });
    });

    test("TD 두 개만 선택하고 ul 추가", function() {
        var html = assi.getHTML(ax.table({border: "1"}, ax.tr(ax.td("cell1"), ax.td(ax.p("cell2")))));
        assi.setContent(html);
        var td0 = assi.byTag("td", 0);
        var p = assi.byTag("p", 0);
        assi.selectForNodes(td0.firstChild, 0, p.firstChild, 5);

        assi.assertToolExecution('styledlist', 'disc', function() {
            var expected = assi.getHTML(ax.table({border:"1"}, ax.tr(ax.td(ax.ul({style:{listStyleType:"disc"}}, ax.li("cell1"))), ax.td(ax.ul({style:{listStyleType:"disc"}}, ax.li("cell2"))))));
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.getText();
            regexpEqual(selectedText, "\\s*cell1\\s*cell2\\s*");
        });
    });

    module("styledlist (cancel)");

    test("collapsed 상태에서 만들어진 중첩된 list를 취소하기", function() {
        var ul = ax.ul(ax.li('a'), ax.ol(ax.li('1'), ax.li('2')), ax.li('d') );
        assi.setContentElement(ul);

        var li1 = assi.byTag("li", 1);
        assi.selectForNodes(li1.firstChild, 1, li1.firstChild, 1);

        assi.assertToolExecution('styledlist', 'cancel', function() {
            var expected = '<ul><li>a</li><li>1</li><ol><li>2</li></ol><li>d</li></ul>';
            htmlEqual(assi.getBodyHTML(), expected);

            var range = assi.createGoogRange();
            ok(range.isCollapsed());

            var currentLocation = $tx.gecko ? range.getStartNode().innerHTML : range.getStartNode().parentNode.innerHTML;
            htmlEqual(currentLocation, "1");
        });
    });

    test("selected 상태에서 만들어진 list를 취소하기", function() {
        var ul = ax.ul(ax.li('a'), ax.li('b'), ax.li('c'), ax.li('d') );
        assi.setContentElement(ul);
        var b = assi.byTag('li', 1).firstChild;
        var c = assi.byTag('li', 2).firstChild;
        assi.selectForNodes(b, 0, c, 1);

        assi.assertToolExecution('styledlist', 'cancel', function() {
            var expected = '<ul><li>a</li></ul><p>b</p><p>c</p><ul><li>d</li></ul>';
            htmlEqual(assi.getBodyHTML(), expected);

            var selectedText = assi.createGoogRange().getText();
            regexpEqual(selectedText, "b\\s*c", "실행 후, 선택이 유지되어야 한다.");
        });
    });

    module("styledlist list item depth");

    test("li 한개의 depth", function() {
        var ul = ax.ul(ax.li("item1"), ax.li("item2"), ax.ul(ax.li("item3-1"), ax.li("item3-2")));
        assi.setContentElement(ul);

        var li = assi.byTag("li", 0);
        equal(countDepthOfList(li), 1);

        li = assi.byTag("li", 2);
        equal(countDepthOfList(li), 2);

    });

    test("ul > li > div > ul > li 에서 하위 li의 depth는 2", function() {
        var ul = ax.ul(ax.li(ax.div(ax.ul(ax.li("li")))));
        assi.setContentElement(ul);
        var li = assi.byTag("li", 1);
        equal(countDepthOfList(li), 2);
    });

    test("li를 제외한 element의 depth는 1", function() {
        var p = ax.p("Hello");
        var div = ax.div("World");
        assi.setContent(assi.getHTML(p, div));
        equal(countDepthOfList(p), 1);
        equal(countDepthOfList(div), 1);
    });

    test("li의 depth 계산하기", function() {
        var li0 = ax.li("item1");
        var li1 = ax.li("item2");
        var li2 = ax.li("item3-1");
        var li3 = ax.li("item3-2");
        var ul = ax.ul(li0, li1, ax.ul(li2, li3));
        assi.setContentElement(ul);
        var lis = [ li0, li1, li2, li3 ];
        var countedList = getNodeDepthList(lis);
        deepEqual(countedList, [{node: li0, depth: 1}, {node: li1, depth: 1}, {node: li2, depth: 2}, {node: li3, depth: 2}]);
    });

    test("ol + p + ul 의 depth 계산하기", function() {
        var ol = ax.ol(ax.li("item1"));
        var p = ax.p("paragraph");
        var ul = ax.ul(ax.li("item2"));
        assi.setContent(assi.getHTML(ol, p, ul));

        var li1 = assi.byTag("li", 0);
        var li2 = assi.byTag("li", 1);
        var countedList = getNodeDepthList([li1, p, li2]);

        deepEqual(countedList, [{node: li1, depth: 1}, {node: p, depth: 1}, {node: li2, depth: 1}]);
    });


    function getNodeDepthList(list) {
        return new Trex.Tool.StyledList.ListBuilder().getNodeDepthList(list);
    }

    function countDepthOfList(node) {
        return new Trex.Tool.StyledList.ListBuilder().countDepthOfList(node);
    }
})();