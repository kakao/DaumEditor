function assertForeColorExecution(color, expectedContent, expectedSelectedText) {
    assi.assertToolExecution("forecolor", color, function() {
        htmlEqual(assi.getContent(), expectedContent);
        var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
        regexpEqual(selectedText, expectedSelectedText);
    });
}

module("forecolor");

$tx.msie && test("collapsed에서 forecolor를 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 2);
    var expected = '<p><span id="span">He<span style="color: #ff0000"></span>llo World</span></p>';
    assertForeColorExecution("#ff0000", expected, "");
});

test("selected에서 forecolor를 #0000ff에서 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span", style: { color: "#0000ff" }}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    var expected = '<p><span id="span" style="color:#0000ff">He<span style="color: #ff0000">l</span>lo World</span></p>';
    assertForeColorExecution("#ff0000", expected, "l");
});

//
//test("기본색으로 변경하기", function() {
//    var p = "<p><span style='color: red'><span style='color: blue'>Hello</span></span></p>";
//    assi.setContent(p);
//    assi.selectNodeContents(assi.$$('span')[1]);
//
//    var defaultColor = assi.canvas.getStyleConfig().color;
//    var expected = "<p><span style='color: red'><span style='color: " + defaultColor + "'>Hello</span></span></p>";
//    assertForeColorExecution(null, expected, "Hello");
//});