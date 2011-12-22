// NOTE 전체적으로 refactoring 필요
Trex.module("make padding area inside Canvas with editor width",
    function(editor, toolbar, sidebar, canvas) {

        var _elHolder;
        var _wysiwygPanel;
        var _elWysiwyg;

        _elHolder = canvas.wysiwygEl;
        _wysiwygPanel = canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE);
        if (!_wysiwygPanel) {
            return;
        }
        _elWysiwyg = _wysiwygPanel.el;

        var __HolderHorPadding = 5;
        var __HolderVerPadding = 5;
        var __ScrollWidth = 16;
        var __MinimumPaddingValue = 28;

        var _elLeftSpace;
        var _elRightSpace;
        var _elLeftSpaceChild;
        var _elRightSpaceChild;

        var _wysiwygDoc;
		
		var _sizeConfig;
        var __EditorMaxWidth;
        var __CanvasWidth;
        var __ContentPadding;
        var __CanvasTextColor;

		function _calSizeConfig() {
			canvas.measureWrapWidth();
			_sizeConfig = canvas.getSizeConfig();
			__EditorMaxWidth = _sizeConfig.wrapWidth.toNumber();
	        __CanvasWidth = _sizeConfig.contentWidth.toNumber();
	        __ContentPadding = _sizeConfig.contentPadding.toNumber();
	        __CanvasTextColor = canvas.getStyleConfig().color;
		}
		_calSizeConfig();

        //iframe 패딩과 패딩영역의 사이즈를 계산한다.
        function _calPadding(skinStyle) {
            var _paddingTop = 0, _paddingRight = 0, _paddingBottom = 0, _paddingLeft = 0;

            //TOP
            if(skinStyle && skinStyle.paddingTop) {
                _paddingTop = __HolderVerPadding + skinStyle.paddingTop;
            } else {
                _paddingTop = __ContentPadding;
            }

            //RIGHT
            if(skinStyle && skinStyle.paddingRight) {
                _paddingRight = __HolderHorPadding + skinStyle.paddingRight;
            } else {
                _paddingRight = __ContentPadding;
            }
            if(__EditorMaxWidth > __CanvasWidth) { //guide area
				_paddingRight += Math.max(Math.floor((__EditorMaxWidth - __CanvasWidth - 2 - __ScrollWidth) / 2), 0);
            }

            //BOTTOM
            if(skinStyle && skinStyle.paddingBottom) {
                _paddingBottom = __HolderVerPadding + skinStyle.paddingBottom;
            } else {
                _paddingBottom = __ContentPadding;
            }

            //LEFT
            if(skinStyle && skinStyle.paddingLeft) {
                _paddingLeft = __HolderHorPadding + skinStyle.paddingLeft;
            } else {
                _paddingLeft = __ContentPadding;
            }
            if(__EditorMaxWidth > __CanvasWidth) { //guide area
				_paddingLeft += Math.max(Math.ceil((__EditorMaxWidth - __CanvasWidth - 2 - __ScrollWidth) / 2), 0);
            }
            return {
                'paddingTop': _paddingTop.toPx(),
                'paddingRight': _paddingRight.toPx(),
                'paddingBottom': _paddingBottom.toPx(),
                'paddingLeft': _paddingLeft.toPx()
            };
        }

        //배경이 적용되었을 경우 사이즈를 변경한다.
        canvas.observeJob('canvas.apply.background', function(data) {
            _wysiwygPanel.addStyle(_calPadding({
                'paddingTop': (data && data.topLeftHeight)? data.topLeftHeight.parsePx(): 0,
                'paddingRight': (data && data.midRightWidth)? data.midRightWidth.parsePx(): 0,
                'paddingBottom': (data && data.botLeftHeight)? data.botLeftHeight.parsePx(): 0,
                'paddingLeft': (data && data.midLeftWidth)? data.midLeftWidth.parsePx(): 0
            }));
        });

        //NOTE: 메일, 편지지가 적용되었을 에디터 영역의 패딩을 조정한다.
        canvas.observeJob('canvas.apply.letterpaper', function(data) {
            _wysiwygPanel.addStyle(_calPadding({
                'paddingTop': (data && data.topHeight)? data.topHeight.parsePx(): 0,
                'paddingRight': (data && (data.midColor || data.midUrl))? __ContentPadding: 0,
                'paddingBottom': (data && data.botHeight)? data.botHeight.parsePx(): 0,
                'paddingLeft': (data && (data.midColor || data.midUrl))? __ContentPadding: 0
            }));
        });

        if(__EditorMaxWidth <= __CanvasWidth) {
            return;
        }
        var _showGuideArea = canvas.getConfig().showGuideArea;
        if (_showGuideArea == _FALSE) {
            __CanvasWidth = __EditorMaxWidth;
        }

        //guide area
        function _calGuideArea() {
			var _guideAreaWidth = (__EditorMaxWidth - __CanvasWidth - 2 - __ScrollWidth) / 2;
            if(_guideAreaWidth < __MinimumPaddingValue) {
                return {
                    'leftWidth': '0',
                    'rightWidth': '0',
                    'rightPos': '0'
                };
            } else {
                return {
                    'leftWidth': Math.ceil(_guideAreaWidth).toPx(),
					'rightWidth': Math.max(0, (Math.floor(_guideAreaWidth))).toPx(),
                    'rightPos': (__CanvasWidth + Math.ceil(_guideAreaWidth)).toPx()
                };
            }
        }

        var _hidePaddingSpace = function(){
            $tx.hide( _elLeftSpace );
            $tx.hide( _elRightSpace );
        };
        var _showPaddingSpace = function(){
            $tx.show( _elLeftSpace );
            $tx.show( _elRightSpace );
        };

        // iframe이 로딩되면 패딩영역을 추가한다.
        canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {

            _wysiwygDoc = _wysiwygPanel.getDocument();

            _wysiwygPanel.addStyle(_calPadding());

            var _height = _wysiwygPanel.getPanelHeight();
            var _guideAreaSizes = _calGuideArea();

            _elLeftSpace = tx.div({
                'className': "tx-wysiwyg-padding",
                'style': {
                    'width': _guideAreaSizes.leftWidth,
                    'height': _height,
                    'left': "0".toPx()
                }
            });

            _elLeftSpaceChild = tx.div({'className': "tx-wysiwyg-padding-divL",
                'style': {
                    'borderRight': "1px solid",
                    'borderBottom': "1px solid",
                    'borderColor': __CanvasTextColor
                }
            });
            _elLeftSpace.appendChild(_elLeftSpaceChild);
            _elHolder.insertBefore(_elLeftSpace, _elWysiwyg);

            _elRightSpace = tx.div({
                'className': "tx-wysiwyg-padding",
                'style': {
                    'width': _guideAreaSizes.rightWidth,
                    'height': _height,
                    'left': _guideAreaSizes.rightPos
                }
            });

            _elRightSpaceChild = tx.div({ 'className': "tx-wysiwyg-padding-divR",
                'style': {
                    'borderLeft': "1px solid",
                    'borderBottom': "1px solid",
                    'borderColor': __CanvasTextColor
                }
            });

            _elRightSpace.appendChild(_elRightSpaceChild);
            _elHolder.insertBefore(_elRightSpace, _elWysiwyg);

            if ( _guideAreaSizes.leftWidth.parsePx() < __MinimumPaddingValue ){
                $tx.setStyle( _elLeftSpaceChild, {
                    borderRight: "0 none",
                    borderBottom: "0 none"
                });
            }
            if ( _guideAreaSizes.rightWidth.parsePx() < __MinimumPaddingValue ){
                $tx.setStyle( _elRightSpaceChild, {
                    borderLeft: "0 none",
                    borderBottom: "0 none"
                });
            }

            _wysiwygPanel.getScrollTop = function() {
                return (_wysiwygDoc.documentElement.scrollTop || _wysiwygDoc.body.scrollTop);
            };

            _wysiwygPanel.setScrollTop = function(scrollTop) {
                if(_wysiwygDoc.documentElement.scrollTop) {
                    _wysiwygDoc.documentElement.scrollTop = scrollTop;
                } else {
                    _wysiwygDoc.body.scrollTop = scrollTop;
                }
            };
            if ( canvas.mode != "html" ){
                _hidePaddingSpace();
            }
        });

        //모드를 변경하였을 경우 패딩영역 처리
        canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, function(from, to) {
            if(from == to) return;
            if(from == Trex.Canvas.__WYSIWYG_MODE) {
                _hidePaddingSpace();
            } else if(to == Trex.Canvas.__WYSIWYG_MODE) {
                _showPaddingSpace();
            }
        });

        //에디터 높이가 변하였을 경우 패딩영역의 높이를 조절한다.
        canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(height) {
            _elLeftSpace.style.height = height;
            _elRightSpace.style.height = height;
        });

        var _adjustPanelPandding = function(){
            _wysiwygPanel.addStyle(_calPadding());
            var _guideAreaSizes = _calGuideArea();
            $tx.setStyle( _elLeftSpace, {
                'width': _guideAreaSizes.leftWidth
            });
            $tx.setStyle( _elRightSpace, {
                'width': _guideAreaSizes.rightWidth,
                'left': _guideAreaSizes.rightPos
            });

            if ( _guideAreaSizes.leftWidth.parsePx() < __MinimumPaddingValue ){
                $tx.setStyle( _elLeftSpaceChild, {
                    borderRight: "0 none",
                    borderBottom: "0 none"
                });
            } else {
                $tx.setStyle( _elLeftSpaceChild, {
                    borderRight: "1px solid",
                    borderBottom: "1px solid"
                });
            }
            if ( _guideAreaSizes.rightWidth.parsePx() < __MinimumPaddingValue ){
                $tx.setStyle( _elRightSpaceChild, {
                    borderLeft: "0 none",
                    borderBottom: "0 none"
                });
            } else {
                $tx.setStyle( _elRightSpaceChild, {
                    borderLeft: "1px solid",
                    borderBottom: "1px solid"
                });
            }
        };
		
		//에디터 래퍼의 너비가 변하였을 경우 패딩영역의 위치를 조절한다.
        canvas.observeJob(Trex.Ev.__CANVAS_WRAP_WIDTH_CHANGE, function(height) {
            _calSizeConfig();
            _adjustPanelPandding();
        });
		
        canvas.observeJob('canvas.normalscreen.change', function(){
            __EditorMaxWidth = _sizeConfig.wrapWidth;
            _adjustPanelPandding();
        });
        canvas.observeJob('canvas.fullscreen.change', function(){
            __EditorMaxWidth = _DOC.body.clientWidth;
            _adjustPanelPandding();
        });

        canvas.getCanvasGuideSize = function(){
            return _calGuideArea().leftWidth.parsePx();
        };

        // NOTE hanmailex에서는 호출되지 않음, __EditorMaxWidth <= __CanvasWidth 조건으로 return 됨
        if (!$tx.msie) {
            if ($tx.gecko) {
                $tx.setStyle(_elWysiwyg, {
                    'overflowX': 'auto',
                    'overflowY': 'auto'
                });
            } else {
                $tx.setStyle(_elWysiwyg, {
                    'overflowX': 'auto',
                    'overflowY': 'scroll'
                });
            }
        }
    }
);
