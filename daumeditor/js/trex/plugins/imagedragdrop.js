/**
 * @fileoverview Image drag&drop
 * @author sungwon
 */

TrexConfig.addPlugin(
    'imagedragdrop',
    {
        use: _TRUE,
        maxFileSize: $tx.msie && $tx.msie_ver < 10 ? 32 * 1024 : 500 * 1024 // 500 kb
    }
);

TrexMessage.addMsg({
    '@imagedragdrop.oversize.alert': "적용 가능한 파일은 이미지 형식만 가능하며,\n각 파일의 최대 크기는 #{maxSize} 입니다.\n제한된 파일은 다음과 같습니다.\n\n",
    '@imagedragdrop.not.supported.browser': '이미지 Drag&Drop 추가 기능이 지원되지 않는 브라우저 입니다.\n다른 브라우저에서 시도해 주세요.'
});

Trex.ImageDragDrop = Trex.Class.create({
	canvas: _NULL,

	initialize: function(canvas, config){
		this.canvas = canvas;
        this.config = config;
        this.skipfiles = [];

        if (this.config.use) {
            this.bindKeyEvent(canvas);
        }
	},

    bindKeyEvent: function(canvas) {
        var self = this;
        var dragStartInCanvas = _FALSE;
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(e) {
        	dragStartInCanvas = _TRUE;
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(e) {
        	dragStartInCanvas = _FALSE;
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DROP, function(e) {
        	if(e && e.dataTransfer && e.dataTransfer.files) {
                if (e.dataTransfer.files.length) {
                    self.imageDisplayHandler(e);
                }
            } else {
                alert(TXMSG("@imagedragdrop.not.supported.browser"));
            }
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGOVER, function(e) {
        	if ($tx.msie && !dragStartInCanvas){
        		e.preventDefault();
        		e.stopPropagation();
        	}
        });
    },

	imageDisplayHandler: function(e){
		e.preventDefault();
		e.stopPropagation();
        this.canvas.getProcessor().moveCaretPoint(e.pageX, e.pageY);
		this.pasteImages(e.dataTransfer.files);
        this.displaySkipFiles();
	},
	
	pasteImages: function(fileList) {
		var _canvas = this.canvas;
        var list = $A(fileList);

        this.skipfiles = [];
        var self = this;

        list.each(function(transferFile) {
            if (self.checkPasteData(transferFile)) {
                var imageReader = new FileReader();
                imageReader.onload = (function(aFile) {
                    return function(e) {
                        _canvas.execute(function(processor) {
                            processor.pasteContent(['<img class="images" src="', e.target.result,'" title="', aFile.name, '"/>'].join(''));
                        });
                    };
                })(transferFile);
                imageReader.readAsDataURL(transferFile);
            }
        });
	},

    isCheckFileSize: function (transferFile) {
        return 0 < this.config.maxFileSize && this.config.maxFileSize > transferFile.size;
    },

    isCheckFileType: function (transferFile) {
        return transferFile.type.indexOf('image/') == 0;
    },

    checkPasteData: function(transferFile) {
        if (!transferFile) {
            return _FALSE;
        }

        if (this.isCheckFileSize(transferFile)
            && this.isCheckFileType(transferFile)) {
            return _TRUE;
        }

        this.skipfiles.push(transferFile);
        return _FALSE;
    },

    displaySkipFiles: function() {
        if (!this.skipfiles.length) {
            return _FALSE;
        }

        var _jstObj = new Template( TXMSG("@imagedragdrop.oversize.alert") );
        var message = [_jstObj.evaluate({ maxSize : (this.config.maxFileSize/1000).humanReadable() })];
        this.skipfiles.each(function(file){
            message.push([file.name, ' : ', file.size.humanReadable(), '\n'].join(''));
        });

        alert(message.join(''));
    }

});

Trex.module("html5 drag&drop apply to canvas. (except ie)", function(editor, toolbar, sidebar, canvas, config){
    var pluginConfig = TrexConfig.getPlugin("imagedragdrop");
    new Trex.ImageDragDrop(canvas, pluginConfig);
});