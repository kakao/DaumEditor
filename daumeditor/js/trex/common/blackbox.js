Trex.MarkupTemplate.add("blackbox",
	'<div class="tx-blackbox">\
		<div class="tx-blackbox-panel"></div>\
		<div class="tx-content"></div>\
	</div>'
);

Trex.BlackBox = Trex.Class.create({
	initialize: function() { },
	make: function(holder) {
		var _elBlackBox = this.elBlackbox = Trex.MarkupTemplate.get("blackbox").evaluateAsDom({});
		var _holder = this.holder = holder || _DOC.body;
		$tom.insertFirst(_holder, _elBlackBox);
		
		this.elBlackboxPanel = $tom.collect( _elBlackBox, "div.tx-blackbox-panel");
		this.elContentArea = $tom.collect( _elBlackBox, "div.tx-content");
		var _panelSize = this.calculatePanelSize();
		this.panelWidth = _panelSize[0];
		this.panelHeight = _panelSize[1];
	},
	show: function(elContent) {
		this.makeScrollbar();
		this._append(elContent);
	},
	_append: function(elContent) {
		if(this.elContentArea.firstChild != _NULL){
			return _FALSE;
		}
		$tom.append(this.elContentArea, elContent);
		var _panelWidthHeight = this.calculatePanelSize();
		this.panelWidth = _panelWidthHeight[0];
		this.panelHeight = _panelWidthHeight[1];
		
		$tx.setStyle(this.elBlackbox, {
			'width': this.panelWidth.toPx(),
			'height': this.panelHeight.toPx()
		});
		$tx.setStyle(this.elBlackboxPanel, {
			'width': this.panelWidth.toPx(),
			'height': this.panelHeight.toPx()
		});
		
		$tx.show(this.elBlackbox);
		this.alignCenter();
	},
	hide: function() {
		$tx.hide(this.elBlackbox);
		this.elContentArea.removeChild(this.elContentArea.firstChild);
		this.removeScrollbar();		
	},
	makeScrollbar: function(){
		if ( $tx.msie ){
			_DOC.body.scroll = "yes"
		}else{
			_DOC.body.style['overflow'] = "scroll";
		}
	},
	removeScrollbar: function(){
		if ( $tx.msie ){
			_DOC.body.scroll = ""
		}else{
			_DOC.body.style['overflow'] = "";
		}
	},
	calculatePanelSize: function() {
		var _panelSize = $tom.getPosition(this.holder);
		return [_panelSize.width, _panelSize.height];
	},
	resizeBlackbox: function(height) {
		this.panelHeight = height;
		$tx.setStyle(this.elBlackbox, {
			'height': this.panelHeight.toPx()
		});
		$tx.setStyle(this.elBlackboxPanel, {
			'height': this.panelHeight.toPx()
		});
		this.alignCenter();
	},
	alignCenter: function(){
		var width = $tx.getStyle(this.elBlackbox, "width" ); 
		var height = $tx.getStyle(this.elBlackbox, "height" );
		var _panelWidthHeight = this.calculatePanelSize();
		
		this.panelWidth = _panelWidthHeight[0];
		this.panelHeight = _panelWidthHeight[1];
		
		var _contentSize = $tom.getPosition(this.elContentArea.firstChild);
		var _contentWidth = _contentSize.width.parsePx();
		var _contentHeight = _contentSize.height.parsePx();
		
		var _marginLeft = (this.panelWidth - _contentWidth)/2;
		var _marginTop = ( this.panelHeight > _contentHeight*2)? (this.panelHeight - _contentHeight)/2: 0;
		
		$tx.setStyle( this.elContentArea, {
			'marginLeft': _marginLeft.toPx(),
			'marginTop': '30px'
		});
	}
});

Trex.install("editor.getBlackBox & canvas.getBlackBox",
    function(editor, toolbar, sidebar, canvas) {
        var _blackBox = new Trex.BlackBox();
		editor.getBlackBox = function() {
			return _blackBox;
		};
		canvas.getBlackBox = function(){
			return _blackBox;
		};
	}
);

Trex.module("generate blackbox", 
	function(editor, toolbar, sidebar, canvas) {
		var _blackBox = editor.getBlackBox();
		
		var _elContainer = editor.getWrapper();
		_blackBox.make(_elContainer);
		canvas.observeKey({ // Esc
			ctrlKey: _FALSE,
			altKey: _FALSE,
			shiftKey: _FALSE,
			keyCode: 27
		}, _blackBox.hide.bind(_blackBox));
		
		editor.observeKey({ // Esc
			ctrlKey: _FALSE,
			altKey: _FALSE,
			shiftKey: _FALSE,
			keyCode: 27
		}, _blackBox.hide.bind(_blackBox));
		
		canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(height) {
			_blackBox.resizeBlackbox(height.parsePx());
		});
	}
);
