/**
 * @fileoverview 
 * 여러 스타일의 구분선을 삽입할 때 쓰이는 menu를 포함하는 Tool인 '구분선' Icon Source,
 * Class Trex.Tool.HorizontalRule과 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"horizontalrule",
	{
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _TRUE,
		top: _NULL,
		left: _NULL,
		options: [{	data: 'tx-hr-border-1', 
			image: '#iconpath/horizontalrule/line01.gif?v=2',
			html: '<hr style="display:block; border: black 0 none; border-top: black 1px solid; height: 1px"/>'
		},
		{	data: 'tx-hr-border-2',
			image: '#iconpath/horizontalrule/line02.gif?v=2',
			html: '<hr style="display:block; border: black 0 none; border-top: black 1px solid; border-bottom: black 3px solid; height: 7px"/>'
		},
		{	data: 'tx-hr-border-3',
			image: '#iconpath/horizontalrule/line04.gif?v=2',
			html: '<hr style="display:block; border: black 0 none; border-top: black 1px dotted; height: 1px"/>'
		},
		{	data: 'tx-hr-image-1',
			image: '#iconpath/horizontalrule/line03.gif?v=2',
			html: '<div style="background: url(#decopath/horizontalrule/line03.gif?v=2) repeat-x scroll left;  width: 99%; height: 15px"><hr style="border: black 0 none; left: -9999px; position: relative; top: -9999px"></div>'
		},
		{	data: 'tx-hr-image-2',
			image: '#iconpath/horizontalrule/line05.gif?v=2',
			html: '<div style="background: url(#decopath/horizontalrule/line05.gif?v=2) repeat-x scroll left;  width: 99%; height: 15px"><hr style="border: black 0 none; left: -9999px; position: relative; top: -9999px"></div>'
		},
		{	data: 'tx-hr-image-3',
			image: '#iconpath/horizontalrule/line06.gif?v=2',
			html: '<div style="background: url(#decopath/horizontalrule/line06.gif?v=2) repeat-x scroll left;  width: 99%; height: 15px"><hr style="border: black 0 none; left: -9999px; position: relative; top: -9999px"></div>'
		},
		{	data: 'tx-hr-image-4',
			image: '#iconpath/horizontalrule/line07.gif?v=2',
			html: '<div style="background: url(#decopath/horizontalrule/line08.gif?v=2) repeat-x scroll left;  width: 99%; height: 15px"><hr style="border: black 0 none; left: -9999px; position: relative; top: -9999px"></div>'
		}]
	},
	function(root){
		var _config = TrexConfig.getTool("horizontalrule", root);
		_config.options.each(function(option) {
			option.image = TrexConfig.getIconPath(option.image);
			if(option.html) {
				option.html = TrexConfig.getDecoPath(option.html);
			}
		});
	}
);

Trex.Tool.HorizontalRule = Trex.Class.create({
	$const: {
		__Identity: 'horizontalrule'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _canvas = this.canvas;

			var map = {};
			config.options.each(function(option) {
				map[option.data] = {
					html: option.html
				};
			});

			var _toolHandler = function(data) {
				if(!map[data]) {
					return;
				}
				var _item = map[data];
				if (_canvas.isWYSIWYG()) {
					_canvas.execute(function(processor){
                        // hr 태그는 p 태그 하위에 포함 될 수 없으므로 newline으로 내용을 추가 한 뒤에 래핑된 p태그를 제거한다.
                        var pastedNode = processor.pasteContent(_item.html, _TRUE);
                        if ($tom.isTagName(pastedNode.parentNode, 'p')) {
                            $tom.unwrap(pastedNode.parentNode);
                        }
					});
				} else {
					_canvas.execute(function(processor) {
						processor.insertTag('',_item.html);
					});
				}	
			};

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				new Trex.Menu.List(this.menuCfg),
				/* handler */
				_toolHandler
			);
		}
	
});
