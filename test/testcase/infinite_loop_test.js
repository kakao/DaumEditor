module("infinite loop");

$tx.msie &&
test("infinite loop", function() {
    var cont =
    '<P id="s">P</P>' +
    '<SPAN id="e">' +
        '<SPAN>' +
            '<DIV>' +
                    'DIV' +
        '</SPAN>' +
        '<SPAN>SPAN</SPAN>'
                '</DIV>' +
    '</SPAN>';

    assi.setContent(cont);
    var range = goog.dom.Range.createFromNodes(assi.$('s').firstChild, 0, assi.$('e'), 3);
    range.select();
    var loop = 0;
    goog.iter.forEach(range.__iterator__(), function(node) {
        if (loop++ >= 50) {
            throw goog.iter.StopIteration;
        }
    });
    ok(loop < 50, "IE에서 무한 루프가 발생함");
});