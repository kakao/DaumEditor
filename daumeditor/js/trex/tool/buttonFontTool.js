Trex.I.ButtonFontTool = Trex.Mixin.create({
    oninitialized: function(config) {
        var self = this;
        self.button = new Trex.Button(self.buttonCfg);
        self.weave(self.button, _NULL, self.handler);
        if (config.sync) {
            self.startSyncButtonWithStyle();
        }
        self.bindKeyboard(config.hotKey, self.handler.bind(self));
    },
    onAfterHandler: function() {
        // TODO 현재 툴의 state만 변경하면 되는데, 불필요하게 Trex.Ev.__CANVAS_PANEL_QUERY_STATUS를 fire한다.
        var canvas = this.canvas;
        if (canvas.triggerQueryStatus) {
            canvas.triggerQueryStatus();
        }
    },
    startSyncButtonWithStyle: function() {
        var self = this;
        self.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function(goog_range) {
            self.syncButton(self.queryCurrentStyle(goog_range));
        });
    },
    queryCurrentStyle: function(goog_range) {
        var self = this;
        var state = self.canvas.query(function(processor) {
            var command = self.getQueryCommandName();
            if (self.legacyMode || (goog_range.isCollapsed() && command && !$tx.opera && !$tx.gecko)) {  //gecko? : FTDUEDTR-1181,  왜 opera는 뺐을까? : <span style="font-weight: bold">...</span> 인 경우에 bold 상태가 false로 나온다. <b>...</b>인 경우는 제대로 나옴.
                return processor.queryCommandState(command);
            } else {
                var targetNode = self.findQueryingNode(goog_range);
                return !!targetNode && self.isStyleApplied(targetNode);
            }
        });
        return state;
    },

    computeNewStyle: function(newStyle, goog_range) {
        return this.toggleFontStyle(this.queryCurrentStyle(goog_range));
    },

    cachedProperty: _FALSE,
    syncButton: function(state) {
        if (this.cachedProperty != state) {
            this.button.setState(state);
            this.cachedProperty = state;
        }
    }
});
