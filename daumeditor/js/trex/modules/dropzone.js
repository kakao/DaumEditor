
Trex.module("drag & drop file, image attacher",
    function(editor, toolbar, sidebar, canvas, config) {
        var dropzone;

        if (config.canvas.dropZone.use && _WIN.FileReader) {
            dropzone = new Trex.DropZone(canvas, config.canvas.dropZone);
        }

        editor.getDropZone = function() {
            return dropzone;
        }
    }
);

Trex.DropZone = Trex.Class.create({

    initialize: function(canvas, config){
        var _adaptor = new Trex.Tenth2(TrexConfig.getAdaptor(config.adaptor));

        var dropAtWysiwyg = function(ev) {
            var dt = ev.dataTransfer;
            var files = dt.files;

            for (var i= 0, len = files.length; i < len; i++) {
                var file = files[i];
                if (_adaptor) {
                    _adaptor.upload(file);
                }

                /*
                 var reader = new FileReader();
                 reader.readAsDataURL(file);
                 $tx.observe(reader, 'loadend', function(e) {
                 var data = {};
                 data.filesize = file.size;
                 data.filename = file.name;
                 data.imageurl = this.result;
                 _attacher.execAttach(data);
                 });      */

            }
        }

        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGOVER, function() {
            console.log("over");
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DRAGENTER, function() {
            console.log("enter");
        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DROP, dropAtWysiwyg);
    }
})