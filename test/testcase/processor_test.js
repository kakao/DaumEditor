module("processor_standard");

test("비어있는 상태에서 focusOnTop", function() {
    assi.canvas.getCurrentPanel().clearContent();
    assi.processor.focusOnTop();

    expect(3);
    equal(assi.getBodyHTML().toLowerCase(), $tom.EMPTY_PARAGRAPH_HTML, 'empty html에 dummy는 들어가있지 않음');

    var range = goog.dom.Range.createFromWindow(assi.win);
    ok(range, 'range가 null이면 안된다.');

    if (range) {
        ok(range.isCollapsed());
    }
});

test("이미지가 있는 상태에서 focusOnTop", function() {
    var initHtml = '<p><img src=""></p>';
    assi.setContent(initHtml);
    assi.processor.focusOnTop();

    equal(assi.getBodyHTML().toLowerCase(), initHtml);
});

test("text가 있는 상태에서 focusOnTop", function() {
    assi.setContent('<p>Hello<br></p>');
    assi.processor.focusOnTop();
    
    expect(3);
    equal(assi.getBodyHTML().toLowerCase(), '<p>hello<br></p>', 'dummy는 없음');

    range = goog.dom.Range.createFromWindow(assi.win);
    ok(range, 'range가 null이면 안된다.');

    if (range) {
        ok(range.isCollapsed());
    }
});

// TODO processor_standard_p 의 ENTER 처리에 관한 테스트
// TODO $propagate 처리 하는 브라우저의 경우 native key event를 생성해야만 테스트 가능하다.
//test("enter 입력시 새로운 &lt;p&gt; 생성", function() {
//    assi.setContent("<p>asdf</p>");
//    assi.focusOnTop();
//
//    var canvas = Editor.getCanvas();
//    canvas.fireKeys({
//        ctrlKey: false,
//        altKey: false,
//        shiftKey: false,
//        keyCode: Trex.__KEY.ENTER
//    });
//
//    equal(assi.getContent(), "<p></p><p>asdf</p>");
//});

