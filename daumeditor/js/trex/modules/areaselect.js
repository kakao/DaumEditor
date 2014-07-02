Trex.MarkupTemplate.add('module.areaselect',
    '<div class="tx-area-selection" contenteditable="false" style="position:absolute;z-index:999;display: block; left: 0px;line-height:1; top: 0px; width: 0px; height: 0px;border:1px dashed #000000;">' +
    '<div class="tx-area-selection-bg" style="width:100%;height:100%;background-color: black;position:absolute;z-index:1000"></div>' +
    '<div class="tx-area-holder" style="display:none;position: absolute; z-index: 1000; line-height: 1; cursor:nw-resize; bottom: -4px; right: -5px; border:1px solid #000000;width:8px;height:8px;background-color: #FFFFFF;"></div>' +
    '<div class="tx-area-selection-info" style="display:none;position: absolute; z-index:1002; line-height: 1;top: 5px; right: 5px; background-color:#000000;font-size:12px;color:#FFFFFF;padding: 3px">0x0</div>' +
    '</div>');

/**
 * @desc Area 모듈
 * @type {{}}
 */
Trex.Area = {};

Trex.Area.Select = Trex.Class.single({
    /**
     * @type {_NULL|HTMLElement}
     * @private
     */
    _target: _NULL,
    /**
     * @type {HTMLElement}
     * @private
     */
    _selectElement: _NULL,
    _isSelect:_FALSE,
    initialize: function(editor){
        this._canvas = editor.getCanvas();
        this._panel = this._canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        this._doc = this._panel.getDocument();
        this._win = this._panel.getWindow();
        this._selectElement = this._makeElement();
    },
    _getCanvas: function(){
        return this._canvas;
    },
    _getPanel: function(){
        return this._panel;
    },
    _getWindow: function(){
        return this._win;

    },
    _getDocument: function(){
        return this._doc;
    },
    /**
     * @param {HTMLElement} element
     * @returns {{left: number, right: number, top: number, bottom:number, width: number, height:number}}
     * @private
     */
    _getPosition: function(element){
        var of = $tx.getCoordsTarget(element);
        var width = of.right - of.left;
        var height = of.bottom - of.top;
        of.width = width;
        of.height = height;
        return of;
    },

    /**
     * @param {{}} style
     * @private
     */
    _setSelectStyle: function(style){
        $tx.setStyle(this._selectElement, style);
    },

    /**
     * @param {number} width
     * @param {number} height
     * @private
     */
    _setSelectInfo: function(width, height){
        var INFO_MIN_WIDTH = 100;
        var INFO_MIN_HEIGHT = 50;
        var info = $tom.collect(this._selectElement,'.tx-area-selection-info');
        info.innerHTML = width + 'x' + height;
        if(width < INFO_MIN_WIDTH || height < INFO_MIN_HEIGHT){
            $tx.setStyle(info, {
                right: '',
                left: (width + 10).toPx()
            });
        }else {
            $tx.setStyle(info, {
                right: '5px',
                left: ''
            });
        }
    },

    /**
     * @param {HTMLElement} element
     * @private
     */
    _makeSelect: function(element){
        if(!element){
            this.reset();
        }else {
            var po = this._getPosition(element);
            $tx.show(this._selectElement);

            this._setSelectStyle({
                top: po.top.toPx(),
                left: po.left.toPx(),
                width: po.width.toPx(),
                height: po.height.toPx()
            });
            this._setSelectInfo(po.width, po.height);
        }
    },
    _makeElement: function(){
        var sel= Trex.MarkupTemplate.get("module.areaselect").evaluateAsDom({});
        $tx.setOpacity($tom.collect(sel,'.tx-area-selection-bg'),0.2);
        $tx.setOpacity($tom.collect(sel,'.tx-area-selection-info'),0.7);
        return sel;
    },
    isSelect: function(){
        return this._isSelect;
    },
    /**
     *
     * @param element
     */
    select: function(element){
        this._canvas.fireJobs(Trex.Ev.__CANVAS_SELECT_ITEM);
        this._target = element;
        $tom.insertNext(this._selectElement,this._doc.body);
        this._isSelect = _TRUE;
        this._makeSelect(element);
    },
    update: function(element){
        this._makeSelect(element||this._target);
    },
    reset: function(){
        if(this.isSelect())
            this._canvas.fireJobs(Trex.Ev.__CANVAS_UNSELECT_ITEM);
        this._isSelect = _FALSE;
        $tom.remove(this._selectElement);
        this._target = _NULL;
    },
    getTarget: function(){
        return this._target;
    }

});

Trex.Area.Resize = Trex.Class.single({
    _mouseData : {
        downPoint:[0,0],
        targetOffset: _NULL,
        moveTarget: _NULL
    },
    /**
     * @desc 'NONE' 일반 'DRAG' 드래그 중
     */
    _state : 'NONE',
    /**
     * @param {Trex.Area.Select} select
     */
    initialize: function(select){
        this._holer = $tom.collect(select._selectElement,'.tx-area-holder');
        this._info = $tom.collect(select._selectElement,'.tx-area-selection-info');
        this._state = 'NONE';
        this._canvas = select._getCanvas();
        this._select = select;
        /**
         * @type {Trex.Canvas.WysiwygPanel}
         * @private
         */
        this._panel = select._getPanel();
        /**
         * @type {HTMLDocument}
         * @private
         */
        this._doc = select._getDocument();
        /**
         * @type {Window}
         * @private
         */
        this._win = select._getWindow();
        this._observeEvent();
    },
    _observeEvent: function(){
        var self = this;
        $tx.observe(this._holer, 'mousedown',function(e){
            self._mousedown(e);

        }, false);
        $tx.observe(this._holer, 'mouseup',function(e){
            self._mouseup(e);
        }, false);
        $tx.observe(this._holer, 'mousemove',function(e){
            self._mousemove(e);
        }, false);
        $tx.observe(_DOC.body, 'mouseup',function(e){
            self._mouseup(e);
        }, false);
        $tx.observe(_DOC.body, 'mousemove',function(e){
            self._mousemove(e);
        }, false);


        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEMOVE, function(e){
            self._mousemove(e);
        });
        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEUP, function(e){
            self._mouseup(e);
        });
    },
    _mousedown: function(e){
        if(this._state === 'NONE'){
            this._changeState('DRAG');
            this._mouseData.downPoint = this._getPointByEvent(e);
            var offset = $tx.getOffset(this._select.getTarget());
            this._mouseData.targetOffset = offset;
            var el = this._select.getTarget().cloneNode(_TRUE);
            $tx.setStyle(el,{
                position: 'absolute',
                top: offset.top.toPx(),
                left: offset.left.toPx(),
                zIndex: 998
            });
            $tx.setOpacity(el, 0.3);
            $tom.insertNext(el,this._doc.body);
            this._mouseData.moveTarget = el;
            $tx.stop(e);
        }
    },
    _mouseup: function(e){
        if(this._state === 'DRAG'){
            this._changeState('NONE');
            $tom.remove(this._mouseData.moveTarget);
            this._resize(this._select.getTarget(),this._getPointByEvent(e));
            this._mouseData.moveTarget = _NULL;
            this.update();
            $tx.stop(e);
        }
    },
    _mousemove: function(e){
        if(this._state === 'DRAG'){
            this._resize(this._mouseData.moveTarget,this._getPointByEvent(e));
            this.update(this._mouseData.moveTarget);
            $tx.stop(e);
        }
    },
    _resize: function(el, point){
        if(!el) return;
        var p = this._subtractPoint(point, this._mouseData.downPoint);
        this._setWidth(el, p[0]);
        this._setHeight(el, p[1]);
    },
    _setWidth: function(el, d){
        var elw = this._mouseData.targetOffset.right - this._mouseData.targetOffset.left;
        var width = (Math.min(Math.max(elw + d,10), this._canvas.getSizeConfig().contentWidth)).toPx();
        el.width = width;
        el.style.width = width;
    },
    _setHeight: function(el, d){
        var elh = this._mouseData.targetOffset.bottom - this._mouseData.targetOffset.top;
        var height = (Math.max(elh + d, 10)).toPx();
        el.height = height;
        el.style.height = height;
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
            var of = $tx.getOffset(this._panel.el);
            return [x-of.left+(this._win.pageXOffset || this._doc.documentElement.scrollLeft), y-of.top+(this._win.pageYOffset || this._doc.documentElement.scrollTop)];
        }
        return [x,y]
    },/**
     * @param {Number[]} p1
     * @param {Number[]} p2
     * @return {Number[]}
     * @private
     */
    _subtractPoint: function(p1, p2){
        return [ p1[0] - p2[0], p1[1] - p2[1] ];
    },
    isSelect: function(){
        return this._select.isSelect();
    },
    select: function(element){
        this._select.select(element);
        $tx.show(this._holer);
    },
    update: function(element){
        this._select.update(element);
        $tx.show(this._info);
    },
    reset: function(){
        this._select.reset();
        $tx.hide(this._info);
        $tx.hide(this._holer);
    },
    getTarget: function(){
        return this._select.getTarget();
    }
});

Trex.Area.Control = Trex.Class.single({
    $mixins: [Trex.I.KeyObservable],
    initialize: function(select){
        this._select = select;
        this._canvas = select._canvas;
        this._observeEvent();

    },
    _observeEvent: function(){
        var self = this;
        this.observeKey({
            keyCode: 46
        },  function(e){
                if(self.isSelect()){
                    $tom.remove(self._select.getTarget());
                    self.reset();
                    $tx.stop(e);
                }
            }
        );
        this._canvas.observeJob(Trex.Ev.__CANVAS_PANEL_KEYDOWN, function(e){
            if(/^(46)$/.test(e.keyCode)){
                self.fireKeys(e);
            }
            self.reset();
        });

    },
    getTarget: function(){
        return this._select.getTarget();
    },
    isSelect: function(){
        return this._select.isSelect();
    },
    select: function(element){
        this._select.select(element);
    },
    update: function(element){
        this._select.update(element);
    },
    reset: function(){
        this._select.reset();
    }

});

Trex.module("area select", function(editor, toolbar, sidebar, canvas, config){
    canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
        var _processor = canvas.getProcessor();
        var select = new Trex.Area.Control(new Trex.Area.Resize(new Trex.Area.Select(editor)));
        Trex.Area.Select.getSelection = function(){
            return select;
        };
        if($tx.msie8under) return;
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(e){
            var el = $tx.element(e);
            if(!$tx.msie8under) {
                var _node = $tx.element(e);
                if ($tom.kindOf(_node, "img")){
                    _processor.createGoogFromNodeContents(_node).select();
                }
            }
            el = $tom.find( el, 'img')||($tom.kindOf(el,'table')&&el);
            if(!el) {
                select.reset();
                return;
            }
            select.select(el);
            $tx.stop(e);

        });
        canvas.observeJob(Trex.Ev.__CANVAS_SELECT_ITEM, function(){
            setTimeout(function() {
                var googRange = canvas.getProcessor().createGoogRange();
                if (googRange) {
                    canvas.fireJobs(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, googRange);
                }
            }, 20);

        });
        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_SCROLLING, function(e){
            select.update();
        });

        $tx.observe(_DOC.body, "mousedown", function(ev) {
            select.reset();
        });
        toolbar.observeJob(Trex.Ev.__TOOL_CLICK, function (identity) {
            if(/align(center|full|left|right)/.test(identity) && $tom.kindOf(select.getTarget(), 'table')){
            }
            else {
                select.reset();
            }

        });

    });

});