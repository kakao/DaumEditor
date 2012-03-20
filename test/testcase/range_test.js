(function () {
    module("range test", {
    });
    
    test("unselectable button", function () {
    	assi.setContent("<button style='border:1px solid red'><p>HI</p></button>");
    	var p = assi.byTag("p");
    	try {
	    	var r = goog.dom.Range.createFromNodeContents(p);
	    	r.select();
	    	ok(!$tx.msie);
    	} catch (e) {    	
    		ok($tx.msie);
    	}
    	
    });
})();