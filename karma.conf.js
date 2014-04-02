// Karma configuration
// Generated on Thu Feb 06 2014 10:10:32 GMT+0900 (대한민국 표준시)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: 'test/',

    proxies: {
        '/':'http://editor7.daum.net/DaumEditor/',
        '/test':'http://editor7.daum.net/DaumEditor/test',
        '/images': 'http://editor7.daum.net/DaumEditor/daumeditor/images/'
    },

    // frameworks to use
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
        "testcase/lib/qunitdiff.js",
        "testcase/lib/qunitpatch.js",
        "../daumeditor/js/trex/header.js",
        "../daumeditor/js/scopeVariable.js",
    /** common library */
        "../daumeditor/js/lib/json2.js",
        "../daumeditor/js/lib/txlib.js",
        "../daumeditor/js/lib/closure-range.js",
        "../daumeditor/js/lib/hyperscript.js",
        "../daumeditor/js/lib/template.js",
        "../daumeditor/js/lib/dgetty.js",
        "../daumeditor/js/lib/dfindy.js",
        "../daumeditor/js/lib/xgetty.js",
        "../daumeditor/js/lib/font_css_property.js",
        //"lib/htmlparser.js",
    /** trex engine & config */
        "../daumeditor/js/trex/eval.js",
        "../daumeditor/js/trex/trex.js",
        "../daumeditor/js/trex/event.js",
        "../daumeditor/js/trex/config.js",
        "../daumeditor/js/trex/message.js",
        "../daumeditor/js/trex/configbuilder.js",
    /** trex library */
        "../daumeditor/js/trex/lib/markup.js",
        "../daumeditor/js/trex/lib/domutil.js",
        "../daumeditor/js/trex/lib/utils.js",
        "../daumeditor/js/trex/lib/imageresizer.js",
        "../daumeditor/js/trex/lib/tableutil.js",
    /** trex mixins */
        "../daumeditor/js/trex/mixins/ajax.js",
        "../daumeditor/js/trex/mixins/observable.js",
        "../daumeditor/js/trex/mixins/colorpallete.js",
        "../daumeditor/js/trex/mixins/cookiebaker.js",
    /** trex common */
        "../daumeditor/js/trex/common/button.js",
        "../daumeditor/js/trex/common/menu.js",
        "../daumeditor/js/trex/common/menuback.js",

    /** editor core */
        "../daumeditor/js/trex/editor.js",
        "../daumeditor/js/trex/toolbar.js",
        "../daumeditor/js/trex/sidebar.js",
        "../daumeditor/js/trex/docparser.js",
        "../daumeditor/js/trex/entryproxy.js",
        "../daumeditor/js/trex/formproxy.js",
        "../daumeditor/js/trex/saver.js",
        "../daumeditor/js/trex/resizer.js",

    /** canvas & panels */
        "../daumeditor/js/trex/history.js",
        "../daumeditor/js/trex/canvas.js",
        "../daumeditor/js/trex/panels/panel.js",
        "../daumeditor/js/trex/panels/wysiwyg/iframeloader.js",
        "../daumeditor/js/trex/panels/wysiwyg/webfontloader.js",
        "../daumeditor/js/trex/panels/wysiwyg/wysiwygrelative.js",
        "../daumeditor/js/trex/panels/wysiwyg/eventbinder.js",
        "../daumeditor/js/trex/panels/wysiwygpanel.js",
        "../daumeditor/js/trex/panels/textareapanel.js",
        "../daumeditor/js/trex/panels/htmlpanel.js",
        "../daumeditor/js/trex/panels/textpanel.js",

    /** processor */
        "../daumeditor/js/trex/processor/marker.js",
        "../daumeditor/js/trex/processor/selection.js",
        "../daumeditor/js/trex/processor/bookmark.js",
        "../daumeditor/js/trex/processor/processor_textarea.js",
        "../daumeditor/js/trex/processor/processor_standard.js",
        "../daumeditor/js/trex/processor/processor_trident.js",
        "../daumeditor/js/trex/processor/processor_trident_standard.js",
        "../daumeditor/js/trex/processor/processor_gecko.js",
        "../daumeditor/js/trex/processor/processor_webkit.js",
        "../daumeditor/js/trex/processor/processor_presto.js",
        /* Processor For P */
        "../daumeditor/js/trex/processor/p/processor_standard_p.js",
        "../daumeditor/js/trex/processor/p/processor_trident_p.js",
        "../daumeditor/js/trex/processor/p/processor_trident_standard_p.js",
        "../daumeditor/js/trex/processor/p/processor_gecko_p.js",
        "../daumeditor/js/trex/processor/p/processor_webkit_p.js",
        "../daumeditor/js/trex/processor/p/processor_presto_p.js",
        "../daumeditor/js/trex/processor/processor.js",

    /** each > filter */
        "../daumeditor/js/trex/filters/converting.js",
        "../daumeditor/js/trex/filters/redundancy.js",

    /** attacher */
        "../daumeditor/js/trex/attachment.js",
        "../daumeditor/js/trex/attachbox.js",
        "../daumeditor/js/trex/attachbox/attachbox_ui.js",
        "../daumeditor/js/trex/attachbox/filecapacity.js",
        "../daumeditor/js/trex/attacher.js",

    /** embeder */
        "../daumeditor/js/trex/embeder.js",
        "../daumeditor/js/trex/embedentry.js",

    /** each > tool */
        "../daumeditor/js/trex/tool/buttonFontTool.js",
        "../daumeditor/js/trex/tool/menuFontTool.js",
        "../daumeditor/js/trex/tool/fontTool.js",
        "../daumeditor/js/trex/tool/switcher.js",
        "../daumeditor/js/trex/tool/switchertoggle.js",
        "../daumeditor/js/trex/tool/fontfamily.js",
        "../daumeditor/js/trex/tool/fontsize.js",
        "../daumeditor/js/trex/tool/bold.js",
        "../daumeditor/js/trex/tool/underline.js",
        "../daumeditor/js/trex/tool/italic.js",
        "../daumeditor/js/trex/tool/strike.js",
        "../daumeditor/js/trex/tool/forecolor.js",
        "../daumeditor/js/trex/tool/backcolor.js",
        "../daumeditor/js/trex/tool/indent.js",
        "../daumeditor/js/trex/tool/indentHelper.js",
        "../daumeditor/js/trex/tool/outdent.js",
        "../daumeditor/js/trex/mixins/alignexecution.js",
        "../daumeditor/js/trex/tool/alignleft.js",
        "../daumeditor/js/trex/tool/aligncenter.js",
        "../daumeditor/js/trex/tool/alignright.js",
        "../daumeditor/js/trex/tool/alignfull.js",

        "../daumeditor/js/trex/tool/insertcells.js",
        "../daumeditor/js/trex/tool/deletecells.js",
        "../daumeditor/js/trex/tool/mergecells.js",
        "../daumeditor/js/trex/tool/cellslineheight.js",
        "../daumeditor/js/trex/tool/cellslinecolor.js",
        "../daumeditor/js/trex/tool/cellslinestyle.js",
        "../daumeditor/js/trex/tool/cellsoutline.js",
        "../daumeditor/js/trex/tool/cellslinepreview.js",
        "../daumeditor/js/trex/tool/tablebackcolor.js",
        "../daumeditor/js/trex/tool/tableedittool.js",
        "../daumeditor/js/trex/tool/tabletemplate.js",

        "../daumeditor/js/trex/tool/lineheight.js",
        "../daumeditor/js/trex/tool/styledlist.js",
        "../daumeditor/js/trex/tool/insertlink.js",
        "../daumeditor/js/trex/tool/richtextbox.js",
        "../daumeditor/js/trex/tool/quote.js",
        "../daumeditor/js/trex/tool/table.js",
        "../daumeditor/js/trex/tool/emoticon.js",
        "../daumeditor/js/trex/tool/redo.js",
        "../daumeditor/js/trex/tool/undo.js",
        "../daumeditor/js/trex/tool/horizontalrule.js",
        "../daumeditor/js/trex/tool/specialchar.js",
        "../daumeditor/js/trex/tool/dictionary.js",
        "../daumeditor/js/trex/tool/background.js",
        "../daumeditor/js/trex/tool/advanced.js",
        "../daumeditor/js/trex/tool/extraButtonDropdown.js",
        "../daumeditor/js/trex/tool/fullscreen.js",

    /** each > attacher */
        "../daumeditor/js/trex/attacher/image.js",
        "../daumeditor/js/trex/attacher/file.js",

    /** each > embeder */
        "../daumeditor/js/trex/embeder/media.js",

    /** each > module */
        "../daumeditor/js/trex/modules/blockingunload.js",
        "../daumeditor/js/trex/modules/alignbuttons.js",
        "../daumeditor/js/trex/modules/canvassize.js",
        "../daumeditor/js/trex/modules/blockingedit.js",
        "../daumeditor/js/trex/modules/saveimagehistory.js",
        // TODO. delete table buttons. but hanmailex?
        // "trex/modules/tablebuttons.js",
        "../daumeditor/js/trex/modules/noticepanel.js",

        "../daumeditor/js/trex/modules/table.js",
        "../daumeditor/js/trex/modules/table/selector.js",
        "../daumeditor/js/trex/modules/table/merge.js",
        "../daumeditor/js/trex/modules/table/insert.js",
        "../daumeditor/js/trex/modules/table/delete.js",

        "../daumeditor/js/trex/modules/table/border.js",
        "../daumeditor/js/trex/modules/table/template.js",

        "../daumeditor/js/trex/modules/tabledragger.js",

        "../daumeditor/js/trex/footer.js",
        "testcase/lib/makeEditor.js",

        "testcase/Assistant.js",
        "testcase/txlib_test.js",

        "testcase/richtextbox_test.js",

        "testcase/fontTool_test.js",
        "testcase/fontExecCommand_test.js",

//    "testcase/bold_test.js",
//    "testcase/underline_test.js",

        "testcase/fontsize_test.js",
        "testcase/fontfamily_test.js",
        "testcase/forecolor_test.js",
        "testcase/backcolor_test.js",

        "testcase/flatten_test.js",
        "testcase/domutil_test.js",

        "testcase/indent_test.js",
        "testcase/outdent_test.js",
        "testcase/backspace_test.js",
        "testcase/styledlist_test.js",
        "testcase/align_test.js",
        "testcase/infinite_loop_test.js",

        "testcase/history_test.js",
        "testcase/wysiwyg_panel_test.js",
        "testcase/processor_test.js",
        "testcase/processor_webkit_test.js",
        "testcase/webfontloader_test.js",
        "testcase/fixing_test.js",
        //"testcase/htmlparser_test.js",
        "testcase/FontCssProperty_test.js",
        "testcase/paste_test.js",
//    "testcase/well_formed_test.js", // not finished
        "testcase/embeder_test.js",
        "testcase/tableedit.js",
        "testcase/range_test.js",
        "testcase/panel_change_test.js"
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
