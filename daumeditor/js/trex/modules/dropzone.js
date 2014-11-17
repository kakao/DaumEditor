
Trex.module('register drag and drop attacher on canvas', function(editor, toolbar, sidebar, canvas, config){
    if (!_WIN.FileReader || !config.canvas.dropZone.use) {
        return;
    }

    var dropZone = new Trex.DropZone(editor, sidebar, canvas, config.canvas.dropZone);
    editor.getDropZone = function(){
        return dropZone;
    };
});

Trex.register("filter > dropzone",
    function(editor) {
        function toRegExp(str){
            return str.replace(/([\\^$(){}[\]+*?.])/g,'\\$1');
        }

        function removeWaiting(_content) {
            return _content.replace(getHTMLWaitingRegExp(),'').replace(getSourceWaitingRegExp(), '');
        }

        function getHTMLWaitingRegExp() {
            return RegExp('<img[^>]*'+toRegExp(Trex.__WAITING_IMG_SRC)+'[^>]*id=[\'"](.*)[\'"][^>]*>','g')
        }

        function getSourceWaitingRegExp() {
            return RegExp('\\[Uploading:([a-zA-Z\\d_]*)\\]', 'g');
        }

        function changeWaitingSourceToHTML(contents) {
            if (!editor.hasOwnProperty('getDropZone')) {
                return contents;
            }
            var dropZone = editor.getDropZone();

            return contents.replace(getSourceWaitingRegExp(), function(match, p1, offset) {
                var imgContents = dropZone.getTempImageContents(p1);
                if(imgContents == _NULL) {
                    return dropZone.createIndicator(p1);
                }
                var _entry = _attachBox.getEntries().find(function(entry) {
                    return (entry.data.dispElId == p1);
                });
                _entry && _entry.setExistStage(true);
                return imgContents;
            })
        }

        var _attachBox = editor.getAttachBox();
        var _docparser = editor.getDocParser();
        _docparser.registerFilter(
            'filter/dropzone', {
                'source@load': function(contents){
                    return removeWaiting(contents);
                },
                'html@load': function(contents){
                    return removeWaiting(contents);
                },
                'source4save': function(contents){
                    contents = changeWaitingSourceToHTML(contents);
                    return removeWaiting(contents);
                },
                'html4save': function(contents){
                    return removeWaiting(contents);
                },
                'text4save': function(contents){
                    return contents;
                },
                'html2text': function(contents) {
                    return removeWaiting(contents);
                },
                'source2text': function(contents) {
                    return removeWaiting(contents);
                },
                'source2html': function(contents){
                    return changeWaitingSourceToHTML(contents);
                },
                'html2source': function(contents){
                    if (!editor.hasOwnProperty('getDropZone')) {
                        return contents;
                    }
                    return contents.replace(getHTMLWaitingRegExp(), function(match, p1, offset) {
                        return '[Uploading:'+p1+']';
                    });
                }
            });
})

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

        this.imgContents = {};

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

        this.canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function(from, to) {
            if (from == to) return;

            if (to == Trex.Canvas.__WYSIWYG_MODE) {
                self.imgContents = {};
            }
        });
    },
    _checkDragType: function(ev) {
        var dataType = this.dataType;
        var dt = ev.dataTransfer || _NULL;

        var typeIndex = -1;

        if (this.canvas.isWYSIWYG() && dt) {
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
    _dropHandler: function(ev) {
        var typeIndex = this._checkDragType(ev);

        if (typeIndex != -1) {
            var processor = this.canvas.getProcessor();
            if (processor.savedRange) {
                processor.savedRange.select();
            }

            this.hideDragArea();
            this.canvas.getProcessor().getAreaSelection().reset();

            var type = this.dataType[typeIndex];

            var dt = ev.dataTransfer;
            if (type == "Files") {
                this.attachFiles($A(dt.files));
            } else {
                this.attachHtml(dt.getData(type));
            }
            $tx.stop(ev);
        }
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
        var _indicatorId = this.insertIndicator();

        var reader = new FileReader();
        $tx.observe(reader, 'loadend', function(e) {
            var data = {};
            data.imageurl = this.result;
            self._execAttach(data, _indicatorId);
        });
        reader.readAsDataURL(file);
    },
    attachHtml: function(data) {
        var paster = this.editor.getPaster();

        paster.pasteHTML(data);
    },
    insertIndicator: function() {
        var _indicatorID = Trex.Util.getDispElId();

        this.canvas.getProcessor().pasteContent(this.createIndicator(_indicatorID), _TRUE);
        return _indicatorID;
    },
    createIndicator:function(id) {
        return '<img src='+Trex.__WAITING_IMG_SRC+' width=16 height=16 id='+id+'>';
    },
    _getIndicator:function(id) {
        if (this.canvas.isWYSIWYG()) {
            var wysiwygDoc = this.canvas.getCurrentPanel().getDocument();
            var indicator = $tom.collect(wysiwygDoc, "#" + id);

            return indicator;
        }
        return _NULL;
    },
    _removeIndicator: function(id){
        if (!id || id == "") {
            return;
        }
        if (this.canvas.isWYSIWYG()) {
            var indicator = this._getIndicator(id);

            if (indicator) {
                goog.dom.removeNode(indicator);
            }
        } else {
            this.imgContents[id] = "";
        }
    },
    _execAttach: function(data, replaceNodeId) {
        var self = this;
        if (data.hasOwnProperty('imageurl')) {

            this.canvas.execute(function(processor) {
                var _img = _DOC.createElement('img');
                _img.src = data.imageurl;
                $tom.addStyles(_img, {'clear':'none', 'float': 'none'});

                if (self.canvas.isWYSIWYG()) {
                    var replaceNode = self._getIndicator(replaceNodeId);

                    if (replaceNode) {
                        goog.dom.replaceNode(_img, replaceNode);
                    }
                }
                else {
                    self.imgContents[replaceNodeId] = goog.dom.getOuterHtml(_img);
                }
            });
        }
    },
    getTempImageContents:function(id) {
        return this.imgContents[id] || _NULL;
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