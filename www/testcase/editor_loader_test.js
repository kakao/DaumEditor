(function() {
    var IS_ORIGIN_LOCAL = (document.location.origin == "file://");

	module("editor loader", {
        setup: function() {
            appendScriptInHead("fixture_script", "https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js");

            EditorJSLoader.NAME = "editor_loader.js";

            EditorJSLoader.onTimeout = function() {
            };
            EditorJSLoader.readyState = "uninitialized";
            removeCookie("tx_host");
            removeCookie("tx_version");
            removeCookie("tx_service");
            removeCookie("tx_environment");
            removeCookie("tx_base_path");
        },

        teardown: function() {
            removeNode("fixture_script");
            removeNode("fixture_script1");
            removeNode("fixture_script2");
            removeNode("fixture_script3");
            removeNode("version_script");

            removeCookie("tx_host");
            removeCookie("tx_version");
            removeCookie("tx_service");
            removeCookie("tx_environment");
            removeCookie("tx_base_path");

            EditorJSLoader.readyState = "uninitialized";
        }
    });

    test("editor.js loader", function() {
        equal(typeof EditorJSLoader, "object")
    });

    test("editor loader의 base path 찾기", function() {
        ok(EditorJSLoader.getBasePath().match(/\/daumeditor\/js\/$/), "일반적인 경우");
        EditorJSLoader.NAME = "jquery.js";
        equal(EditorJSLoader.getBasePath(), "https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/", "custom 한 js의 base path 찾기");
    });

    test("editor loader를 찾기 실패했을 경우", function() {
        try {
            EditorJSLoader.NAME = "unknown.js";
            equal(EditorJSLoader.getBasePath());
            ok(false, "should error occured");
        } catch (e) {
            equal(e.toString(), "cannot find 'unknown.js' script element");
        }
    });


    test("url param의 옵션 값 읽기 : 단일 옵션", function() {
        createDummyScriptWithParam("foo=bar");
        equal(EditorJSLoader.getOption("foo"), "bar");
    });

    test("url param의 옵션 값 읽기 : 복수개의 옵션", function() {
        createDummyScriptWithParam("foo=bar&foo1=&foo2=bar2");
        equal(EditorJSLoader.getOption("foo"), "bar");
        equal(EditorJSLoader.getOption("foo1"), "", "missing value");
        equal(EditorJSLoader.getOption("foo2"), "bar2");
        equal(EditorJSLoader.getOption("undefined"), "", "존재하지 않는 옵션 접근");
    });

    test("url param의 옵션 값 읽기 : url param 없을 경우", function() {
        createDummyScriptWithParam("");
        equal(EditorJSLoader.getOption("foo"), "");
    });

    test("default option 설정 값 확인", function() {
        EditorJSLoader.NAME = "jquery.js";
        equal(EditorJSLoader.getOption("environment"), "production");
    });

    test("default option에 override된  값 확인", function() {
        createDummyScriptWithParam("environment=stage");
        equal(EditorJSLoader.getOption("environment"), "stage");
    });

    test("우선순위에 따라 option의 값을 읽어오기", function() {
        equal(EditorJSLoader.getOption("host"), "http://s1.daumcdn.net/editor/", "default option");

        createDummyScriptWithParam("host=" + encodeURIComponent("http://localhost/"));
        equal(EditorJSLoader.getOption("host"), encodeURIComponent("http://localhost/"), "user option");

        if (!IS_ORIGIN_LOCAL) { // local file doensn't support cookies
            document.cookie = "tx_host=" + encodeURIComponent("http://editor.daum.net/");
            document.cookie = "tx_environment=stage";

            equal(EditorJSLoader.getOption("host"), "http://editor.daum.net/", "cookie option");
            equal(EditorJSLoader.getOption("environment"), "stage", "동시에 여러개의 cookie option 사용 가능");
        }
    });

    !IS_ORIGIN_LOCAL && test("EditorJSLoader onload callback 제공", function() {
        expect(1);
        EditorJSLoader.ready(function(Editor) {
            ok(Editor, "load 완료시 argument로 Editor 객체 제공");
            continueTest();
        });
        document.cookie = "tx_version=7.1.11";
        EditorJSLoader.loadPackage("editor_basic.js");
        waitTest();
    });

    test("이미 load 완료된 상태에서 onload 호출 할 경우 callback을 바로 실행해준다.", function() {
        EditorJSLoader.readyState = "complete";
        expect(1);
        EditorJSLoader.ready(function(Editor) {
            ok(Editor, "load 완료시 argument로 Editor 객체 제공");
            continueTest();
        });
    });

    test("EditorJSLoader onload callback 에 잘못된 값이 들어갔을 때 실행시키지 않는다.", function() {
        EditorJSLoader.readyState = "complete";
        expect(1);
        EditorJSLoader.ready(null);
        EditorJSLoader.ready({});
        EditorJSLoader.ready(function() {
            ok(true);
        });
    });

    // TODO production : css version 이 다르면 css 갱신

    test("CSS를 개발 모드(development)로 변경", function() {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.charse = "utf-8";
        link.href = "http://s1.daumcdn.net/editor/releases/7.1.11/css/editor_basic.css";
        document.body.appendChild(link);

        EditorJSLoader.reloadDevelopmentCSS();
//        ok(link.href.endsWith("editor_basic.css"), "파일 이름 자체는 바뀌면 안된다.");
        equal(link.href.indexOf(Editor.version), -1, "개발환경이니 version 같은 거 없다.");
        equal(link.href.indexOf("s1.daumcdn.net"), -1, "개발 host로 바뀌어야 한다.");

        document.body.removeChild(link);
    });
    
    test("Editor가 호출되는 host와 path를 외부로 제공", function(){
    	ok("getBasePath" in EditorJSLoader, "기본 경로");
    	ok("getCSSBasePath" in EditorJSLoader, "css 경로");
    	ok("getPageBasePath" in EditorJSLoader, "page 경로");
    });
    
    test("동적으로 js파일을 로딩하는 함수를 외부로 제공", function(){
    	ok("asyncLoadModule" in EditorJSLoader, "호출함수 존재");
    	EditorJSLoader.asyncLoadModule({
    		url: "testcase/fixture/value1.js",
    		callback: function(){
	    		ok("testValue1" in window, "load 완료시 testValue 값이 window namespace에 존재");
	    		equals(testValue1, 100, "testValue 값은 100");
	            continueTest();
    		},
    		id: "fixture_script2"
    	});
    	waitTest();
    });
    
    test("동적 모듈로딩은 여러 파일을 한꺼번에 호출이 가능해야 한다", function(){
    	EditorJSLoader.asyncLoadModule({
    		url: "testcase/fixture/value1.js",
    		callback: function(){
	    		ok("testValue1" in window, "load 완료시 testValue 값이 window namespace에 존재");
	    		equals(testValue1, 100, "testValue 값은 100");
	            continueTest();
    		},
    		id: "fixture_script2"
    	});
    	waitTest();
    	EditorJSLoader.asyncLoadModule({
    		url: "testcase/fixture/value2.js",
    		callback: function(){
    			ok("testValue2" in window, "load 완료시 testValue 값이 window namespace에 존재");
    			equals(testValue2, 200, "testValue 값은 200");
    			continueTest();
    		},
    		id: "fixture_script3"
    	});
    	waitTest();
    });
    
    test("에디터의 버전 정규식 매칭 확인", function(){
    	
    });
    
//    TODO: 아래 테스트 동작하도록 하기
//    test("동적 모듈로딩은 동일한 url이 존재하면 중복하여 호출 하지 않는다.", function(){
//    	EditorJSLoader.asyncLoadModule({
//    		url: "testcase/fixture/value1.js",
//    		callback: function(){
//    			ok(true, "로딩완료 #1");
//	    		continueTest();
//    		},
//    		id: "fixture_script2"
//    	});
//    	waitTest();
//    	EditorJSLoader.asyncLoadModule({
//    		url: "testcase/fixture/value1.js",
//    		callback: function(){
//	    		ok(true, "로딩완료 #2");
//	            continueTest();
//    		},
//    		id: "fixture_script3"
//    	});
//    	waitTest();
//    });
    

    // test utils
    function createDummyScriptWithParam(param) {
        param = param ? "?" + param : param;
        var id = "fixture_script1",
        	url = "https://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js" + param;
        appendScriptInHead(id, url);
        
        EditorJSLoader.NAME = "jquery.min.js";
    }
    
    function appendScriptInHead(id, src){
    	var script = document.createElement("script");
        script.id = id;
        script.type = "text/javascript";
        script.src = src;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function removeNode(node) {
        if (typeof node == 'string') {
            node = document.getElementById(node);
        }
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    function removeCookie(name) {
        document.cookie = name + "=; expires=Mon, 1 Jan 1970 00:00:00 GMT;";
    }

    function waitTest() {
        QUnit.stop(2000);
    }

    function continueTest() {
        QUnit.start();
    }

})();
