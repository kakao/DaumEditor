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
    rangeExecutor: function(processor, newStyle, range) {
        var el = null;
        if($tx.msie && this.wrapDummy && processor.isCollapsed()){
            el = this.wrapDummy(processor, range);
            processor.execCommand(this.getQueryCommandName());
            var rng = processor.createGoogRangeFromNodes(el, 1, el, 1);
            rng.select();
        }else {
            processor.execCommand(this.getQueryCommandName());
        }
    },
    onAfterHandler: function(data) {
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
            var minGeckoVersion = 20;
            var geckoQueryCommandStateNotWorkingVersion = ($tx.gecko && $tx.gecko_ver < minGeckoVersion);
            if (command && !$tx.opera && !geckoQueryCommandStateNotWorkingVersion) {
                // gecko? : FTDUEDTR-1181
                // opera?: <span style="font-weight: bold">...</span> 인 경우에 bold 상태가 false로 나온다. <b>...</b>인 경우는 제대로 나옴.
                return processor.queryCommandState(command);
            } else {
                var targetNode = self.findQueryingNode(goog_range);
                return !!targetNode && self.isStyleApplied(targetNode);
            }
        });
        return state;
    },

    computeNewStyle: function() {
        return _NULL;
    },

    cachedProperty: _FALSE,
    syncButton: function(state) {
        if (this.cachedProperty != state) {
            this.button.setState(state);
            this.cachedProperty = state;
        }
    }
});
