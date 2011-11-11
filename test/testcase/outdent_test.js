/*
    indent가 되는 element 종류는? : p, div, ... 
    <div style="margin-left: 4em"><div>Hello</div></div> 에서의 outdent라면?
    handler 생성 부분 refactoring
    
 */
(function() {
    var SAMPLE_TABLE, SAMPLE_LIST;
    var INDENT_ONCE = "2em";
    var INDENT_ONCE_STYLE = {marginLeft: INDENT_ONCE};
    var indentHelper = Trex.Tool.Indent.Helper;
    module("outdent", {
        setup: function() {
            SAMPLE_TABLE = assi.getHTML(ax.table({border: 1}, ax.tr(ax.td({id: "c1"}, ax.p({id: "p"}, "1-1")), ax.td({id: "c2"}, "1-2")), ax.tr(ax.td({id: "c3"}, "2-1"), ax.td({id: "c4"}, "2-2"))));
            SAMPLE_LIST = ax.ol({id: "ol1"},
                            ax.li({id: "item1"}, "item1"),
                            ax.ol({id: "ol2"},
                                ax.li({id: "item2"}, "item2")));
        }
    });

    test("이전 cell 찾기", function() {
        assi.setContent(SAMPLE_TABLE);
        equal(indentHelper.findPreviousCell(assi.$("c2")), assi.$("c1"));
        equal(indentHelper.findPreviousCell(assi.$("c3")), assi.$("c2"));
        equal(indentHelper.findPreviousCell(assi.$("c1")), null);
    });

    test("td 안에서 shift+tab키를 눌러서 이전 cell로 이동하기", function() {
        assi.setContent(SAMPLE_TABLE);
        var p = assi.$('p');
        assi.selectForNodes(assi.$("c2").firstChild, 0, assi.$("c2").firstChild, 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok(indentHelper.isCaretOnStartOf(p, range));
            ok(range.isCollapsed());
        });
    });

    test("첫번째 td에서 shift+tab키를 눌러서 table앞으로 빠져나가기", function() {
        assi.setContent('<p id="p">Hello</p><table border="1"><tr><td id="td">World</td></tr></table>');
        var td = assi.$('td');
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            var range = assi.createGoogRange();
            ok(range.isCollapsed());
            ok($tom.include(assi.$("p"), range.getStartNode()));
        });
    });

    test("두번째 list item에서 shift+tab키를 눌러서 outdent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item2");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol2"));

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            equal(item.parentNode, assi.$("ol1"));
        });
    });

    test("첫번째 list item에서 outdent 버튼을 눌러서 outdent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item = assi.$("item1");
        assi.selectForNodes(item.firstChild, 0, item.firstChild, 0);

        equal(item.parentNode, assi.$("ol1"));

        try {
            assi.executeTool('outdent');
        } catch(e) {
            if (e != $stop) {
                throw e;
            }
        }

        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<p>item1</p><ol id="ol1"><ol id="ol2"><li id="item2">item2</li></ol></ol>');
        });
    });

    test("문단 처음에서 shift+tab키를 눌러서 outdent하기", function() {
        var p = ax.p("Hello", {id: 'p', style: INDENT_ONCE_STYLE});
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            equal(p.style.marginLeft, "");
        });
    });

    test("margin이 0 인 문단에서 outdent : 아무 변화 없음", function() {
        var p = ax.p("Hello", {id: 'p', style: {marginLeft: "0"}});
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            equal(p.style.marginLeft, "");
        });
    });

    test("div>p+text+p 중 text에서 outdent : P로 감싼 후 margin-left", function() {
        var div = ax.div(ax.p({style : INDENT_ONCE_STYLE}, "Hello"), "World", ax.p("!!"));
        assi.setContentElement(div);
        assi.selectForNodes(div.childNodes[1], 0, div.childNodes[1], 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<div><p style="margin-left:' + INDENT_ONCE + '">Hello</p><p>World</p><p>!!</p></div>');
        });
    });

    test("li > ol > li 중 innerLI에서 outdent", function() {
        var subLi = ax.li("item1-1");
        var ol = ax.ol(ax.li("item1"), ax.li(ax.ol(subLi)));
        assi.setContentElement(ol)
        assi.selectForNodes(subLi.firstChild, 0, subLi.firstChild, 0);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<ol><li>item1</li><li>item1-1</li></ol>');
        });
    });
})();

(function() {
    var SAMPLE_TABLE, SAMPLE_LIST;
    var NO_INDENT = "";
    var INDENT_ONCE = "2em";
    var INDENT_ONCE_STYLE = {marginLeft: INDENT_ONCE};
    var DOUBLE_PARAGRAPH = "<p id='p1' style='margin-left:' + INDENT_ONCE + ''>Hello</p><p id='p2'>Welcom</p><p id='p3' style='margin-left:4em'>World<span id='s1'>!!!!</span></p>";
    module("selection outdent", {
        setup: function() {
            SAMPLE_TABLE = assi.getHTML(ax.table({border: 1},
                    ax.tr(ax.td({id: "td1"}, ax.ol(ax.li({id: "li1"}, ax.p({id: "p1"}, "item1")),ax.li({id: "li2"}, ax.p({id: "p2"}, "item2")))),
                          ax.td({id: "td2"}, "Hello")),
                    ax.tr(ax.td({id: "td3"}, ax.p({id: "p3", style: INDENT_ONCE_STYLE}, "1-1")),
                          ax.td({id: "td4"}, "1-2")),
                    ax.tr(ax.td({id: "td5"}, "2-1"),
                          ax.td({id: "td6"}, "2-2"))));
            var innerOL = ax.ol({id: "ol1"}, ax.li({id: "item1"}, "item1"), ax.ol({id: "ol2"}, ax.li({id: "item2"}, "item2")));
            SAMPLE_LIST = ax.ol({id: "ol0"}, innerOL);
        }
    });

    test("P태그 일부를 선택하고 outdent", function() {
        var p = ax.p("Hello", {id: 'p', style: INDENT_ONCE_STYLE});
        assi.setContentElement(p);
        assi.selectForNodes(assi.$("p").firstChild, 2, assi.$("p").firstChild, 3);

        assi.assertToolExecution("outdent", null, function() {
            equal(p.style.marginLeft, NO_INDENT);
        });
    });

    test("세 개의 P를 선택하고 outdent", function() {
        assi.setContent(DOUBLE_PARAGRAPH);
        assi.selectForNodes(assi.$("p1").firstChild, 2, assi.$("p3").firstChild, 3);

        assi.assertToolExecution("outdent", null, function() {
            equal(assi.$('p1').style.marginLeft, NO_INDENT);
            equal(assi.$('p2').style.marginLeft, NO_INDENT);
            equal(assi.$('p3').style.marginLeft, INDENT_ONCE);
        });
    });

    test("list item 2개를 선택하고 tab키를 눌러서 outdent하기", function() {
        assi.setContentElement(SAMPLE_LIST);
        var item1 = assi.$("item1");
        var item2 = assi.$("item2");
        assi.selectForNodes(item1.firstChild, 0, item2.firstChild, 5);

        equal(item1.parentNode, assi.$("ol1"));
        equal(item2.parentNode, assi.$("ol2"));

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            equal(item1.parentNode, assi.$("ol0"));
            equal(item2.parentNode, assi.$("ol1"));
            regexpEqual(assi.getText(), "item1\\s*item2");
        });
    });

    test("div의 일부만outdent", function() {
        assi.setContent('<div id="div" style="margin-left:' + INDENT_ONCE + '">Hey<p id="p" style="margin-left:' + INDENT_ONCE + '">Hello</p>World<p>!!</p></div>');
        var p = assi.$('p');
        var div = assi.$('div');
        assi.selectForNodes(p.firstChild, 2, div.childNodes[2], 2);

        assi.pressShiftTab();
        assi.delayedAssertion(function() {
            htmlEqual(assi.getBodyHTML(), '<div id="div" style="margin-left:' + INDENT_ONCE + '">Hey' + ($tx.msie ? ' ' : '') + '<p id="p">Hello</p><p>World</p><p>!!</p></div>');
        });
    });

    test("DIV > DIV[indented]에서  상위 div를 선택하고 outdent하면 하위의 div의 indent를 없애고 싶지만, 어려워서 그만둠", function() {
        assi.setContent('<p id="p1">Hello</p><div id="div1" style="margin-left:' + INDENT_ONCE +
                '">Head<div id="div2" style="margin-left:' + INDENT_ONCE + '">World</div>Tail</div><p id="p2">!!</p>');
        assi.selectForNodes(assi.$('p1').firstChild, 0, assi.$('p2').firstChild, 2);
        assi.assertToolExecution("outdent", null, function() {
            equal(assi.$('p1').style.marginLeft, NO_INDENT);
            equal(assi.$('p2').style.marginLeft, NO_INDENT);
            if (false) {
                // wanted result
                equal(assi.$('div1').style.marginLeft, NO_INDENT);
                equal(assi.$('div2').style.marginLeft, INDENT_ONCE);
            } else {
                // current implementation
                equal(assi.$('div1').style.marginLeft, INDENT_ONCE);
                equal(assi.$('div2').style.marginLeft, NO_INDENT);
            }

        });
    });

    test("DIV[indented] > DIV에서 하위 div를 선택하고 outdent하면 상위의 indent를 없애고 싶은데, 현재는 구현되지 않음", function() {
        assi.setContent('<div id="div1" style="margin-left:' + INDENT_ONCE + '"><div id="div2">World</div></div>');
        assi.selectForNodes(assi.$('div2').firstChild, 0, assi.$('div2').firstChild, 2);
        assi.assertToolExecution("outdent", null, function() {
            equal(assi.$('div1').style.marginLeft, INDENT_ONCE);
            equal(assi.$('div2').style.marginLeft, NO_INDENT);
        });
    });

    test("table안에서 inline만 포함하는 td 두개 선택 후에 outdent tool 실행, inline을 P로 감싸고, margin-left +2em", function() {
        assi.setContent(SAMPLE_TABLE);
        assi.selectForNodes(assi.$('p3').firstChild, 1, assi.$('td4').firstChild, 1);
        assi.assertToolExecution("outdent", null, function() {
            equal(assi.$('p3').style.marginLeft, NO_INDENT);
            equal(assi.$('td4').firstChild.tagName, "P");
            equal(assi.$('td4').firstChild.style.marginLeft, NO_INDENT);
        });
    });
})();


(function() {
    var TABLE_BORDER_1 = {border: "1"};
    module("outdent - table cell");

    test("P가 들어있는 TD를 선택한 상태에서 outdent", function() {
        var margin = {style: {marginLeft: "2em"}};
        var table = ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.p("Hello", margin)), ax.td(ax.p("World", margin)), ax.td(ax.p("!!", margin))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution("outdent", null, function() {
            htmlEqual(cell1, '<p>Hello</p>');
            htmlEqual(cell2, '<p>World</p>');
            htmlEqual(assi.byTag("td", 2), '<p style="margin-left:2em">!!</p>');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

    test("List가 들어있는 TD 두 개를 선택한 상태에서 outdent", function() {
        var table = ax.table(TABLE_BORDER_1, ax.tr(ax.td(ax.ol(ax.ol(ax.li("list1"), ax.li("list2")))), ax.td(ax.ul(ax.ul(ax.li("listItem"))), ax.td("!!"))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution("outdent", null, function() {
            htmlEqual(cell1, '<ol><li>list1</li><li>list2</li></ol>');
            htmlEqual(cell2, '<ul><li>listItem</li></ul>');
            htmlEqual(assi.byTag("td", 2), '!!');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });
})();
