Trex.module("new Trex.Resizer",
	function(editor, toolbar, sidebar, canvas, config){
		var _initializedId = config.initializedId || ""; 
		var cfg = TrexConfig.get("resizer", config);
		var _resizer = _NULL;
		
		editor.setMinHeight = function(h) {
			return _resizer.setMinHeight(h);
		};
		editor.restoreMinHeight = function() {
			return _resizer.restoreMinHeight();
		};
		if (Trex.available(cfg, "resizer" + _initializedId)) {
			_resizer = new Trex.Resizer(editor, cfg);
		}
	}
);
TrexConfig.add({
	'resizer': {
		minHeight: 200
	}
});
Trex.Resizer = Trex.Class.create({
	$const: {
		__Identity: 'resizer'
	},
	$mixins: [
		Trex.I.JobObservable
	],
	initialize: function(editor, config) {
		var _presentHeight = 0;
		if(!editor) {
			return;
		}
		this.config = config;
		
		var _initializedId = editor.getInitializedId();
		var _elBar = this.elBar = $tx("tx_resizer" + _initializedId);
		if(!_elBar) {
			return;
		}
		if($tx.msie_ver == '5.5'){
			_elBar.setAttribute('align', 'center');
		}
		
		this.resizeHeightAtService = function( height ) { //NOTE: 에디터를 리사이즈하고 나서 실행할 서비스 콜백
			if(typeof resizeHeight == "function") {
				resizeHeight( height );
			}
		};
		this.resizingHeightAtService = function( height ) { //NOTE: 에디터를 리사이즈하는 중에 실행할 서비스 콜백 ex) iframe 길이 늘리기
			if(typeof resizingEditorHeight == "function") { 
				resizingEditorHeight( height ); 
			} 
		};
		this.minDragHeight = config.minHeight;
		var _wysiwygDoc;
		this.startDrag = function(ev) {
			var _canvas = editor.getCanvas();
			var _panel = _canvas.getCurrentPanel();
			if(_panel == _NULL) {
				return;
			}

			var _position = _panel.getPosition();
			this.panelHeight = _position.height;
			this.dragStartPosY = ev.clientY;
			this.isDragging = _TRUE;
			$tx.observe(_DOC, 'mousemove', this.documentDraggingHandler);
			$tx.observe(_DOC, 'mouseup', this.stopDragHandler);
			if(_panel.getName() == Trex.Canvas.__WYSIWYG_MODE) {
				this.panelTop = _position.y;
				_wysiwygDoc = _panel.getDocument();
				if(_wysiwygDoc == _NULL) {
					return;
				}
				_canvas.fireJobs('canvas.height.beforechange');
				$tx.observe(_wysiwygDoc, 'mousemove', this.wysiwygDraggingHandler);
				$tx.observe(_wysiwygDoc, 'mouseup', this.stopDragHandler);
			}
			$tx.stop(ev);
		};

		this.stopDrag = function(ev){
			var _canvas = editor.getCanvas();
			var _panel = _canvas.getCurrentPanel();
			if(_panel == _NULL) {
				return;
			}
			this.isDragging = _FALSE;

			$tx.stopObserving(_DOC, 'mousemove', this.documentDraggingHandler);
			$tx.stopObserving(_DOC, 'mouseup', this.stopDragHandler);
			if(_wysiwygDoc == _NULL) {
				return;
			}
			$tx.stopObserving(_wysiwygDoc, 'mousemove', this.wysiwygDraggingHandler);
			$tx.stopObserving(_wysiwygDoc, 'mouseup', this.stopDragHandler);
			_wysiwygDoc = _NULL;
			
			this.resizeHeightAtService(_presentHeight);
			_canvas.fireJobs('canvas.height.afterchange');
			$tx.stop(ev);
		};

		this.dragingAtDocument = function(ev) {
			var _canvas = editor.getCanvas();
			if (this.isDragging) {
				var _panel = _canvas.getCurrentPanel();
				if(_panel == _NULL) {
					return;
				}
				try {
					var _height = Math.max((this.panelHeight + ev.clientY - this.dragStartPosY), this.minDragHeight.parsePx()).toPx();
					_panel.setPanelHeight(_height);
					_presentHeight = _height;
					_canvas.fireJobs('canvas.height.change', _height);
					this.resizingHeightAtService(_height);
				} catch(e) {
					console.log(e);
				}
			}
			$tx.stop(ev);
		};

		this.dragingAtWysiwyg = function(ev) {
			var _canvas = editor.getCanvas();
			if (this.isDragging) {
				var _panel = _canvas.getCurrentPanel();
				if(_panel == _NULL) {
					return;
				}
				try {
                    var _scrollTop = _DOC.body.scrollTop || _DOC_EL.scrollTop || _WIN.pageYOffset;
                    var canvasPos = _canvas.getCanvasPos(); // canvas 위치를 조정하지 않아서 높이 잘못 계산한 부분 수정 #FTDUEDTR-1317
                    var _height = Math.max((this.panelHeight + ev.clientY + canvasPos.y - this.dragStartPosY + this.panelTop - _scrollTop), this.minDragHeight.parsePx()).toPx();
                    _panel.setPanelHeight(_height);
                    _canvas.fireJobs('canvas.height.change', _height);
                } catch (e) {
					console.log(e);
				}
			}
			$tx.stop(ev);
		};

		this.startDragHandler = this.startDrag.bindAsEventListener(this);
		this.stopDragHandler = this.stopDrag.bindAsEventListener(this);
		this.documentDraggingHandler = this.dragingAtDocument.bindAsEventListener(this);
		this.wysiwygDraggingHandler = this.dragingAtWysiwyg.bindAsEventListener(this);
		this.isDragging = _FALSE;

		$tx.observe(_elBar, 'mousedown', this.startDragHandler);

		var _canvas = editor.getCanvas();
		_canvas.observeJob(Trex.Ev.__CANVAS_FULL_SCREEN_CHANGE, function() {
			$tx.hide(_elBar);
		});

		_canvas.observeJob(Trex.Ev.__CANVAS_NORMAL_SCREEN_CHANGE, function() {
			$tx.show(_elBar);
		});

	},
	setMinHeight: function(height) {
		return this.minDragHeight = height.toPx();
	},
	restoreMinHeight: function() {
		return this.minDragHeight = this.config.minHeight || 200;
	}
});