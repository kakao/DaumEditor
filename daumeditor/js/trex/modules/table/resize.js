/**
 * Created by sungwon on 14. 6. 13.
 */

Trex.Table.Resize = Trex.Class.create({
    TYPE: {
        WIDTH: 'WIDTH',
        HEIGHT: 'HEIGHT'
    },
    initialize: function (editor/*, config*/) {
        var canvas;
        canvas = editor.getCanvas();
        /**
         * @private
         * @type {Trex.Canvas}
         */
        this.canvas = canvas;
        /**
         * @private
         * @type {Trex.Canvas.WysiwygPanel}
         */
        this.wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
    },
    /**
     *
     * @param {Trex.Table.Selector} select
     * @param {String} type
     * @param {Number} d
     * @param {Boolean=} isDifference
     */
    resize: function(select, type, d, isDifference){
        var els = _NULL;
        if(type == this.TYPE.WIDTH){
            els = this._makeTDArrWidth(select);
        }else {
            els = this._makeTDArrHeight(select);
        }
        if(els.expandElement == 0 ){
            return;
        }
        if(type == this.TYPE.WIDTH){
            this._resizeWidth(els.expandElement, d, isDifference);
            this._resizeTableWidth(select.currentTable);
        }else {
            this._resizeHeight(els.expandElement, d, isDifference)
            this._deleteTableHeight(select.currentTable)
        }
    },
    /**
     * @param {Number} start
     * @param {Number} end
     * @param {Number} step
     * @private
     */
    _range: function(start, end, step){
        var res = [];
        var pos = start;
        while(start<=pos&&pos<=end){
            res.push(pos);
            pos += step;
        }
        return res;
    },
    /**
     * @private
     * @param {Trex.Table.Selector} select
     * @return {Object}
     */
    _makeTDArrWidth : function(select){
        var curBoundery = select.getSelected();
        var indexer = select.getIndexer();

        var expandElement = indexer.getTdArrCol.apply(indexer, this._range(curBoundery.left,curBoundery.right,1));
        var contractElement = [];
        return {expandElement: expandElement, contractElement:contractElement}
    },
    /**
     * @private
     * @param {Trex.Table.Selector} select
     * @return {Object}
     */
    _makeTDArrHeight : function(select){
        var curBoundery = select.getSelected();
        var indexer = select.getIndexer();

        var expandElement = indexer.getTdArrRow.apply(indexer, this._range(curBoundery.top,curBoundery.bottom,1));
        var contractElement = [];
        return {expandElement: expandElement, contractElement:contractElement}
    },
    /**
     *
     * @param {Array} tds
     * @param {Number} d
     * @param {Boolean=} isDifference
     * @private
     */
    _resizeWidth: function(tds, d, isDifference){
        var MIN_WIDTH = 10;
        if (tds) {
            for (var i = 0; i < tds.length; i++) {
                tds[i].style.width = Math.max((isDifference?this._getTdWidth(tds[i]):0) + (d*tds[i].colSpan||1),MIN_WIDTH).toPx();
            }
        }
    },
    /**
     *
     * @param {Element} table
     * @private
     */
    _resizeTableWidth: function(table) {
        if(!table || !table.rows) return;
        var movingWidth = Math.min(this._getTableWidth(table), this.canvas.getSizeConfig().contentWidth);
        table.width = movingWidth.toPx();
        table.style.width = movingWidth.toPx();
    },
    /**
     *
     * @param {Element} table
     * @returns {Number}
     * @private
     */
    _getTableWidth: function(table){
        if(!table || !table.rows) return 0;
        var res = 0;
        var self = this;
        Array.prototype.each.call(table.rows[0].children,function(td){
            res+=self._getTdWidth(td);
        });
        return res;
    },
    /**
     *
     * @param {Element} td
     * @return {Number}
     * @private
     */
    _getTdWidth: function(td){
        var width = td.width||td.style.width;
        if(width.indexOf("%")!=-1)
            return td.offsetWidth;
        else
            return parseInt(width,10);
    },

    /**
     *
     * @param {Array} tds
     * @param {Number} d
     * @param {Boolean=} isDifference
     * @private
     */
    _resizeHeight: function(tds, d, isDifference){
        var MIN_HEIGHT = 20;
        if (tds) {
            for (var i = 0; i < tds.length; i++) {
                tds[i].style.height = (Math.max(parseInt((isDifference?tds[i].style.height:0),10) + (d*tds[i].rowSpan||1), MIN_HEIGHT)).toPx();
            }
        }
    },
    _deleteTableHeight: function(table){
        table.height = '';
        table.style.height = '';
    }

});
