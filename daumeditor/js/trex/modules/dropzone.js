
Trex.module('register drag and drop attacher on canvas', function(editor, toolbar, sidebar, canvas, config){
    if (!_WIN.FileReader || !config.canvas.dropZone.use) {
        return;
    }

    var dropZone = new Trex.DropZone(editor, sidebar, canvas, config.canvas.dropZone);
    editor.getDropZone = function(){
        return dropZone;
    };
});

Trex.DropZone = Trex.Class.create({
    initialize: function(editor, sidebar, canvas, config) {
        this.editor = editor;
        this.sidebar = sidebar;
        this.canvas = canvas;
        this.config = config;

        this.useFileUpload = config.useFileUpload;
        this.useImageUpload = config.useImageUpload;

        this.dataType = ["text/html", "text/uri-list", "text/plain", "Files"];

        this._canvasObserveJobs();
    },
    _canvasObserveJobs: function() {
        var self = this;

        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGOVER, function(ev) {
            var dt = ev.dataTransfer || _NULL;

            if (dt && dt.types && dt.types.length) {
                $tx.stop(ev);
            }
        });
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGENTER, function(ev) {self.showDragArea(ev)});
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGLEAVE, function(ev) {self.hideDragArea(ev)});
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DROP, function(ev) {
            var processor = self.canvas.getProcessor();

            if (processor.savedRange) {
                processor.savedRange.select();
            }

            var dt = ev.dataTransfer || _NULL;
            if (!dt) {
                return;
            }

            var typeIndex = -1;

            $A(dt.types).each(function(type) {
                var index = self.dataType.indexOf(type);

                if (index < typeIndex || typeIndex == -1) {
                    typeIndex = index;
                }
            });

            if (typeIndex != -1) {
                var type = self.dataType[typeIndex];

                if (type == "Files") {
                    self.attachFiles($A(dt.files));
                } else {
                    self.attachHtml(dt.getData(type));
                }
                $tx.stop(ev);
            }

        });

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
        _indicator.src = 'data:image/gif;base64,R0lGODlhEAAQAOUdAOvr69HR0cHBwby8vOzs7PHx8ff397W1tbOzs+Xl5ebm5vDw8PPz88PDw7e3t+3t7dvb2+7u7vX19eTk5OPj4+rq6tbW1unp6bu7u+fn5+jo6N/f3+/v7/7+/ra2ttXV1f39/fz8/Li4uMXFxfb29vLy8vr6+sLCwtPT0/j4+PT09MDAwL+/v7m5ubS0tM7OzsrKytra2tTU1MfHx+Li4tDQ0M/Pz9nZ2b6+vgAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFMAA5ACwAAAAAEAAQAAAGg8CcMAcICAY5QsEwHBYPCMQhl6guGM5GNOqgVhMPbA6y5Xq/kZwkN3Fsu98EJcdYKCo5i7kKwCorVRd4GAg5GVgAfBpxaRtsZwkaiwpfD0NxkYl8QngARF8AdhmeDwl4pngUCQsVHDl2m2iveDkXcZ6YTgS3kAS0RKWxVQ+/TqydrE1BACH5BAkwADkALAAAAAAQABAAAAZ+wJwwJ1kQIgNBgDMcdh6KRILgQSAOn46TIJVSrdZGSMjpeqtgREAoYWi6BFF6xCAJS6ZyYhEIUwxNQgYkFxwBByh2gU0kKRVHi4sgOQuRTRJtJgwSBJElihwMQioqGmw5gEMLKk2AEkSBq4ElQmNNoYG2OVpDuE6Lrzmfp0NBACH5BAUwADkALAAAAAAQABAAAAaFwJwwJ1kQCDlCwTAcMh6KhDQnVSwYTkJ1un1gc5wtdxsh5iqaLbVKyVEWigq4ugZgTyiA9CK/JHIZWCsICCxpVWV/EzkHhAgth1UPQ4OOLXpScmebFA6ELHAZclBycXIULi8VZXCZawplFG05flWlakIVWravCgSaZ1CuksBDFQsAcsfFQQAh+QQJMAA5ACwAAAAAEAAQAAAGQcCccEgsGo/IpHLJzDGaOcKCCUgkAEuFNaFRbq1dJCxX2WKRCFdMmJiiEQjRp1BJwu8y5R3RWNsRBx9+SSsxgzlBACH5BAkwADkALAAAAAAQABAAAAaJwJwwJ1kQCDlCwTAcMh6KhDQnVSwYTkJ1un1gc5wtdxsh5iqaLbVKyTEWigq4ugZglRXpRX5J5DJYAFIAaVVlfhNrURqFVQ9DYhqCgzkzCGdnVQBwGRU0LQiXCRUAORQJCwAcOTChoYplBXIKLq6vUXRCCQ22olUEcroJB66KD8FNCjUrlxWpTUEAIfkEBTAAOQAsAAAAABAAEAAABobAnDAnWRAIOULBMBwyHoqENCdVLBhOQnW6fWBznC13G8nZchXNllql5Bg2xA1cZQOwShwCMdDkLgk5GVgAUgAie3syVDkTbFIaiIkIJ0NiGnp7HiNonRVVAHEuFjlQFVQVAI0JCzYjrKCPZQWnf1unYkMVWrFbBLVoUIaPD8C6CwCnAMhNQQA7';
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
        this.canvas.execute(function(processor) {
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
        });
    },
    showDragArea: function(ev) {
        //console.log("show");
    },
    hideDragArea: function(ev) {
        //console.log("hide");
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