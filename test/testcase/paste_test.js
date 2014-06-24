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