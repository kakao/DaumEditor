$tx.webkit && (function() {

    module("webkit processor");

    test("ol > li > table > p > ul > li > div > #text 에서 현재 위치와 가까운 li 찾기 ", function() {
        var ol = ax.ol(ax.li(ax.table(ax.p(ax.ul(ax.li(ax.div("Hello")))))));
        assi.setContent(assi.getHTML(ol));
        var div = assi.byTag("div");

        assi.selectForNodes(div.firstChild, 0, div.firstChild, 0);
        var currentNode = assi.processor.getNode();
        equal(currentNode, div, "현재 캐럿이 위치한 노드는 div");

        var foundNode = assi.processor.findAncestorListItem(div);
        var innerLi = assi.byTag("li", 1);
        equal(foundNode, innerLi, "td 내의 li를 찾아야 한다.");
    });

    test("li > div > #text 중 #text 끝에서 enter 입력시 새로운li 생성", function() {
        var div = ax.div("Hello");
        var ol = ax.ol(ax.li(div));
        assi.setContentElement(ol);
        assi.selectForNodes(div.firstChild, 5, div.firstChild, 5);

        assi.pressEnter();
        equal(assi.getBodyHTML(), '<ol><li><div>Hello</div></li><li>' + Trex.__WORD_JOINER + '<br></li></ol>');
    });

    test("li > p > #text #text중간에서 enter key", function() {
        var p = ax.p("Hello");
        var ol = ax.ol(ax.li(p));
        assi.setContentElement(ol);
        assi.selectForNodes(p.firstChild, 1, p.firstChild, 1);

        assi.pressEnter();
        equal(assi.getBodyHTML(), '<ol><li><p>H</p></li><li><p>' + Trex.__WORD_JOINER + Trex.__WORD_JOINER + 'ello</p></li></ol>');
    });
})();
