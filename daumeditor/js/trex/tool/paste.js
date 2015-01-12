/**
 * @fileoverview
 * '붙여넣기' Icon Source,
 * Class Trex.Tool.Paste configuration을 포함
 *
 */
TrexConfig.addTool(
    "paste",
    {
        defaultMode: Trex.Paste.MODE_OFF,
        wysiwygonly: _TRUE,
        sync: _FALSE,
        status: _TRUE,
        options: [
            { label: '끄기', title: '붙여넣기는 브라우저 기본 기능을 사용합니다', data: Trex.Paste.MODE_OFF, klass: 'cell_ico clip_off' },
            { label: '켜기', title: '내용을 정제해서 HTML로 붙여 넣습니다', data: Trex.Paste.MODE_HTML,klass: 'cell_ico clip_on' },
            { label: '문자만', title: '내용을 Text만 붙여 넣습니다', data: Trex.Paste.MODE_TEXT,klass: 'cell_ico clip_text' }
        ]
    }
);

Trex.Tool.Paste = Trex.Class.create({
    $const: {
        __Identity: 'paste'
    },
    $extend: Trex.Tool,
    oninitialized: function(config) {
        var _canvas = this.canvas;
        var _editor = this.editor;
        var _defaultMode = config.defaultMode;

        var _toolHandler = function(command) {
            // reset className
            var elButton = this.button.elButton;
            var resetClassName = elButton.className.replace(/tx\-paste\-[a-z]+/gi, '');
            elButton.className = resetClassName + ' tx-paste-' + command;

            // change paste mode
            var paster = _editor.getPaster();
            paster.switchMode(command);
        };

        /* button & menu weave */
        this.weave.bind(this)(
            /* button */
            new Trex.Button.Select(TrexConfig.merge(this.buttonCfg, {
                selectedValue: _defaultMode
            })),
            /* menu */
            new Trex.Menu.Select(this.menuCfg),
            /* handler */
            _toolHandler);

        // init execute
        this.execute(_defaultMode);
    }
});

Trex.install('force init paste mode', function(editor, toolbar, sidebar, canvas, config) {
    // Toolbar가 활성화 되지 않더라도 defaultMode로 paster를 셋팅하기 위함.
    var paster = editor.getPaster();
    paster.switchMode(config.toolbar.paste.defaultMode);
});