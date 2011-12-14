(function() {
    module("htmlparser");

    test("toString", function() {
        var tree = HTMLTree.create();
        tree.openTag(1, "p", "", false);
        tree.unaryTag(3, "Hello");
        tree.unaryTag(1, "br", "", true);
        tree.openTag(1, "i", "", false);
        tree.unaryTag(3, "World");
        tree.closeTag();
        tree.unaryTag(8, "Comment");
        equal(tree.toString(), "<p>Hello<br><i>World</i><!--Comment--></p>")
    });
    
    test("from text", function() {
        var html = "<p>Hello<br><i>World</i><!--Comment--></p>";
        equals(HTMLParser(html).cleanHTML, html);
    });

    test("effectiveness - has id", function() {
        var html = "<p>Hello<br><span id='a'>World</span><!--Comment--></p>";
        equals(HTMLParser(html).cleanHTML, html);
    });

    test("effectiveness", function() {
        var html = "<p>Hello<br><span>World</span><!--Comment--></p>";
        equals(HTMLParser(html).cleanHTML, "<p>Hello<br>World<!--Comment--></p>");
    });

    test("duplicated font size", function() {
        var html = '<span style="font-size: 10pt"><font size="2">Hello</font></span>';
        equals(HTMLParser(html).cleanHTML, '<font size="2">Hello</font>');
    });

    test("removeUseless more complex", function() {
        var html = '<P><SPAN style="FONT-FAMILY: Arial"><SPAN style="FONT-SIZE: 12pt"><FONT style="BACKGROUND-COLOR: #9aa5ea" color=#ffffff>Part&nbsp; #1 : Review 11/4 (20 times)</FONT></SPAN></SPAN></P>';
        equals(HTMLParser(html).cleanHTML, html);
    });
    
    test('<p style="TEXT-ALIGN: right" class=""><o:p style="TEXT-ALIGN: center"></o:p></p> is well-formed', function() {
        ok(HTMLParser('<p style="TEXT-ALIGN: right" class=""><o:p style="TEXT-ALIGN: center"></o:p></p>').wellFormed);
    });

    var invalidHTML = [
        {
            input : "<p><table border='1'><tr><td>Hello</p>World</td></tr></table>",
            output : "<p><table border='1'><tr><td>Hello</p>World</td></tr></table>"
        },
        {
            input: "<strong><p>Hello</p></strong>",
            output: '<strong><p>Hello</p></strong>'
        }
    ];

    false && test('invalid html', function() {
        for (var i = 0; i < invalidHTML.length; i++) {
            equal(HTMLParser(invalidHTML[i].input).cleanHTML, invalidHTML[i].output, invalidHTML[i].input);
        }
    });
})();

(function() {
    module("htmlparser - cleanHTML");

    var wellFormedHtmls = [
        "",
        "Hello",
        "<p id='123'>Hello</p>",
        "a<b>b<i>c<u>d</u>e</i>f</b>g",
        "<script>var a = 1;</script>Hello",
        "<textarea><b><textarea>Hello</textarea>"
    ];
    var notWellFormedHtmls = [
        "<p>Hello",
        "Hello</p>",
        "<b>a<i id='i'>b</b>c</i>",
        "<tr><td>td1<td>td2</tr>",
        "<i><u>A</p></u></i>",
        "<P>Hello<STRONG>World</P><P>Hello<STRONG>World</STRONG></P></STRONG>",
        "<head></script>",
        "<span><span><p>"
    ];
    var expectedNotWellFormedResult = [
        "<p>Hello</p>",
        "Hello",
        "<b>a<i id='i'>b</i></b><i id='i'>c</i>",
        "<tr><td>td1</td><td>td2</td></tr>",
        "<i><u>A</u></i>",
        "<P>Hello<STRONG>World</STRONG></P><STRONG><P>Hello<STRONG>World</STRONG></P></STRONG>",
        "<head></head>",
        "<p></p>"
    ];
    var parseErrorHtmls = [
        "<!-- Hello"
    ];

    var fixedHtmls = [
        "<span id='span'><span><p></p></span></span>"
    ];

    test("well-formed", function() {
        var result;
        for (var i = 0; i < wellFormedHtmls.length; i++) {
            var html = wellFormedHtmls[i];
            result = HTMLParser(html);
            ok(result.wellFormed, html);
            equal(result.cleanHTML, html, html);
        }
    });

    test("not well-formed", function() {
        var result;
        for (var i = 0; i < notWellFormedHtmls.length; i++) {
            var html = notWellFormedHtmls[i];
            result = HTMLParser(html);
            ok(result.wellFormed === false, html);
            equal(result.cleanHTML, expectedNotWellFormedResult[i], html);
        }
    });

    test("inline > block", function() {
        var html = "<span id>\n<span id>\n<p>1</p>\n<p>2</p>\n";
        var result = HTMLParser(html);
        ok(result.wellFormed === false);
    });

    test("useless span", function() {
        var html = "<span><span>1</span></span>";
        var result = HTMLParser(html);
        ok(result.wellFormed);
        equal(result.cleanHTML, '1');
    });

    test("nested strong", function() {
        var html = "<em><strong><em><span><em><strong>Hello</strong></em></span></em></strong></em>";
        var result = HTMLParser(html);
        ok(result.wellFormed);
        equal(result.cleanHTML, '<em><strong>Hello</strong></em>');
    });
})();