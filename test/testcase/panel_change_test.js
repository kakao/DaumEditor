(function(){
    module("filtered content");
    var PASS = null;

    function generateAnchorMarkup(href) {
        return "<p><a href=\"" + href + "\">anchor</a></p>";
    }

    function assertAnchorHrefResult(href, opt_msg) {
        var p = generateAnchorMarkup(href);
        assi.setContent(p);
        var result = assi.editor.getContent();
        equal(result.toLocaleLowerCase(), p.toLocaleLowerCase(), opt_msg);
    }

    function assertAnchorHrefCustomResult(href, resultHref, opt_msg) {
        assi.setContent(generateAnchorMarkup(href));
        var result = assi.editor.getContent();
        equal(result.toLocaleLowerCase(), resultHref.toLocaleLowerCase(), opt_msg);
    }

    test("a href=\"...\"", function() {
        assertAnchorHrefResult('#hash', 'hash만 존재');
        assertAnchorHrefResult('filename.html', 'filename만 존재');
        assertAnchorHrefResult('filename.html#hash', 'filename과 hash존재');
        assertAnchorHrefResult('/filename.html#hash', 'filename & hash & 절대경로');
        assertAnchorHrefResult('http://domain.com/filename.html', 'domain도 포함');
        assertAnchorHrefResult('http://domain.com/filename.html#hash', 'domain & hash');

        if ($tx.msie_nonstd) {
            // 구형 IE에서는 상대경로에 대한 처리가 애매모호..
            PASS && assertAnchorHrefResult('../filename.html#hash', 'filename & hash & 상대경로 #1');
            PASS && assertAnchorHrefResult('../../filename.html#hash', 'filename & hash & 상대경로 #2');
            assertAnchorHrefCustomResult('./filename.html#hash', generateAnchorMarkup('filename.html#hash'), 'filename & hash & 현재경로');
        } else {
            assertAnchorHrefResult('../filename.html#hash', 'filename & hash & 상대경로 #1');
            assertAnchorHrefResult('../../filename.html#hash', 'filename & hash & 상대경로 #2');
            assertAnchorHrefResult('./filename.html#hash', 'filename & hash & 현재경로');
        }
    });



    function assertCompareText(html, text, opt_msg) {
        var expectText = $tx.msie_nonstd ? text.replace(/\n/g, '\r\n') : text;
        assi.setContent(html);
        assi.editor.getCanvas().changeMode('text');
        equal(assi.getContent(), expectText, opt_msg);
        assi.editor.getCanvas().changeMode('html');
    }

    test("html to text", function() {
        assertCompareText('<p>hello</p><p>world</p>', 'hello\nworld\n', '기본 줄바꿈');
//        assertCompareText('<p>hello<br></p><p><br></p><p>world<br></p><br>', 'hello\n\nworld\n\n', '기본 줄바꿈 + br삽입');
//        assertCompareText('<h2>Html to Text</h2><p>hello</p><p>world</p>', 'Html to Text\n\nhello\nworld\n', 'h2 타이틀');
//        assertCompareText('<h2>Html to Text #1</h2><p>hello</p><p>world</p><h2>Html to Text #2</h2><p>Daum Editor</p>', 'Html to Text #1\n\nhello\nworld\n\nHtml to Text #2\n\nDaum Editor\n', 'h2 타이틀 2개');
//        assertCompareText('<p>hello</p><p>world</p><div>Daum</div>', 'hello\nworld\nDaum\n', 'div 사용');
//        assertCompareText('<p>hello</p><p>world</p><div>Daum<div>Editor</div></div>', 'hello\nworld\nDaum\nEditor\n', 'div 중첩사용');
//        assertCompareText('<p><table><tbody><tr><td><p>hello</p><p>world</p></td><td><p>Daum</p></td></tr><tr><td><p>&nbsp;</p></td><td><p>Editor</p></td></tr></tbody></table>', '===\nhello\nworld\n---\n\nEditor\n===', '테이블');

    });
})();