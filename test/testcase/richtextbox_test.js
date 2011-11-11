(function() {

    var textBoxTool = null;
    var textBoxMenu = null;

    module("richtextbox", {
        setup: function() {
            textBoxTool = assi.getTool("richtextbox");
            textBoxMenu = textBoxTool.menu;
            textBoxMenu.show();
            textBoxMenu.elPreview.style.border = "1px solid #ff0000";
            textBoxMenu.elPreview.style.backgroundColor = "#FFD8D8";
        }
    });

    test("테이블 안에 글상자 삽입", function() {
        assi.setContent(assi.getHTML(ax.table({border:1}, ax.tr(ax.td("cell")))));
        var td = assi.byTag("td");
        assi.selectForNodes(td.firstChild, 0, td.firstChild, 0);

        textBoxTool.handler.apply(textBoxTool);
        textBoxMenu.hide();
        
        assi.delayedAssertion(function() {
            equal(assi.getElementsBySelector("table tr td div").length, 1);
        });
    });

    test("테이블 두번째 셀 안에 글상자 삽입", function() {
        assi.setContent(assi.getHTML(ax.table({border:1}, ax.tr(ax.td("cell1", {id:"c1"}), ax.td("cell2", {id:"c2"})))));
        var td = assi.byTag("td", 1);
        assi.selectForNodes(td.firstChild, 1, td.firstChild, 2);

        textBoxTool.handler.apply(textBoxTool);
        textBoxMenu.hide();

        assi.delayedAssertion(function() {
            equal(assi.getElementsBySelector("table tr td div").length, 1);
        });
    });
})();
