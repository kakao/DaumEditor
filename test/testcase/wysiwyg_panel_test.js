(function() {

    var panel;

    module("wysiwyg panel", {
        setup: function() {
            panel = Editor.getCanvas().getPanel(Trex.Canvas.__WYSIWYG_MODE);
            this.originalWebfontLoader = panel.webfontLoader;
        },
        teardown: function() {
            panel.webfontLoader = this.originalWebfontLoader;
        }
    });

    var mockCanvas = {
        handlers: [],
        observeJob: function(e, fn) {
            this.handlers.push({ e: e, fn: fn });
        },
        fireJobs: function(e, doc) {
            for (var i = 0; i < this.handlers.length; i++) {
                var handler = this.handlers[i];
                if (handler.e === e) {
                    handler.fn(doc);
                }
            }
        },
        reserveJob: function() {
        }
    };
    var mockConfig = TrexConfig.get("canvas");
    mockConfig.wysiwygUrl = "/daumeditor/pages/daumx/wysiwyg_html.html";

    test("get content on wysiwyg panel", function() {
        var content = '<p>lorem ipsum</p>';
        panel.getDocument().body.innerHTML = content;
        equalIgnoreCases(panel.getContent(), content);
    });

    test("set content on wysiwyg panel", function() {
        var content = '<p>lorem ipsum</p>';
        panel.setContent(content);
        equalIgnoreCases(panel.getDocument().body.innerHTML, content);
    });

    test("get Document object of wysiwyg panel", function() {
        var wysiwygDocument = document.getElementById("tx_canvas_wysiwyg").contentWindow.document;
        ok(wysiwygDocument === panel.getDocument());
    });

    test("wysiwygpanel 안에 있던 sub module 로딩 잘 되는지 확인", function() {
        var wysiwygDocument = panel.getDocument();
        mockCanvas.fireJobs(Trex.Ev.__IFRAME_LOAD_COMPLETE, wysiwygDocument);

        ok(panel.webfontLoader instanceof Trex.WebfontLoader, "Trex.WebfontLoader");
        equal(typeof panel.webfontLoader.load, "function", "WebfontLoader.load");
    });

    test("wysiwygPanel.addStyle", function() {
        panel.addStyle({ "padding": "10px", "margin": "1px" });
        assertBodyStyle("padding", "10px");
        assertBodyStyle("margin", "1px");
    });


    test("includeWebfontCss() 호출시 WebfontLoader에 delegation 한다.", function() {
        expect(1);
        panel.webfontLoader = {
            load: function() {
                ok(true, "WebfontLoader.load() should be invoked")
            }
        };
        panel.includeWebfontCss();
    });

    test("getUsedWebfont() 호출시 WebfontLoader에 delegation 한다.", function() {
        expect(2);
        panel.webfontLoader = {
            getUsed: function() {
                ok(true, "WebfontLoader.getUsed() should be invoked");
                return [1, 2, 3];
            }
        };
        deepEqual(panel.getUsedWebfont(), [1, 2, 3], "should deleagte to WebfontLoader");
    });

    test("getName", function() {
        equal(panel.getName(), "html", "panel name should be");
    });

    test("body에 style 지정", function() {
        var doc = panel.getDocument();
        panel.setBodyStyle(doc, { backgroundRepeat: "repeat-y", something: "foo" });
        assertBodyStyle("backgroundRepeat", "repeat-y");
        assertBodyStyle("something", "foo");
    });

    test("setBodyStyle은 color, fontSize, fontFamily, lineHeight 속성은 무시한다.", function() {
        var doc = panel.getDocument();
        panel.setBodyStyle(doc, { color: "red", fontSize: "10px", fontFamily: "verdana", lineHeight: "1.5em" });
        failBodyStyle("color", "red");
        failBodyStyle("fontSize", "10px");
        failBodyStyle("fontFamily", "verdana");
        failBodyStyle("lineHeight", "1.5em");
    });

    asyncTest("setFontStyle을 이용하여 font 속성 지정 가능하다.", 4, function() {
        var doc = panel.getDocument();
        panel.setContent("Force English Font");
        panel.setFontStyle(doc, { color: "rgb(255, 0, 0)", fontSize: "12px", fontFamily: "Verdana !important", lineHeight: "24px" });
        setTimeout(function() {
            assertBodyStyle("color", $tx.opera ? "#ff0000" : "rgb(255, 0, 0)");
            assertBodyStyle("fontSize", "12px");
            assertBodyStyle("fontFamily", "Verdana");
            assertBodyStyle("lineHeight", "24px");
            QUnit.start();
        }, 0);
    });

    test("setContent 시 내용이 없을 경우 기본 paragraph를 추가하여 준다.", function() {
        panel.setContent("");
        equalIgnoreCases(panel.getContent(), $tom.EMPTY_PARAGRAPH_HTML);
    });

    test("clean word joiner in pre filter", function() {
        equal(panel.doPreFilter("before \ufeff after"), "before  after", "word joiner should be removed");
    });

    $tx.msie && test("IE에서 innerHTML로 세팅시 no scope element 사라지는 현상을 막는다.", function() {
        equal(panel.doPreFilter("<script "), Trex.__WORD_JOINER + "<script ", "should append word joiner in IE");
        equal(panel.doPreFilter('<html><head><title>TITLE</title></head><body>  <script'),
                '<html><head><title>TITLE</title></head><body>  ' + Trex.__WORD_JOINER + '<script',
                'script 앞에 head와 title이 있는 경우');
    });

    $tx.msie && test("IE에서만 post filter 수행", function() {
        panel.setBodyHTML("<p>&nbsp;</p><p>second line</p>");
        panel.doPostFilter(panel.getDocument().body);
        var ps = panel.getDocument().getElementsByTagName("P");
        var emptyP = ps[0], secondP = ps[1];
        notEqual(panel.getPositionByNode(emptyP).y, panel.getPositionByNode(secondP).y, "empty paragraph should has a height");
        equal(emptyP.innerHTML, "", "nbsp should be removed from empty paragraph");
    });



    var canvas;
    var processor = {
        getTxSel: function() {
            return {
                getNode: function() {
                    return {};
                }
            };
        }
    };
    var eventBinder, iframe, wysiwygDoc, wysiwygWindow;
    module("wysiwyg panel > eventbinder", {
        setup: function() {
            QUnit.stop(1000);
            canvas = {
                isWYSIWYG: function() {
                    return true;
                },
                onKeyDown: function() {
                },
                fireElements: function() {
                }
            };
            iframe = document.createElement("iframe");
            document.body.appendChild(iframe);

            window.onBlankPageLoaded = function(win, doc) {
                eventBinder = new Trex.WysiwygEventBinder(win, doc, canvas, processor);
                eventBinder.bindEvents();
                wysiwygDoc = doc;
                wysiwygWindow = win;
                QUnit.start();
            };

            var doc = iframe.contentWindow.document;
            doc.open();
            doc.write('<html><head><title>mock iframe</title></head><body>' +
                      '<script type="text/javascript">parent.onBlankPageLoaded(this, document);<\/script>' +
                      '</body></html>');
            doc.close();
        },
        teardown: function() {
            document.body.removeChild(iframe);
            iframe = null;
        }
    });

    test("initialize event binder only", function() {
        ok(eventBinder, "event binder");
    });

    test("keydown event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onKeyDown");
        $tx.simulateEvent(wysiwygDoc, "keydown", {});
    });

    test("mouseover event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onMouseOver");
        $tx.simulateEvent(wysiwygDoc, "mouseover", {});
    });

    test("mouseout event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onMouseOut");
        $tx.simulateEvent(wysiwygDoc, "mouseout", {});
    });

    test("click event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onClick");
        $tx.simulateEvent(wysiwygDoc, "click", {});
    });

    test("double click event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onDoubleClick");
        $tx.simulateEvent(wysiwygDoc, "dblclick", {});
    });

    test("scroll event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onScroll");
        $tx.simulateEvent(wysiwygWindow, "scroll", {});
    });

    test("mousedown event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onMouseDown");
        $tx.simulateEvent(wysiwygDoc, "mousedown", {});
    });

    test("mouseup event canvas 에 전파", function() {
        expect(1);
        assertCanvasMethodInvocation("onMouseUp");
        $tx.simulateEvent(wysiwygDoc, "mouseup", {});
    });

    asyncTest("반복된 keypress시에 query trigger 되도록 함", 1, function() {
        canvas.triggerQueryStatus = function() {
            ok(true);
            QUnit.start();
        };
        typeTenStrokes();
    });

    asyncTest("동일 key keypress시에 query trigger 하지 않음", 0, function() {
        canvas.triggerQueryStatus = function() {
            ok(false);
        };
        
        for (var i = 0; i < 30; i++) {
            typeAStrokes(3);
        }
        setTimeout(function() {
            QUnit.start();
        }, 50);
    });

    asyncTest("몇몇 특수키에 대해서는 query trigger 하지 않음", 0, function() {
        canvas.triggerQueryStatus = function() {
            ok(false);
        };

        typeNineStrokes();
        typeAStrokes(16);
        typeAStrokes(33);
        typeAStrokes(34);
        setTimeout(function() {
            QUnit.start();
        }, 50);
    });

    function typeTenStrokes() {
        var strokes = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11];
        for (var i = 0; i < strokes.length; i++) {
            typeAStrokes(strokes[i]);
        }
    }

    function typeNineStrokes() {
        var strokes = [1, 2, 3, 4, 5, 6, 7, 9, 10];
        for (var i = 0; i < strokes.length; i++) {
            typeAStrokes(strokes[i]);
        }
    }

    function typeAStrokes(keyCode) {
        var eventName = ($tx.webkit || wysiwygDoc.attachEvent) ? "keydown" : "keypress";
        $tx.simulateEvent(wysiwygDoc, eventName, {'keyCode': keyCode});
    }


    function assertCanvasMethodInvocation(methodName) {
        canvas[methodName] = function() {
            ok(true, "canvas." + methodName + " should be invoked");
        };
    }

    function equalIgnoreWhitespaces(actual, expected, message) {
        equal(actual.replace(/\s/g, ""), expected.replace(/\s/g, ""), message);
    }

    function equalIgnoreCases(actual, expected, message) {
        equal(actual.toLowerCase(), expected.toLowerCase(), message);
    }

    function assertBodyStyle(name, value) {
        var body = panel.getDocument().body;
        equalIgnoreWhitespaces($tx.getStyle(body, name), value, name);
    }

    function failBodyStyle(name, value) {
        var bodyStyle = panel.getDocument().body.style;
        notEqual(bodyStyle[name], value, name);
    }
})();
