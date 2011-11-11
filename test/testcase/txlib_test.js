(function() {
    module("txlib");

    test("objectToQueryString", function() {
        equal($tx.objectToQueryString({ stringType: "string" }), "stringType=string");
        equal($tx.objectToQueryString({ numberType: 0 }), "numberType=0");
        equal($tx.objectToQueryString({ boolType: true }), "boolType=true");
        equal($tx.objectToQueryString({ boolType: false }), "boolType=false");
        equal($tx.objectToQueryString({ stringType: "string", numberType: 1 }), "stringType=string&numberType=1", "multiple fields");
        equal($tx.objectToQueryString({ hanguel: "한남동" }), "hanguel=%ED%95%9C%EB%82%A8%EB%8F%99");
        equal($tx.objectToQueryString({ nullType: null }), "nullType=");
        equal($tx.objectToQueryString({ specialChars: "&=?" }), "specialChars=%26%3D%3F");
    });

    test("objectToQueryString, legacy(map.js) use case", function() {
        var obj = {
            "mapInfo": "{\"mapWidth\": 569, \"mapHeight\": 420, \"mapCenterX\": 501048, \"mapCenterY\": 1120810, \"c" +
                    "oordinate\": \"congnamul\", \"mapScale\": 2.5, \"mapLevel\": 3, \"markInfo\": [], \"graphicInfo" +
                    "\": [], \"routeInfo\": []}",
            "isScroll": "false", "userWidth": 490, "map_type": "TYPE_MAP", "map_hybrid": false, "mapWidth": 490,
            "mapHeight": 362, "idx": 1, "title": "", "title2": "", "addr": "서울특별시 용산구 한남동", "mapX": 501048,
            "mapY": 1120810, "ifrW": "490px", "ifrH": "362px", "addtype": "1","map_level": 3, "rcode": "1103074",
            "docid": "", "confirmid": "", "toJSONString": null};

        var expected = "mapInfo=%7B%22mapWidth%22%3A%20569%2C%20%22mapHeight%22%3A%20420%2C%20%22mapCenterX%22%3A%205" +
                "01048%2C%20%22mapCenterY%22%3A%201120810%2C%20%22coordinate%22%3A%20%22congnamul%22%2C%20%22mapScale" +
                "%22%3A%202.5%2C%20%22mapLevel%22%3A%203%2C%20%22markInfo%22%3A%20%5B%5D%2C%20%22graphicInfo%22%3A%20" +
                "%5B%5D%2C%20%22routeInfo%22%3A%20%5B%5D%7D&isScroll=false&userWidth=490&map_type=TYPE_MAP&map_hybrid" +
                "=false&mapWidth=490&mapHeight=362&idx=1&title=&title2=&addr=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%" +
                "8B%9C%20%EC%9A%A9%EC%82%B0%EA%B5%AC%20%ED%95%9C%EB%82%A8%EB%8F%99&mapX=501048&mapY=1120810&ifrW=490p" +
                "x&ifrH=362px&addtype=1&map_level=3&rcode=1103074&docid=&confirmid=&toJSONString=";

        equal($tx.objectToQueryString(obj), expected, "map.js real use case");
    });

    test("Array.prototype.findAll", function() {
        var array = [1, 2, 3, 7, 8, 9];
        var filtered = array.findAll(function(item) {
            return item > 3;
        });
        deepEqual(filtered, [7, 8, 9]);
    });

    test("Array.prototype.findAll with index", function() {
        var array = [1, 2, 3, 7, 8, 9];
        var filtered = array.findAll(function(item, index) {
            return 1 < index && index < 4;
        });
        deepEqual(filtered, [3, 7]);
    });

    test("Array.prototype.find", function() {
        function typeOnly (type) {
            return function(object) {
                return typeof object === type;
            };
        }
        var array = [1, 2, "3", 7, 8, 9];
        equal(array.find(typeOnly("string")), "3", "only one");
        equal(array.find(typeOnly("number")), 1, "should return first one");
        equal(array.find(typeOnly("boolean")), null, "should return null");
    });

    test("Array.prototype.flatten", function() {
        var multiArray = [1, 2, [3, 4, [5, 6], 7, 8], 9];
        deepEqual(multiArray.flatten(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test("Array.prototype.uniq", function() {
        var multiArray = [1, 2, 1, 2, 3];
        deepEqual(multiArray.uniq(), [1, 2, 3], "same types");
    });

    ignore_test && test("Array.prototype.uniq should be strict with type", function() {
        var differentTypeMultiArray = [1, 2, "1", "2"];
        deepEqual(differentTypeMultiArray.uniq(), [1, 2, "1", "2"], "with different types");
    });

    test('JSON.stringify + encodeURIComponent', function() {
        var obj = {
            'number': 3,
            'string': '한글',
            'stringifyedArray': '[1,2,3]'
        };
        equal(JSON.stringify(obj, $tx.JSONHelper.encodeURIComponentReplacer),
                '{"number":3,"string":"%ED%95%9C%EA%B8%80","stringifyedArray":"[1,2,3]"}');
    });

    test("JSON.parse + decodeURIComponent", function() {
        var str = '{"number":3,"string":"%ED%95%9C%EA%B8%80","stringifyedArray":"[1,2,3]"}';
        deepEqual(JSON.parse(str, $tx.JSONHelper.decodeURIComponentReviver), {
            'number': 3,
            'string': '한글',
            'stringifyedArray': [1, 2, 3]
        });
    });

    module("txlib > CSS Utilities", {
        setup: function() {
            this.noClassEl = document.createElement("div");

            this.oneClassEl = document.createElement("div");
            this.oneClassEl.className = "class1";

            this.threeClassEl = document.createElement("div");
            this.threeClassEl.className = " class1 class2\t \tclass3 ";
        }
    });

    test("$tx.hasClassName - className 하나일 경우", function() {
        ok($tx.hasClassName(this.oneClassEl, "class1"));
        ok(!$tx.hasClassName(this.oneClassEl, "unknown"));
    });

    test("$tx.hasClassName - className 여러개일 경우", function () {
        ok($tx.hasClassName(this.threeClassEl, "class1"));
        ok($tx.hasClassName(this.threeClassEl, "class2"));
        ok($tx.hasClassName(this.threeClassEl, "class3"));
        ok(!$tx.hasClassName(this.threeClassEl, ""));
        ok(!$tx.hasClassName(this.threeClassEl, "unknown"));
    });

    test("$tx.hasClassName - className 속성이 없는 경우", function () {
        ok(!$tx.hasClassName(this.noClassEl, "unknown"));
    });

    test("$tx.removeClassName - 1 from 3", function () {
        $tx.removeClassName(this.threeClassEl, "class2");
        equal(this.threeClassEl.className, "class1 class3");
    });

    test("$tx.removeClassName - 1 from 1", function () {
        $tx.removeClassName(this.oneClassEl, "class1");
        equal(this.oneClassEl.className, "");
    });

    test("$tx.removeClassName - trying remove unknown", function () {
        $tx.removeClassName(this.oneClassEl, "unknown");
        equal(this.oneClassEl.className, "class1");
    });

    test('$A : convert array like object to array', function () {
        (function () {
            deepEqual($A(arguments), [1, 2, 3, 4, 5]);
        }(1, 2, 3, 4, 5));
    });

    test('$A : use toArray method if it exists', function () {
        var string = 'string';
        string.toArray = function() {
            return ['s', 't', 'r', 'i', 'n', 'g'];
        };

        deepEqual($A(string), ['s', 't', 'r', 'i', 'n', 'g']);
    });

    test('$A : convert node list objects to array', function () {
        var nodeList = document.body.childNodes;
        var arrayConverted = $A(nodeList);

        equal(nodeList.length, arrayConverted.length, "length");
        for (var i = 0; i < arrayConverted.length; i++) {
            equal(nodeList[i], arrayConverted[i], i + "th child should be same");
        }
    });

    test('$A : falsy value should be converted to empty array', function () {
        deepEqual($A(false), []);
        deepEqual($A(), []);
        deepEqual($A(null), []);
    });
})();