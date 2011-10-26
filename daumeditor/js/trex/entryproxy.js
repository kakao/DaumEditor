Trex.install("editor.getEntryProxy",
	function(editor, toolbar, sidebar, canvas, config){
		var _entryproxy = new Trex.EntryProxy(editor, sidebar, config);
		editor.getEntryProxy = function() {
			return _entryproxy;
		};
	}
);

Trex.EntryProxy =Trex.Class.create( {
	initialize : function(editor, sidebar,  config){
		this.editor = editor;
		this.sidebar = sidebar;
		this.config = config;
	},
	/**
	 * For loadEntriesAtRestore, loadEntriesAtModify
	 */
	commands: {},
	registerCommand: function(name, command){
		this.commands[name] = command;
	},
	getcommand: function(name){
		return this.commands[name];
	},
	executeCommand: function(cmd, data){
		for(var i in this.commands){
			var command = this.commands[i];
			if(command[cmd]){
				command[cmd](data);	
			}
		}
	},
	setAttachments: function(attachments, contents) { //NOTE: data format = JSON
		attachments = attachments || [];
		contents = contents || "";
		
		var _entrybox = this.editor.getAttachBox();
		_entrybox.empty();
		
		var _actors = this.sidebar.getAttacher();
		attachments.each(function(attachment){
			var _actor = _actors[attachment.attacher];
			if(_actor) {
				_actor.execReload(attachment.data, contents, attachment.type);
			}
		});
	},
	getAttachments: function(attachments, all) {
		all = !!all;
		var _attachments = [];
		attachments.each(function(attachment){
			if(attachment.deletedMark) {
				return;
			}
			if(all || attachment.existStage) {
				_attachments.push({
					attacher: attachment.actor.name,
					existStage: attachment.existStage,
					data: Object.extend(attachment.data, {
						tmpSeq: attachment.dataSeq
					}) //html mode
				});
			}
		});
		return _attachments;
	}
} );
	


