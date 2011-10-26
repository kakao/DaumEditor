Trex.I.MenuFontTool = Trex.Mixin.create({
	oninitialized: function(config) {
        var self = this;
        self.beforeOnInitialized(config);
        var menuInitHandler = self.menuInitHandler && self.menuInitHandler.bind(self);
        self.weave(self.createButton(), self.createMenu(), self.handler, menuInitHandler);
        if (config.sync) {
            self.startSyncButtonWithStyle();
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
        var currentStyle = self.canvas.query(function(processor) {
            var command = self.getQueryCommandName();
            var targetNode;
            if (self.legacyMode || (goog_range.isCollapsed() && command && $tx.msie)) { // FTDUEDTR-1233
                targetNode = processor.getNode();
            } else {
                targetNode = self.findQueryingNode(goog_range);
            }
            return self.queryElementCurrentStyle(targetNode) || self.getDefaultProperty();
        });
        return this.getTextByValue(currentStyle);
    },
    computeNewStyle: function(newStyle) {
        var style = {};
        style[this.getCssPropertyName()] = newStyle;
        return style;
    },

    cachedProperty: _FALSE,
    syncButton: function(text) {
        var self = this;
        self.button.setText(text);
        if (self.cachedProperty != text) {
            self.button.setText(text);
            self.cachedProperty = text;
        }
    }
});
