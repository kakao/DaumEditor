module("underline");

function assertUnderlineResult(expectedContent, expectedSelectedText, message) {
    if (typeof expectedContent == "object") {
        expectedContent =
            $tx.msie ? expectedContent.msie :
            $tx.webkit ? expectedContent.webkit :
            $tx.gecko ? expectedContent.gecko :
            $tx.opera? expectedContent.opera : '';
    }
    assi.assertToolExecution("underline", null, function() {
        htmlEqual(assi.getContent(), expectedContent, message);
        var selectedText = assi.createGoogRange().getText();
        regexpEqual(selectedText, expectedSelectedText);
    });
}
test("collapsed underline", function() {
    var p = ax.p("Hello");
    assi.setContentElement(p);
    assi.selectForNodes(p.firstChild, 2, p.firstChild, 2);

    var expectedContent = {
        msie: '<P><U>Hello</U></P>',
        webkit: '<p>Hello</p>',
        gecko: '<p>Hello</p>',
        opera: '<P>Hello</P>'
    };
    assertUnderlineResult(expectedContent, "");
});

test("selected underline 실행하기", function() {
    var span = ax.span({style: { textDecoration: "line-through" } }, "Hello");
    assi.setContentElement(ax.p(span));
    assi.selectForNodes(span.firstChild, 2, span.firstChild, 3);

    var expectedContent = {
        msie: '<P><SPAN style="text-decoration: line-through">He<U>l</U>lo</SPAN></P>',
        webkit: '<P><SPAN style="text-decoration: line-through">He</SPAN><U><strike>l</strike></U><span style="text-decoration: line-through">lo</span></P>',
        gecko: '<P><SPAN style="text-decoration: line-through">He<U>l</U>lo</SPAN></P>',
        opera: '<P><SPAN style="text-decoration: line-through">He<U>l</U>lo</SPAN></P>'
    };
    assertUnderlineResult(expectedContent, "l");
});

test("selected underline 해제하기", function() {
    var initContent = '<p id="p"><span id="s" style="text-decoration:underline">He</span><span style="text-decoration:line-through">llo</span>Wo<span id="e" style="text-decoration:underline">rld</span></p>';
    assi.setContent(initContent);
    assi.selectForNodes(assi.$('s').firstChild, 1, assi.$('e').firstChild, 2);

    var expectedContent = {
        msie: '<P id=p><SPAN id=s style="TEXT-DECORATION: underline">He</SPAN><SPAN style="TEXT-DECORATION: line-through">llo</SPAN>Wo<SPAN id=e style="TEXT-DECORATION: underline">rld</SPAN></P>',
        webkit: '<p id="p"><span id="s" style="text-decoration: underline">H</span>elloWo<span id="e">rl</span><span style="text-decoration: underline">d</span></p>',
        gecko: '<p id="p"><span id="s" style="text-decoration: underline">H</span>elloWo<span id="e">rl</span><span style="text-decoration: underline">d</span></p>',
        opera: '<p id="p"><span id="s" style="text-decoration: underline">H</span>elloWo<span id="e">rl</span><span style="text-decoration: underline">d</span></p>'
    };
    assertUnderlineResult(expectedContent, "elloWorl");
});

test("textDecoration:none을 가지고 있는 span에서 selected underline실행하기", function() {
    var p = ax.p(ax.span({style: {textDecoration: "none"}}, "Hello"));
    assi.setContentElement(p);
    assi.selectNodeContents(p);

    var expectedContent = {
        msie: '<P><SPAN style="TEXT-DECORATION: none"><U>Hello</U></SPAN></P>',
        webkit: '<p><u>Hello</u></p>',
        gecko: '<p><u>Hello</u></p>',
        opera: '<P><SPAN style="text-decoration: none"><U>Hello</U></SPAN></P>'
    };
    assertUnderlineResult(expectedContent, "Hello");
});

test("underline이 적용된 p내의 span에서 underline실행", function() {
    var span = ax.span("Hello");
    assi.setContentElement(ax.p({style: {textDecoration: "underline"}}, span));
    assi.selectForNodes(span.firstChild, 2, span.firstChild, 3);
    var expected = {
        msie: '<P style="TEXT-DECORATION: underline"><SPAN>Hello</SPAN></P>',
        webkit: '<p><u>He</u>l<u>lo</u></p>',
        gecko: '<p><u>He</u>l<u>lo</u></p>',
        opera: '<p><u>He</u>l<u>lo</u></p>'
    };
    assertUnderlineResult(expected, "l");
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
        equal(computedStyle.fontWeight, $tx.gecko  || $tx.opera ? 700 : "bold", "bold는 잘 된다.");
    }
});