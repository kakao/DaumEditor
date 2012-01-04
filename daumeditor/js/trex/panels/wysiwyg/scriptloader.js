(function() {
    Trex.ScriptLoader = Trex.Class.create({
        $mixins: [Trex.I.FHRequester],
        isJsHolding: _FALSE,
        jsQueue: [],
        imported: [],
        initialize: function(win) {
            this.win = win;
        },
        execScript: function() {
            if (this.jsQueue.length == 0) {
                return;
            }
            if (!this.isJsHolding) {
                this.isJsHolding = _TRUE;
                try {
                    var _queue = this.jsQueue.shift();
					//CHECK:: src 없는 iframe 에 document.write 를
					//통해 위지윅을 만들면, IE8 이하에서는 win.eval 이 없다..
					if (this.win['eval']) {
                        txEval(_queue['script'], this.win);
					} else {
						this.win.document.getElementById("txScriptForEval").text = _queue['script'];
					}
                } catch(ignore) {
                } finally {
                    if (typeof(_queue['callback']) === "function") {
                        _queue['callback']();
                    }
                    this.isJsHolding = _FALSE;
                }
            }
            setTimeout(this.execScript.bind(this), 5);
        },
        runBy: function(script, callback) {
            this.jsQueue.push({
                'script': script,
                'callback': callback
            });
            this.execScript();
        },
        importBy: function(url, callback) {
            if (url.indexOf('cia.daum.net') < 0 && this.imported.contains(url)) {
                if (typeof(callback) === "function") {
                    callback();
                }
                return;
            }
            this.imported.push(url);
            this.sendRequest("get", url, "", _FALSE, function(script) {
                this.runBy(script, callback);
            }.bind(this), function() {
            });
        }
    });
})();