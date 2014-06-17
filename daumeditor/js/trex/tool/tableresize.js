/**
 * @fileoverview
 * table, cell resize
 *
 */


TrexMessage.addMsg({
    '@tableresize.cancel.image': "#iconpath/btn_cancel.gif?v=2",
    '@tableresize.confirm.image': "#iconpath/btn_confirm.gif?v=2",
    '@tableresize.invalid': "잘못된 입력 값 입니다.",
    '@tableresize.title': "선택된 표 cell 크기를 입력해 주세요.",
    '@tableresize.width': "너비(px)",
    '@tableresize.height': "높이(px)"
});

TrexConfig.addTool(
    "tableresize",
    {
        wysiwygonly: _TRUE,
        sync: _FALSE,
        status: _TRUE,
        rows: 2,
        cols: 1,
        options: [
            { label: 'image', data: 1 , klass: 'tx-tabletemplate-1' },
            { label: 'image', data: 2 , klass: 'tx-tabletemplate-2' }
        ]
    }
);

Trex.Tool.TableResize = Trex.Class.create({
    $const: {
        __Identity: 'tableresize'
    },
    $extend: Trex.Tool,
    oninitialized: function() {
        var canvas = this.canvas;
        var self = this;

        this.button = new Trex.Button(this.buttonCfg);

        var _toolHandler = function(data) {
            if(data.width != null)
                canvas.getProcessor().table.resize('WIDTH', data.width);
            if(data.height != null)
                canvas.getProcessor().table.resize('HEIGHT', data.height);
        };



        /* button & menu weave */
        this.weave.bind(this)(
            /* button */
            self.button,
            /* menu */
            new Trex.Menu.TableResize(this.menuCfg),
            /* handler */
            _toolHandler
        );
    }
});

Trex.MarkupTemplate.add(
    'menu.tableresize', [
        '<div class="tx-menu-inner">',
        '    <dl>',
        '        <dt>',
        '            @tableresize.title',
        '        </dt>',
        '        <dd>',
        '            <span>@tableresize.width</span><input type="text" class="tx-text-input"/>',
        '        </dd>',
        '        </dt>',
        '        <dd>',
        '            <span>@tableresize.height</span><input type="text" class="tx-text-input"/>',
        '        </dd>',
        '        <dd class="tx-hr">',
        '            <hr/>',
        '        </dd>',
        '        <dd>',
        '            <img width="32" height="21" src="@tableresize.confirm.image"/>',
        '            <img width="32" height="21" src="@tableresize.cancel.image"/>',
        '        </dd>',
        '    </dl>',
        '</div>'
    ].join("")
);
Trex.Menu.TableResize = Trex.Class.create({
    $extend: Trex.Menu,
    ongenerated: function() {
        var _elMenu = this.elMenu;
        Trex.MarkupTemplate.get('menu.tableresize').evaluateToDom({}, _elMenu);
        var self = this;
        var _elInput = $tom.collectAll(_elMenu, 'input.tx-text-input');
        $tx.observe(_elInput[0], "keydown", function(ev) {
            var element = $tx.element(ev);
            if(ev.keyCode == 13) { //Enter
                var _val = self._isValidation(element.value);
                if (!_val) {
                    alert( TXMSG("@tableresize.invalid") );
                    $tx.stop(ev);
                    return;
                }
                this.onSelect(ev, {
                    width: parseInt(element.value)
                });
                $tx.stop(ev);
            }
        }.bindAsEventListener(this));
        $tx.observe(_elInput[1], "keydown", function(ev) {
            var element = $tx.element(ev);
            if(ev.keyCode == 13) { //Enter
                var _val = self._isValidation(element.value);
                if (!_val) {
                    alert( TXMSG("@tableresize.invalid") );
                    $tx.stop(ev);
                    return;
                }
                this.onSelect(ev, {
                    height: parseInt(element.value)
                });
                $tx.stop(ev);
            }
        }.bindAsEventListener(this));

        var _elImgs = $tom.collectAll(_elMenu, 'img');
        $tx.observe(_elImgs[0], "click", function(ev) {
            var _val = self._isValidation(_elInput[0].value)&&self._isValidation(_elInput[1].value);
            if (!_val) {
                alert( TXMSG("@tableresize.invalid") );
                $tx.stop(ev);
                return;
            }
            this.onSelect(ev, {
                width: parseInt(_elInput[0].value),
                height: parseInt(_elInput[1].value)
            });

            $tx.stop(ev);
        }.bind(this));

        $tx.observe(_elImgs[1], "click", function() {
            this.onCancel();
        }.bindAsEventListener(this));

    },
    _isValidation: function(n){
        return  n > 0;
    },
    onregenerated: function() {
        var _elMenu = this.elMenu;
        var _elInput =$tom.collectAll(_elMenu, 'input.tx-text-input');
        _elInput[0].value = '';
        _elInput[1].value = '';
    }
});


