
(function() {
    var p, div;
    module("flattening", {
        setup: function() {
            p = document.createElement("P");
            div = document.createElement("DIV");
            document.body.appendChild(p);
            document.body.appendChild(div);
        },
        teardown: function() {
            document.body.removeChild(p);
            document.body.removeChild(div);
        }
    });


    // TODO class의 중첩을 어떻게 처리를 해야할까?
    test("2depth span[class]을 포함한 P를 flatten", function() {
        var initHTML = '<span class="outer">Hello<span class="inner">World</span>!!</span>';
        var expectedHTML = '<span class="outer">Hello</span><span class="inner">World</span><span class="outer">!!</span>';
        assertFlatten(p, initHTML, expectedHTML);
    });

    test("간단한 test", function() {
        var initHTML = "<span>Hello<span>World</span></span>";
        var expectedHTML = '<span>Hello</span><span>World</span>';
        assertFlatten(p, initHTML, expectedHTML);
    });

    test("2depth span[style]을 포함한 P를 flatten", function() {
        var initHTML = '<span style="text-decoration: underline; ">Hello<span style="font-size: 12px; ">World</span></span>';
        var expectedHTML = '<span style="text-decoration: underline; ">Hello</span><span style="text-decoration: underline; font-size: 12px; ">World</span>';
        assertFlatten(p, initHTML, expectedHTML);
    });

    test("3depth span을 포함한 P를 flatten", function() {
        var initHTML = '<span>H<span>e<span>l</span>l</span>o</span>';
        var expectedHTML = '<span>H</span><span>e</span><span>l</span><span>l</span><span>o</span>';
        assertFlatten(p, initHTML, expectedHTML);
    });

    test("a안에 span이 존재하는 경우flatten", function() {
        var initHTML = '<a><span>He</span>llo</a>World';
        var expectedHTML = '<a><span>He</span>llo</a>World';
        assertFlatten(p, initHTML, expectedHTML);
    });

    //<p><span><a>Hello</a>Text</span><span><a>World</a></span></p>
	test("span안에 a와 Textnode가 있는 경우", function() {
        var initHTML = '<span style="font-weight:bold;"><a style="font-weight:bolder;">aa<span style="font-weight:normal">bb</span></a>cc<a>dd</a></span>';
        var expectedHTML = '<a><span style="font-weight:bolder">aa</span><span style="font-weight:normal">bb</span></a><span style="font-weight:bold">cc</span><a><span style="font-weight:bold">dd</span></a>';
        assertFlatten(p, initHTML, expectedHTML);
	});

    test("span안에 div와 Textnode가 있는 경우", function() {
        var initHTML = '<span style="font-weight:bold;"><div style="font-weight:bolder;">aa<span style="font-weight:normal">bb</span></div>cc<a>dd</a></span>';
        var expectedHTML = '<div><span style="font-weight:bolder">aa</span><span style="font-weight:normal">bb</span></div><span style="font-weight:bold">cc</span><a><span style="font-weight:bold">dd</span></a>';
        assertFlatten(div, initHTML, expectedHTML);
	});

    test("두 개의 block 중첩", function() {
        var initHTML = '<div><span id="1">Hello<span style="font-style: italic">W<a id="2">orl</a>d</span></span></div>';
        var expectedHTML = '<div><span id="1">Hello</span><span style="font-style:italic;">W</span><a id="2"><span style="font-style:italic;">orl</span></a><span style="font-style:italic">d</span></div>';
        assertFlatten(div, initHTML, expectedHTML);
    });

    test("[regression] flattening 도중 node iterator 가 지정한 범위를 뚫고 나가는 경우", function() {
        assi.setContent('<p><u><b>text</b></u></p><p class="stop"><font>hello</font></p>');
        var p = assi.byTag("p", 0);
        Trex.I.FontTool.flattenChildren(p);
        equals(assi.byTag("p", 1).firstChild.tagName, "FONT");
    });

    test("p > span > p", function() {
        var initHTML = "<p><span><p>Hello</p></span></p>";
        var expectedHTML = "<p><span></span><p>Hello</p><span></span></p>"
        assertFlatten(div, initHTML, expectedHTML);
    });

    function assertFlatten(p, initHTML, expectedHTML) {
        p.innerHTML = initHTML;
        Trex.I.FontTool.flattenChildren(p);
        htmlEqual(p.innerHTML, expectedHTML);
    }
})();