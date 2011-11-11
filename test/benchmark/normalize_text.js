suite("normalize");

function normalizeText_(firstTextNode) {
    while ($tom.isText(firstTextNode.nextSibling)) {
        firstTextNode.nodeValue += firstTextNode.nextSibling.nodeValue;
        $tom.remove(firstTextNode.nextSibling);
    }
}
function normalizeText(node) {
    var child = node.firstChild;
    while (child) {
        if ($tom.isText(child)) {
            normalizeText_(child);
        }
        child = child.nextSibling;
    }
}

bench("create element", function() {
    var a = document.createElement("div");
    a.innerHTML = "Hello";
    var firstChild = a.firstChild;
});
bench("split", function() {
    var a = document.createElement("div");
    a.innerHTML = "Hello";
    var firstChild = a.firstChild;
    firstChild.splitText(2);
});
bench("normalize", function() {
    var a = document.createElement("div");
    a.innerHTML = "Hello";
    var firstChild = a.firstChild;
    firstChild.splitText(2);
    a.normalize();
});
bench("custom normalize", function() {
    var a = document.createElement("div");
    a.innerHTML = "Hello";
    var firstChild = a.firstChild;
    firstChild.splitText(2);
    normalizeText(a);
});

