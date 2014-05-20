/**
 * Created by sungwon on 14. 4. 30.
 */
TrexConfig.addTool(
    "codehighlight",
    {
        disabledonmobile: _TRUE,
        sync: _FALSE,
        status: _FALSE,
        wysiwygonly: _TRUE,
        features: { left:250, top:65, width:797, height:385 },
        popPageUrl: "#host#path/pages/trex/code_highlight.html",
        styleSheetUrl: "http://editor7.daum.net/DaumEditor/daumeditor/lib/prettify.css",
        highlight: function(code){
            return prettyPrintOne(code);
        }
    },
    function(root){
        var _config = TrexConfig.getTool("codehighlight", root);
        _config.popPageUrl = TrexConfig.getUrl(_config.popPageUrl);
        _config.features = TrexConfig.getPopFeatures(_config.features);
    }
);

TrexMessage.addMsg({
    '@codehighlight.insert.alert': "에디터 상태에서만 삽입할 수 있습니다."
});

Trex.Tool.Codehighlight = Trex.Class.create({
    $const: {
        __Identity: 'codehighlight'
    },
    $extend: Trex.Tool,
    isModify: false,
    target: null,
    oninitialized: function(config) {
        var self = this;
        this.highlight = config.highlight;
        this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_CLICK, function(e){
            var element = $tx.element(e);
            var pre = null;
            if(element.className !='txc-code-wrap'){
                pre = $tom.ancestor(element, 'pre.txc-code');
                if(!pre || pre.parentNode.tagName.toUpperCase() != 'BUTTON')
                    return;
            }else {
                pre = $tom.first(element, 'pre');
            }
            self.isModify = true;
            self.target = pre;
            self.toolbar.fireJobs(Trex.Ev.__TOOL_CLICK, self.identity, _TRUE);
        });
        this.toolbar.observeJob(Trex.Ev.__TOOL_CLICK, function(e, isModify){
            if(e != 'codehighlight')
                return;
            if(self.wysiwygonly && !self.canvas.isWYSIWYG()) {
                alert(TXMSG("@codehighlight.insert.alert"));
                return;
            }

            if(!isModify){
                self.isModify =  false;
                self.target =  null;
            }

            if(self.clickHandler) {
                self.clickHandler();
            } else {
                try {
                    var _url = self.config.popPageUrl;
                    var isDocumentDomainDeclaredExplicitly = (document.location.hostname != document.domain);
                    if (isDocumentDomainDeclaredExplicitly) {
                        _url = _url + ((_url.indexOf("?") > -1) ? "&" : "?") + "xssDomain=" + document.domain;
                    }

                    _url = (self.pvUrl? self.pvUrl + ((self.pvUrl.indexOf("?") > -1) ? "&" : "?") + "u="+escape(_url): _url);
                    var win = _WIN.open(_url, "at" + self.name, self.config.features);
                    win.data = self.target? self.target.textContent: '';
                    win.focus();
                } catch (e) {}
            }
        });
        this.weave.bind(this)(
            new Trex.Button(this.buttonCfg),
            _NULL,function(){}
        );
    },
    attachHandler: function(data){
        if(this.checkInsertable()) {
            this.execAttach(data);
        }else {
            this.execReattach(data);
        }
    },
    execAttach: function(data){
        var _doc = Editor.getCanvas().getProcessor().doc;
        var button = _doc.createElement('button');
        button.className = 'txc-code-wrap'
        button.innerHTML = '<pre class="txc-code"><code>' + this.highlight(data.code) + '</code></pre>';
        this.canvas.pasteNode(button, _TRUE);
    },
    execReattach: function(data) {
        var code = $tom.descendant(this.target, 'code');
        code.innerHTML =  this.highlight(data.code);
    },
    checkInsertable: function() {
        return !this.isModify;
    }
});
Trex.register("add highlight css",
    function(editor, toolbar, sidebar, canvas, config) {
        canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(_doc){
            var link = _doc.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.href = config.toolbar.codehighlight.styleSheetUrl;
            (_doc.head||_doc.getElementsByTagName('head')[0]).appendChild(link);
        });
    }
);
Trex.register("filter > codehighlight",
    function(editor, toolbar, sidebar, canvas, config) {
        var highlight = config.toolbar.codehighlight.highlight;
        var _docparser = editor.getDocParser();
        function encode(contents){
            contents = contents.replace(/(<pre[^>]*class=['"]?txc-code['"]?[^>]*>\s*<code[^>]*>)([\s\S]*?)(<\/code>\s*<\/pre>)/ig,function(a, p1, p2, p3){
                return '<button class="txc-code-wrap">'+ p1 + highlight(p2) + p3 +'</button>';
            });
            return contents;
        }
        function decode(contents){
            contents = contents.replace(/<button[^>]*>\s*(<pre[^>]*class=['"]?txc-code['"]?[^>]*>\s*<code[^>]*>)([\s\S]*?)(<\/code>\s*<\/pre>)\s*<\/button>/ig,function(a, p1, p2, p3){
                return p1 + p2.stripTags() + p3;
            });
            return contents;
        }
        _docparser.registerFilter(
            'filter/codehighlight', {
                'text@load': function (contents) {
                    return contents;
                },
                'source@load': function (contents) {
                    return contents;
                },
                'html@load': function (contents) {
                    return encode(contents);
                },
                'text4save': function (contents) {
                    return contents;
                },
                'source4save': function (contents) {
                    return contents;
                },
                'html4save': function (contents) {
                    return decode(contents);
                },
                'text2source': function (contents) {
                    return contents;
                },
                'text2html': function (contents) {
                    return encode(contents);
                },
                'source2text': function (contents) {
                    return contents;
                },
                'source2html': function (contents) { //source2wysiwyg
                    return encode(contents);
                },
                'html2text': function (contents) {
                    return decode(contents);
                },
                'html2source': function (contents) { //wysiwyg2source
                    return decode(contents);
                }
            }
        );
    }
);