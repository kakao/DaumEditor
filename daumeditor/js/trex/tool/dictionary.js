/**
 * @fileoverview 
 * 영어 사전 팝업을 띄워 주는 '사전' Icon을 위해 필요한 source, configuration과 Class Trex.Tool.Dictionary을/를 포함    
 *   
 */
TrexConfig.addTool(
	"dictionary",
	{
		url: 'http://engdic.daum.net/dicen/small_view_top.do',
		sync: _FALSE,
		status: _FALSE
	}
);

Trex.Tool.Dictionary = Trex.Class.create({
	$const: {
		__Identity: 'dictionary'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _canvas = this.canvas;

			var _toolHandler = function() {
				var _word = _canvas.query(function(processor) {
					return encodeURI(processor.getText());
				});
				var _popupUrl = (_word.length > 0) ?  "http://engdic.daum.net/dicen/small_search.do" : config.url;
				var _dicWin = _WIN.open(_popupUrl + '?q=' + _word, 'dicWin', 'width=410,height=550,scrollbars=yes'); 
				_dicWin.focus();
			};

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				_NULL,
				/* handler */
				_toolHandler
			);
		}
});
