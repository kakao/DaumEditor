var DEVELLIBS = [
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
    "popuputil.js",
    '' /*dummy*/
];

var daumx = [
    "daumx/common/logger.js",
    "daumx/common/daumlogin.js",
    '' /*dummy*/
];
DEVELLIBS = DEVELLIBS.concat(daumx);

for (var i = 0; i < DEVELLIBS.length; i++) {
    if (DEVELLIBS[i]) {
        var src = '/daumeditor/js/' + DEVELLIBS[i] + '?v=' + new Date().getTime();
        document.write('<script type="text/javascript" src="' + src + '" charset="utf-8"></script>');
    }
}
