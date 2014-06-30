Trex.Table.Dragger = Trex.Class.create({
    EDGE_TYPE: {
        TOP: "EDGE_TOP",
        BOTTOM: "EDGE_BOTTOM",
        LEFT: "EDGE_LEFT",
        RIGHT: "EDGE_RIGHT",
        NONE: "NONE"
    },
    initialize: function(editor, config){
        /**
         * @type {Trex.Editor.canvas}
         * @private
         */
        this._canvas = editor.canvas;
        /**
         * @type {Trex.Canvas.WysiwygPanel}
         * @private
         */
        this._panel = this._canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        /**
         * @type {HTMLDocument}
         * @private
         */
        this._doc = this._panel.getDocument();
        /**
         * @type {Window}
         * @private
         */
        this._win = this._panel.getWindow();
        /**
         * @type {*}
         * @private
         */
        this._config = config;
        /**
         * @type {HTMLElement}
         * @private
         */
        this._colGuide = $tom.collect(this._canvas.wysiwygEl, ".tx-table-col-resize-dragger");
        /**
         * @type {HTMLElement}
         * @private
         */
        this._rowGuide = $tom.collect(this._canvas.wysiwygEl, ".tx-table-row-resize-dragger");
        /**
         * @type {Object}
         * @private
         */
        this._mouseData = {
            downPoint: [0,0],
            moveTd: _NULL,
            downType: this.EDGE_TYPE.NONE,
            downTd: _NULL
        };
        this._observeEvent();
        /**
         * @desc NONE: 일반, READY: 드래그 전, DRAG: 드래그 중
         * @type {string}
         * @private
         */
        this._state = 'NONE';
        this._MINWIDTH = 10;
        this._MINHEIGHT = 20;
    },
    mousedown: function(e){
        if(this._state =='NONE'){
            var td = this._mouseData.moveTd;
            if(!td) return;
            var point = this._getPointByEvent(e);
            if(this._getType(td,point)=='NONE') return;
            $tx.stop(e);
            this._setMouseDownData(td, point);
            this._changeState('READY');
        }

    },
    mousemove: function(e){
        var point = this._getPointByEvent(e);
        if(this._state =='NONE'){
            if(this._canvas.getProcessor().table.isDuringSelection()) return;
            var td = this._getTdByEvent(e);
            this._mouseData.moveTd= td;
            var type = this._getType(td, point);
            this._makeGuide(type, this._state, point);
        }
        if(this._state == 'READY'){
            if(this._distancePoint(this._mouseData.downPoint, point) > 6){
                this._changeState('DRAG');
            }
            this._makeGuide(this._mouseData.downType, this._state, point);
        }
        if(this._state == 'DRAG'){
            var tdArr = this._makeTDArr(this._mouseData.downTd, this._mouseData.downType, $tom.find(this._mouseData.downTd, 'table'));
            var p = this._calMinMaxPoint(tdArr, point,this._mouseData.downType);
            this._makeGuide(this._mouseData.downType, this._state, p);
        }

    },
    mouseup: function(ev){
        if(this._state == 'DRAG'){
            var tdArr = this._makeTDArr(this._mouseData.downTd, this._mouseData.downType, $tom.find(this._mouseData.downTd, 'table'));
            var point = this._getPointByEvent(ev);
            this._resize(tdArr, point, this._mouseData.downType)
        }

        if(this._state != 'NONE'){
            this._changeState('NONE');
            this._makeGuide(this.EDGE_TYPE.NONE, 'NONE', this._getPointByEvent(ev));
            this._setMouseDownData(_NULL, [0,0]);
        }

    },
    _observeEvent: function(){
        var self = this;
        $tx.observe(_DOC.body, "mouseup", function(ev) {
            self.mouseup(ev);
        });
        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(ev){
            self.mouseup(ev);
        });
        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEMOVE, function(ev){
            self.mousemove(ev);
        });
        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(ev){
            self.mousedown(ev);
        });
        $tx.observe(this._rowGuide, "mousedown", function(ev) {
            self.mousedown(ev);
            if(self._state != 'DRAG'){
                if(self._mouseData.moveTd)
                    Trex.TableUtil.collapseCaret(self._panel, self._mouseData.moveTd);
            }
        });
        $tx.observe(this._colGuide, "mousedown", function(ev) {
            self.mousedown(ev);
            if(self._state != 'DRAG'){
                if(self._mouseData.moveTd)
                    Trex.TableUtil.collapseCaret(self._panel, self._mouseData.moveTd);
            }
        });
        $tx.observe(this._rowGuide, "mouseup", function(ev) {
            self.mouseup(ev);
        });
        $tx.observe(this._colGuide, "mouseup", function(ev) {
            self.mouseup(ev);
        });
    },
    /**
     * @param mode
     * @private
     */
    _changeState: function(mode){
        if(!['NONE', 'READY', 'DRAG'].contains(mode)) return;
        this._state = mode;
    },
    /**
     *
     * @private
     * @param {String} type
     * @param {HTMLElement} table
     * @param {HTMLElement} td
     */
    _makeTDArr: function(td, type, table){
        var indexer = new Trex.TableUtil.Indexer(table);
        var curBoundery = indexer.getBoundary(td);
        var expandElements = [],contractElements = [];
        var mapping = {
            EDGE_TOP: function(){expandElements = indexer.getTdArrHasBottom(curBoundery.top - 1)},
            EDGE_BOTTOM: function(){expandElements = indexer.getTdArrHasTop(curBoundery.bottom)},
            EDGE_LEFT: function(){
                if (curBoundery.left > 0) {
                    expandElements = indexer.getTdArrHasRight(curBoundery.left - 1);
                    contractElements = indexer.getTdArrHasLeft(curBoundery.left);
                }
            },
            EDGE_RIGHT: function(){
                expandElements = indexer.getTdArrHasRight(curBoundery.right);
                if (curBoundery.right < indexer.getColSize() - 1) {
                    contractElements = indexer.getTdArrHasLeft(curBoundery.right + 1);
                }
            }

        };
        mapping[type]();
        return {
            expandElements: expandElements,
            contractElements: contractElements
        }
    },
    /**
     * @param {String} type
     * @returns {HTMLElement}
     * @private
     */
    _getGuide : function(type) {
        switch (type) {
            case this.EDGE_TYPE.LEFT:
            case this.EDGE_TYPE.RIGHT:
                return this._colGuide;
            case this.EDGE_TYPE.TOP:
            case this.EDGE_TYPE.BOTTOM:
                return this._rowGuide;
                break;
        }
        return _NULL;
    },
    /**
     * @param {HTMLElement} guide
     * @param {Object} style
     * @private
     */
    _setGuideStyle: function(guide, style) {
        $tx.setStyle(guide, style);
    },
    /**
     *
     * @param {String} type
     * @param {String} state
     * @param {[]} point
     * @private
     */
    _makeGuide: function(type, state, point){
        $tx.hide(this._colGuide);
        $tx.hide(this._rowGuide);
        var g = this._getGuide(type);
        if(!g) return;
        var style = {
            "border": "1px dotted #81aFFC",
            "background":""
        };
        var mapping = {
            READY: function(g){
                style.border = "1px dotted #F5A9A9"
                $tx.setOpacity(g, 1);
            },
            DRAG: function(g){
                $tx.setOpacity(g, 1);
            },
            NONE: function(g){
                style.border = "1px dotted #CCC"
                $tx.setOpacity(g, 0.5);
            }
        };

        $tx.show(g);
        if(g == this._colGuide){
            style['left'] = (point[0]-(this._win.pageXOffset || this._doc.documentElement.scrollLeft)).toPx();
            style['width'] = "2px";
            style['height'] = this._panel.el.clientHeight.toPx();
            style['background'] = "";
        }else {
            style['top'] = (point[1]-(this._win.pageYOffset || this._doc.documentElement.scrollTop)).toPx();
            style['width'] = this._panel.el.clientWidth.toPx();
            style['height'] = "2px";
            style['background'] = "";
        }
        mapping[state](g);
        this._setGuideStyle(g, style);
    },
    /**
     * @param {HTMLElement} node
     * @returns {Object} {top:Number, left:Number}
     * @private
     */
    _getOffset: function(node){
        var doc = node.ownerDocument;
        if ("getBoundingClientRect" in doc.documentElement) {
            var docElem = doc.documentElement;
            var win = doc.defaultView || doc.parentWindow;
            var box = node.getBoundingClientRect();
            var ot = (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop||0);
            var or = (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft||0);
            return {
                'top': box.top + ot,
                'bottom': box.bottom + ot,
                'left': box.left + or,
                'right': box.right + or
            }
        }else {
            return $tx.getCoordsTarget(node);
        }
    },
    /**
     *
     * @param {[]} point
     * @param {HTMLElement} node
     * @returns {string}
     * @private
     */
    _getType : function(node, point){
        var edgeType = this.EDGE_TYPE.NONE;
        if(!node) return edgeType;
        var MAX_SELECTION = 5;
        var rect = this._getOffset(node);
        if ((point[0] - rect.left) < MAX_SELECTION && node.cellIndex != 0) {
            edgeType = this.EDGE_TYPE.LEFT;
        }
        else if ((rect.right - MAX_SELECTION) < point[0]) {
            edgeType = this.EDGE_TYPE.RIGHT;
        }
        else if ((point[1] - rect.top) < MAX_SELECTION && node.parentNode.rowIndex != 0) {
            edgeType = this.EDGE_TYPE.TOP;
        }
        else if ((rect.bottom - MAX_SELECTION) < point[1]) {
            edgeType = this.EDGE_TYPE.BOTTOM;
        }
        return edgeType;
    },
    /**
     * @param {HTMLElement} node
     * @param {[]} point
     * @private
     */
    _setMouseDownData: function(node,point){
        this._mouseData.downPoint = point;
        this._mouseData.downTd = node;
        this._mouseData.downType = this._getType(node, point);
    },
    /**
     * @param {Event} e
     * @returns {Number[]}
     * @private
     */
    _getPointByEvent: function(e){
        var el = $tx.element(e);
        var doc = el.ownerDocument;
        var x = $tx.pointerX(e);
        var y = $tx.pointerY(e);
        if(doc !== this._doc){
            var of = this._getOffset(this._panel.el);
            return [x-of.left+(this._win.pageXOffset || this._doc.documentElement.scrollLeft), y-of.top+(this._win.pageYOffset || this._doc.documentElement.scrollTop)];
        }
        return [x,y]
    },
    /**
     * @param {Number[]} p1
     * @param {Number[]} p2
     * @return {Number[]}
     * @private
     */
    _subtractPoint: function(p1, p2){
        return [ p1[0] - p2[0], p1[1] - p2[1] ];
    },
    _addPoint: function(p1, p2){
        return [ p1[0] + p2[0], p1[1] + p2[1] ];
    },
    /**
     * @param {Number[]} p1
     * @param {Number[]} p2
     * @returns {number}
     * @private
     */
    _distancePoint: function(p1, p2){
        var point = this._subtractPoint(p1,p2);
        return Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2));
    },
    /**
     * @param {Event} e
     * @return {HTMLElement}
     * @private
     */
    _getTdByEvent: function(e){
        var td = $tom.find($tx.element(e), "td");
        if(!td) return _NULL;
		var isTxInfo = $tom.find(td, ".txc-info");
        return td
    },
    /**
     * @param {[]} array
     * @param {String} type
     * @return {Number}
     * @private
     */
    _minimum: function (array, type) {
        var t = '', min = 0;
        var self = this;
        this._switch(type, function(){
            t = 'width';
            min = self._MINWIDTH;
        }, function(){
            t = 'height';
            min = self._MINHEIGHT;
        });
        var res = array.map(function(td){
            return Trex.TableUtil.getCellOffset(td)[t];
        });
        return Math.min.apply(Math, res) - min;
    },
    /**
     * @param {String} type
     * @param {Function} wfn
     * @param {Function} hfn
     * @private
     */
    _switch: function(type, wfn, hfn){
        switch (type) {
            case this.EDGE_TYPE.LEFT:
            case this.EDGE_TYPE.RIGHT:
                wfn();
                break;
            case this.EDGE_TYPE.TOP:
            case this.EDGE_TYPE.BOTTOM:
                hfn();
                break;
        }
    },
    /**
     * @param {{expandElements:Array,contractElements:Array}} tdArr
     * @param {Number[]} point
     * @param {String} type
     * @return {Number[]}
     * @private
     */
    _calMinMaxPoint: function (tdArr, point, type){
        var min = this._minimum(tdArr.expandElements, type);
        var max = this._minimum(tdArr.contractElements, type);
        var subPoint = this._subtractPoint(point, this._mouseData.downPoint);
        var x = 0;
        var y = 0;
        this._switch(type, function(){
            x = Math.min(Math.max(subPoint[0] + min, 0), max+min) - min;
        }, function(){
            y = Math.min(Math.max(subPoint[1] + min, 0), max+min) - min;
        });
        return this._addPoint(this._mouseData.downPoint, [x,y]);
    },
    /**
     * @param {HTMLElement} td
     * @returns {Number}
     * @private
     */
    _getTdWidth: function(td){
        return Trex.TableUtil.getCellOffset(td).width;
    },

    /**
     * @param {HTMLElement} td
     * @returns {Number}
     * @private
     */
    _getTdHeight: function(td) {
        return Trex.TableUtil.getCellOffset(td).height;
    },

    /**
     *
     * @param {{expandElements:Array, contractElements:Array}} tdArr
     * @param {String} type
     * @param {Number[]} point
     * @private
     */
    _resize: function(tdArr, point, type){
        var self = this;
        var p = this._subtractPoint(this._calMinMaxPoint(tdArr, point, type), this._mouseData.downPoint);

        this._switch(type, function(){
            self._resizeWidth(tdArr, p[0]);
        }, function(){
            self._resizeHeight(tdArr, p[1]);
        });
        this._canvas.history.saveHistory();

    },
    /**
     * @param {{expandElements:Array, contractElements:Array}} tdArr
     * @param {Number} d
     * @private
     */
    _resizeWidth: function(tdArr, d) {
        var self = this;
        tdArr.expandElements.each(function(td){
            td.style.width = (self._getTdWidth(td) + d).toPx();
        });
        tdArr.contractElements.each(function(td){
            td.style.width = (self._getTdWidth(td) - d).toPx();
        });
        if(tdArr.contractElements.length == 0){
            var table = $tom.find(tdArr.expandElements[0],'table');
            this._resizeTableWidth(table,d)
        }
    },
    _resizeTableWidth: function(table, d) {
        var tableWidth = (Math.min(table.offsetWidth + d, this._canvas.getSizeConfig().contentWidth)).toPx();
        table.width = tableWidth;
        table.style.width = tableWidth;
    },
    _resizeHeight: function(tdArr, d){
        var self = this;
        tdArr.expandElements.each(function(td){
            td.style.height = (self._getTdHeight(td) + d).toPx();
        });
        tdArr.contractElements.each(function(td){
            td.style.height = (self._getTdHeight(td) - d).toPx();
        });
    }
});

Trex.module("table resize dragger", function(editor, toolbar, sidebar, canvas) {
    canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
        new Trex.Table.Dragger(editor);
    });
});
