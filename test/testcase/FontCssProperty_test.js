(function() {
    module("FontCssProperty");

    test("setProperty", function() {
        var property = new FontCssProperty();
        property.setProperty("fontSize", "10pt");
        property.setProperty("fontSize", "12pt");
        ok(!property.isEmpty());
        equal(property.getComputedStyles()["fontSize"], "12pt");
    });

    test("fromShorthand", function() {
        var property = new FontCssProperty();
        deepEqual(property.fromShorthand("10pt Dotum"), {
            fontFamily: 'Dotum',
            fontSize: '10pt',
            fontWeight: 'normal',
            fontStyle: 'normal',
            fontVariant: 'normal',
            lineHeight: 'normal'
        });
    });
})();