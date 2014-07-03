($tx.msie && $tx.msie_ver <= 8) &&
(function() {
    module("paste html");

    test('regression : IE paste causes invalid markup', function() {
        var assi = new Assistant();
        assi.setContent('<p><span>text</span></p>');
        var span = assi.byTag('span');
        var textNode = span.childNodes[0];
        assi.selectForNodes(textNode, 4, textNode, 4);

        var range = assi.createGoogRange();

        range.getBrowserRangeObject().pasteHTML('<span>inserted</span><p>text</p>');

        htmlEqual(assi.getContent(), '<p><span>text</span><span>inserted</span></p><p>text</p>');
    });

    test('move caret after end element', function() {
        var assi = new Assistant();
        assi.setContent('<p><span>text</span> </p>');
        var p = assi.byTag('p');
        assi.selectForNodes(p, 2, p, 2);

        var range = assi.createGoogRange();
        range.getBrowserRangeObject().pasteHTML('<span>inserted</span><p>text</p>');

        htmlEqual(assi.getContent(), '<p><span>text</span> <span>inserted</span></p><p>text</p>');
    });

})();

var autolinkConverter;
module('paste autolink', {
    "setup": function() {
        autolinkConverter = new Trex.Paste.AutolinkConverter();
    },
    "teardown": function() {
        autolinkConverter = null;
    }
});

test('문자열 url 패턴매칭 공백체크', function() {
    equal(autolinkConverter.isContainSpace('http://www.daum.net으로'), false);
    equal(autolinkConverter.isContainSpace('http://www.daum.net으로 이동하면 된다.'), true);
});

test('문자열 url패턴 체크', function() {
    [
        // false
        ['192.168.0', false, '숫자로만 구성된 host형태는 url로 판단하지 않는다'],
        ['192.168.0/path', false, '숫자로만 구성된 host형태는 url로 판단하지 않는다'],
        ['192.168.0/path?query=test', false, '숫자로만 구성된 host형태는 url로 판단하지 않는다'],
        ['192.168.0.333', false, 'ip형식 체크'],
        ['1.1.0.20', false, 'ip형식 체크'],
        ['daum.net', false, '1차 도메인만 넣는것은 url로 인식하지 않음'],
        ['http://www.daum.net으로', false, 'url뒤 의미에 맞지않게 붙여쓴 한글은 url로 판단하지 않는다'],
        ['http://www.daum.net 으로', false, '문자열 중간에 공백이 들어가면 안된다'],

        // true
        ['192.168.0.100', true, 'ip형식을 가진다면 숫자 형식이라도 링크로 인식한다. 단, IP의 패턴을 체크함'],
        ['10.10.192.220', true, 'ip형식 체크'],
        ['10.10.192.220/path', true, 'ip형식 체크'],
        ['10.10.192.220/path?query=test', true, 'ip형식 체크'],
        ['10.10.192.220/path?query=test#hash/hashPath-dash', true, 'ip형식 체크'],
        ['10.10.192.220:8080/path?query=test#hash/hashPath-dash', true, 'ip형식 체크'],
        ['www.daum.net', true, '프로토콜이 없어도 정상으로 판단한다'],
        ['www.daum.net/path', true, '프로토콜이 없이 path'],
        ['http://www.daum.net/으로', true, '의미없는 한글이 붙지만 path에 포함하는 것으로 인식한다'],
        ['http://www.daum.net/path으로', true, '의미없는 한글이 붙지만 path에 포함하는 것으로 인식한다'],
        ['http://www.daum.net/path?query=a으로', true, '의미없는 한글이 붙지만 query에 포함하는 것으로 인식한다'],
        ['http://www.daum.net ', true, '문자열 끝 공백체크'],
        [' http://www.daum.net', true, '문자열 앞 공백체크'],
        ['http://www.daum.net', true, '도메인만 존재'],
        ['http://www.daum.net/', true, '도메인 + /'],
        ['http://www.daum.net:8080', true, '포트추가'],
        ['http://www.daum.net:8080/', true, '포트추가 + /'],
        ['http://daum.net', true, '도메인에 www 제거'],
        ['http://daum.net:8080', true, '도메인에 www 제거 + 포트추가'],
        ['http://daum.net/', true, '도메인에 www 제거 + /'],
        ['http://daum.net:8080/', true, '도메인에 www 제거 + 포트추가 + /'],
        ['http://daum.net:8080/path', true, '포트 추가 + path'],
        ['http://daum.net/#', true, 'hash태그 #1'],
        ['http://daum.net/#head-link2', true, 'hash태그 #2'],
        ['http://daum.net/#한글', true, 'hash태그 한글'],
        ['http://daum.net/#%ED%95%9C%EA%B8%80', true, 'hash태그 인코딩 한글'],
        ['http://editor.daum.net/test?query=한글', true, '한글 query'],
        ['http://editor.daum.net/test?query=%ED%95%9C%EA%B8%80', true, '인코딩된 한글 query'],
        ['https://daum.net/', true, 'https 확인'],
        ['https://daum.net/gogo', true, 'path 경로 확인'],
        ['https://maart-1.net', true, '- 문자 도메인'],
        ['https://maart-1.daum.net/gogo', true, '- 문자 도메인 + path'],
        ['http://bbs.music.daum.net', true, '3차 도메인'],
        ['http://bbs.music.daum.net/gaia/do/list', true, '3차 도메인 + path'],
        ['http://bbs.music.daum.net/gaia/do/list?bbsId=test&dummy=%EB%8B%A4%EC%9D%8C%EC%97%90%EB%94%94%ED%84%B0', true, '3차 도메인 + path + query']

    ].each(function(item){
        var desc = item[2] ? item[2] + ' : ' + item[0] : item[0];
        equal(autolinkConverter.isValidUrl(item[0]), item[1], desc);
    });
});

test('HTML anchor 패턴 체크', function(){
    [
        ['<a href="#">링크</a>', true, '정상링크'],
        ['<a href="#" style="display:none;">링크</a>', true, '속성 있을 때'],
        ['<a style="display:none;" class="test-link" href="#" >링크</a>', true, '속성 순서 뒤바꿈'],
        ['<A style="display:none;" class="test-link" href="#" >링크</A>', true, '대문자 태그'],
        ['<A style="display:none;" class="test-link" href="#" >링크</A> ', true, '태그 뒤 공백'],
        [' <A style="display:none;" class="test-link" href="#" >링크</A>', true, '태그 앞 공백']

    ].each(function(item){
        var desc = item[2] ? item[2] + ' : ' + item[0] : item[0];
        equal(autolinkConverter.isAnchorTag(item[0]), item[1], desc);
    });
});

test('HTML anchor 패턴 파싱 체크', function(){
    [
        ['<a href="#">링크</a>', '링크', '정상링크'],
        ['<a href="http://www.daum.net">www.daum.net</a>', 'www.daum.net', 'href 속성이 아닌 text 기반으로 파싱'],
        ['<a href="#">링크</a>', '링크', '정상링크']

    ].each(function(item){
        var desc = item[2] ? item[2] + ' : ' + item[0] : item[0];
        equal(autolinkConverter.parseAnchor(item[0]), item[1], desc);
    });
});


var paster,
    pasteProcessor;

function getTextContent(node) {
    return node.textContent || node.innerText;
}
module('paste basic', {
    'setup': function() {
        paster = Editor.getPaster();
        pasteProcessor = Editor.getPasteProcessor();
        assi.setContent('');

    },
    'teardown': function() {
        paster = null;
        pasteProcessor = null;
    }
});

test('tree 나누기', function(){
    assi.setContent('<p><span>12<strong>34</strong>56</span></p>');

    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    var result = pasteProcessor.divideTree(assi.$$("p")[0]);
    assi.delayedAssertion(function() {
        pasteProcessor.removeDummyText();

        ok(result.previousNode, '이전 노드객체가 존재해야 한다');
        equal(result.previousNode.nodeType, 1, '이전 노드객체가 존재해야 한다');
        equal(result.previousNode.tagName, 'P', 'p태그 컨테이너');
        equal(getTextContent(result.previousNode), '123', '이전 노드객체가 존재해야 한다');
        equal(assi.$$('strong', result.previousNode)[0].innerHTML, '3', '노드 구조를 유지해야 한다');
        equal(assi.$$('strong', result.previousNode)[0].parentNode.tagName, 'SPAN', '노드 구조를 유지해야 한다');
        equal(assi.$$('strong', result.previousNode)[0].parentNode.parentNode.tagName, 'P', '노드 구조를 유지해야 한다');

        ok(result.nextNode, '다음 노드객체가 존재해야 한다');
        equal(result.nextNode.nodeType, 1, '다음 노드객체가 존재해야 한다');
        equal(result.nextNode.tagName, 'P', 'p태그 컨테이너');
        equal(getTextContent(result.nextNode), '456', '이전 노드객체가 존재해야 한다');
        equal(assi.$$('strong', result.nextNode)[0].innerHTML, '4', '노드 구조를 유지해야 한다');
        equal(assi.$$('strong', result.nextNode)[0].parentNode.tagName, 'SPAN', '노드 구조를 유지해야 한다');
        equal(assi.$$('strong', result.nextNode)[0].parentNode.parentNode.tagName, 'P', '노드 구조를 유지해야 한다');
    });
});

test('붙여넣기 기본 테스트', function(){
    assi.setContent('<p><span>12<strong>34</strong>56</span></p>');

    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    var range = Editor.canvas.getProcessor().createGoogRange();
    ok(range, '분리 후 range객체를 확인 가능해야 한다');
    var focusNode = range.getFocusNode();
    ok(focusNode, '분리 후 range.focusNode 객체를 확인 가능해야 한다');

    paster.pasteHTML('<p>test1</p>');
    paster.pasteHTML('<p>test2</p>');
    paster.pasteHTML('<p>test3</p>');

    assi.delayedAssertion(function() {
        equal(assi.$$('p').length, 5, '3번의 p태그를 추가했으므로 나뉘어진 태그와 함께 총 5개가 존재해야 함.');
        equal(assi.$$('p')[1].innerHTML, 'test1', '2번째 p태그의 내용은 test1이다');
        equal(assi.$$('p')[2].innerHTML, 'test2', '3번째 p태그의 내용은 test2이다');
        equal(assi.$$('p')[3].innerHTML, 'test3', '4번째 p태그의 내용은 test3이다');
    });
});


test('붙여넣기 후 range는 붙여넣은 데이터의 가장 마지막에 위치해야 한다', function(){
    assi.setContent('<p>111222</p>');

    var targetParagraphText = assi.$$("p")[0].childNodes[0];
    assi.selectForNodes(targetParagraphText, 3, targetParagraphText, 3);

    paster.pasteHTML('<p>aaa</p><p>bbb</p>');
    paster.pasteHTML('<p>ccc</p>');

    assi.delayedAssertion(function(){
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>111</p><p>aaa</p><p>bbb</p><p>ccc</p><p>222</p>', '결과 html 확인');

        var range = assi.createGoogRange();
        equal(range.isCollapsed(), true, 'range isCollapsed 여부');
    });

});

test('p태그 중간에 p태그 여럿을 붙여넣기', function(){
    assi.setContent('<p>111</p><p>222</p><p>333</p>');

    var targetParagraphText = assi.$$("p")[1].childNodes[0];
    assi.selectForNodes(targetParagraphText, 1, targetParagraphText, 1);

    paster.pasteHTML('<p>aaa</p><p>bbb</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>111</p><p>2</p><p>aaa</p><p>bbb</p><p>22</p><p>333</p>', '결과 html 확인');

        var range = assi.createGoogRange();
        equal(range.isCollapsed(), true, 'range isCollapsed 여부');
    });
});

test('p태그 중간에 text 붙여넣기', function(){
    assi.setContent('<p>111</p><p>222</p><p>333</p>');

    var targetParagraphText = assi.$$("p")[1].childNodes[0];
    assi.selectForNodes(targetParagraphText, 1, targetParagraphText, 1);

    paster.pasteHTML('aaa');

    assi.delayedAssertion(function() {

        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>111</p><p>2aaa22</p><p>333</p>', '결과 html 확인');

        var range = assi.createGoogRange();
        equal(range.isCollapsed(), true, 'range isCollapsed 여부');
    });
});

test('body 하위 text에 중간에 텍스트 붙여넣기', function(){
    assi.setContent('111<br>222<br>333<span>marker</span>');

    var marker = assi.$$("span")[0];
    var targetText = marker.previousSibling;
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('aaa');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '111<br>222<br>3aaa33<span>marker</span>', '결과 html 확인');

        var range = assi.createGoogRange();
        equal(range.isCollapsed(), true, 'range isCollapsed 여부');
    });

});


test('body 하위 text에 중간에 p태그 붙여넣기', function(){
    assi.setContent('111<br>222<br>333<span>marker</span>');

    var marker = assi.$$("span")[0];
    var targetText = marker.previousSibling;
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>aaa</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '111<br>222<br>3<p>aaa</p>33<span>marker</span>', '결과 html 확인');

        var range = assi.createGoogRange();
        equal(range.isCollapsed(), true, 'range isCollapsed 여부');
    });

});

test('table 내부에 p태그를 나누기 - text', function() {
    assi.setContent('<p>abc</p><table><tbody><tr><td><p>1<strong>23</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('!!');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><table><tbody><tr><td><p>1<strong>2!!3</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>', '결과 html 확인');
    });
});

test('table 내부에 p태그를 나누기 - text&html', function() {
    assi.setContent('<p>abc</p><table><tbody><tr><td><p>1<strong>23</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><table><tbody><tr><td><p>1<strong>2</strong></p><p>!!</p><p><strong>3</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>', '결과 html 확인');
    });
});

test('table 내부에 p태그를 나누기 - 다중 text&html', function() {
    assi.setContent('<p>abc</p><table><tbody><tr><td><p>1<strong>23</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>@@<p>##</p><div>$$</div>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><table><tbody><tr><td><p>1<strong>2</strong></p><p>!!</p><p>@@</p><p>##</p><div>$$</div><p><strong>3</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>', '결과 html 확인');
    });
});

test('table 내부에 p태그가 없는 상태를 나누기', function() {
    assi.setContent('<p>abc</p><table><tbody><tr><td>1<strong>23</strong></td><td><p>456</p></td></tr></tbody></table><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><table><tbody><tr><td>1<strong>2</strong><p>!!</p><strong>3</strong></td><td><p>456</p></td></tr></tbody></table><p>def</p>', '결과 html 확인');

        // TODO: 나뉘어지는 태그의 상위 컨테이너가 P태그가 아니라면 P태그로 감싸주도록 하자
//        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><table><tbody><tr><td><p>1<strong>2</strong></p></p><p>!!</p><p><strong>3</strong></p></td><td><p>456</p></td></tr></tbody></table><p>def</p>', '결과 html 확인');
    });
});

test('li 내부에 p태그를 나누기', function() {
    assi.setContent('<p>abc</p><ul><li><p>1<strong>23</strong></p><p>456</p></li></ul><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><ul><li><p>1<strong>2</strong></p><p>!!</p><p><strong>3</strong></p><p>456</p></li></ul><p>def</p>', '결과 html 확인');
    });
});

test('li 내부에 p태그가 없는 상태를 나누기', function() {
    assi.setContent('<p>abc</p><ul><li>1<strong>23</strong><p>456</p></li></ul><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><ul><li>1<strong>2</strong><p>!!</p><strong>3</strong><p>456</p></li></ul><p>def</p>', '결과 html 확인');
    });
});


test('li 내부에 p태그를 나누기 - 다중', function() {
    assi.setContent('<p>abc</p><ul><li><p>1<strong>23</strong></p><p>456</p></li></ul><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>@@<p>##</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><ul><li><p>1<strong>2</strong></p><p>!!</p><p>@@</p><p>##</p><p><strong>3</strong></p><p>456</p></li></ul><p>def</p>', '결과 html 확인');
    });
});

test('li 내부에 p태그가 없는 상태를 나누기 - 다중 #1', function() {
    assi.setContent('<p>abc</p><ul><li>1<strong>23</strong><p>456</p></li></ul><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>@@<p>##</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><ul><li>1<strong>2</strong><p>!!</p><p>@@</p><p>##</p><strong>3</strong><p>456</p></li></ul><p>def</p>', '결과 html 확인');
    });
});


test('li 내부에 p태그가 없는 상태를 나누기 - 다중 #2 (pasteHTML를 2연속)', function() {
    assi.setContent('<p>abc</p><ul><li>1<strong>23</strong><p>456</p></li></ul><p>def</p>');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>');
    paster.pasteHTML('@@<p>##</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>abc</p><ul><li>1<strong>2</strong><p>!!</p><p>@@</p><p>##</p><strong>3</strong><p>456</p></li></ul><p>def</p>', '결과 html 확인');
    });
});

test('p태그 없는 노드에서 붙여넣기', function() {


    assi.setContent('asd<strong>1234</strong>fghj');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>@@<p>##</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), 'asd<strong>1</strong><p>!!</p><p>@@</p><p>##</p><strong>234</strong>fghj', '결과 html 확인');

    });
});


test('p태그 없는 노드에서 붙여넣기', function() {
    assi.setContent('asd<strong>1234</strong>fghj');
    var targetText = assi.$$("strong")[0].childNodes[0];
    assi.selectForNodes(targetText, 1, targetText, 1);

    paster.pasteHTML('<p>!!</p>@@<p>##</p>');

    assi.delayedAssertion(function() {
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), 'asd<strong>1</strong><p>!!</p><p>@@</p><p>##</p><strong>234</strong>fghj', '결과 html 확인');
    });
});

test('붙여넣기 데이터 중 마지막 요소가 br인경우', function() {
    assi.setContent('<p>content</p>');
    assi.focusOnTop();

    paster.pasteHTML('<p>test1</p><br>');
    paster.pasteHTML('<p>test2</p><br>');

    assi.delayedAssertion(function() {
        // TODO: body > br 구조에 대한 처리는 향후에 차차 개선하기로 한다. 현재는 붙여넣는 구조 그대로를 유지하도록 함.
        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>test1</p><br><p>test2</p><br><p>content</p>', '결과 html 확인');
    });
});

// invalid markup
//test('invalid markup #1', function() {
//    assi.setContent('<p>123</p><p>4<strong>56</strong></p><p>789</p>');
//    var targetText = assi.$$("strong")[0].childNodes[0];
//    assi.selectForNodes(targetText, 1, targetText, 1);
//
//    paster.pasteHTML('<span><p>!!</span></p>');
//
//    assi.delayedAssertion(function() {
//        equal(assi.getContent().toLowerCase().replace(/[\r\n]/g, ''), '<p>123</p><p>4<strong>5</strong></p><p>!!</p><p><strong>6</strong></p><p>789</p>', '결과 html 확인');
//    });
//});

// body
// li > table
// blockquote > table
// li > blockquote
// h1 > p
// p > h1
//