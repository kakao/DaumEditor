(function() {
    /**
     * @fileoverview
     * Toolbar의 AlignFull Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignFull을 포함
     *
     */
    TrexConfig.addTool(
        "alignfull",
        {
            sync: _TRUE,
            status: _TRUE
        }
    );

    /*
    * Text : align full
    * Image : float right
    */
    var __TextAlignProperty = "justify";
    var __ImageFloatProperty = 'right';
    var __ImageClearProperty = 'both';
    var __ImageMarginProperty = "8px";
    var __ImageNoMarginProperty = "";

    Trex.Tool.AlignFull = Trex.Class.create({
        $const: {
            __Identity: 'alignfull',
            __ImageModeProps: {
                'image': {
                    'style': {
                        'clear': __ImageClearProperty,
                        'float': __ImageFloatProperty,
                        'marginLeft': __ImageMarginProperty,
                        'marginRight': __ImageNoMarginProperty
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
                        'margin': '0'
                    }
                }
            }
        },
        $extend: Trex.Tool,
        $mixins: [Trex.I.AlignExecution],
        oninitialized: function() {
            var self = this;
            self.imageAlignMode = _FALSE;

            self.weave(new Trex.Button(self.buttonCfg), _NULL, self.handler);
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
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_FLOAT_RIGHT);
                } else if (alignMode == "text") {
                    toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_FULL);
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