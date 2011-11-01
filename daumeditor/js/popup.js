var CORE_FILES = [
    "scopeVariable.js",
    "global.js",
    /** debugging library */
    "lib/firebug/firebugx.js",
    "lib/stopwatch.js",
    /** common library */
    "lib/txlib.js",
    "lib/hyperscript.js",
    "lib/template.js",
    "lib/dgetty.js",
    "lib/xgetty.js",
    "lib/dateformat.js",
    "lib/rubber.js",
    "lib/swfobject.js",
    /** trex engine & config */
    "trex/trex.js",
    "trex/config.js",
    "trex/event.js",
    /** trex library */
    "trex/lib/markup.js",
    "trex/lib/domutil.js",
    "trex/lib/utils.js",
    "trex/lib/flash.js",
    /** trex mixins */
    "trex/mixins/ajax.js",
    "trex/mixins/observable.js",
    /** trex common */
    "trex/common/blackbox.js",
    "trex/common/noticebox.js",
    "popuputil.js"
];

for (var i = 0; i < CORE_FILES.length; i++) {
    if (CORE_FILES[i]) {
        var src = '/daumeditor/js/' + CORE_FILES[i] + '?v=' + new Date().getTime();
        document.write('<script type="text/javascript" src="' + src + '" charset="utf-8"></script>');
    }
}
