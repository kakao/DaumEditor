var o = /o/;
suite("regular expression");

bench("empty function", function() {
});
bench("create one regexp", function() {
    /o/;
});
bench("create complex regexp", function() {
    /style=(['"])([^\1]+?);? ?\1/g;
});
bench("create/test one regexp", function() {
    /o/.test('Hello World');
});
bench("prepared/test one regexp", function() {
    o.test('Hello World');
});

suite("replace all");
bench("using split+join", function() {
    "HellooldwordWorld".split("oldword").join("newword");
});
bench("using regexp object", function() {
    "HellooldwordWorld".replace(new RegExp("oldword", "g"), "newword");
});
bench("using regexp literal", function() {
    "HellooldwordWorld".replace(/oldword/g, "newword");
});
