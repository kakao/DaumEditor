/**
 * XMLGetty - Very Very Simple XML Dom Selector Engine By XPath
 * - xpath
 */
(function(){
	
	var XMLGetty = function(node){
		this.selectSingleNode = function(path) {
			if(!node) {
				return _NULL;
			}
			return node.selectSingleNode(path);
		};
		this.selectNodes = function(path) {
			if(!node) {
				return [];
			}
			return node.selectNodes(path);
		};
		this.getAttributeNode = function(name) {
			if(!node) {
				return _NULL;
			}
			return node.getAttributeNode(name);
		};
		this.hasChildNodes = function() {
			if(!node) {
				return _FALSE;
			}
			return node.hasChildNodes();
		};
		this.text = node? (node.textContent || node.text) : _NULL;
		this.type = node? node.nodeType : 0;
		this.name = (node && node.nodeType == 1)? (node.nodeName || "") : "";
		return this;
	};
	
	XMLGetty.prototype = {
		'getValueOrDefault': function(val, defval) {
			if (val === "") {
				return defval;
			} else {
				if (typeof(defval) === 'number') {
					return (isNaN(val) ? 0 : parseInt(val));
				} else if (typeof(defval) === 'boolean') {
					return !!val;
				} else {
					return val;
				}
			}
		},
			
		'xText': function(defval){
			defval = defval || "";
			var val = this.text;
			val = (val || "").trim();
			
			return this.getValueOrDefault(val, defval);
		},
		'xAttr': function(name, defval){
			defval = defval || "";
			var attr = this.getAttributeNode(name);
			var val = (!attr) ? "" : attr.nodeValue.trim();

			return this.getValueOrDefault(val, defval);
		},
		'xGet': function(path){
			return xGetty(this, path);
		},
		'xGets': function(path){
			return xGetties(this, path);
		}
	};
	
	var ieXmlParsers = [
		"MSXML2.DOMDocument.6.0",
		"MSXML2.DOMDocument.5.0",
		"MSXML2.DOMDocument.4.0",
		"MSXML4.DOMDocument",
		"MSXML3.DOMDocument",
		"MSXML2.DOMDocument",
		"MSXML.DOMDocument",
		"Microsoft.XmlDom"
	];
	/**
	 * xCreate : Get XML DOM From XML Text
	 * @example
	 * var _xmlDoc = xCreate("<data><name>hopeserver</name></data>");
	 * 
	 * @param {string} text - responseText
	 * @return node 
	 * 			extend function as xText, xAttr, xGet, xGets
	 */
	_WIN.xCreate = function(text) {
		if($tx.msie) {
			var xObj = (function() {
				var _xObj = _NULL;
				for(var i=0; i<ieXmlParsers.length; i++) {
					try {
						_xObj = new ActiveXObject(ieXmlParsers[i]);
					} catch (e) {}
					if(_xObj !== _NULL) {
						return _xObj;
					}
				}
				return _NULL;
			})();
			if(xObj === _NULL){
				return _NULL;
			}
			xObj.async = _FALSE;
			xObj.loadXML(text);
			if (xObj.parseError.errorCode !== 0) {
				return _NULL;
			}
			return new XMLGetty(xObj);
		} else {
			var oParser = new DOMParser();
			var xObj = oParser.parseFromString(new String(text), "text/xml");
			return new XMLGetty(xObj);
		}
	};

	/**
	 * xGetty : Get Node By Xpath
	 * @example
	 * var _node = xGetty(node, "/rss/items/title")
	 * 
	 * @param {element} node - node
	 * @param {string} path - xpath expression
	 * 
	 * @return node 
	 * 			node extends function as xText, xAttr, xGet, xGets
	 */
	_WIN.xGetty = function(node, path) {
		if(node === _NULL) {
			return _NULL;
		}
		return new XMLGetty(node.selectSingleNode(path));
	};
	
	/**
	 * xGetties : Get Node List By Xpath
	 * @example
	 * var _nodelist = xGetties(node, "/rss/items/title")
	 * 
	 * @param {element} node - node
	 * @param {string} path - xpath expression
	 * 
	 * @return node array
	 * 			each node extends function as xText, xAttr, xGet, xGets
	 */
	_WIN.xGetties = function(node, path) {
		if(node === _NULL) {
			return [];
		}
		var list = [];
		var nodes = node.selectNodes(path);
		for(var i=0, len=nodes.length; i<len; i++) {
			list.push(new XMLGetty(nodes[i]));
		}
		return list;
	};

})();