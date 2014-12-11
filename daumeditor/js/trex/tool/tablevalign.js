/**
 * @fileoverview
 * table, cell valign
 *
 */
TrexConfig.addTool(
    "tablevalign",
    {
        wysiwygonly: _TRUE,
        sync: _FALSE,
        status: _TRUE,
        options: [
            { label: '상단맞춤', data: 'TOP' , klass: 'cell_ico cell_top' },
            { label: '중간맞춤', data: 'MIDDLE' , klass: 'cell_ico cell_mid' },
            { label: '하단맞춤', data: 'BOTTOM' , klass: 'cell_ico cell_bot' }
        ]
    }
);

Trex.Tool.TableValign = Trex.Class.create({
    $const: {
        __Identity: 'tablevalign'
    },
    $extend: Trex.Tool,
    oninitialized: function() {
        var canvas = this.canvas;
        var self = this;

        this.button = new Trex.Button(this.buttonCfg);

        var _toolHandler = function(a) {
            canvas.getProcessor().table.execute(function(){
                var tds = canvas.getProcessor().table.getTdArr();
                tds.each(function(el){
                    el.style.verticalAlign = a.toLowerCase();
                });
            });
        };

        /* button & menu weave */
        this.weave.bind(this)(
            /* button */
            self.button,
            /* menu */
            new Trex.Menu.Tablevalign(this.menuCfg),
            /* handler */
            _toolHandler
        );
    }
});
Trex.MarkupTemplate.add(
    'menu.tablevalign',
    '<ul class="tx-menu-list list_valign" unselectable="on">#{items}</ul>'
);

Trex.Menu.Tablevalign = Trex.Class.create(/** @lends Trex.Menu.Select.prototype */{
    /** @ignore */
    $extend: Trex.Menu,
    /**
     * menu를 생성한다.
     * @function
     */
    generate: function() {
        /*
         [{
         label: "string",
         title: "string",
         data: "string",
         klass: "string"
         }]
         */
        var _config = this.config;
        var _optionz = this.getValidOptions(_config);

        var _elList = this.generateList(_optionz);
        $tom.insertFirst(this.elMenu, _elList);

        if (this.generateHandler) {
            this.generateHandler(_config);
        }
        if (this.ongeneratedList) {
            this.generateList = this.ongeneratedList.bind(this);
        }
        if (this.ongeneratedListItem) {
            this.generateListItem = this.ongeneratedListItem.bind(this);
        }
    },

    /**
     * menu 의 list markup 을 만들고 event handler 를 연결한다.
     * @function
     */
    generateList: function(optionz) {
        var _elGroup = Trex.MarkupTemplate.get("menu.tablevalign").evaluateAsDom({
            'items': this.generateListItem(optionz)
        });

        var _elItemList = $tom.collectAll(_elGroup, "li a");
        for (var i=0; i < optionz.length; i++) {
            var _option = optionz[i];
            var _elItem = _elItemList[i];
            $tx.observe(_elItem, "click", this.onSelect.bindAsEventListener(this, _option.data, _option.title));
        }
        return _elGroup;
    },
    /**
     * menu 의 list item markup 생성한다.
     * @function
     * @return {String} HTML markup
     */
    generateListItem: function(option) {
        var result = [];
        for(var i=0; i < option.length; i++) {
            result.push(Trex.MarkupTemplate.get("menu.select.item").evaluate(option[i]));
        }
        return result.join("");
    },
    /**
     * menu 의 list item 이 선택되었을 때 command 를 실행한다.
     * @function
     */
    onSelect: function() {
        var _args = $A(arguments);
        var _ev = _args.shift();
        this._command.apply(this, _args);
        this.hide();
        $tx.stop(_ev);
    }
});


