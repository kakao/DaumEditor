/**
 * @fileoverview 
 * Trex.Sidebar, Trex.EntryBox, Trex.Entry, Trex.Actor를 포함하고 있다.  
 */

/**
 * 에디터와 외부 component사이의 연동을 하는 class
 * 
 * @class
 * @param {object} editor
 * @param {object} config
 */
Trex.Sidebar = Trex.Class.create({
	/** @ignore */
	$const: {
		__REG_ENTRY_ATTR_PAIR_Q: new RegExp("([\\w]+)=\"([^\"]+)\"", "g"),
		__REG_ENTRY_ATTR_PAIR_NQ: new RegExp("([\\w]+)=([\\w]+)", "g")
	},
	/** @ignore */
	$mixins: [
		Trex.I.JobObservable
	],
	entryboxRegistry: _NULL,
	initialize: function(editor) {
		var _canvas = editor.getCanvas();

		this.entryboxRegistry = {};
		this.getFields = function() {
			var fields = [];
			for(var i in this.entryboxRegistry){
				var entrybox = this.entryboxRegistry[i];
				fields = fields.concat(entrybox.getFields());
			}
			return fields;
		};

		this.syncSidebar = function() {
			var _content = _canvas.getContent();
			for(var i in this.entryboxRegistry){
				this.entryboxRegistry[i].syncBox(_content);
			}
		};
		this.emptyEntries = function() {
			for(var i in this.entryboxRegistry){
				this.entryboxRegistry[i].empty();
			}
		};

		_canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DELETE_SOMETHING, function() {
			this.syncSidebar();
		}.bind(this));
	}
});


/**
 * Trex.entryBox
 * @class
 */
Trex.EntryBox = Trex.Class.draft({
	/** @ignore */
	$mixins: [
		Trex.I.JobObservable
	],
	autoSeq: 0,
	datalist: [],
	initialize: function() {
		throw new Error("[Exception]Trex.EntryBox : not implements function(initialize)");
	},
	newSeq: function() {
		return (++this.autoSeq);
	},
	syncSeq: function(existedSeq) {
		this.autoSeq = (existedSeq > this.autoSeq)? existedSeq: this.autoSeq;
		return existedSeq;
	},
	empty: function() {
		this.fireJobs(Trex.Ev.__ENTRYBOX_ALL_ENTRY_REMOVED);
		this.datalist = [];
	},
	append: function(entry) {
		this.datalist.push(entry);
		this.fireJobs(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, entry);
	},
	modify: function(entry) {
		this.fireJobs(Trex.Ev.__ENTRYBOX_ENTRY_MODIFIED, entry);
	},
	remove: function(entry) {
		entry.deletedMark = _TRUE;
		this.fireJobs(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, entry);
	},
	syncBox: function(content) {
		this.datalist.each(function(entry) {
			entry.execSync(content);
		});
	},
	getFields: function() {
		var _fields = [];
		this.datalist.each(function(entry) {
			_fields.push(entry.getField());
		});
		return _fields.findAll(function(field) {
			return (field != _NULL);
		});
	},
	getEntries: function(name) {
		if(!name) { //all file
			return this.datalist;
		} 
		var _entries = [];
		this.datalist.each(
			function(entry){
				if(entry.type == name){
					_entries.push(entry);
				}
			}
		);
		return _entries;
	}
});

/**
 * Trex.Entry
 * @class 
 */
Trex.Entry = Trex.Class.draft({
	/** @ignore */
	$mixins: [
		Trex.I.JobObservable
	],
	existStage: _FALSE,
	deletedMark: _FALSE,
	initialize: function(/*actor, canvas, entryBox, config*/) {
		throw new Error("[Exception]Trex.Entry : not implements function(initialize)");
	},
	setExistStage: function(existStage) {
		this.existStage = existStage;
	},
	execRegister: function() {
		this.register();
		this.entryBox.append(this);
		this.setExistStage(_TRUE);
	},
	execReload: function() {
		if(this.reload) {
			this.reload();
		} 
		this.entryBox.append(this);
		this.exchangeHandlerAtReload();
	},
	execRemove: function() {
		this.remove();
		this.entryBox.remove(this);
	},
	execReplace: function(oldReg) { 
		this.replace(oldReg);
		this.entryBox.modify(this);
		this.setExistStage(_TRUE);
	},
	execAppend: function() {
		this.register();
		this.setExistStage(_TRUE);
	},
	execSync: function(content) {
		this.setExistStage(this.checkExisted(content));
	},
	checkExisted: function(content) {
		if(this.canvas.isWYSIWYG()) {
			return (content.search(this.regHtml) > -1);
		} else {
			return (content.search(this.regText) > -1);
		}
	},
	getChangedContent: function(content, rex, str, param) {
		var _existStage = _FALSE;
		if(content.search(rex) > -1) {
			_existStage = _TRUE;
			if (this.actor.canResized) { 
				content = this.getChangedContentWithAttr(content, rex, str, param);
			} else {
				content = content.replace(rex, str);
			}
		}
		this.setExistStage(_existStage);
		return content;
	},
	getChangedContentFromHtml: function(content) {
		return this.getChangedContent(content, this.regHtml, this.dispText, ["id", "class"]);
	},
	getChangedContentToHtml: function(content) {
		return this.getChangedContent(content, this.regText, this.dispHtml);
	},
	getChangedContentAtSave: function(content) { //Only HTML
		return this.getChangedContent(content,  this.regHtml, this.saveHtml, ["id", "class"]);
	},
	getChangedContentAtLoad: function(content) { //Only HTML
		return this.getChangedContent(content, this.regLoad, this.dispHtml);
	},
	getChangedContentWithAttr: function(content, reg, disp, excepts) {
		excepts = excepts || [];
		var _attrMap = Trex.Util.getAllAttributes(disp);
				
		var _getChangedTag = function(source) {
			var _tag = Trex.Util.getMatchValue(/<([a-z]*)/i, disp, 1);
			var _attr = ["<"+_tag.toLowerCase()];
			var _overMap = Trex.Util.getAllAttributes(source);

			for(var _name in _attrMap) {
				if (["width", "height"].contains(_name)) {
					if(!_overMap[_name]) {
						_attr.push(_name + "=\"" + _attrMap[_name] + "\"");
					}
				} else {
					_attr.push(_name + "=\"" + _attrMap[_name] + "\"");
				}
			}
			
			for(var _name in _overMap) {
				if(!excepts.contains(_name)) {
					if (["width", "height"].contains(_name)) {
						_attr.push(_name + "=\"" + _overMap[_name] + "\"");
					} else if(!_attrMap[_name]) {
						_attr.push(_name + "=\"" + _overMap[_name] + "\"");
					}
				}
			}
			_attr.push("/>");
			return _attr.join(" "); 
		};
		
		var _orgContent = content;
		var _matchs;
		reg.lastIndex = 0;
		while ((_matchs = reg.exec(_orgContent)) != _NULL) {
			var _textOrg = _matchs[0];
			var _dispTrans = _getChangedTag(_textOrg);
			var _regOrg = _textOrg.getRegExp();
			content = content.replace(new RegExp(_regOrg, "gmi"), _dispTrans);
		}
		return content;
	},
	getField: function() {
		if(!this.field) {
			return _NULL;
		}
		return {
			name: this.field.name, 
			value: [this.field.value, this.existStage].join('|')
		};
	},
	exchangeHandlerAtReload: function(){}
});

/**
 * Trex.Actor
 * @class
 */
Trex.Actor = Trex.Class.draft({
	/** @ignore */
	$mixins: [
		Trex.I.JobObservable
	],
	isDisabled: _FALSE,
	initialize: function(/*config, canvas*/) {
		throw new Error("[Exception]Trex.Actor : not implements function(initialize)");
	},
	execAttach: function(data, type) {
		var _entry = this.createEntry(this.getDataForEntry(data), type);
		_entry.execRegister();
		this.canvas.fireJobs('canvas.' + (type || this.constructor.__Identity) + '.added', _entry);
	},
	getDatalist: function(){
		return this.entryBox.getEntries(this.name);
	},
	execReattach: function(data, type) {
		var datalist = this.getDatalist();
		var parsedData = this.getDataForEntry(data);
		if(datalist.length < 1) {
			var _entry = this.createEntry(parsedData, type);
			_entry.execRegister();
		} else {
			var _entry = datalist[0];
			var _oldReg = {
				regHtml: _entry.regHtml,
				regText: _entry.regText
			};
			_entry.setProperties(parsedData);
			_entry.execReplace(_oldReg);
		}
	},
    execReload: function(data, content, type) {
        var _dataForEntry = this.getDataForEntry(data, content);
        if (_dataForEntry) { // FTDUEDTR-1361
            var _entry = this.createEntry(_dataForEntry, type);
            _entry.execReload();
        }
    },
	existEntry: function() {
        var list = this.getDatalist().findAll(function(entry) {
            return entry.deletedMark != _TRUE;
        });
		return list.length !== 0;
	},
	getFirstEntryData: function() {
        var list = this.getDatalist().findAll(function(entry) {
            return entry.deletedMark != _TRUE;
        });
		return ((list.length == 0)? _NULL: list[0].data);
	}
});
