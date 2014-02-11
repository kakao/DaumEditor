(function() {
    var INDENT_ONCE = "2em";
    var INDENT_ONCE_STYLE = {style : {marginLeft: INDENT_ONCE}};
    var SHOULD_STOP_EVENT = {
        preventDefault: function() {
            ok(true);
        },
        stopPropagation: function() {
            ok(true);
        }
    };
    var SHOULD_DEFAULT_ACTION = {
        preventDefault: function() {
            ok(false);
        },
        stopPropagation: function() {
            ok(false);
        }
    };
    module("backspace");

    test("selection이 있는 상태에서 backspace -> default action", function() {
        expect(0);
        var p = ax.p(INDENT_ONCE_STYLE, "Hello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 1);

        assi.pressBackspace(SHOULD_DEFAULT_ACTION);
    });

    test("indented block의 처음에서 backspace -> outdent", function() {
        var p = ax.p(INDENT_ONCE_STYLE, "Hello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        expect(4);
        assi.pressBackspace(SHOULD_STOP_EVENT);
        assi.delayedAssertion(function() {
            equal(p.style.marginLeft, "", "p에 outdent가 실행되어야 한다.");
            equal(p.innerHTML, "Hello", "p의 innerHTML은 변경되지 않는다.");
        });
    });

    test("list item 처음에서 backspace -> outdent", function() {
        var ol = ax.ol(ax.ol(ax.li({id: "li"}, "item1"), ax.li("item2")));
        assi.setContentElement(ol);
        var li = assi.$('li');
        assi.selectForNodes(li.firstChild, 0, li.firstChild, 0);

        expect(3);
        assi.pressBackspace(SHOULD_STOP_EVENT);
        assi.delayedAssertion(function() {
            htmlEqual(ol.innerHTML, "<li id='li'>item1</li><ol><li>item2</li></ol>", "첫번째 list item이 outdent 되었다.");
        });
    });

    test("td의 텍스트 중간에서 backspace -> default action", function() {
        expect(0);
        var table = ax.table({border: 1}, ax.tr(ax.td({id: "td"}, "Text")));
        assi.setContent(assi.getHTML(table));
        var td = assi.$('td');
        assi.selectForNodes(td.firstChild, 2, td.firstChild, 2);

        assi.pressBackspace(SHOULD_DEFAULT_ACTION);
    });

    test("indented block의 중간에서 backspace -> default action", function() {
        expect(0);
        var p = ax.p(INDENT_ONCE_STYLE, "Hello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);

        assi.pressBackspace(SHOULD_DEFAULT_ACTION);
    });

    test("no-indent block의 처음에서 backspace -> default action", function() {
        expect(0);
        var p = ax.p("Hello");
        assi.setContentElement(p);
        assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);

        assi.pressBackspace(SHOULD_DEFAULT_ACTION);
    });

    test("list item 끝에서 backspace -> default action", function() {
        expect(0);
        var ol = ax.ol(ax.ol(ax.li({id: "li"}, "item1"), ax.li("item2")));
        assi.setContentElement(ol);
        var li = assi.$('li');
        assi.selectForNodes(li.firstChild, 5, li.firstChild, 5);

        assi.pressBackspace(SHOULD_DEFAULT_ACTION);
    });

    test("list item 처음에서 backspace -> outdent", function() {
        var ol = ax.ol(ax.ol(ax.li({id: "li1"}, "item1"), ax.li({id: "li2"}, "item2")));
        assi.setContentElement(ol);
        var li2 = assi.$('li2');
        assi.selectForNodes(li2.firstChild, 0, li2.firstChild, 0);

        assi.pressBackspace(SHOULD_STOP_EVENT);
        var range = assi.createGoogRange();
        ok($tom.include(assi.$('li2'), range.getStartNode()));
    });

    $tx.msie &&
    test("IE test 1 : TextRange로 두번째 li의 맨처음으로 select할 수 없다.", function() {
        expect(0);
        var ol = ax.ol(ax.ol(ax.li({id: "li1"}, "item2")), ax.li({id: "li2"}, ax.span({id:"s"}), ax.span({id:"e"}), "item2"));
        assi.setContentElement(ol);
        var textRange = assi.doc.body.createTextRange();
        textRange.moveToElementText(assi.$('s'));
        textRange.collapse(true);
        textRange.select();
    });
    
    $tx.msie &&
    test("IE test 2 : 빈 span이 두 개 있으면 두번째 li 맨처음을 select할 수 있다.", function() {
        expect(0);
        var ol = ax.ol(ax.ol(ax.li({id: "li1"}, "item2")), ax.li({id: "li2"}, ax.span({id:"s"}), ax.span({id:"e"}), "item2"));
        assi.setContentElement(ol);
        var li2 = assi.$('li2');
        var range = goog.dom.Range.createFromNodes(assi.$("li2"), 1, assi.$("li2"), 1);
        range.select();
        $tom.remove(assi.$("s"));
        $tom.remove(assi.$("e"));
        
        range = goog.dom.Range.createFromNodes(assi.$("li2"), 0, assi.$("li2"), 0);
        range.select();
    });
})();