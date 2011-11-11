(function() {
    module("well-formed test");

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
        "<i><u></p></u></i>",
        "<P>Hello<STRONG>World</P><P>Hello<STRONG>World</STRONG></P></STRONG>",
        "<head></script>",
        "<span><span><p>"
    ];
    var expectedNotWellFormedResult = [
        "<p>Hello</p>",
        "Hello",
        "<b>a<i id='i'>b</i></b><i id='i'>c</i>",
        "<tr><td>td1</td><td>td2</td></tr>",
        "<i><u></u></i>",
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
            equal(result.wellFormedHtml, html, html);
        }
    });

    test("not well-formed", function() {
        var result;
        for (var i = 0; i < notWellFormedHtmls.length; i++) {
            var html = notWellFormedHtmls[i];
            result = HTMLParser(html);
            ok(result.wellFormed === false, html);
            equal(result.wellFormedHtml, expectedNotWellFormedResult[i], html);
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
        equals(result.wellFormedHtml, '1');
    });
})();