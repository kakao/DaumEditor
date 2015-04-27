TrexMessage.addMsg({
	'@embeder.alert': "에디터 상태에서만 삽입할 수 있습니다."
});

/**
 * Trex.EmbedBox
 * 본문에 삽입한 embed들이 저장되는 class 
 * 
 * @class
 * @extends Trex.EntryBox
 * @param {Object} config
 * @param {Object} canvas
 * @param {Object} editor
 */
Trex.EmbedBox = Trex.Class.create({
	/** @ignore */
	$extend: Trex.EntryBox,
	initialize: function() {
	}
});

Trex.install("editor.getEmbedBox & sidebar.getEmbeder & sidebar.getEmbeddedData",
	function(editor, toolbar, sidebar, canvas, config){
		var _embedBox = new Trex.EmbedBox(config, canvas, editor);
		
		sidebar.entryboxRegistry['embedbox'] = _embedBox;
		editor.getEmbedBox = function() {
			return _embedBox;
		};
		sidebar.getEmbeddedData = _embedBox.getEntries.bind(_embedBox);
		
		var _embeders = sidebar.embeders = {};
		sidebar.getEmbeder = function(name) {
			if(_embeders[name] != _NULL) {
				return _embeders[name];
			} else if(arguments.length == 0){
				return _embeders;
			}else{
				return _NULL;
			}
		};
	}
);

Trex.register("new embeders",
	function(editor, toolbar, sidebar, canvas, config){
		var _embedBox = editor.getEmbedBox();
		var _embeders = sidebar.embeders;
		
		for(var i in Trex.Embeder) {
			var _name = Trex.Embeder[i]['__Identity'];
			if (_name) {
				if(!toolbar.tools[_name]){
//					console.log(["No tool '",_name,"', but Embeder '", _name,"' is initialized."].join(""));
				}
				_embeders[_name] = new Trex.Embeder[i](editor, _embedBox, config);
			}
		}
	}
);

Trex.Embeder = Trex.Class.draft({
	$extend: Trex.Actor,
	canResized: _FALSE,
	initialize: function(editor, entryBox, config) {
		this.editor = editor;
		this.canvas = editor.getCanvas();
        this.entryBox = entryBox;
		
		var _config = this.config = TrexConfig.getEmbeder(this.constructor.__Identity, config);
		if(config.pvpage && !!_config.usepvpage) {
			this.pvUrl =  TrexConfig.getUrl(config.pvpage, { "pvname": this.name });
		}
		this.wysiwygonly = ((_config.wysiwygonly != _NULL)? _config.wysiwygonly: _TRUE);
		this.pastescope = _config.pastescope;
		
		this.embedHandler = this.embedHandler.bind(this);
		
		//NOTE: Cuz Specific Case 
		if (this.oninitialized) {
			this.oninitialized.bind(this)(config);
		}
	},
	execute: function() {
		if(this.wysiwygonly && !this.canvas.isWYSIWYG()) {
			alert(TXMSG("@embeder.alert"));
			return;
		}
		
		if(this.clickHandler) {
			this.clickHandler();
		} else {
			try {
				var _url = this.config.popPageUrl;
                var isDocumentDomainDeclaredExplicitly = (document.location.hostname != document.domain);
                if (isDocumentDomainDeclaredExplicitly) {
                    _url = _url + ((_url.indexOf("?") > -1) ? "&" : "?") + "xssDomain=" + document.domain;
                }

				_url = (this.pvUrl? this.pvUrl + ((this.pvUrl.indexOf("?") > -1) ? "&" : "?") + "u="+escape(_url): _url);
				var win = _WIN.open(_url, "at" + this.name, this.config.features);
				win.focus();
			} catch (e) {}
		}
	},
	embedHandler: function(data) {
		this.execAttach(data);
	},
	createEntry: function(data, type) {
		var _embeddedItemType = this.constructor.__Identity;
		if(type){
			_embeddedItemType = type;
		}
		return new Trex.EmbedEntry[_embeddedItemType.capitalize()](this, data);
	},
	execAttach: function(data) {
		var _pastescope = this.pastescope;
		var _html = this.getCreatedHtml(data);
		var _style = this.config.parastyle || this.config.defaultstyle || {};
		this.canvas.execute(function(processor) {
			processor.moveCaretWith(_pastescope);
			processor.pasteContent(_html, _TRUE, _style);
		});
	},
	execReattach: function(/*data, type*/) {
	},
	execReload: function(/*data, type*/) {
	},
	getReloadContent: function(data, content) {
		if(!data.dispElId) {
			return content;
		}
		var _html = this.getCreatedHtml(data);
		var _reg = new RegExp("<(?:img|IMG)[^>]*id=\"?" + data.dispElId + "\"?[^>]*\/?>", "gm");
		if(content.search(_reg) > -1) {
			return content.replace(_reg, _html);
		}
		return content;
	}
});


Trex.register("filter > embeder",
    function(editor) {
        var _embedBox = editor.getEmbedBox();
        var _docparser = editor.getDocParser();
        _docparser.registerFilter(
            'filter/embeder', {
                'text@load': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('text@load', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regLoad, "");
                    });
                    return contents;
                },
                'source@load': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('source@load', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regLoad, entry.dispText);
                    });
                    return contents;
                },
                'html@load': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('html@load', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regLoad, entry.dispHtml);
                    });
                    return contents;
                },
                'text4save': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('text4save', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regText, "");
                    });
                    return contents;
                },
                'source4save': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('source4save', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regText, entry.saveHtml, ["id", "class"]);
                    });
                    return contents;
                },
                'html4save': function(contents){
                    var entries = _embedBox.datalist;
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
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('source2text', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regText, "");
                    });
                    return contents;
                },
                'source2html': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('source2html', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regText, entry.dispHtml);
                    });
                    return contents;
                },
                'html2text': function(contents){
                    var entries = _embedBox.datalist;
                    entries.each(function(entry) {
                        if (entry.loadDataByContent) {
                            entry.loadDataByContent('html2text', contents);
                        }
                        contents = entry.getChangedContent(contents, entry.regHtml, "");
                    });
                    return contents;
                },
                'html2source': function(contents){
                    var entries = _embedBox.datalist;
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
Trex.module("embad entry data", function (editor, toolbar, sidebar, canvas, config) {
    var _embedBox = editor.getEmbedBox();
    var _embeders = sidebar.embeders;
    editor.observeJob(Trex.Ev.__EDITOR_LOAD_DATA_BEGIN, function(jsonData) {
        _embedBox.empty();
        var content = jsonData.content;
        function setEmbedEntrys(embedEntrys, contents) { //NOTE: data format = JSON
            embedEntrys = embedEntrys || [];
            contents = contents || "";
            embedEntrys.each(function(embedEntry){
                try {
                    var _actor = _embeders[embedEntry.embeder];
                    if(_actor) {
                        _actor.execReload(embedEntry.data, contents, embedEntry.type);
                    }
                } catch(ignore) {
                    // 첨부데이터 일부를 정상적으로 불러오지 못했습니다.
                    console.error("첨부데이터 일부를 정상적으로 불러오지 못했습니다:", ignore);
                }
            });
        }
        for(var name in _embeders){
            if(_embeders[name]["onloadData"]){
                setEmbedEntrys(_embeders[name]["onloadData"](content),content)
            }
        }
    });
});