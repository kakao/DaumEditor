var EditorCreator = {
    convert: function (el, template, callback) {
        if (!el || !template || !$tom) return;

        $tom.applyStyles(el, {display: 'none'});
        Trex.I.XHRequester.sendRequest('get',
            template,
            '',
            false,
            function (html) {
                var root = document.createElement('div');
                root.innerHTML = html;
                $tom.insertNext(root, el);
                callback && callback();
            }
        );
    }
};