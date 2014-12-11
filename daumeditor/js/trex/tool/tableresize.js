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
    '@tableresize.width': "너비",
    '@tableresize.height': "높이"
});

TrexConfig.addTool(
    "tableresize",
    {
        wysiwygonly: _TRUE,
        sync: _FALSE,
        status: _TRUE
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
            canvas.execute(function(processor){
                processor.table.resize(data);
            });
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
    '<p class="desc_cellsize">선택된 표cell 크기를 입력해주세요.</p>',
    '<div>',
    '<label for="cellWidth">@tableresize.width</label>',
    '<input type="text" name="cellWidth" id="cellWidth" class="inp_cellw" /> px',
    '</div>',
    '<div>',
    '<label for="cellHeight">@tableresize.height</label>',
    '<input type="text" name="cellHeight" id="cellHeight" class="inp_cellh" /> px',
    '</div>',
    '<div class="wrap_btn">',
    '<img src="@tableresize.confirm.image" class="tx-menu-btn" alt="확인" />',
    '<img src="@tableresize.cancel.image" class="tx-menu-btn" alt="취소" />',
    '</div>',
    '</div><!-- //tx-menu-inner -->'
    ].join("\n")
);
Trex.Menu.TableResize = Trex.Class.create({
    $extend: Trex.Menu,
    ongenerated: function() {
        var _elMenu = this.elMenu;
        Trex.MarkupTemplate.get('menu.tableresize').evaluateToDom({}, _elMenu);
        var self = this;
        var _elInput = $tom.collectAll(_elMenu, 'input');
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
        var p = Editor.getCanvas().getProcessor();
        var td = p.table.getTdArr()[0];
        var _elInput =$tom.collectAll(_elMenu, 'input');
        if(!td){
            _elInput[0].value = '';
            _elInput[1].value = '';
        }else {
            var offset = Trex.TableUtil.getCellOffset(td);
            _elInput[0].value = offset.width;
            _elInput[1].value = offset.height;
        }
    }
});


