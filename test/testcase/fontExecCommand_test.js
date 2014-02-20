(function() {
    module("execCommand compatibility");

    function assertFontToolExecution(toolName, expectedStyle) {
        assi.assertToolExecution(toolName, null, function() {
            for (var command in expectedStyle) {
                if (command == 'textDecoration') {
                    equal(assi.doc.queryCommandState('underline'), expectedStyle[command].indexOf("underline") >= 0, "underline miss-matched");
                    equal(assi.doc.queryCommandState('strikethrough'), expectedStyle[command].indexOf("line-through") >= 0, "line-through miss-matched");
                } else {
                    equal(assi.doc.queryCommandState(command), expectedStyle[command], command+" miss-matched");
                }
            }
        });
    }
    function assertBoldExecution(expectedStyle) {
        assertFontToolExecution("bold", {
            bold: expectedStyle == "bold"
        });
    }

    function assertItalicExecution(expectedStyle) {
        assertFontToolExecution("italic", {
            italic: expectedStyle == "italic"
        });
    }

    function assertStrikeExecution(expectedStyle) {
        assertFontToolExecution("strike", {
            textDecoration: expectedStyle
        });
    }

    function assertUnderExecution(expectedStyle) {
        assertFontToolExecution("underline", {
            textDecoration: expectedStyle
        });
    }

    /**
     * bold
     */
    test("bold - Text", function() {
        var html = '<p>Hello</p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('p')[0]);
        assertBoldExecution("bold");
    });

    test("bold - span[style='font-weight:normal']", function() {
        var html = '<p><span style="font-weight: normal">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertBoldExecution("bold");
    });

    test("bold - span[style='font: 9pt Dotum']", function() {
        var html = '<p><span style="font: 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertBoldExecution("bold");
    });

    test("unbold - <strong>", function() {
        var html = '<p><strong>Hello</strong></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('strong')[0]);
        assertBoldExecution("normal");
    });

    test("unbold - <b>", function() {
        var html = '<p><b>Hello</b></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('b')[0]);
        assertBoldExecution("normal");
    });

    test("unbold - span[style='font-weight:bold']", function() {
        var html = '<p><span style="font-weight: bold">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertBoldExecution("normal");
    });

    test("unbold - span[style='font: bold 9pt Dotum']", function() {
        var html = '<p><span style="font: bold 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertBoldExecution("normal");
    });

    /**
     * italic
     */
    test("italic - Text", function() {
        var html = '<p>Hello</p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('p')[0]);
        assertItalicExecution("italic");
    });

    test("italic - span[style='font-style:normal']", function() {
        var html = '<p><span style="font-style: normal">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertItalicExecution("italic");
    });

    test("italic - span[style='font: 9pt Dotum']", function() {
        var html = '<p><span style="font: 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertItalicExecution("italic");
    });

    test("unitalic - <i>", function() {
        var html = '<p><i>Hello</i></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('i')[0]);
        assertItalicExecution("normal");
    });

    test("unitalic - <em>", function() {
        var html = '<p><em>Hello</b></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('em')[0]);
        assertItalicExecution("normal");
    });

    test("unitalic - span[style='font-style:italic']", function() {
        var html = '<p><span style="font-style: italic">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertItalicExecution("normal");
    });

    test("unitalic - span[style='font: italic 9pt Dotum']", function() {
        var html = '<p><span style="font: italic 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertItalicExecution("normal");
    });

    /**
     * strike
     */
    test("strike - Text", function() {
        var html = '<p>Hello</p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('p')[0]);
        assertStrikeExecution("line-through");
    });

    test("strike - span[style='text-decoration: none']", function() {
        var html = '<p><span style="text-decoration: none">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertStrikeExecution("line-through");
    });

    test("strike - span[style='text-decoration: underline']", function() {
        var html = '<p><span style="text-decoration: underline">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertStrikeExecution("underline line-through");
    });

    test("strike - span[style='font: 9pt Dotum']", function() {
        var html = '<p><span style="font: 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertStrikeExecution("line-through");
    });

    test("unstrike - <strike>", function() {
        var html = '<p><strike>Hello</strike></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('strike')[0]);
        assertStrikeExecution("none");
    });

    test("unstrike - <s>", function() {
        var html = '<p><s>Hello</s></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('s')[0]);
        assertStrikeExecution("none");
    });

    test("unstrike - span[style='text-decoration: line-through']", function() {
        var html = '<p><span style="text-decoration: line-through">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertStrikeExecution("none");
    });

    test("unstrike - span[style='text-decoration: line-through underline']", function() {
        var html = '<p><span style="text-decoration: line-through underline">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertStrikeExecution("underline");
    });

    /**
     * underline
     */
    test("underline - Text", function() {
        var html = '<p>Hello</p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('p')[0]);
        assertUnderExecution("underline");
    });

    test("underline - span[style='text-decoration: none']", function() {
        var html = '<p><span style="text-decoration: none">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertUnderExecution("underline");
    });

    test("underline - span[style='text-decoration: line-though']", function() {
        var html = '<p><span style="text-decoration: line-through">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertUnderExecution("underline line-through");
    });

    test("underline - span[style='font: 9pt Dotum']", function() {
        var html = '<p><span style="font: 9pt Dotum">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertUnderExecution("underline");
    });

    test("ununderline - <u>", function() {
        var html = '<p><u>Hello</u></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('u')[0]);
        assertUnderExecution("none");
    });

    test("ununderline - span[style='text-decoration: underline']", function() {
        var html = '<p><span style="text-decoration: underline">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertUnderExecution("none");
    });

    test("ununderline - span[style='text-decoration: line-through underline']", function() {
        var html = '<p><span style="text-decoration: line-through underline">Hello</span></p>';
        assi.setContent(html);
        assi.selectNodeContents(assi.$$('span')[0]);
        assertUnderExecution("line-through");
    });
})();