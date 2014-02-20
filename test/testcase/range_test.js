(function () {
    module("range test", {
    });
    
    test("unselectable button", function () {
    	assi.setContent("<button style='border:1px solid red'><p>HI</p></button>");
    	var p = assi.byTag("p");
    	try {
	    	var r = goog.dom.Range.createFromNodeContents(p);
	    	r.select();
	    	ok(($tx.msie&&$tx.msie_ver>=8)||!$tx.msie, 'ie9이상 모던 브라우져 selectable button');
    	} catch (e) {    	
    		ok($tx.msie&$tx.msie_ver<=8, 'ie8이하 unselected');
    	}
    	
    });
})();