/**
 * DomFindy - Very Very Simple Dom Selector Engine, But find ancestor
 * - id : #
 * - class : .
 * - tag : tagname
 */
(function(){
	var m, el, els;
	var filters = {
		'#': function(cnxt, expr){
			if ((m = /(\S*)#(\S+)/.exec(expr)) !== _NULL) {
				var tag = ((m[1] === "") ? "*" : m[1]);
				var id = m[2];
				var _node = cnxt;
				while(_node) {
					if(_node.nodeName.toLowerCase() == "body") {
						break;
					}
					if (tag == "*" || _node.nodeName.toLowerCase() == tag) {
						if (_node.id == id) {
							return _node;
						}
					}
					_node = _node.parentNode;
				}
			}
			return _NULL;
		},
		'.': function(cnxt, expr){
			if ((m = /(\S*)\.(\S+)/.exec(expr)) !== _NULL) {
				var tag = ((m[1] === "") ? "*" : m[1]);
				var klass = m[2];
				var _node = cnxt;
				while(_node) {
					if(_node.nodeName.toLowerCase() == "body") {
						break;
					}
					if (tag == "*" || _node.nodeName.toLowerCase() == tag) {
						if (_node.className.indexOf(klass) > -1) {
							return _node;
						}
					}
					_node = _node.parentNode;
				}
			}
			return _NULL;
		},
		'*': function(cnxt, expr){
			var _node = cnxt;
			var map = {};
			var exprs = expr.split(",");
			for (var i=0,len=exprs.length; i<len; i++) {
				map[exprs[i]] = _TRUE;
			}
			while(_node) {
				if(_node.nodeName.toLowerCase() == "body") {
					break;
				}
				if (map[_node.nodeName.toLowerCase()]) {
					return _node;
				}
				_node = _node.parentNode;
			}
			return _NULL;
		}
	};
	
	var find = function(cnxt, expr) {
        var fltr;
        if ((f = /(\.|#|:\w+)/.exec(expr)) !== _NULL) {
            if (filters[f[1]]) {
                fltr = f[1];
            }
        }
        fltr = fltr || "*";
        var result = _NULL;
        if ((result = filters[fltr](cnxt, expr)) != _NULL) {
            return result;
        }
        return _NULL;
    };
	
	var DomFindy = function(context, selector) {
		if ( !selector || typeof selector !== "string" ) {
			return _NULL;
		}
		
		var els = context;
		var exprs = selector.split(" ");
		for(var i=0,len=exprs.length; i<len; i++) {
			if((els = find(els, exprs[i])) == _NULL) {
				return _NULL;
			}
		} 
		return els;
		/*
		if (els.length < 1) {
			return _NULL;
		} else if (els.length < 2) {
			return els[0];
		} else {
			return els;
		}*/
	};
 
	/**
	 * Find Ancestor Element By Css Selector
	 * 
	 * dFindy(element, selector) or dFindy(selector)
	 * ex)
	 *  dFindy($tx("#wrapper"), "div.article")
	 *  dFindy("#wrapper div.article") -> default document
	 */
	_WIN.dFindy = function() {
		var args = arguments;
		if(args.length == 1) {
			throw new Error("need more arguments");
		} else if(args.length == 2) {
			if(args[0].nodeType && typeof (args[1]) === "string") {
				return DomFindy(args[0], args[1]);
			}
		}
		return _NULL;
	};
})();
