/*
 * 이미지 드래그엔 드롭 구현
 */
/**
 * @fileoverview img drop
 *
 * @author sungwon
 */

/**
 * @namespace
 */

Trex.module("new Trex.ImgDrop", function(editor, toolbar, sidebar, canvas, config){
	var _initializedId = config.initializedId || ""; 
	var cfg = TrexConfig.get("imgdrop", config);
	new Trex.ImgDrop(canvas, cfg);
});

Trex.ImgDrop = Trex.Class.create({
	canvas: _NULL,
	initialize: function(canvas){
		this.canvas = canvas;
        this.bindKeyEvent(canvas);
	},
    bindKeyEvent: function(canvas) {
        var self = this;
        var file = true;
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(e) {
        	file = false;
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(e) {
        	file = true;
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DROP, function(e) {
        	if(e.dataTransfer.files.length)
        		self.imgHandler(e);
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGOVER, function(e) {
        	if ($tx.msie && file){
        		e.preventDefault();
        		e.stopPropagation();
        	}
        });
        
    },
	imgHandler: function(e){
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX, y = e.pageY;
		var node = e.target.childNodes[0];
		var self = this;
		function moveSel(x, y){
			var doc = self.canvas.getCurrentPanel().getDocument();
			var rng = doc.createRange();
			var pos;
			if (document.caretPositionFromPoint) {
				pos = doc.caretPositionFromPoint(x, y);
				rng.setStart(pos.offsetNode, pos.offset);
				rng.setEnd(pos.offsetNode, pos.offset);
			}else if(doc.caretRangeFromPoint){
				rng = doc.caretRangeFromPoint(x, y)
			}else if(doc.body.createTextRange != undefined){
				try{
					rng = doc.body.createTextRange();
					rng.moveToPoint(x,y);
					var endRange = rng.duplicate();
					endRange.moveToPoint(x,y);
					rng.setEndPoint('EndToEnd', endRange);
					rng.select();
				}catch(e){
					console.dir(e);
					throw e;
				}
				return;
			}
			var sel = self.canvas.getProcessor().getSel();
			sel.removeAllRanges();
			sel.addRange(rng);
			
		}
		moveSel(x, y)
		this.imagesSelected(e.dataTransfer.files);
	},
	
	imagesSelected: function(myFiles) {
		var _canvas = this.canvas;
		for (var i = 0, f; f = myFiles[i]; i++) {
			var imageReader = new FileReader();
			imageReader.onload = (function(aFile) {
				return function(e) {
					_canvas.execute(function(processor) {
						processor.pasteContent(['<img class="images" src="', e.target.result,'" title="', aFile.name, '"/>'].join(''));
					});
				};
			})(f);
			imageReader.readAsDataURL(f);
			
		}
	}
});