(function() {
    var p, table;
    var FontTool = Trex.I.FontTool;
    module("fontTool", {
        setup: function() {
            p = ax.p();
            table = ax.table({border: "1"}, ax.tr(
                ax.td(ax.p("Hello1"), ax.p("Hello2"), ax.p("Hello3")),
                ax.td(ax.table({border: "1"}, ax.tr(ax.td("World1"), ax.td("World2"))), "World3")));
        }
    });

    test("font태그의 size 값을 style의 font-size로 변환한다.", function() {
        var converter = FontCssProperty.TAGS_FOR_PRESENTATION.FONT;
        var node = document.createElement("font");
        assertFontTagSize(7, "xx-large");
        assertFontTagSize(6, "xx-large");
        assertFontTagSize(5, "x-large");
        assertFontTagSize(3, "medium");
        assertFontTagSize(1, "x-small");
        assertFontTagSize(0, "x-small");
        assertFontTagSize("10pt", $tx.msie ? "xx-large" : "10pt");

        function assertFontTagSize(size, expected) {
            node.size = size;
            deepEqual(converter(node), { fontSize: expected });
        }
    });
})();