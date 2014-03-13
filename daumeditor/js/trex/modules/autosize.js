/**
 * Created by sungwon on 14. 3. 12.
 */
Trex.module("auto canvas height resize",
    function(editor, toolbar, sidebar, canvas, config){
        var _config = config.canvas;
        if(!_config.autoSize)
            return;
        var beforeHeight = 0;
        function _resize(){
            var _panel = canvas.getCurrentPanel();
            if(!canvas.isWYSIWYG()) return;
            var _doc = _panel.getDocument();
            var _h;
            if($tx.msie){
                var _body = _doc.body;
                $tx.setStyle(_body,{
                    position: 'absolute'
                });
                _h = _body.offsetHeight ;
                //스크롤 여부 확인 body 높이가 > maxHeight 일경우
                if(_h >= _config.maxHeight)
                    $tx.setStyle(_body,{
                        overflow: ''
                    });
                else {
                    $tx.setStyle(_body,{
                        overflow: 'hidden'
                    });
                }
                //높이 변경이 없는 경우
                $tx.setStyle(_body,{
                    position: ''
                });
            }else {
                _h = _doc.documentElement.offsetHeight;
            }

            if(_h == beforeHeight) {
                return;
            }

            var _height = Math.min(Math.max(parseInt(_h, 10), _config.minHeight), _config.maxHeight).toPx();
            _panel.setPanelHeight(_height);
            canvas.fireJobs('canvas.height.change', _height);
            beforeHeight = _h;
        }
        setInterval(_resize, 200);
    }
);