if (window.localStorage) {
    suite("localStorage", {
        onStart: function() {
            localStorage.setItem("key", "value");
        }
    });

    bench("setItem", function() {
        localStorage.setItem("key", "other");
    });

    bench("getItem", function() {
        localStorage.getItem("key");
    });
}