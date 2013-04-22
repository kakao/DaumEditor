/**
 * @fileoverview
 * 에디터의 이미지를 선택시 툴바의 align icon을 변경시키는 module
 */

TrexMessage.addMsg({
	'@align.image.align.center': "가운데정렬",
	'@align.image.align.full': "오른쪽글흐름",
	'@align.image.align.left': "왼쪽정렬",
	'@align.image.align.right': "왼쪽글흐름",
	'@align.text.align.center': "가운데정렬 (Ctrl+.)",
	'@align.text.align.full': "양쪽정렬",
	'@align.text.align.left': "왼쪽정렬 (Ctrl+,)",
	'@align.text.align.right': "오른쪽정렬 (Ctrl+/)"
});

Trex.module("Register an eventhandler in order to change align icons upon toolbar when user click a specific image or not.",
	function(editor, toolbar, sidebar, canvas){
		var _imageAlignModeClass = "tx-selected-image";
		var _alignset = [	
			toolbar.tools['alignleft'], toolbar.tools['aligncenter'], toolbar.tools['alignright'], toolbar.tools['alignfull']	
		];
		var _excludes = [
			"txc-2image-c", "txc-3image-c", "txc-footnote", "txc-jukebox", "txc-movie", "txc-gallery", "txc-imazing", "txc-map",
			"txc-file",'txc-emo',"tx-entry-embed", "txc-bgm", "txc-pie"
		];
			
		var _changeButton = function(kind) {
			var _exec = function(tool, kind, title){
				if (!tool) {
					return;
				}
				var _elList = _NULL;
				var _elIcon = _NULL;	
				if(!_elList) {
					_elList = $tom.find(tool.button.elButton, "li");
				}
				if(!_elIcon) {
					_elIcon = $tx(tool.button.elIcon);
				}	
				_elIcon.title = title;
				if(kind == "image") {
					if(!$tx.hasClassName(_elList, _imageAlignModeClass)) {
						$tx.addClassName(_elList, _imageAlignModeClass);
					}
					tool.imageAlignMode = _TRUE;
				} else {
					if($tx.hasClassName(_elList, _imageAlignModeClass)) {
						$tx.removeClassName(_elList, _imageAlignModeClass);
					}
					tool.imageAlignMode = _FALSE;
				}
			};
			_exec(_alignset[0], kind, kind=="image" ? TXMSG("@align.image.align.left") : TXMSG("@align.text.align.left"));
			_exec(_alignset[1], kind, kind=="image" ? TXMSG("@align.image.align.center") : TXMSG("@align.text.align.center"));
			_exec(_alignset[2], kind, kind=="image" ? TXMSG("@align.image.align.right") : TXMSG("@align.text.align.right"));
			_exec(_alignset[3], kind, kind=="image" ? TXMSG("@align.image.align.full") : TXMSG("@align.text.align.full"));
		};
		
		canvas.observeElement([
			{ tag: "body" },
			{ tag: "table" },
			{ tag: "hr" }
		], function() {
			_changeButton("text");	
		});
		
		canvas.observeElement({ tag: "img" },  function(element) {
			var matched = Trex.Util.getMatchedClassName(element, _excludes);
			if(matched) {
				_changeButton("text");
			} else if($tom.find(element, 'button')) {
				_changeButton("text");
			} else {
				_changeButton("image");
			}
		});
	}
);

