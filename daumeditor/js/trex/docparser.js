Trex.install("editor.getDocParser",
	function(editor, toolbar, sidebar, canvas, config){
		var _docparser = new Trex.Docparser(editor, sidebar, config);
		editor.getDocParser = function() {
			return _docparser;
		};
	}
);

Trex.Docparser =Trex.Class.create( {
		initialize : function(editor, sidebar,  config){
			this.editor = editor;
			this.sidebar = sidebar;
			this.config = config;
		},
		filters: {},
		/**
		 * register contents converting filter 
		 * 
		 * 	original = DB에 저장되는 컨텐츠
		 * 	html = wysiwyg 모드에서 보이는 컨텐츠
		 * 	source = source 모드에서 보이는 컨텐츠
		 * 	text = text 모드에서 보이는 컨텐츠
		 * 
		 * @example
		 * editor.getDocParser().registerFilter(
				'filter/converting', {
					'text@load': function(contents){ // orginal -> text
						return contents;
					},
					'source@load': function(contents){ // orginal -> source
						return contents;
					},
					'html@load': function(contents){ // orginal -> html
						return contents;
					},
					'text4save': function(contents){ // text -> orginal 
						return contents;
					},
					'source4save': function(contents){ // source -> orginal 
						return contents;
					},
					'html4save': function(contents){ // html -> orginal 
						return contents;
					},
					'text2source': function(contents){ // text -> source
						return contents;
					},
					'text2html': function(contents){ // text -> html
						return contents;
					},
					'source2text': function(contents){ // source -> text
						return contents;
					},
					'source2html': function(contents){ // source -> html
						return contents;
					},
					'html2text': function(contents){ // html -> text
						return contents;
					},
					'html2source': function(contents){ // html -> source
						return contents;
					}
				}
			);
		 */
		registerFilter: function(name, filter){
			this.filters[name] = filter;
		},
		getFilter: function(name){
			return this.filters[name];
		},
		executeFilters: function (cmd, contents) {
			var filters = this.filters;
			["before " + cmd, cmd, "after " + cmd].each(function (cmd) {
				var name, filter;
				for (name in filters) {
					if (filters.hasOwnProperty(name)) {
						filter = filters[name];
						if (filter[cmd]) {
							contents = filter[cmd](contents);	
						}
					}
				}
			});
			return contents;
		},
		getContentsAtChangingMode: function(contents, oldMode, newMode) {
			if (oldMode == newMode) {
				return contents;
			}
			contents = contents.trim() || "";
			return this.executeFilters(oldMode.concat("2").concat(newMode), contents);
		},
		convertAtLoad: function(contents, editorMode, inputMode) { // For Display
			/*
			 * DB에 저장된 컨텐츠
			 *  > original, text
			 */
			if(inputMode == 'original') { //original 컨텐츠 변환
				contents = this.executeFilters(editorMode.concat('@load'), contents);
			} else { //그외 모드, 자동저장은 변환없이 저장됨.
				if(editorMode != inputMode) {
					contents = this.executeFilters(inputMode.concat("2").concat(editorMode), contents);
				}
			}
			return contents;
		},
		convertAtSave: function(contents, editorMode, outputMode) { // For Save
			if (outputMode == 'original') { //original 컨텐츠 변환
				contents = this.executeFilters(editorMode.concat('4save'), contents);
			} else { //그외 모드, 자동저장은 변환없이 저장됨.
				if (editorMode != outputMode) {
					contents = this.executeFilters(editorMode.concat("2").concat(outputMode), contents);
				}
			}
			return contents;
		},
		/* 외부에서 참조할 컨텐츠 변환 필터명 시작 */
		text2source: function(contents) {
			return this.executeFilters("text2source", contents);
		},
		text2html: function(contents) {
			if (contents === "") {
				return $tom.EMPTY_PARAGRAPH_HTML;
			}
			return this.executeFilters("text2html", contents);
		},
		source2text: function(contents) {
			return this.executeFilters("source2text", contents);
		},
		source2html: function(contents) {
			if (contents === "") {
				return $tom.EMPTY_PARAGRAPH_HTML;
			}
			return this.executeFilters("source2html", contents);
		},
		html2text: function(contents) {
			return this.executeFilters("html2text", contents);
		},
		html2source: function(contents) {
			return this.executeFilters("html2source", contents);
		}
		/* 외부에서 참조할 컨텐츠 변환 필터명 끝 */
	} 
);
