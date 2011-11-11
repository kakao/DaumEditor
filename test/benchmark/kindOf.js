var div, REGEXP_PARAGRAPH, MAP_PARAGRAPH;

suite("kindOf", {
    onStart: function() {
        div = document.createElement("div");
        div.className = "div";
        REGEXP_PARAGRAPH = new RegExp(['p','li','dd','dt','h1','h2','h3','h4','h5','h6','td','th','div','caption'].join('|'), "i");
        MAP_PARAGRAPH = new $tx.Set("SPAN", "FONT", "U", "I", "B", "EM", "STRONG", "BIG", "SMALL", "A", "SUB", "SUP",
                "TT", "DFN", "CODE", "SAMP", "KBD", "VAR", "CITE", "ABBR", "ACRONYM", "Q", "BDO", "LABEL", "DIV")
    }
});

bench("kindOf로 element 종류 판단하기", function() {
    $tom.kindOf(div, '%paragraph');
});
bench("regexp + tagName으로 element 종류 판단하기", function() {
    var REGEXP_PARAGRAPH = new RegExp(['p','li','dd','dt','h1','h2','h3','h4','h5','h6','td','th','div','caption'].join('|'), "i");
    return REGEXP_PARAGRAPH.test(div.tagName);
});
bench("compiled regexp + tagName으로 element 종류 판단하기", function() {
    return REGEXP_PARAGRAPH.test(div.tagName);
});
bench("map으로 element 종류 판단하기", function() {
    return MAP_PARAGRAPH[div.tagName];
});

bench("old kindOf - %block", function() {
    $tom.kindOf_old(div, '%block');
});
bench("old kindOf - %element", function() {
    $tom.kindOf_old(div, '%element');
});
bench("old kindOf - %text", function() {
    $tom.kindOf_old(div, '%text');
});
bench("old kindOf - div.txc-image", function() {
    $tom.kindOf_old(div, 'div.txc-image');
});
bench("old kindOf - p,li,dd,dt,h1,h2,h3,h4,h5,h6", function() {
    $tom.kindOf_old(div, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6');
});

bench("new kindOf - %block", function() {
    $tom.kindOf(div, '%block');
});
bench("new kindOf - %element", function() {
    $tom.kindOf(div, '%element');
});
bench("new kindOf - %text", function() {
    $tom.kindOf(div, '%text');
});
bench("new kindOf - div.txc-image", function() {
    $tom.kindOf(div, 'div.txc-image');
});
bench("new kindOf - p,li,dd,dt,h1,h2,h3,h4,h5,h6", function() {
    $tom.kindOf(div, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6');
});