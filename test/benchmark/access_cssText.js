var node = document.createElement("div");
node.style.cssText = "font-weight: bold";

suite("access cssText");

bench(".access", function() {
    var value = node.style.cssText;
});
bench("getAttribute", function() {
    var value = node.getAttribute("style");
});