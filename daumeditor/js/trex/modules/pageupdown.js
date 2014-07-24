/**
 * Created by sungwon on 14. 7. 21.
 */
Trex.module("page up & down", function(editor, toolbar, sidebar, canvas, config) {
    canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function(doc) {
        function exeHandler(){
            moveScroll();
        }
        function moveScroll(){
            var top = (_WIN.pageYOffset || _DOC.documentElement.scrollTop) - (_DOC.documentElement.clientTop||0);
            var left = (_WIN.pageXOffset || _DOC.documentElement.scrollLeft) - (_DOC.documentElement.clientLeft||0);

            function fixscroll(e){
                window.scrollTo(left, top);
                //$tx.stop(e);
            }

            $tx.observe(_DOC, 'scroll', fixscroll);

            setTimeout(function(){
                $tx.stopObserving(_DOC, 'scroll', fixscroll);
            },30);

        }
        $tx.observe(doc, 'keydown', function(e){
            if(/^(33|34)$/.test(e.keyCode)){
                exeHandler();
            }

        });

    });
});