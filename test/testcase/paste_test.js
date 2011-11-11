$tx.msie &&
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