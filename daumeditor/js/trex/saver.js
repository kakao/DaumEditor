Trex.install("editor.getSaver & editor.getDataAsJSON & editor.setDataByJSON",
	function(editor, toolbar, sidebar, canvas, config){
		var _saver = new Trex.Save(editor, toolbar, sidebar, canvas, config);
		editor.getSaver = function() {
			return _saver;
		};
		
		editor.getDataAsJSON = function() {
			var _content = canvas.getContent(); // getContent() of current mode
			var _validator = new Trex.Validator();
			if(!_validator.exists(_content)) {
				return _NULL;
			}
			return {
				'inputmode': canvas.getCurrentPanel().getName(),
				'content': _content,
				'attachments': function() {
					var _attachments = sidebar.getAttachments(); // all getAttachments()
					return editor.getEntryProxy().getAttachments(_attachments, _TRUE);
				}(),
				'resultBox': function() {
					var _resultBox = editor.getResultBox();
					var datas = [];
					_resultBox.datalist.each(function(entry){
						datas.push(entry.data);
					});
					return datas;
				}(),
				'formfield': editor.getForm().getFormField()
			};
		};
		
		editor.setDataByJSON = function(jsonData) {
			if(!jsonData) {
				return;
			}
			var _editorMode = canvas.mode;
			var _inputMode = jsonData.inputmode || _editorMode;
			if (_inputMode == 'original') { //save
			} else if(_inputMode != _editorMode) {
				canvas.fireJobs(Trex.Ev.__CANVAS_MODE_INITIALIZE, _editorMode, _inputMode);
				canvas.changeMode(_inputMode);
			}
			
			var _content = jsonData.content;
			
			if(jsonData.attachments) {
				editor.getEntryProxy().setAttachments(jsonData.attachments, _content);
			}
				
			if(_content) {
				_content = editor.getDocParser().convertAtLoad(_content, _editorMode, _inputMode); //onlyHTML
				canvas.initContent(_content);
			}
			
			if (jsonData.resultBox) {
				jsonData.resultBox.each(function(data){
					var _actor;
					_actor = sidebar.searchers[data._meta.type];
					if (_actor) {
						_actor.execReload(data, _content);
					}
				});
			}
			
			sidebar.syncSidebar(); //sync
			
			if(jsonData.formfield) {
				editor.getForm().setFormField(jsonData.formfield);
			}
		};
	}
);

Trex.Save = Trex.Class.create({
	editor: _NULL,
	toolbar: _NULL,
	sidebar: _NULL,
	canvas: _NULL,
	config: _NULL,
	form: _NULL,
	initialize: function(editor, toolbar, sidebar, canvas, config) {
		this.editor = editor;
		this.toolbar = toolbar;
		this.sidebar = sidebar;
		this.canvas = canvas;
		this.config = config;
		this.form = editor.getForm();
		this.docparser = editor.getDocParser();
		this.entryproxy = editor.getEntryProxy();
	},
	save: function() {
		try {
			if (typeof validForm == "function") {
				if (!validForm(this.editor)) {
					return _FALSE;
				}
			}
			if (typeof setForm == "function") {
				if (!setForm(this.editor)) {
					return _FALSE;
				}
			}
			return _TRUE;
		} catch(e) {
			this.editor.fireJobs(Trex.Ev.__RUNTIME_EXCEPTION, e);
			return _FALSE;
		}
	},
	submit: function() {
		if(this.save()) {
			this.editor.fireJobs(Trex.Ev.__ON_SUBMIT, this.editor);
			if ( this.config.save && typeof this.config.save.onSave == "function" ){
				var externalSaveHandler = this.config.save.onSave;
				externalSaveHandler();
			} else {
				this.form.submit();
			}
		}		
	},
	getContent: function(outputMode) {
		var _canvas = this.canvas;

		//에디터모드, 출력모드
		var _editorMode = _canvas.mode;
		var _outputMode = outputMode || "original";
		
		var _content = _canvas.getContent(); // getContent() of current mode
		_content = this.docparser.convertAtSave(_content, _editorMode, _outputMode);
		
		return _content;
	},
	getAttachments: function(type, all) {
		all = all || _FALSE;
		var _attachments = this.sidebar.getAttachments(type); // all getAttachments()
		return this.entryproxy.getAttachments(_attachments, all);
	},
	getEmbeddedData: function(type) {
		return this.sidebar.getEmbeddedData(type);
	},
	getResults: function(type) {
		return this.sidebar.getResults(type);
	},
	/*
		data = {
			content: "string",
			inputmode: "string",
			attachments: [{
				attacher: "string",
				data: {object}
			}]
		}
	*/
	load: function(jsonData) { //NOTE: data format = JSON
		jsonData = {
			'inputmode': (!jsonData.inputmode || jsonData.inputmode == 'html')? 'original': jsonData.inputmode,
			'content': function() {
				var _contentObj = jsonData.content;
				if (typeof _contentObj == "string") {
					return jsonData.content;
				} else if (_contentObj && _contentObj.nodeType && (_contentObj.nodeType == 1)) {
					return jsonData.content.value;
				} else {
					return '';
				}
			}(),
			'attachments': jsonData.attachments
		};
        this.editor.fireJobs(Trex.Ev.__EDITOR_LOAD_DATA_BEGIN, jsonData);
		if (!jsonData) {
			throw new Error("[Exception]Trex.Save : not exist argument(data)");
		}
		if (typeof loadForm == "function") {
			loadForm(this.editor, jsonData);
		}
		
		try { //#FTDUEDTR-1111
			this.setDataByJSONToEditor(jsonData);
		} catch (error) {
			alert(' - Error: ' + error.message + '\n소스보기 모드로 전환합니다.\n잘못된 HTML이 있는지 확인해주세요.');
			jsonData.inputmode = Trex.Canvas.__HTML_MODE;
            try {
                this.setDataByJSONToEditor(jsonData);
            } catch(ignore) {}
		}
		
		if (typeof postLoad == "function") {
			postLoad(this.editor, jsonData);
		}
        this.editor.fireJobs(Trex.Ev.__EDITOR_LOAD_DATA_END);
	},
	setDataByJSONToEditor: function (jsonData) {
		this.editor.setDataByJSON(jsonData);
	},
	makeField: function() {
		var _sidebar = this.sidebar;
		var _form = this.form;

		//NOTE: create field content
		var _content = this.getContent();
		_form.createField(tx.textarea({ name: "tx_content", style: { display: "none" } }, _content));

		//NOTE: create field attach
		var _fields = _sidebar.getFields();
		_fields.each(function(field) {
			_form.createField(tx.input({ type: "hidden", name: field.name, value: field.value }));
		});
	}

});

