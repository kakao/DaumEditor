function assertForeColorExecution(range, color, expectedContent, expectedSelectedText) {
    range.select();
    assi.assertToolExecution("forecolor", color, function() {
        htmlEqual(assi.getContent(), expectedContent);
        var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
        regexpEqual(selectedText, expectedSelectedText);
    });
}

module("forecolor");

!($tx.os_win && $tx.safari) && test("collapsed에서 forecolor를 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 2);
    range.select();
    assertForeColorExecution(range, "#ff0000", '<p><span id="span">He</span><span style="color: #ff0000"></span><span>llo World</span></p>', "");
});

test("selected에서 forecolor를 #0000ff에서 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span", style: { color: "#0000ff" }}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    range.select();
    assertForeColorExecution(range, "#ff0000", '<p><span id="span" style="color:#0000ff">He</span><span style="color: #ff0000">l</span><span style="color: #0000ff">lo World</span></p>', "l");
});