(function() {
    /**
     * @fileoverview
     * Toolbar의 AlignLeft Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignLeft를 포함
     *
     */
    TrexConfig.addTool(
        "alignleft",
        {
            sync: _TRUE,
            status: _TRUE,
            hotKey: { // ctrl + ,
                ctrlKey: _TRUE,
                keyCode: 188
            }
        }
    );

    /*
     * Text : align left
     * Image : float none + align left
     */
    var __TextAlignProperty = "left";
    var __ImageFloatProperty = 'none';
    var __ImageClearProperty = 'none';
    var paragraphProp = {
        'align': _NULL,
        'style': {
            'textAlign': __TextAlignProperty
        }
    };

    Trex.Tool.AlignLeft = Trex.Class.create({
        $const: {
            __Identity: 'alignleft',
            __ImageModeProps: {
                'paragraph': paragraphProp,
                'image': {
                    'style': {
                        'clear': __ImageClearProperty,
                        'float': __ImageFloatProperty,
                        'marginLeft': "",
                        'marginRight': ""
                    }
                }
            },
            __TextModeProps: {
                'paragraph': paragraphProp,
                'button': {
                    'style': {
                        'margin': '0'
                    }
                }
            }
        },
        $extend: Trex.Tool,
        $mixins: [Trex.I.AlignExecution],
        oninitialized: function(config) {
            var self = this;
            self.imageAlignMode = _FALSE;

            self.weave(new Trex.Button(self.buttonCfg), _NULL, self.handler);
            self.bindKeyboard(config.hotKey, self.handler.bind(self));
            self.startSyncButtonWithStyle();
        },
        handler: function() {
            var self = this;
            var canvas = self.canvas;
            var toolbar = self.toolbar;
            canvas.execute(function(processor) {
                self.executeAlign(processor);
                var alignMode = self.getAlignMode(processor);
                if (alignMode == "image") {
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_LEFT);
                } else if (alignMode == "text") {
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_LEFT);
                }
            });
            canvas.triggerQueryStatus();
        },
	        startSyncButtonWithStyle: function() {
            var self = this;
            self.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function(){
                 self.syncButtonState();
            });
        }
    });
})();