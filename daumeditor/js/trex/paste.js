/**
 * Created by sungwon on 14. 1. 28.
 */

Trex.install("paste",
    function(editor, toolbar, sidebar, canvas, config){
        new Trex.Paste(editor, toolbar, sidebar, canvas, config);
    }
);

Trex.Paste = Trex.Class.create({
    $mixins: [Trex.I.JobObservable],
    editor: _NULL,
    toolbar: _NULL,
    sidebar: _NULL,
    canvas: _NULL,
    config: _NULL,
    initialize: function(editor, toolbar, sidebar, canvas, config) {
        this.editor = editor;
        this.toolbar = toolbar;
        this.sidebar = sidebar;
        this.canvas = canvas;
        this.config = config;
        var self = this;
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_PASTE, function(e){
            self.paste(e);
        });
        this.observeJob('BEFOREPASTE', function(data){});
        this.observeJob('PASTE', function(data){
            console.log(data['text/html']);
            console.log(data);
            var p = self.canvas.getProcessor();
            p.pasteContent(data['text/plain']);
        });
        this.observeJob('AFTERPASTE', function(data){});
    },
    getClipboardContent: function(e){
        var data = e.clipboardData || this.canvas.getCurrentPanel().getDocument().dataTransfer;
        var res = {};
        if (!(data && data.types)) return res;
        res['text/plain'] = data.getData('Text');
        res['text/html'] = data.getData('text/html');
        for(var i = 0; i < data.types.length; i++){
            var type = data.types[i];
            data[type] = data.getData(type);
        }
        return res;
    },
    paste: function(e){
        var bin;
        var self = this;
        var p = this.canvas.getProcessor();
        var doc = this.canvas.getCurrentPanel().getDocument();
        function createPasteBin(){
            if(bin)
                return bin;
            bin = document.createElement('div');
            bin.contentEditable = _TRUE;
            $tx.setStyle(bin, {
                'position': 'absolute',
                'left': '-999px',
                'visibility': 'hidden'
            });

            doc.body.appendChild(bin);
            ['beforedeactivate', 'focusin', 'focusout', 'paste'].each(function (name){
                $tx.observe(bin, name, function(e){
                    e.cancelBubble = true;
                    $tx.stopPropagation(e);
                });
            });
            return bin;
        }
        function removePasteBin(){
            $tom.remove(bin);
        }
        function getContentPasteBinHtml(){
            var lastRange = p.getRange();
            p.selectControl(bin);
            bin.focus();
            doc.execCommand('paste', _FALSE, _NULL);
            lastRange.select();
            return bin.innerHTML;
        }
        function run(data){
            self.fireJobs('BEFOREPASTE', data);
            self.fireJobs('PASTE', data);
            self.fireJobs('AFTERPASTE', data);
        }
        var content = this.getClipboardContent(e);
        $tx.preventDefault(e);
        if($tx.msie &&  $tx.msie_ver < 11){
            createPasteBin();
            setTimeout(function(){
                content['text/html'] = getContentPasteBinHtml();
                removePasteBin();
                run(content)
            }, 0);
        }else {
            run(content);
        }
    }

});
