// NOTE 전체적으로 refactoring 필요
Trex.module("make padding area inside Canvas with editor width",
	function(editor, toolbar, sidebar, canvas) {
        var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        if (!_wysiwygPanel) {
            return;
        }
        var _elWysiwyg = _wysiwygPanel.el;

        var SCROLL_WIDTH = 16;
        var REQUIRED_MINIMUM_PADDING = 28;
        var BORDER_OF_CANVAS = 2;

        var _elLeftSpace;
        var _elRightSpace;
        var _elLeftSpaceChild;
        var _elRightSpaceChild;

		var sizeConfig = canvas.getSizeConfig();
		var currentCanvasWidth = canvas.getContainerWidth();
		var contentWidth = sizeConfig.contentWidth.toNumber();
        var contentPadding = sizeConfig.contentPadding.toNumber();
		var fixedContentWidth = (currentCanvasWidth > contentWidth);	// canvas.js: _sizeConfig.contentWidth = _sizeConfig.wrapWidth 와 얽힌 문제임.

        //배경이 적용되었을 경우 사이즈를 변경한다.
        canvas.observeJob('canvas.apply.background', function(data) {
        	adjustCanvasPadding({
                top: (data && data.topLeftHeight)? data.topLeftHeight.parsePx(): 0,
                right: (data && data.midRightWidth)? data.midRightWidth.parsePx(): 0,
                bottom: (data && data.botLeftHeight)? data.botLeftHeight.parsePx(): 0,
                left: (data && data.midLeftWidth)? data.midLeftWidth.parsePx(): 0
            });
        });

        //NOTE: 메일, 편지지가 적용되었을 에디터 영역의 패딩을 조정한다.
        canvas.observeJob('canvas.apply.letterpaper', function(data) {
        	adjustCanvasPadding({
                top: (data && data.topHeight)? data.topHeight.parsePx(): 0,
                right: (data && (data.midColor || data.midUrl))? contentPadding: 0,
                bottom: (data && data.botHeight)? data.botHeight.parsePx(): 0,
                left: (data && (data.midColor || data.midUrl))? contentPadding: 0
            });
        });

        // contentWidth가 지정된 경우만, 패딩을 조정할 필요가 있다.
        if(fixedContentWidth) {

            // iframe이 로딩되면 패딩영역을 추가한다.
            canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
                adjustCanvasPadding();
                createGuideArea();
                updatePaddingSpace();
            });
    
            //모드를 변경하였을 경우 패딩영역 처리
            canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function() {
            	adjustGuidAreaPosition();
            	updatePaddingSpace();
            });
    		
    		//에디터 래퍼의 너비가 변하였을 경우 패딩영역의 위치를 조절한다.
            canvas.observeJob(Trex.Ev.__CANVAS_WRAP_WIDTH_CHANGE, onCanvasWidthChanged);
            canvas.observeJob(Trex.Ev.__CANVAS_NORMAL_SCREEN_CHANGE, onCanvasWidthChanged);
            canvas.observeJob(Trex.Ev.__CANVAS_FULL_SCREEN_CHANGE, onCanvasWidthChanged);


            // 아래 코드의 필요성은 확인 필요
            if (!$tx.msie_nonstd) {
                if ($tx.gecko) {
                    $tx.setStyle(_elWysiwyg, {
                        overflowX: 'auto',
                        overflowY: 'auto'
                    });
                } else if ($tx.chrome){
                    $tx.setStyle(_elWysiwyg.contentDocument.documentElement, {
                        overflowX: 'auto',
                        overflowY: 'auto'
                    });
                } else {
                    $tx.setStyle(_elWysiwyg, {
                        overflowX: 'auto',
                        overflowY: 'scroll'
                    });
                }
            }
        }

		canvas.getCanvasGuideSize = function(){
			return calculdateGuideArea().leftWidth.parsePx();
		};
        
        function adjustCanvasPadding(skinStyle) {
        	_wysiwygPanel.addStyle(calculdateCanvasPadding(skinStyle));
        }

        //iframe 패딩과 패딩영역의 사이즈를 계산한다.
        function calculdateCanvasPadding(skinStyle) {
        	var canvasPadding = {};
        	var direction = ['top', 'bottom', 'left', 'right'];
        	
        	for (var i = 0; i < direction.length; i++) {
        		var key = direction[i];
        		canvasPadding[key] = (skinStyle && skinStyle[key]) || contentPadding;
        	}
            
            if (fixedContentWidth) {
            	canvasPadding.mleft = Math.max(Math.ceil(getGuideAreaWidth()), 0);
            	canvasPadding.mright = Math.max(Math.floor(getGuideAreaWidth()), 0);	// for quirks mode

            	return {
            		width: contentWidth.toPx(),
            		paddingLeft: canvasPadding.left.toPx(),
            		paddingRight: canvasPadding.right.toPx(),
            		paddingTop: canvasPadding.top.toPx(),
            		paddingBottom: canvasPadding.bottom.toPx(),
            		marginLeft: canvasPadding.mleft.toPx(),
            		marginRight: canvasPadding.mright.toPx()
            	};
            } else {
            	return {
            		paddingTop: canvasPadding.top.toPx(),
            		paddingRight: canvasPadding.right.toPx(),
            		paddingBottom: canvasPadding.bottom.toPx(),
            		paddingLeft: canvasPadding.left.toPx()
            	};
            }
        }

        function getGuideAreaWidth() {
        	return (currentCanvasWidth - contentWidth - BORDER_OF_CANVAS - SCROLL_WIDTH) / 2;
        }
        
        function calculdateGuideArea() {
			var _guideAreaWidth = getGuideAreaWidth();
            if(_guideAreaWidth < REQUIRED_MINIMUM_PADDING) {
                return {
                    leftWidth: '0',
                    rightWidth: '0',
                    rightPos: '0'
                };
            } else {
                return { 
                    leftWidth: Math.ceil(_guideAreaWidth - contentPadding).toPx(),
					rightWidth: Math.max(0, (Math.floor(_guideAreaWidth - contentPadding))).toPx(),
                    rightPos: (contentWidth + Math.ceil(_guideAreaWidth + contentPadding)).toPx()
                };
            }
        }
        
        function isGuideAreaCreated() {
        	return _elLeftSpace && _elRightSpace;
        }

		var queuedJob;
        function onCanvasWidthChanged() {
        	// for quirks mode
    		clearTimeout(queuedJob);
        	queuedJob = setTimeout(function() {
        		currentCanvasWidth = canvas.getContainerWidth();
        		adjustPanelPandding();
        	}, 4);
        }

        function adjustPanelPandding() {
        	adjustCanvasPadding();
            adjustGuidAreaPosition();
            updatePaddingSpace();
        }
        
        function createGuideArea() {
	        var canvasTextColor = canvas.getStyleConfig().color;
	        
            _elLeftSpace = tx.div({ className: "tx-wysiwyg-padding" });
            _elLeftSpaceChild = tx.div({
            	className: "tx-wysiwyg-padding-divL",
                style: {
                    borderColor: canvasTextColor
                }
            });

            _elRightSpace = tx.div({ className: "tx-wysiwyg-padding" });
            _elRightSpaceChild = tx.div({
            	className: "tx-wysiwyg-padding-divR",
                style: {
                	borderColor: canvasTextColor
                }
            });

    		var _elHolder = canvas.wysiwygEl;
            _elLeftSpace.appendChild(_elLeftSpaceChild);
            _elHolder.insertBefore(_elLeftSpace, _elWysiwyg);
            _elRightSpace.appendChild(_elRightSpaceChild);
            _elHolder.insertBefore(_elRightSpace, _elWysiwyg);
            
            adjustGuidAreaPosition();
        }
        
        function adjustGuidAreaPosition() {
            if (isGuideAreaCreated()) {
                var _guideAreaSizes = calculdateGuideArea();
                
                $tx.setStyle(_elLeftSpace, {
                    width: _guideAreaSizes.leftWidth
                });
                $tx.setStyle(_elRightSpace, {
                    width: _guideAreaSizes.rightWidth,
                    left: _guideAreaSizes.rightPos
                });
    
                var enoughSpaceForGuideArea = _guideAreaSizes.leftWidth.parsePx() > REQUIRED_MINIMUM_PADDING;
                var showGuideArea = canvas.getConfig().showGuideArea;
                var guideAreaBorder = enoughSpaceForGuideArea && showGuideArea ? "1px solid" : "0 none";
                	
                $tx.setStyle(_elLeftSpaceChild, {
                    borderRight: guideAreaBorder,
                    borderBottom: guideAreaBorder
                });
                $tx.setStyle(_elRightSpaceChild, {
                    borderLeft: guideAreaBorder,
                    borderBottom: guideAreaBorder
                });
            }
        }
        
        function updatePaddingSpace() {
        	if (isGuideAreaCreated()) {
            	if (canvas.mode == Trex.Canvas.__WYSIWYG_MODE) {
    				$tx.show(_elLeftSpace);
    				$tx.show(_elRightSpace);
                } else {
    				$tx.hide(_elLeftSpace);
    				$tx.hide(_elRightSpace);
                }
        	}
        }
    }
);
