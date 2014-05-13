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
    function isSearchElement(searchElement){
        return !($tx.getStyle(searchElement,'display') == 'none'||
            $tx.getStyle(searchElement,'visibility') == 'hidden' ||
            searchElement.tagName.toLowerCase() === 'input' && searchElement.type == 'hidden'||
            searchElement.tagName.toLowerCase() === 'a' && (searchElement.href||'').trim() == ''||
            searchElement.offsetLeft <= 0);
    }
    function execHandler(e){
        try{
            if(_config.nextElement){
                _config.nextElement.focus();
                return;
            }
            var el = _elWysiwyg;
            var pattern = 'button,a,input,select,object';
            var searchElement = null;
            var els = null;
            do{
                var next = $tom.nextContent(el,'#element');
                if($tom.kindOf(next, pattern)){
                    searchElement = next;
                }else {
                    els = $tom.descendants(next, pattern);
                    searchElement = els.find(isSearchElement);
                }
                if(searchElement){
                    if(!isSearchElement(searchElement))
                        searchElement = null;
                }
                el = next;
            }while(!searchElement&&el);
            if(searchElement)
                searchElement.focus();
            else
                canvas.getProcessor().blur();
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