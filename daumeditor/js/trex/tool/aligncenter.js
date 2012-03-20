(function() {
    /**
     * @fileoverview
     * Toolbar의 AlignCenter Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignCentrer를 포함
     *
     */
    TrexConfig.addTool(
            "aligncenter",
    {
        sync: _TRUE,
        status: _TRUE,
        hotKey: {
            ctrlKey: _TRUE, // ctrl + .
            keyCode: 190
        }
    }
            );

    /*
     * Text : align center
     * Image : float none + align center
     */
    var __TextAlignProperty = "center";
    var __ImageFloatProperty = 'none';
    var __ImageClearProperty = 'none';
    var paragraphProp = {
        'align': _NULL,
        'style': {
            'textAlign': __TextAlignProperty
        }
    };

    Trex.Tool.AlignCenter = Trex.Class.create({
        $const: {
            __Identity: 'aligncenter',
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
                        'margin': '0 auto'
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
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_CENTER);
                } else if (alignMode == "text") {
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_CENTER);
                }
            });
            canvas.triggerQueryStatus();
        },
        startSyncButtonWithStyle: function() {
            var self = this;
            self.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
                self.syncButtonState();
            });
        }
    });
})();