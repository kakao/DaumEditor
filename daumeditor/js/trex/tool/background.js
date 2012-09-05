(function() {
    TrexConfig.addTool(
        "background",
        {
            wysiwygonly: _TRUE,
            sync: _FALSE,
            status: _TRUE,
			needRevert: true,
            thumbs: Trex.__CONFIG_COMMON.thumbs
        }
    );

    var articleBackgroundColor;

    Trex.Tool.Background = Trex.Class.create({
        $const: {
            __Identity: 'background'
        },
        $extend: Trex.Tool,
        oninitialized: function() {
            /* button & menu weave */
            this.weave(
                new Trex.Button(this.buttonCfg),
                new Trex.Menu.ColorPallete(this.menuCfg),
                this.handler
            );
        },
        handler: function(color) {
            var self = this;
            var canvas = self.canvas;

            canvas.fireJobs("canvas.apply.backgroundcolor", color);
            canvas.history.saveHistory(
                {
                    backgroundColor: articleBackgroundColor,
                    backgroundImage: canvas.getStyle('backgroundImage')
                },
                {
                    backgroundColor: color,
                    backgroundImage: canvas.getStyle('backgroundImage')
                },
                function(data){
                    self._restoreColor(data);
                }
            );
			if (color === null) {
				canvas.addStyle({
	                backgroundColor: canvas.getConfig().styles ? canvas.getConfig().styles.backgroundColor || "" : "",
	                backgroundImage: canvas.getConfig().styles ? canvas.getConfig().styles.backgroundImage || "" : ""
	            });
				articleBackgroundColor = "";
				canvas.getConfig().hasUserBgcolor = _FALSE;
			} else {
	            canvas.addStyle({
	                backgroundColor: color,
	                backgroundImage: ""
	            });
	            articleBackgroundColor = color;
	            canvas.getConfig().hasUserBgcolor = _TRUE;
			}
        },
        _restoreColor: function(data) {
            var canvas = this.canvas;
            canvas.addStyle({ backgroundColor: data.backgroundColor });
            if (data.backgroundImage) {
                canvas.addStyle({ backgroundImage: data.backgroundImage });
            }
            articleBackgroundColor = data.backgroundColor;
        }
    });

    Trex.install('canvas.getBgColor & canvas.setBgColor & editor.getContentWithBg',
        function(editor, toolbar, sidebar, canvas, config) {
            articleBackgroundColor = config.canvas.styles.backgroundColor;

            // 저장, 로드할때 content 수정
            canvas.getBgColor = function() {
                var color = articleBackgroundColor || canvas.getPanel("html").getStyle("backgroundColor");
                if ( color ) {
                    return Trex.Color.getHexColor(color);
                } else {
                    return "";
                }
            };

            canvas.setBgColor = function(color) {
                canvas.getPanel("html").addStyle({
                    "backgroundColor": color || 'transparent'
                });
            };

            editor.getContentWithBg = function() {
                var _selColor = canvas.getBgColor().toLowerCase();
                if(_selColor == 'transparent') {
                    return editor.getContent();
                } else {
                    return [
                        '<table class="txc-wrapper" border="0" cellspacing="0" cellpadding="0"><tr>',
                        '<td bgcolor="',_selColor,'">',
                        editor.getContent(),
                        '</td>',
                        '</tr></table>'
                    ].join("");
                }
            };

            var _originInitContent = canvas.initContent.bind(canvas);
            canvas.initContent = function(content) {
                if(content.search(/<table[^>]*txc-wrapper[^>]*>/i) > -1) {
                    var _selColor;
                    content = content.replace(/<table[^>]*txc-wrapper[^>]*><tr><td([^>]*)>([\s\S]*?)<\/td><\/tr><\/table>/i, function(full, color, html){
                        _selColor = color.replace(/\sbgcolor="([#\w]*)"/, "$1");
                        return html;
                    });
                    canvas.setBgColor(_selColor);
                }
                _originInitContent(content);
            };

            canvas.history.initHistory({
                'backgroundColor': config.canvas.styles.backgroundColor,
                'backgroundImage': config.canvas.styles.backgroundImage || "none"
            });

            canvas.reserveJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
                var color = canvas.config.articleBackgroundColor;
                if ( color && color != "transparent" ){
                    canvas.addStyle({
                        backgroundColor: color,
                        backgroundImage: ""
                    });
                }
            });

            canvas.observeJob('canvas.apply.letterpaper', function(data){
                if ( data.id ){
                    canvas.getPanel("html").addStyle({
                        "backgroundColor": 'transparent'
                    });
                }
            });
        }
    );
})();