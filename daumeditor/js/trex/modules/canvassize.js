// NOTE 전체적으로 refactoring 필요
Trex.module("make padding area inside Canvas with editor width",
	function(editor, toolbar, sidebar, canvas) {
        var _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        if (!_wysiwygPanel) {
            return;
        }
        
		var _elHolder = canvas.wysiwygEl;
        var _elWysiwyg = _wysiwygPanel.el;

        var ADDED_PADDING_FOR_SKIN = 5;
        var SCROLL_WIDTH = 16;
        var REQUIRED_MINIMUM_PADDING = 28;
        var BORDER_OF_CANVAS = 2;

        var _elLeftSpace;
        var _elRightSpace;
        var _elLeftSpaceChild;
        var _elRightSpaceChild;

		var sizeConfig = canvas.getSizeConfig();
		var __EditorMaxWidth = canvas.getContainerWidth();
		var __CanvasWidth = sizeConfig.contentWidth.toNumber();
        var __ContentPadding = sizeConfig.contentPadding.toNumber();
		var fixedContentWidth = (__EditorMaxWidth != __CanvasWidth);	// canvas.js: _sizeConfig.contentWidth = _sizeConfig.wrapWidth 와 얽힌 문제임.
		
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
                right: (data && (data.midColor || data.midUrl))? __ContentPadding: 0,
                bottom: (data && data.botHeight)? data.botHeight.parsePx(): 0,
                left: (data && (data.midColor || data.midUrl))? __ContentPadding: 0
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
            canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function(from, to) {
            	adjustGuidAreaPosition();
            	updatePaddingSpace();
            });
    		
    		//에디터 래퍼의 너비가 변하였을 경우 패딩영역의 위치를 조절한다.
            canvas.observeJob(Trex.Ev.__CANVAS_WRAP_WIDTH_CHANGE, onCanvasWidthChanged);
    		
            canvas.observeJob('canvas.normalscreen.change', onCanvasWidthChanged);
            canvas.observeJob('canvas.fullscreen.change', onCanvasWidthChanged);
    
            // 사용하는 곳 확인 필요
            canvas.getCanvasGuideSize = function(){
                return calculdateGuideArea().leftWidth.parsePx();
            };

            // 아래 코드의 필요성은 확인 필요
            if (!$tx.msie) {
                if ($tx.gecko) {
                    $tx.setStyle(_elWysiwyg, {
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
        
        function adjustCanvasPadding(skinStyle) {
        	_wysiwygPanel.addStyle(calculdateCanvasPadding(skinStyle));
        }

        //iframe 패딩과 패딩영역의 사이즈를 계산한다.
        function calculdateCanvasPadding(skinStyle) {
            var _paddingTop = 0, _paddingRight = 0, _paddingBottom = 0, _paddingLeft = 0;
            
            var computedPadding = {
            	top: (skinStyle && skinStyle.top ? skinStyle.top + ADDED_PADDING_FOR_SKIN : __ContentPadding),
            	right: (skinStyle && skinStyle.right ? skinStyle.right + ADDED_PADDING_FOR_SKIN : __ContentPadding),
            	bottom: (skinStyle && skinStyle.bottom ? skinStyle.bottom + ADDED_PADDING_FOR_SKIN : __ContentPadding),
            	left: (skinStyle && skinStyle.left ? skinStyle.left + ADDED_PADDING_FOR_SKIN : __ContentPadding)
            };

            if(fixedContentWidth) {
            	computedPadding.left += Math.max(Math.ceil((__EditorMaxWidth - __CanvasWidth - BORDER_OF_CANVAS - SCROLL_WIDTH) / 2), 0);
            	computedPadding.right += Math.max(Math.floor((__EditorMaxWidth - __CanvasWidth - BORDER_OF_CANVAS - SCROLL_WIDTH) / 2), 0);
            }

            return {
                paddingTop: computedPadding.top.toPx(),
                paddingRight: computedPadding.right.toPx(),
                paddingBottom: computedPadding.bottom.toPx(),
                paddingLeft: computedPadding.left.toPx()
            };
        }
        
        function calculdateGuideArea() {
			var _guideAreaWidth = (__EditorMaxWidth - __CanvasWidth - BORDER_OF_CANVAS - SCROLL_WIDTH) / 2;
            if(_guideAreaWidth < REQUIRED_MINIMUM_PADDING) {
                return {
                    leftWidth: '0',
                    rightWidth: '0',
                    rightPos: '0'
                };
            } else {
                return {
                    leftWidth: Math.ceil(_guideAreaWidth).toPx(),
					rightWidth: Math.max(0, (Math.floor(_guideAreaWidth))).toPx(),
                    rightPos: (__CanvasWidth + Math.ceil(_guideAreaWidth)).toPx()
                };
            }
        }
        
        function isGuideAreaCreated() {
        	return _elLeftSpace && _elRightSpace;
        }
        
        function onCanvasWidthChanged() {
        	setTimeout(function() {
        		__EditorMaxWidth = canvas.getContainerWidth();
        		adjustPanelPandding();
        	}, 0);
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
