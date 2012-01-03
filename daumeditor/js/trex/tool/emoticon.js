(function() {
    TrexMessage.addMsg({
        '@emoticon.subtitle.person': '사람',
        '@emoticon.subtitle.animal': '동식물',
        '@emoticon.subtitle.thing': '사물',
        '@emoticon.subtitle.etc': '기타'
    });

    var createEmoticonURLs = function (category, maxNum){
        var urls = [];
        for (var i = 1; i <= maxNum; i++) {
            urls.push('#decopath/emoticon/' + category + '_' + addZeroPadding(i) + '.gif?v=2');
        }
        return urls;
    };

    var addZeroPadding = function (number) {
        return (number < 10) ? '0' + number : String(number);
    };

    TrexConfig.addTool("emoticon",
        {
            sync: _FALSE,
            status: _TRUE,
            rows: 5,
            cols: 7,
            matrices: [
                {
                    title: TXMSG("@emoticon.subtitle.person"),
                    klass: "tx-menu-matrix-per",
                    options: createEmoticonURLs("per", 29)
                },
                {
                    title: TXMSG("@emoticon.subtitle.animal"),
                    klass: "tx-menu-matrix-ani",
                    options: createEmoticonURLs("ani", 28)
                },
                {
                    title: TXMSG("@emoticon.subtitle.thing"),
                    klass: "tx-menu-matrix-things",
                    options: createEmoticonURLs("things", 35),
                    defaultshow: _TRUE
                },
                {
                    title: TXMSG("@emoticon.subtitle.etc"),
                    klass: "tx-menu-matrix-etc",
                    options: createEmoticonURLs("etc", 29)
                }
            ],
            asyncUrl: "trex/tool/async/emoticon.js"
        },
        function(root) {
            var emoticonConfig = TrexConfig.getTool("emoticon", root);
            emoticonConfig.matrices.each(function (matrix) {
                for (var i = 0, len = matrix.options.length; i < len; i++) {
                    matrix.options[i] = TrexConfig.getDecoPath(matrix.options[i]);
                }
            });
        }
    );

    Trex.Tool.Emoticon = Trex.Class.create({
        $const: {
            __Identity: 'emoticon'
        },
        $extend: Trex.AsyncTool,
        oninitialized: function () {
			this.weave.bind(this)(
				new Trex.Button(this.buttonCfg), 
				_NULL,
				this.onLoadModule // define in Trex.AsyncTool
			);
        }
    });
    
})();