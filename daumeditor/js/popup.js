var CORE_FILES = [
	"scopeVariable.js",
	/** common library */
	"lib/txlib.js",
	"lib/hyperscript.js",
	"lib/template.js",
	"lib/dgetty.js",
	"lib/xgetty.js",
	"lib/rubber.js",
	/** trex engine & config */
	"trex/trex.js",
	"trex/config.js",
	"trex/event.js",
	/** trex library */
	"trex/lib/markup.js",
	"trex/lib/domutil.js",
	"trex/lib/utils.js",
	/** trex mixins */
	"trex/mixins/ajax.js",
	"trex/mixins/observable.js",
	/** trex common */
	"popuputil.js"
];

try {
	var urlParams = {};
	(function () {
		var e,
			a = /\+/g,  // Regex for replacing addition symbol with a space
			r = /([^&=]+)=?([^&]*)/g,
			d = function (s) {
				return decodeURIComponent(s.replace(a, " "));
			},
			q = window.location.search.substring(1);

		while (e = r.exec(q))
			urlParams[d(e[1])] = d(e[2]);
	})();
	if (urlParams.xssDomain) {
		document.domain = urlParams.xssDomain;
	}
} catch (e) {
	// ignore error when loaded from build script
}

try {
	var basePath = opener.EditorJSLoader.getJSBasePath();
} catch (e) {
	// ignore error when loaded from build script
}

for (var i = 0; i < CORE_FILES.length; i++) {
	if (CORE_FILES[i]) {
		var src = basePath + CORE_FILES[i] + '?v=' + new Date().getTime();
		document.write('<script type="text/javascript" src="' + src + '" charset="utf-8"></script>');
	}
}