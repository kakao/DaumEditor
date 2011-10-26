var EditorConfigBuilder = function (defaultConfigObject /* optional */) {
	this.config = defaultConfigObject || {};
};

EditorConfigBuilder.prototype.set = function (path, value) {
	var splitedPath = path.split(".");
	var lastKey = splitedPath[splitedPath.length - 1];
	
	var curObj = this.config;
	for (var i = 0; i < splitedPath.length - 1; i++) {
		var key = splitedPath[i];
		if (!curObj[key]) {
			curObj[key] = {};	
		}
		curObj = curObj[key];
	}
	
	if ($tx.isPrimitiveType(value)) {
		curObj[lastKey] = value;
	} else {
		if (!curObj[lastKey]) {
			curObj[lastKey] = {};
		}
		$tx.deepcopy(curObj[lastKey], value);
	}
};

EditorConfigBuilder.prototype.getConfig = function () {
	return this.config;
};

_WIN.EditorConfigBuilder = EditorConfigBuilder;