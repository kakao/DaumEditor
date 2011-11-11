suite("array each");

var contains = function(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            return true;
        }
    }
    return false;
};

Array.prototype.contains = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == value) {
            return true;
        }
    }
    return false;
};

Array.prototype.newEach = function(fn) {
    try {
        for (var i = 0; i < this.length; i++) {
            fn(this[i]);
        }
    } catch (e) {
        if (e != $break) {
            throw e;
        }
    }
};

function eachContains(array, value) {
    var found = false;
    array.newEach(function(obj) {
        if (obj == value) {
            found = true;
            throw $break;
        }
    });
    return found;
}

bench("using loop w/o prototype", function() {
    var arr = [1,2,3,4,5,6,7,8,9];
    contains(arr, 9);
});
bench("using loop w/ prototype", function() {
    var arr = [1,2,3,4,5,6,7,8,9];
    arr.contains(9);
});
bench("using newEach", function() {
    var arr = [1,2,3,4,5,6,7,8,9];
    eachContains(arr, 9);
});