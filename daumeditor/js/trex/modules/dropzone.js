
Trex.module('register drag and drop attacher on canvas', function(editor, toolbar, sidebar, canvas, config){
    if (!_WIN.FileReader || !config.canvas.dropZone.use) {
        return;
    }

    var dropZone = new Trex.DropZone(editor, sidebar, canvas, config.canvas.dropZone);
    editor.getDropZone = function(){
        return dropZone;
    };
});

Trex.MarkupTemplate.add('module.dropZone',
        '<div style="display: table; left:0px; top:0px; width:0px; height:0px; z-index:9999; border-spacing:6px; position:absolute;">\
        <div style="display:table-row">\
        <div style="background-color:white; border:4px dashed #cfcfcf; display:table-cell; opacity: .8; vertical-align:middle">\
        <div style="font-size: 40px; color:#cfcfcf; text-align:center;">여기에 파일 놓기</div></div></div></div>');

Trex.DropZone = Trex.Class.create({
    initialize: function(editor, sidebar, canvas, config) {
        this.editor = editor;
        this.sidebar = sidebar;
        this.canvas = canvas;
        this.config = config;

        this.useFileUpload = config.useFileUpload;
        this.useImageUpload = config.useImageUpload;

        this.dataType = ["text/html", "text/uri-list", "text/plain", "Files"];

        this.cover = this._createCover();
        this.coverShow = _FALSE;
        this._canvasObserveJobs();
    },
    _createCover: function() {
        var cover = Trex.MarkupTemplate.get("module.dropZone").evaluateAsDom({});
        return cover;
    },
    _canvasObserveJobs: function() {
        var self = this;

        var debounceHideDragArea = $tx.debounce(function() {
            self.hideDragArea();
        }, 100);

        var dragOverHandler = function(ev) {
            if(self._checkDragType(ev) != -1) {
                self.showDragArea();

                debounceHideDragArea();
            }
        };

        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGOVER, dragOverHandler);
        $tx.observe(_WIN, "dragover", dragOverHandler);
        $tx.observe(_WIN, "drop", function(ev) {
            self._checkDragType(ev);
        });

        $tx.observe(this.cover, "drop", function(ev) {
            self._dropHandler(ev);
        });
    },
    _checkDragType: function(ev) {
        var dataType = this.dataType;
        var dt = ev.dataTransfer || _NULL;

        var typeIndex = -1;

        if (dt) {
            $A(dt.types).each(function(type) {
                var index = dataType.indexOf(type);

                if (index < typeIndex || typeIndex == -1) {
                    $tx.stop(ev);
                    typeIndex = index;
                }
            });
        }

        return typeIndex;
    },
    _dropHandler: function(ev) {
        var self = this;
        var processor = this.canvas.getProcessor();

        var dt = ev.dataTransfer || _NULL;
        if (!dt) {
            return;
        }

        var typeIndex = this._checkDragType(ev);

        if (typeIndex != -1) {
            if (processor.savedRange) {
                processor.savedRange.select();
            }

            this.hideDragArea();
            (new Trex.Area.Select()).reset();

            var type = this.dataType[typeIndex];

            if (type == "Files") {
                this.attachFiles($A(dt.files));
            } else {
                this.attachHtml(dt.getData(type));
            }
            $tx.stop(ev);
        }
    },
    showDragArea: function() {
        if(this.coverShow) {
            return;
        }

        var _iframe = this.canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE).el;
        var _iframeRect = $tx.getOffset(_iframe);

        $tom.applyStyles(this.cover, {left: _iframeRect.left.toPx(),
                                      top: _iframeRect.top.toPx(),
                                      width: (_iframeRect.right - _iframeRect.left).toPx(),
                                      height: (_iframeRect.bottom - _iframeRect.top).toPx()});
        $tom.insertNext(this.cover, _DOC.body);


        this.coverShow = _TRUE;
    },
    hideDragArea: function() {
        $tom.remove(this.cover);
        this.coverShow = _FALSE;
    },
    attachFiles: function(files) {
        if (!files || !files.length) {
            return;
        }
        var self = this;
        var overfiles = [];
        var overfile;

        files.each(function(file){
            if (self.useImageUpload && file.type && file.type.split('/')[0].toUpperCase() == 'IMAGE') {
                overfile = self.attachImage(file);
            } else if (self.useFileUpload) {
                overfile = self.attachFile(file);
            }

            if (overfile) {
                overfiles.push(overfile);
            }
        });

        this.alertMessage(overfiles);
    },
    attachFile: function(file) {
    },
    attachImage: function(file) {
        var self = this;
        var indicator = this.insertIndicator();

        var reader = new FileReader();
        $tx.observe(reader, 'loadend', function(e) {
            var data = {};
            data.imageurl = this.result;
            self._execAttach(data, indicator);
        });
        reader.readAsDataURL(file);
    },
    attachHtml: function(data) {
        var paster = this.editor.getPaster();

        paster.pasteHTML(data);
    },
    insertIndicator: function() {
        var _indicator = this.canvas.getProcessor().create('img');
        _indicator.src = Trex.__WAITING_IMG_SRC;
        _indicator.width = 16;
        _indicator.height = 16;

        this._insertNode(_indicator);

        return _indicator;
    },
    _execAttach: function(data, replaceNode) {
        if (data.hasOwnProperty('imageurl')) {
            this.canvas.execute(function(processor) {
                var _img = processor.create('img');
                _img.src = data.imageurl;
                $tom.addStyles(_img, {clear:'none', float: 'none'});

                var parent = replaceNode ? replaceNode.parentNode || _NULL : _NULL;

                if (parent) {
                    parent.replaceChild(_img, replaceNode);
                } else {
                    processor.pasteNode(_img, _TRUE);
                }
            });
        }
    },
    _insertNode: function(node) {
        var processor = this.canvas.getProcessor();
        var range = processor.createGoogRange();

        if (range == _NULL) {
            processor.focusOnTop();
            range = processor.createGoogRange();
        }

        if (!range.isCollapsed()) {
            range.removeContents();
            range.select();
        }

        processor.pasteNode(node, _TRUE);
    },
    alertMessage: function(overfiles) {
        if (!overfiles || overfiles.length == 0) {
            return;
        }

        var msg = [];
        msg.push('check your files\n');

        var overfile;
        for (var i=0;i< overfiles.length; i++) {
            overfile = overfiles[i];
            msg.push("\n" + overfile.name);
            if(overfile.size) {
                msg.push(" (" + overfile.size.toByteUnit() + ")");
            }
        }
        this.alertTimeout(msg.join(""));
    },
    alertTimeout: function(msg) {
        setTimeout(function(){
            alert( msg );
        },1);
    }
})