var testDiv = document.createElement("div");

suite("cloneNode");

bench("clone으로 node 만들기", function() {
    testDiv.cloneNode(false);
});
bench("createElement로 node 만들기", function() {
    document.createElement("DIV");
});