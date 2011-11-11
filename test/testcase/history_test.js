(function() {
    var BOGUS_HTML = $tom.EMPTY_PARAGRAPH_HTML;

    function writeAndSave(content) {
        write(content);
        history.saveHistoryByKeyEvent({ keyCode: Trex.__KEY.SPACE });
    }
    function write(content) {
        var currentContent = canvas.getContent();
        if (!currentContent || standardizeHTML(currentContent) == standardizeHTML(BOGUS_HTML)) {
            canvas.setContent(content);
        } else {
            canvas.setContent(currentContent + ' ' + content);
        }
        history.contentModified = true;
    }

    function undo() {
        history.undoHandler();
    }

    function redo() {
        history.redoHandler();
    }

    function assertContent(expected) {
        htmlEqual(canvas.getContent(), expected);
    }

    function assertBackground(expectedColor) {
        var actualBackground = toHexColor(assi.canvas.getCurrentPanel().getStyle("backgroundColor"));
        equal(actualBackground, expectedColor);
    }
    var history = null;
    var canvas = null;
    module("history", {
        setup: function() {
            canvas = assi.canvas;
            history = canvas.history;
            history.setupHistory();
            history.initHistory({
                backgroundColor: "#ffffff",
                backgroundImage: "none"
            });
            canvas.setContent(BOGUS_HTML);
            canvas.contentModified = false;
            assi.editor.getAttachBox().empty();
        }
    });

    test("init/set content", function() {
        assertContent(BOGUS_HTML);

        var newContent = "Hello";
        canvas.setContent(newContent);
        assertContent(newContent);
    });

    test("check init condition", function() {
        ok(!history.canUndo());
        ok(!history.canRedo());
    });

    test("can undo if history saved", function() {
        writeAndSave("hello world");

        ok(history.canUndo());
        ok(!history.canRedo());
    });

    test("do nothing if nothing is changed", function() {
        history.saveHistoryIfEdited();
        ok(!history.canUndo());
        ok(!history.canRedo());
    });

    test("undo를 하면 이전 내용으로 변경되어야 한다.", function() {
        writeAndSave("hello world");
        writeAndSave("daumcorp");

        assertContent("hello world daumcorp");

        undo();
        assertContent("hello world");

        undo();
        assertContent(BOGUS_HTML);
    });

    test("redo를 하면 다시 복구", function() {
        writeAndSave("hello world");
        writeAndSave("daumcorp");
        undo();
        assertContent("hello world");
        redo();
        assertContent("hello world daumcorp");
    });

    test("현재 수정된 내용이 있으면 undo를 하면", function() {
        writeAndSave("hello world");
        undo();
        assertContent(BOGUS_HTML);
    });

    test("undo를 하고 본문을 수정하면 redo가 불가능하다.", function() {
        writeAndSave("hello world");
        writeAndSave("daumcorp");
        undo();
        ok(history.canRedo(), "undo를 직후에는 redo 가능");
        writeAndSave("cabbage");
        ok(!history.canRedo(), "undo후에 본문을 수정하면 redo 불가능");
    });

    test("시작 Content를 세팅할 수 있다.", function() {
        var initContent = "I decided";
        canvas.initContent(initContent);

        assertContent(initContent);
        ok(!history.canUndo());
        writeAndSave("to visit");
        ok(history.canUndo());
        undo();
        ok(!history.canUndo());
        assertContent(initContent);
    });

    test("Undo/Redo 반복 검증", function() {
        var initContent = "I decided";
        canvas.initContent(initContent);
        writeAndSave("to visit");
        writeAndSave("death valley");
        assertContent("I decided to visit death valley");
        undo();
        assertContent("I decided to visit");
        write("Death Valley");
        assertContent("I decided to visit Death Valley");
        undo();
        undo();
        undo();
        undo();
        assertContent("I decided");

        redo();
        redo();
        redo();
        redo();
        assertContent("I decided to visit Death Valley");
        writeAndSave("to exp");
        assertContent("I decided to visit Death Valley to exp");
    });

    test("MAX_UNDO_COUNT 만큼만 history를 저장한다", function() {
        history.maxUndoCount = 1;
        writeAndSave("Hello");
        writeAndSave("World");
        assertContent("Hello World");
        undo();
        assertContent("Hello");
        undo();
        assertContent("Hello");
        history.maxUndoCount = 20;
    });

    test("attachment 추가하고 undo, redo", function() {
        var editor = assi.editor;
        var attachBox = editor.getAttachBox();
        var imageAttacher = editor.getSidebar().getAttacher("image");
        var sampleImage = {
            "dataSeq": 1,
            "filename":"사고 후 돈다발 '휙' 중국 'BMW녀' 논란.jpg",
            "isoriginalsize":true,
            "originalurl":"http://cfile257.uf.daum.net/original/16602B464DD32D3F165F55",
            "exifurl":"http://cfile257.uf.daum.net/info/16602B464DD32D3F165F55",
            "filesize":3831,
            "attachurl":"http://cfile257.uf.daum.net/attach/16602B464DD32D3F165F55",
            "actualheight":78,
            "imagealign":"C",
            "imageurl":"http://cfile257.uf.daum.net/image/16602B464DD32D3F165F55",
            "actualwidth":108,
            "thumburl":"http://cfile257.uf.daum.net/P150x100/16602B464DD32D3F165F55",
            "dispElId":"tx_entry_8691"
        };
        imageAttacher.execAttach(sampleImage);
        assi.delayedAssertion(function() {
            var entries = attachBox.datalist;
            var imageEntry = entries[0];
            var contentAfterImageAttach = assi.getContent();
            
            writeAndSave("<p>BMW녀</p>");

            undo();
            assertContent(contentAfterImageAttach);
            equal(imageEntry.deletedMark, false);

            undo();
            assertContent(BOGUS_HTML);
            equal(imageEntry.deletedMark, true);

            redo();
            assertContent(contentAfterImageAttach);
            equal(imageEntry.deletedMark, false);

            redo();
            assertContent(contentAfterImageAttach + " <p>BMW녀</p>");
            equal(imageEntry.deletedMark, false);
        });
    });

    test("undo하고 글을 수정하면 다시 redo할 수 없다.", function() {
        writeAndSave("Hello");
        undo();
        assertContent(BOGUS_HTML);
        write("World");
        redo();
        assertContent("World");
    });

    // TODO canvas.execute

    // TODO table : 이건 없었으니까 만들면 좋겠군

    // background
    test("background 바꾼 후에 undo, redo", function() {
        assi.executeTool("background", "#dddddd");
        assi.executeTool("background", "#eeeeee");

        assertBackground("#eeeeee");
        undo();
        assertBackground("#dddddd");
        undo();
        assertBackground("#ffffff");
        redo();
        assertBackground("#dddddd");
        undo();
        assertBackground("#ffffff");
    });
    
    test("combine writing and background", function() {
        writeAndSave("Hello");
        writeAndSave("World");
        assi.executeTool("background", "#eeeeee");
        assi.executeTool("background", "#dddddd");

        assertContent("Hello World");
        assertBackground("#dddddd");
        undo();
        assertContent("Hello World");
        assertBackground("#eeeeee");
        undo();
        assertContent("Hello World");
        assertBackground("#ffffff");
        undo();
        assertContent("Hello");
        assertBackground("#ffffff");
        undo();
        assertContent(BOGUS_HTML);
        assertBackground("#ffffff");
        undo();
        assertContent(BOGUS_HTML);
        assertBackground("#ffffff");

        redo();
        assertContent("Hello");
        assertBackground("#ffffff");
        redo();
        assertContent("Hello World");
        assertBackground("#ffffff");
        redo();
        assertContent("Hello World");
        assertBackground("#eeeeee");
        redo();
        assertContent("Hello World");
        assertBackground("#dddddd");
        redo();
        assertContent("Hello World");
        assertBackground("#dddddd");

        undo();
        assertContent("Hello World");
        assertBackground("#eeeeee");
        undo();
    });
    
    test("undo 하고 수정하고 undo 하면 동작이  이상하다.", function() {
        writeAndSave("Hello");
        writeAndSave("World");
        undo();
        writeAndSave("!!");
        undo();
        assertContent("Hello");
    });

    ignore_test &&
    test("undo/redo를 했을 때에 caret이 복구 되어야 한다", function() {
        var getParagraph = function(nth) { return assi.byTag("p", nth || 0) };
        var range;

        write("<p>Hello</p>");
        assi.selectForNodes(getParagraph(0).firstChild, 5, getParagraph(0).firstChild, 5);
        history.saveHistory();
        write("<p>World</p>");
        assi.selectForNodes(getParagraph(1).firstChild, 1, getParagraph(1).firstChild, 1);
        history.saveHistory();

        undo();
        range = assi.createGoogRange();
        ok(range);
        equal(range.getStartNode(), getParagraph(0).firstChild);
        equal(range.getStartOffset(), 5);
        equal(range.isCollapsed(), true);

        redo();
        range = assi.createGoogRange();
        ok(range);
        equal(range.getStartNode(), getParagraph(1).firstChild);
        equal(range.getStartOffset(), 1);
        equal(range.isCollapsed(), true);
    });
})();
