(function() {

    module("moreless");

    // http://issue.daumcorp.com/browse/FTDUEDTR-1061
    test("테이블 안에 더보기 삽입", function() {
        assi.setContent(assi.getHTML(ax.table({border:1}, ax.tr(ax.td("cell")))));
        var td = assi.byTag("td");
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        assi.executeTool("moreless");
        assi.delayedAssertion(function() {
            equal(assi.getElementsBySelector("table tr td div").length, 1);
        });
    });

})();
