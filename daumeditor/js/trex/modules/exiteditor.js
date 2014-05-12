/**
 * Created by sungwon on 14. 5. 9.
 */
TrexConfig.add(
    {canvas: {exitEditor:{
        desc:'에디터 영역 : 에디터 영역에서 빠져 나오시려면 Shift+ESC키를 누르세요',
        hotKey: {
            shiftKey: true,
            keyCode:27
        },
        nextElement: null
    }}}, null);
Trex.module("exit Editor", function(editor, toolbar, sidebar, canvas, config) {
    var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
    var _elWysiwyg = _wysiwygPanel.el;
    var _config = config.canvas.exitEditor;

    function execHandler(e){
        try{
            if(_config.nextElement){
                _config.nextElement.focus();
                return;
            }
            var el = _elWysiwyg;
            var pattern = 'button,a,input';
            var searchElement = null;
            do{
                var next = $tom.nextContent(el,'#element');
                if($tom.kindOf(next, pattern)){
                    searchElement = next;
                }else {
                    searchElement = $tom.descendant(next, pattern);
                }
                if(searchElement && searchElement.tagName.toLowerCase() === 'a' && (searchElement.href||'').trim() == ''){
                    searchElement = null;
                }
                el = next;
            }while(!searchElement&&el);
            searchElement.focus();
        }catch(e){
            canvas.getProcessor().blur();
        }
    }

    _elWysiwyg.title = _config.desc;

    canvas.observeKey(_config.hotKey, function(ev){
        $tx.stop(ev);
        execHandler(ev);
    });
});