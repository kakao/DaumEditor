/**
 * DomGetty - Very Very Simple Dom Selector Engine
 * - id : #
 * - class : .
 * - tag : tagname
 */
(function(){
	var m, el, els;
	var filters = {
		'#': function(cnxt, expr){
			if ((m = /(\S*)#(\S+)/.exec(expr)) !== _NULL) {
				var tag = m[1];
				var id = m[2];
				if(!cnxt.getElementById) { //ie
					cnxt = cnxt.ownerDocument;
				}
				if (el = cnxt.getElementById(id)) {
					if (tag.length < 1 || el.nodeName.toLowerCase() == tag) {
						return [el];
					}
				}
			}
			return [];
		},
		'.': function(cnxt, expr){
			if ((m = /(\S*)\.(\S+)/.exec(expr)) !== _NULL) {
				var tag = ((m[1] === "") ? "*" : m[1]);
				var klass = m[2];
				if ((els = cnxt.getElementsByTagName(tag)).length > 0) {
					var results = [];
					for (var i=0; i<els.length; i++) {
						var el = els[i];
						if ( (new RegExp("(^| )" + klass + "($| )")).test(el.className)) {
							results.push(el);
						}
					}
					return results;
				}
			}
			return [];
		},
		'*': function(cnxt, expr){
			if ((els = cnxt.getElementsByTagName(expr)).length > 0) {
				var results = [];
				for (var i=0; i<els.length; i++) {
					results.push(els[i]);
				}
				return results;
			}
			return [];
		}
	};
	
	var match = function(cnxt, expr) {
        if (cnxt.length < 1) {
            return [];
        }
        var fltr;
        if ((f = /(\.|#)/.exec(expr)) !== _NULL) {
            if (filters[f[1]]) {
                fltr = f[1];
            }
        }
        fltr = fltr || "*";
        var results = [];
        for (var i = 0; i < cnxt.length; i++) {
            results = results.concat(filters[fltr](cnxt[i], expr));
        }
        return results;
    };
	
	var collect = function(cnxt, expr) {
        var els = [cnxt];
        var exprs = expr.split(" ");
        for (var j = 0; j < exprs.length; j++) {
            els = match(els, exprs[j]);
        }
        return els;
    };
	
	var DomGetty = function(context, selector, all) {
		all = !!all;
		if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
			return (all? []: _NULL);
		}
		if ( !selector || typeof selector !== "string" ) {
			return (all? []: _NULL);
		}

		var els;
		var mathes = [];
		var exprs = selector.split(",");
		for (var i = 0; i < exprs.length; i++) {
			els = collect(context, exprs[i]);
			if(els && els.length > 0) {
				mathes = mathes.concat(els);
				if(!all) {
					break;
				}
			}
		}
		if(all) {
			return mathes;
		} else {
			return mathes[0];
		} 
	};
 
	/**
	 * Get Element By Css Selector
	 * 
	 * dGetty(element, selector) or dGetty(selector)
	 * ex)
	 *  dGetty(document, "#wrapper div.article")
	 *  dGetty($tx("#wrapper"), "div.article")
	 *  dGetty("#wrapper div.article") -> default document
	 */
	_WIN.dGetty = function() {
		var args = arguments;
		if(args.length == 1) {
			if(typeof (args[0]) === "string") {
				return DomGetty(_DOC, args[0]);
			}
		} else if(args.length == 2) {
			if(args[0].nodeType && typeof (args[1]) === "string") {
				return DomGetty(args[0], args[1]);
			}
		}
		return _NULL;
	};
	
	/**
	 * Get Element List By Css Selector
	 * 
	 * dGetties(element, selector) or dGetties(selector)
	 * ex)
	 *  dGetties(document, "#wrapper div.article")
	 *  dGetties($tx("#wrapper"), "div.article")
	 *  dGetties("#wrapper div.article") -> default document
	 */
	_WIN.dGetties = function() {
		var args = arguments;
		if(args.length == 1) {
			if(typeof (args[0]) === "string") {
				return DomGetty(_DOC, args[0], _TRUE);
			}
		} else if(args.length == 2) {
			if(args[0].nodeType && typeof (args[1]) === "string") {
				return DomGetty(args[0], args[1], _TRUE);
			}
		}
		return [];
	};
	
})();	

/**
 * DomChecky - Very Very Simple Dom Check Engine By Selector
 * - id : #
 * - class : .
 * - tag : tagname
 */
(function(){
	var m, el, els;
	var filters = {
		'#': function(cnxt, expr){
			if ((m = /(\S*)#(\S+)/.exec(expr)) !== _NULL) {
				var tag = m[1];
				var id = m[2];
				if (tag.length < 1 || cnxt.nodeName.toLowerCase() == tag) {
					if (cnxt.id == id) {
						return _TRUE;
					}
				}
			}
			return _FALSE;
		},
		'.': function(cnxt, expr){
			if ((m = /(\S*)\.(\S+)/.exec(expr)) !== _NULL) {
				var tag = m[1];
				var klass = m[2];
				if (tag.length < 1 || cnxt.nodeName.toLowerCase() == tag) {
					if (cnxt.className.indexOf(klass) > -1) {
						return _TRUE;
					}
				}
			}
			return _FALSE;
		},
		'*': function(cnxt, expr){
			var tag = expr;
			if (cnxt.nodeName.toLowerCase() == tag) {
				return _TRUE;
			}
			return _FALSE;
		}
	};
	
	var check = function(cnxt, expr) {
        var fltr;
        if ((f = /(\.|#)/.exec(expr)) !== _NULL) {
            if (filters[f[1]]) {
                fltr = f[1];
            }
        }
        fltr = fltr || "*";
        return filters[fltr](cnxt, expr);
    };
	
	var DomChecky = function(context, selector) {
		if ( context.nodeType !== 1) {
			return _FALSE;
		}

		var found = _FALSE;
		var exprs = selector.split(",");
		for (var i = 0; i < exprs.length; i++) {
			found = check(context, exprs[i]);
			if(found) {
				break;
			}
		}
		return found;
	};
	
	/**
	 * Check Element By Css Selector
	 * @returns boolean
	 * 
	 * dChecky(element, selector)
	 * ex)
	 *  dChecky(document, "#wrapper")
	 */
	_WIN.dChecky = function() {
		var args = arguments;
		if(args.length == 2) {
			if(args[0].nodeType && typeof (args[1]) === "string") {
				return DomChecky(args[0], args[1]);
			}
		}
		return _FALSE;
	};

})();
