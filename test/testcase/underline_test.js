module("underline");

function assertUnderlineResult(expectedContent, expectedSelectedText, message) {
    assi.assertToolExecution("underline", null, function() {
        htmlEqual(assi.getContent(), expectedContent, message);
        var selectedText = assi.createGoogRange().getText();
        regexpEqual(selectedText, expectedSelectedText);
    });
}
!($tx.os_win && $tx.safari) && test("collapsed underline", function() {
    var p = ax.p("Hello");
    assi.setContentElement(p);
    assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);

    var expectedContent = "<p>He<span style='text-decoration:underline'></span>llo</p>";
    assertUnderlineResult(expectedContent, "");
});

test("selected underline 실행하기", function() {
    var span = ax.span({style: { textDecoration: "line-through" } }, "Hello");
    assi.setContentElement(ax.p(span));
    assi.selectForNodes(span.firstChild, 2, span.firstChild, 3);

    var expectedContent = "<p><span style='text-decoration:line-through'>He</span><span style='text-decoration:line-through underline'>l</span><span style='text-decoration:line-through'>lo</span></p>";
    assertUnderlineResult(expectedContent, "l");
});

test("selected underline 해제하기", function() {
    var initContent = '<p id="p"><span id="s" style="text-decoration:underline">He</span><span style="text-decoration:line-through">llo</span>Wo<span id="e" style="text-decoration:underline">rld</span></p>';
    assi.setContent(initContent);
    assi.selectForNodes(assi.$('s').firstChild, 1, assi.$('e').firstChild, 2);

    var expectedContent = '<p id="p"><span id="s" style="text-decoration:underline">H</span>e<span style="text-decoration:line-through">llo</span><span>Wo</span><span id="e">rl</span><span style="text-decoration:underline">d</span></p>';
    assertUnderlineResult(expectedContent, "elloWorl");
});

test("textDecoration:none을 가지고 있는 span에서 selected underline실행하기", function() {
    var p = ax.p(ax.span({style: {textDecoration: "none"}}, "Hello"));
    assi.setContentElement(p);
    assi.selectNodeContents(p);

    var expectedContent = '<p><span style="text-decoration:underline">Hello</span></p>';
    assertUnderlineResult(expectedContent, "Hello");
});

test("underline이 적용된 p내의 span에서 underline실행시 밑줄이 지워져야 하지만 지워지지 않는다. (IE이외의 브라우저에서 발생)", function() {
    var span = ax.span("Hello");
    assi.setContentElement(ax.p({style: {textDecoration: "underline"}}, span));
    assi.selectForNodes(span.firstChild, 2, span.firstChild, 3);
    var expected = '<p><span style="text-decoration: underline">He</span>l<span style="text-decoration: underline">lo</span></p>';
    var unexpected = '<p><span style="text-decoration: underline">He</span><span style="text-decoration: underline">l</span><span style="text-decoration: underline">lo</span></p>';
    if ($tx.msie) {
        assertUnderlineResult(expected, "l");
    } else {
        assertUnderlineResult(unexpected, "l", "브라우저가 textdecoration의 computedStyle값을 none으로 리턴해주기 때문에 선택한 부분에 세팅할 newStyle이 틀린값이 나오기 때문");
    }
});

test("IE외 브라우저에서는 text-decoration은 computedStyle로 접근해도 원하는 값이 나오지 않는다.", function() {
    var span = ax.span("Hello");
    assi.setContentElement(ax.p({style: {textDecoration: "underline", fontWeight: "bold"}}, span));
    var computedStyle;
    if ($tx.msie) {
        computedStyle = span.currentStyle;
        equal(computedStyle.textDecoration, "underline");
        equal(computedStyle.fontWeight, "700");
    } else {
        computedStyle = assi.doc.defaultView.getComputedStyle(span, null);
        equal(computedStyle.textDecoration, "none", "왜 underline이 아닌 none이 나올까요..?");
        equal(computedStyle.fontWeight, $tx.gecko ? 700 : "bold", "bold는 잘 된다.");
    }
});