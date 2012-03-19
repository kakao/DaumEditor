(function() {
    /**
     * @fileoverview
     * Toolbar의 AlignRight Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignRight을/를 포함
     *
     */
    TrexConfig.addTool(
        "alignright",
        {
            sync: _TRUE,
            status: _TRUE,
            hotKey: { // ctrl + /
                ctrlKey: _TRUE,
                keyCode: 191
            }
        }
    );

    /*
     * Text : align right
     * Image : float left
     */
    var __TextAlignProperty = "right";
    var __ImageFloatProperty = 'left';
    var __ImageClearProperty = 'both';
    var __ImageMarginProperty = "8px";
    var __ImageNoMarginProperty = "";

    Trex.Tool.AlignRight = Trex.Class.create({
        $const: {
            __Identity: 'alignright',
            __ImageModeProps: {
                'image': {
                    'style': {
                        'clear': __ImageClearProperty,
                        'float': __ImageFloatProperty,
                        'marginLeft': __ImageNoMarginProperty,
                        'marginRight': __ImageMarginProperty
                    }
                }
            },
            __TextModeProps: {
                'paragraph': {
                    'align': _NULL,
                    'style': {
                        'textAlign': __TextAlignProperty
                    }
                },
                'button': {
                    'style': {
                        'margin': '0 0 0 auto'
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
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_FLOAT_LEFT);
                } else if (alignMode == "text") {
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_RIGHT);
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