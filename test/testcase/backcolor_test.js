function assertBackColorExecution(color, expectedContent, expectedSelectedText) {
    assi.assertToolExecution("backcolor", color, function() {
        htmlEqual(assi.getContent(), expectedContent);
        var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
        regexpEqual(selectedText, expectedSelectedText);
    });
}

module("backcolor");

$tx.msie && test("collapsed에서 backcolor를 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 2);
    assertBackColorExecution("#ff0000", '<p><span id="span">He<span style="background-color: #ff0000"></span>llo World</span></p>', "");
});

test("selected에서 backcolor를 #0000ff에서 #ff0000로 변경하기", function() {
    var p = ax.p(ax.span({id: "span", style: { backgroundColor: "#0000ff" }}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    assertBackColorExecution("#ff0000", '<p><span id="span" style="background-color:#0000ff">He<span style="background-color: #ff0000">l</span>lo World</span></p>', "l");
});

test("selected에서 backcolor를 기본색으로 되돌리기", function() {
    var p = ax.p(ax.span({id: "span", style: { backgroundColor: "#ff0000", color: "#ffffff" }}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    assertBackColorExecution(null, '<p><span id="span" style="background-color:#ff0000; color:#ffffff">He</span>l<span style="background-color:#ff0000; color:#ffffff">lo World</span></p>', 'l');

    var buttonColor = assi.getTool("backcolor").button.elButton.style.backgroundColor;
    notEqual(buttonColor, "", "되돌리기시 버튼색이 바뀌어있으면 안된다");
});

test("selected에서 글자색도 변경되는 backColor를 실행하기", function() {
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    assi.selectForNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    assertBackColorExecution("#ff0000|#ffffff", '<p><span id="span">He<span style="background-color: #ff0000; color: #ffffff">l</span>lo World</span></p>', "l");
});

test("글상자 안에서 backColor실행시 글상자 배경색 속성은 글상자에 유지되어야 한다.", function() {
    var textBoxColor = "#dbe8fb";
    var textBoxHtml = '<div style="border: #79a5e4 1px dashed; padding: 10px; background-color: '+ textBoxColor + '" class="txc-textbox"></div>';
    assi.setContent(textBoxHtml);
    var div = assi.byTag("div");
    div.innerHTML = "Hello";
    assi.selectForNodes(div.firstChild, 0, div.firstChild, 1);
    assi.assertToolExecution("backcolor", "#ff0000", function() {
        equal(Trex.Color.getHexColor(div.style.backgroundColor).toLowerCase(), textBoxColor);
    });
});