function runFontFamilyTest(range, fontfamily, expectedContent, expectedSelectedText) {
    range.select();
    assi.assertToolExecution("fontfamily", fontfamily, function() {
        assertFontFamilyResult(expectedContent, expectedSelectedText);
    });
}

function assertFontFamilyResult(expectedContent, expectedSelectedText) {
    htmlEqual(assi.getContent(), expectedContent);
    var selectedText = goog.dom.Range.createFromWindow(assi.win).getText();
    regexpEqual(selectedText, expectedSelectedText);
}


module("fontfamily");

test("fontfamily queryCurrentStyle : Gulim", function() {
    var p = ax.p(ax.span({id: "span", style: { fontFamily: "Gulim" }}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 2);
    range.select();
    equal(assi.getTool('fontfamily').queryCurrentStyle(range), "굴림");
});

!($tx.os_win && $tx.safari) && test("collapsed에서 fontfamily를 Gulim으로 변경하기", function() {
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 2);
    runFontFamilyTest(range, "Gulim", '<p><span id="span">He</span><span style="font-family: Gulim; "></span><span>llo World</span></p>', "");
});

test("selected에서 fontfamily를 Gulim에서 Batang으로 변경하기", function() {
    var p = ax.p(ax.span({id: "span", style: { fontFamily: "Gulim" }}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    runFontFamilyTest(range, "Batang", '<p><span id="span" style="font-family:Gulim">He</span><span style="font-family:Batang">l</span><span style="font-family:Gulim">lo World</span></p>', "l");
});

test("웹폰트는 IE에서만 적용된다. (but myeditor.daum.net 등에서만 제대로 보여진다)", function() {
    expect(3);
    var p = ax.p(ax.span({id: "span"}, "Hello World"));
    assi.setContentElement(p);
    var range = new goog.dom.Range.createFromNodes(assi.$('span').firstChild, 2, assi.$('span').firstChild, 3);
    range.select();
    var fontfamily = "MD_diary";
    
    assi.executeTool("fontfamily", fontfamily);
    QUnit.stop(1000);
    setTimeout(function() {
        setTimeout(function() {
            var expectedContent = '<p><span id="span">He</span><span style="font-family: MD_diary; ">l</span><span>lo World</span></p>';
            var expectedSelectedText = 'l';
            assertFontFamilyResult(expectedContent, expectedSelectedText);
            var usedWebfonts = assi.canvas.getPanel('html').getUsedWebfont();
            if ($tx.msie) {
                equal(usedWebfonts.length, 1);
            } else {
                equal(usedWebfonts.length, 0);
            }
            QUnit.start();
        }, 20);
    }, 0);
});

test("Empty text를 선택한 상태에서 queryCurrentStyle", function() {
    assi.setContent('<p style="font-family:Gungsuh"></p>');
    var p = assi.byTag("p");
    var textNode = assi.doc.createTextNode("");
    p.appendChild(textNode);
    var range = assi.selectForNodes(textNode, 0, textNode, 0);
    var state = assi.getTool("fontfamily").queryCurrentStyle(range);
    equal(state, "궁서");
});

