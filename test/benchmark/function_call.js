suite("function call");

bench("one empty var-function", function() {
    var a = function() {
    };
    var b = 1;
});
bench("one var-function with variable", function() {
    var a = function() {
        var c = 10;
    };
    var b = 1;
});
bench("use function keyword", function() {
    function a() {
    }
    var b = 1;
});
bench("use function keyword with variable", function() {
    function a() {
        var c = 10;
    }
    var b = 1;
});
bench("비교군", function() {
    var b = 1;
});
