
Trex.I.CookieBaker = Trex.Faculty.create({
	cookieName: _NULL,
	cookieValue: _NULL,
	initCookie: function(name, maxCnt) {
		this.cookieName = name;
		this.cookieValue = function () {
		    var cookies = _DOC.cookie.split(';');
		    for(var i=0; i<cookies.length; i++){
		        var cookie=cookies[i].replace(/^\s+/, '');
		        if (cookie.indexOf(name+'=')==0) return cookie.substring(name.length+1);
		    }
		    return _NULL;
		}() || "";
		this.maxCnt = maxCnt || 3;
	},
	writeCookie: function(value, days){
		var name = this.cookieName, exp;
	    if(days){
            var time = new Date();
            time.setTime(new Date().getTime()+days*24*60*60*1000);
	        exp = '; expires='+time.toGMTString();
	    }else{
	        exp='';
	    }
		if (value === _NULL) {//NOTE: #FTDUEDTR-888
			value = '';
		}
		_DOC.cookie=name+"="+value+exp+"; path=/";
		this.cookieValue = value;
	},
	readCookie: function () {
		if (this.cookieValue === _NULL+'') {//NOTE: #FTDUEDTR-888
			return _NULL;
		}
	    return this.cookieValue;
	},
	eraseCookie: function () {
		var name = this.cookieName;
	    this.writeCookie(name, "", -1);
	},
	extractOptions: function(options, value) {
		var _optionMap = options.toMap('data');
		var _values = [];
		value.split('|').compact().each(function(data) {
			if(_optionMap[data]) {
				_values.push(_optionMap[data]);
			}
		}.bind(this));
		return _values;
	},
	mergeValues: function(value, data) {
		var _values = value.split('|').compact();
		if(_values.contains(data)) {
			return value;
		}
		if(_values.length >= this.maxCnt) {
			_values.pop();
		}
		_values.unshift(data);
		return _values.join('|');
	}
});
