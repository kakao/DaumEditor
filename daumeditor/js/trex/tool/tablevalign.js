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
        rows: 1,
        cols: 3,
        options: [
            { label: 'image', data: 'TOP' , klass: 'tx-tablevalign-1' },
            { label: 'image', data: 'MIDDLE' , klass: 'tx-tablevalign-2' },
            { label: 'image', data: 'BOTTOM' , klass: 'tx-tablevalign-3' }
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
            new Trex.Menu.List(this.menuCfg),
            /* handler */
            _toolHandler
        );
    }
});


