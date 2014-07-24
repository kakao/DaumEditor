// TODO duplicated with editor_common.js
var DEBUG = 1;
var CORE_FILES = [
	"scopeVariable.js",
	/** common library */
	"lib/json2.js",
	"lib/txlib.js",
	"lib/closure-range.js",
	"lib/hyperscript.js",
	"lib/template.js",
	"lib/dgetty.js",
	"lib/dfindy.js",
	"lib/xgetty.js",
	"lib/font_css_property.js",
	//"lib/htmlparser.js",
	/** trex engine & config */
	"trex/eval.js",
	"trex/trex.js",
	"trex/event.js",
	"trex/config.js",
	"trex/message.js",
	"trex/configbuilder.js",
	/** trex library */
	"trex/lib/markup.js",
	"trex/lib/domutil.js",
	"trex/lib/utils.js",
	"trex/lib/imageresizer.js",
	"trex/lib/tableutil.js",
	/** trex mixins */
	"trex/mixins/ajax.js",
	"trex/mixins/observable.js",
	"trex/mixins/colorpallete.js",
	"trex/mixins/cookiebaker.js",
	/** trex common */
	"trex/common/button.js",
	"trex/common/menu.js",
	"trex/common/menuback.js",

	/** editor core */
	"trex/editor.js",
	"trex/toolbar.js",
	"trex/sidebar.js",
	"trex/docparser.js",
	"trex/entryproxy.js",
	"trex/formproxy.js",
	"trex/saver.js",
	"trex/resizer.js",

	/** canvas & panels */
	"trex/history.js",
	"trex/canvas.js",
	"trex/panels/panel.js",
	"trex/panels/wysiwyg/iframeloader.js",
	"trex/panels/wysiwyg/webfontloader.js",
	"trex/panels/wysiwyg/wysiwygrelative.js",
	"trex/panels/wysiwyg/eventbinder.js",
	"trex/panels/wysiwygpanel.js",
	"trex/panels/textareapanel.js",
	"trex/panels/htmlpanel.js",
	"trex/panels/textpanel.js",

	/** processor */
	"trex/processor/marker.js",
	"trex/processor/selection.js",
	"trex/processor/bookmark.js",
	"trex/processor/processor_textarea.js",
		"trex/processor/processor_standard.js",
		"trex/processor/processor_trident.js",
		"trex/processor/processor_trident_standard.js",
		"trex/processor/processor_gecko.js",
		"trex/processor/processor_webkit.js",
		"trex/processor/processor_presto.js",
			/* Processor For P */
			"trex/processor/p/processor_standard_p.js",
			"trex/processor/p/processor_trident_p.js",
			"trex/processor/p/processor_trident_standard_p.js",
			"trex/processor/p/processor_gecko_p.js",
			"trex/processor/p/processor_webkit_p.js",
			"trex/processor/p/processor_presto_p.js",
	"trex/processor/processor.js",

	/** each > filter */
	"trex/filters/converting.js",
	"trex/filters/redundancy.js",

	/** attacher */
	"trex/attachment.js",
	"trex/attachbox.js",
	"trex/attachbox/attachbox_ui.js",
	"trex/attachbox/filecapacity.js",
	"trex/attacher.js",

	/** embeder */
	"trex/embeder.js",
	"trex/embedentry.js",

	/** each > tool */
	"trex/tool/buttonFontTool.js",
	"trex/tool/menuFontTool.js",
	"trex/tool/fontTool.js",
	"trex/tool/switcher.js",
	"trex/tool/switchertoggle.js",
	"trex/tool/fontfamily.js",
	"trex/tool/fontsize.js",
	"trex/tool/bold.js",
	"trex/tool/underline.js",
	"trex/tool/italic.js",
	"trex/tool/strike.js",
	"trex/tool/forecolor.js",
	"trex/tool/backcolor.js",
	"trex/tool/indent.js",
	"trex/tool/indentHelper.js",
	"trex/tool/outdent.js",
	"trex/mixins/alignexecution.js",
	"trex/tool/alignleft.js",
	"trex/tool/aligncenter.js",
	"trex/tool/alignright.js",
	"trex/tool/alignfull.js",

	"trex/tool/insertcells.js",
	"trex/tool/deletecells.js",
	"trex/tool/mergecells.js",
	"trex/tool/cellslineheight.js",
	"trex/tool/cellslinecolor.js",
	"trex/tool/cellslinestyle.js",
	"trex/tool/cellsoutline.js",
	"trex/tool/cellslinepreview.js",
	"trex/tool/tablebackcolor.js",
	"trex/tool/tableedittool.js",
	"trex/tool/tabletemplate.js",

	"trex/tool/lineheight.js",
	"trex/tool/styledlist.js",
	"trex/tool/insertlink.js",
	"trex/tool/richtextbox.js",
	"trex/tool/quote.js",
	"trex/tool/table.js",
	"trex/tool/emoticon.js",
	"trex/tool/redo.js",
	"trex/tool/undo.js",
	"trex/tool/removeformat.js",
	"trex/tool/horizontalrule.js",
	"trex/tool/specialchar.js",
	"trex/tool/dictionary.js",
	"trex/tool/background.js",
	"trex/tool/advanced.js",
	"trex/tool/extraButtonDropdown.js",
	"trex/tool/fullscreen.js",

	/** each > attacher */
	"trex/attacher/image.js",
	"trex/attacher/file.js",

	/** each > embeder */
	"trex/embeder/media.js",

	/** each > module */
	"trex/modules/blockingunload.js",
	"trex/modules/alignbuttons.js",
	"trex/modules/canvassize.js",
	"trex/modules/blockingedit.js",
	"trex/modules/saveimagehistory.js",
	// TODO. delete table buttons. but hanmailex?
	// "trex/modules/tablebuttons.js",
	"trex/modules/noticepanel.js",

	"trex/modules/table.js",
	"trex/modules/table/selector.js",
	"trex/modules/table/merge.js",
	"trex/modules/table/insert.js",
	"trex/modules/table/delete.js",

	"trex/modules/table/border.js",
	"trex/modules/table/template.js",

    "trex/modules/pageupdown.js",
	"trex/modules/tabledragger.js",
    "trex/modules/exiteditor.js"
];
var DE_PREFIX = EditorJSLoader.getJSBasePath("editor.js");
EditorJSLoader.loadModule(DE_PREFIX + "development_environments.js");