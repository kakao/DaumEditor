
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

        this.canvasObjserveJobs();
    },
    canvasObserveJobs: function() {
        var self = this;

        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGENTER, this.showDragArea);
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGLEAVE, this.hideDragArea);
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DROP, function(ev) {
            console.log(ev);

            var dt = ev.dataTransfer;
            if (dt && dt.files && dt.files.length) {
                var files = dt.files;
                self.attachFiles($A(files));
            } else {
                // TODO:필요하면 처리추가

            }
        });

    },
    attachFiles: function(files) {
        var self = this;
        files.each(function(file){
            self.attachFile(file);
        });
    },
    attachFile: function(file) {
        var self = this;
        if (file.type && file.type.split('/')[0].toUpperCase() == 'IMAGE'){
            var reader = new FileReader();
            reader.readAsDataURL(file);
            $tx.observe(reader, 'loadend', function(e) {
                var data = {};
                data.imageurl = this.result;
                self.execAttach(data);
            });
        }
    },
    execAttach: function(data) {
        var _img = _DOC.createElement('img');
        _img.src = data.imageurl;
        var _style = {clear:'none', float: 'none'};
        this.canvas.execute(function(processor) {
            // TODO: ie에서 확인, 문제가 있다면 processor.lastRange 를 이용해서 range를 복원하고 paste를 한다.
            processor.pasteNode(_img, _TRUE, _style);
        });
    },
    showDragArea: function() {
        console.log("show");
    },
    hideDragArea: function() {
        console.log("hide");
    }
})