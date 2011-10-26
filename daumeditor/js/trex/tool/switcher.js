/**
 * @fileoverview 
 *  wysiwyg, source, text 세모드로의 변경을 가능하게하는 dropdown 형식의 tool 'Switcher' Source,
 * Class Trex.Tool.Switcher 와 configuration을 포함    
 *     
 */

TrexMessage.addMsg({
	'@switcher.wysiwyg': '에디터',
	'@switcher.source': 'HTML',
	'@switcher.text': '텍스트'
});

TrexConfig.addTool(
	"switcher",
	{
		wysiwygonly: _FALSE,
		status: _TRUE,
		options: [
			{ label: TXMSG('@switcher.wysiwyg'), title: TXMSG('@switcher.wysiwyg'), data: 'html' },
			{ label: TXMSG('@switcher.source'), title: TXMSG('@switcher.source'), data: 'source' },
			{ label: TXMSG('@switcher.text'), title: TXMSG('@switcher.text'), data: 'text' }
		]
	}
);

Trex.Tool.Switcher = Trex.Class.create({
	$const: {
		__Identity: 'switcher'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _canvas = this.canvas;
			
			var _map = {};
			config.options.each(function(option) {
				_map[option.data] = {
					title: option.title
				};
			});
			
			var _cachedProperty = "";
			var _defaultProperty = config.options[0];
			
			var _isChangeToTextMode = function (mode) {
				if (mode === "text") {
					if (_canvas.mode !== "text") {
						return _TRUE;
					}
				}
				return _FALSE;
			};
			var _hasContent = function () {
				var content, curText, baseText;
				content = _canvas.getContent();
				curText = content.toLowerCase().trim();
				baseText = $tom.EMPTY_PARAGRAPH_HTML.toLowerCase().trim();
				if (curText && curText !== baseText && curText !== "&nbsp;") {
					return _TRUE;
				}
				return _FALSE;
			};
			var _toolHandler = function (data) {
				if (config.changeModeConfirmMsg) {
					if (_isChangeToTextMode(data)) {
						if (_hasContent()) {
							if (_FALSE === confirm(config.changeModeConfirmMsg)) {
								return $stop;
							}
						}
					}
				}
				_canvas.changeMode(data);
			};
			
			var _changeMode = function(from, to) {
				if(from == to) return;
				if(_cachedProperty == to) {
					return;
				}
				if(!_map[to]) {
					return;
				}
				this.button.setValue(to);
				this.button.setText(_map[to].title);
				_cachedProperty = to; //NOTE: Editor.modify()를 통한 로딩일 경우 switcher 동기화를 위해.
			}.bind(this);
			
			_canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, _changeMode);
			_canvas.observeJob(Trex.Ev.__CANVAS_MODE_INITIALIZE, _changeMode);

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button.Select(TrexConfig.merge(this.buttonCfg, {
					selectedValue: _defaultProperty.data,
					selectedText: _defaultProperty.label 
				})),
				/* menu */
				new Trex.Menu.Select(this.menuCfg),
				/* handler */
				_toolHandler
			);
		}
	
});
