
TrexConfig.addSidebar('attachbox', {
	show: _FALSE,
	destroy: _FALSE
});

/**
 * Trex.AttachBox
 * Trex.Attachment instance들이 저장되는 class  
 * @class
 * @extends Trex.EntryBox
 */
Trex.AttachBox = Trex.Class.create({
	/** @ignore */
	$extend: Trex.EntryBox,
	isChecked: _FALSE,
	initialize: function() {

	},
	checkAvailableCapacity: function() { //Before Popup
		return _TRUE;
	},
	getAvailableCapacity: function() { //Within Flash
		return _TRUE;
	},
	checkInsertableSize: function() { //Before Attach
		return _TRUE;
	}
});

Trex.install("editor.getAttachBox & sidebar.getAttachments",
	function(editor, toolbar, sidebar, canvas, config){
		var _attachBox = new Trex.AttachBox(config, editor);
		sidebar.entryboxRegistry['attachbox'] = _attachBox;
		editor.getAttachBox = function() {
			return _attachBox;
		};
		sidebar.getAttachments = _attachBox.getEntries.bind(_attachBox);
	}
);

Trex.register("filter > attachers",
	function(editor) {
		var _attachBox = editor.getAttachBox();
		var _docparser = editor.getDocParser();		
		_docparser.registerFilter(
			'filter/attachments', {
				'text@load': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('text@load', contents);
						}
						contents = entry.getChangedContent(contents, entry.regLoad, "");
					});
					return contents;
				},
				'source@load': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('source@load', contents);
						}
						contents = entry.getChangedContent(contents, entry.regLoad, entry.dispText);
					});
					return contents;
				},
				'html@load': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('html@load', contents);
						}
						contents = entry.getChangedContent(contents, entry.regLoad, entry.dispHtml);
					});
					return contents;
				},
				'text4save': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('text4save', contents);
						}
						contents = entry.getChangedContent(contents, entry.regText, "");
					});
					return contents;
				},
				'source4save': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('source4save', contents);
						}
						contents = entry.getChangedContent(contents, entry.regText, entry.saveHtml, ["id", "class"]);
					});
					return contents;
				},
				'html4save': function(contents){
					var entries = _attachBox.datalist;
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('html4save', contents);
						}
						contents = entry.getChangedContent(contents, entry.regHtml, entry.saveHtml, ["id", "class"]);
					});
					return contents;
				},
				'text2source': function(contents){
					return contents;
				},
				'text2html': function(contents){
					return contents;
				},
				'source2text': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('source2text', contents);
						}
						contents = entry.getChangedContent(contents, entry.regText, "");
					});
					return contents;
				},
				'source2html': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('source2html', contents);
						}
						contents = entry.getChangedContent(contents, entry.regText, entry.dispHtml);
					});
					return contents;
				},
				'html2text': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('html2text', contents);
						}
						contents = entry.getChangedContent(contents, entry.regHtml, "");
					});
					return contents;
				},
				'html2source': function(contents){
					var entries = _attachBox.datalist;					
					entries.each(function(entry) {
						if (entry.loadDataByContent) {
							entry.loadDataByContent('html2source', contents);
						}
						contents = entry.getChangedContent(contents, entry.regHtml, entry.dispText, ["id", "class"]);
					});
					return contents;
				}
			}
		);
	}
);
		
Trex.module("push history @when entrybox has changes",
	function(editor, toolbar, sidebar, canvas) {
		var _attachBox = editor.getAttachBox();		

		_attachBox.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, function(entry) {
			canvas.history.saveHistory(
                { deleted: _FALSE },
                { deleted: _TRUE },
                function(data) {
                    entry.deletedMark = data.deleted;
                    _attachBox.fireJobs(Trex.Ev.__ENTRYBOX_ENTRY_REFRESH, entry);
                }
			);
		});
        /*
         * IE에서는 canvas.execute 가 setTimeout 을 통하여 실행이 되기 때문에
         * 이하 실행되어야 하는 로직과 순서가 뒤바뀌는 문제가 있다.
         * saveHistory, injectHistory 와 같이 쌍으로 실행이 되며,
         * 순서 보장이 중요한 작업의 경우에 이를 맞춰주기 위해 뒤에 실행되어야 하는 로직도
         * setTimeout 을 이용한다.
         */
        var runOrRunLaterIfIE = function(fn) {
            if ($tx.msie) {
                setTimeout(function() {
                    fn();
                }, 0);
            } else {
                fn();
            }
        };
		
		_attachBox.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, function(entry) {
			runOrRunLaterIfIE(function() {
                canvas.history.injectHistory(
                    { deleted: _TRUE },
                    { deleted: _FALSE },
                    function(data) {
                        entry.deletedMark = data.deleted;
                        _attachBox.fireJobs(Trex.Ev.__ENTRYBOX_ENTRY_REFRESH, entry);
                    }
                );
            });
		});
	}
);
