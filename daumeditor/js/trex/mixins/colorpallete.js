TrexMessage.addMsg({
    '@menu.pallete.revert': "기본색으로",
    '@adoptor.label': "가나다",
    '@adoptor.transparent': "투명"
});

Trex.MarkupTemplate.add(
    "menu.colorpallete.text",
    '#{for:items}<li class="tx-menu-list-item" style="background-color:#{color}"><a unselectable="on" style="color:#{text}">#{label}</a></li>#{/for:items}'
);
Trex.MarkupTemplate.add(
    "menu.colorpallete.thumb",
    // TODO forecolor,backcolor에서 <li class="tx-menu-list-item" unselectable="on" style="background-color:#FF0000;border:none;#{if:image!=null}background-image:url(#{image})#{/if:image};"></li> 이렇게 결과가 나온다.
    '#{for:items}<li class="tx-menu-list-item" unselectable="on" style="background-color:#{color};border:none;#{if:image!=null}background-image:url(#{image})#{/if:image};"></li>#{/for:items}'
);
Trex.MarkupTemplate.add(
    "menu.colorpallete.revert",
    '<p class="tx-pallete-revert"><a unselectable="on" href="javascript:;" title="@menu.pallete.revert">@menu.pallete.revert</a></p>'
);
Trex.I.ColorPallete = Trex.Faculty.create({
    isGradeInit: _FALSE,
    isPickerDisplayed: _FALSE,
    onregenerated: function(config, initValue) {
        this.setColorValueAtInputbox(initValue);
    },
    setColorValueAtInputbox: function(initValue) {
        if ( !initValue ){
            return ;
        }
        if ( typeof initValue != "string" && initValue.toString){
            initValue = initValue.toString();
        }
        var _color = initValue.split("|")[0];
        if ( !Trex.Color.getValidColor(_color) ){
            _color = "#000000";
        }
        var _elValueInput = $tom.collect(this.elInner, 'p.tx-pallete-input input');
        var _elColorDisplay = $tom.collect(this.elInner, 'p.tx-pallete-input span');
        if (initValue && _elValueInput && _elColorDisplay) {
            _elValueInput.value = _color;
            _elColorDisplay.style.backgroundColor = _color;
        }
    },
    hookEvent: function(config) {
        var _elMenu = this.elMenu;
        var _elInner = this.elInner = $tom.collect(_elMenu, 'div.tx-menu-inner');

        var _elPreset = $tom.collect(_elInner, 'ul.tx-pallete-text-list');
        if(config.texts) {
            var _textOptions = config.texts.options;
            Trex.MarkupTemplate.get("menu.colorpallete.text").evaluateToDom({
                'items': _textOptions
            }, _elPreset);
            var _elPresetChilds = $tom.collectAll(_elPreset, "li");
            this.addColorClickEvent(_elPresetChilds, _textOptions);
        } else {
            _elInner.removeChild(_elPreset);
            _elPreset = _NULL;
        }

        if(config.thumbs) {
            var _needTrans = !!config.needTrans;
            var _thumbsOptions = [].concat(config.thumbs.options);
            if(_needTrans) { //투명이 필요한 컬러팔레트일 경우 마지막 컬러 삭제
                _thumbsOptions.pop();
                _thumbsOptions.push(Object.extend({}, config.thumbs.transparent));
            }
            var _elThumb = $tom.collect(_elInner, 'ul.tx-pallete-thumb-list');
            Trex.MarkupTemplate.get("menu.colorpallete.thumb").evaluateToDom({
                'items': _thumbsOptions
            }, _elThumb);
            var _elThumbChilds = $tom.collectAll(_elThumb, "li");
            this.addColorClickEvent(_elThumbChilds, _thumbsOptions);
        }

        this.elPicker = $tom.collect(_elInner, "div.tx-pallete-picker");

        var _elButton = $tom.collect(_elInner, 'div.tx-pallete-buttons');
        var _elMore = this.elMore = $tom.collect(_elButton, 'p.tx-pallete-more a');
        $tx.observe(_elMore, "click", this.togglePicker.bind(this));

        if(config.needRevert) {
            $tom.insertFirst(_elButton, Trex.MarkupTemplate.get("menu.colorpallete.revert").evaluateAsDom({}));
            $tx.observe($tom.collect(_elButton, 'p.tx-pallete-revert a'), "click", function(ev) {
                this.onSelect(ev, _NULL);
                this.hide();
            }.bind(this));
        }

        var _elPickerEnter = $tom.collect(this.elInner, "p.tx-pallete-input");
        this.elPreview = $tom.collect(_elPickerEnter, "span");
        var _elInput = this.elInput = $tom.collect(_elPickerEnter, "input");
        var _elEnter = this.elEnter = $tom.collect(_elPickerEnter, "a");
        var _self = this;
        $tx.observe(_elInput, "blur", function(){
            _self.lastValue = _elInput.value;
        });
        $tx.observe(_elEnter, "click", this.onColorEnter.bind(this));
    },
    addColorClickEvent: function(elItemList, textOptions) {
        for (var i=0, end=elItemList.length; i < end; i++) {
            var _item = elItemList[i];
            var _option = textOptions[i]; // both elItemList.length and textOptions.length must be equal.
            $tx.observe(_item, "click", this.onSelect.bindAsEventListener(this, _option.color + (_option.text? '|' + _option.text: '')));
        }
    },
    _generatePicker: function() {
        var _elPicker = this.elPicker;
        var _elPickerBox = $tom.collect(_elPicker, "div.tx-pallete-pickerbox");
        $tx.observe(_elPickerBox, "mouseout", this.onMouseOut.bind(this));

        var _elChromaBar = this.elChromaBar = $tom.collect(_elPickerBox, "div.tx-chromabar");
        $tom.replacePngPath(_elChromaBar);
        $tx.observe(_elChromaBar, 'mousedown', this.onChromDown.bindAsEventListener(this));
        $tx.observe(_elChromaBar, 'mousemove', this.onChromMove.bindAsEventListener(this));
        $tx.observe(_elChromaBar, 'mouseup', this.onChromUp.bindAsEventListener(this));

        this.elHueBar = $tom.collect(_elPickerBox, "div.tx-huebar");
        var _elHueBar = this.elHueBar;

        this.hueDownHandler = this.onHueDown.bindAsEventListener(this);
        this.hueMoveHandler = this.onHueMove.bindAsEventListener(this);
        this.hueUpHandler = this.onHueUp.bindAsEventListener(this);
        this.hueClickHandler = this.onHueClick.bindAsEventListener(this);
        $tx.observe(_elHueBar,'mousedown', this.hueDownHandler);
        $tx.observe(_elHueBar,'click', this.hueClickHandler);

        this.nColWidth = 150;
        this.nColHeight = 120;
        this.nHueHeight = 120;

        this.mRGB = { r:0, g:0, b:0 };
        this.mHSV = { h:0, s:100, v:100 };

        // 초기화
        this.setHueColor('FF0000');
    },
    reinitGrade: function() {
        var posParent = $tx.cumulativeOffset(this.elMenu);
        var position = $tx.positionedOffset(this.elChromaBar);
        this.iChromPos = {
            x: (posParent[0] + position[0]),
            y: (posParent[1] + position[1])
        };
        position = $tx.positionedOffset(this.elHueBar);
        this.iHuePos = {
            x: (posParent[0] + position[0]),
            y: (posParent[1] + position[1])
        };
    },
    onColorEnter: function(ev) {
        var color;
        if(this.elInput.value == TXMSG("@adoptor.transparent")) {
            color = "transparent";
        } else {
            color = Trex.Color.getValidColor(this.elInput.value);
        }
        if(color !== _NULL) {
            this.onSelect(ev, color);
        }
        this.hide();
    },
    previewColor: function(color) {
        this.changeColor(color);
    },
    onMouseOut: function() {
        if(this.lastValue !== _NULL && this.lastValue !== _UNDEFINED && this.mousedownDetected) {
            this.changeColor(this.lastValue);
        }
    },
    changeColor: function(color) {
        color = Trex.Color.getHexColor(color);
        this.elPreview.style.backgroundColor = color;
        if(color == "transparent") {
            this.elInput.value = TXMSG("@adoptor.transparent");
        } else {
            this.elInput.value = color;
        }
    },
    enterColor: function() {
        if(this.elInput.value == TXMSG("@adoptor.transparent")) {
            this.changeColor("transparent");
        } else if(this.elInput.value.length == 7) {
            var color = Trex.Color.getValidColor(this.elInput.value);
            if(color !== _NULL) {
                this.changeColor(color);
            }
        }
    },
    togglePicker: function(ev) {
        var _elMore = this.elMore;
        var _elPicker = this.elPicker;
        if(this.isPickerDisplayed) {
            _elMore.className = "tx-more-down";
            $tx.hide(_elPicker);
        } else {
            _elMore.className = "tx-more-up";
            $tx.show(_elPicker);
            if ($tx.msie6) {
                _elPicker.style.padding = "1px";
                setTimeout(function(){
                    _elPicker.style.padding = "0px";
                }, 0);
            }
            if(!this.isGradeInit) {
                this._generatePicker();
                this.isGradeInit = _TRUE;
                this.reinitGrade(); //position
            }
        }
        this.isPickerDisplayed = !this.isPickerDisplayed;
        $tx.stop(ev);
    },
    getChromCoords: function(ev) {
        var nPosX = (ev.clientX - this.iChromPos.x) + _DOC_EL.scrollLeft;
        var nPosY = (ev.clientY - this.iChromPos.y) + _DOC_EL.scrollTop;

        nPosX = Math.min(this.nColWidth, Math.max(0, nPosX));
        nPosY = Math.min(this.nColHeight, Math.max(0, nPosY));
        return {x: nPosX, y: nPosY};
    },
    getHueCoords: function(ev) {
		var y = ev.offsetY || ev.layerY;
		return Math.min(this.nHueHeight, Math.max(0, y));
    },
    getColorByEvent: function(x, y) {
        var s = (x/(this.nColWidth))*100;
        var v = (1-y/(this.nColHeight))*100;

        var nMargin = 3;
        s = Math.floor(Math.min(Math.max(s, 0), 100));
        if(s < nMargin) {
            s = 0;
        } else if(s > 100 - nMargin) {
            s = 100;
        }
        v = Math.floor(Math.min(Math.max(v, 0), 100));
        if(v < nMargin) {
            v = 0;
        } else if(v > 100 - nMargin) {
            v = 100;
        }

        this.mHSV.s = s;
        this.mHSV.v = v;
        this.mRGB = this.hsv2rgb(this.mHSV.h, this.mHSV.s, this.mHSV.v);

        return this.rgb2hex(this.mRGB.r, this.mRGB.g, this.mRGB.b);
    },
    onChromDown: function() {
        this.mousedownDetected = _TRUE;
    },
    onChromMove: function(ev) {
        if (this.mousedownDetected) {
            var iPos = this.getChromCoords(ev);
            var color = this.getColorByEvent(iPos.x, iPos.y);
            this.previewColor(color);
        }
    },
    onChromUp: function(ev) {
        var iPos = this.getChromCoords(ev);
        var color = this.getColorByEvent(iPos.x, iPos.y);
        this.previewColor(color);
        this.lastValue = color;
        this.mousedownDetected = _FALSE;
    },
    getHueByEvent: function(y) {
        var h = parseInt((y/(this.nHueHeight))*360);
        this.mHSV.h = Math.floor(Math.min(Math.max(h,0), 360));
        var mHueRgb = this.hsv2rgb(this.mHSV.h, 100, 100);
        return this.rgb2hex(mHueRgb.r, mHueRgb.g, mHueRgb.b);
    },
    setHueColor: function(sHueHex) {
        this.elChromaBar.style.backgroundColor = sHueHex;
    },
    onHueDown: function() {
        $tx.observe(_DOC, 'mousemove', this.hueMoveHandler);
        $tx.observe(_DOC, 'mouseup', this.hueUpHandler);
    },
    onHueMove: function(ev) {
		var y = this.getHueCoords(ev);
		var color = this.getHueByEvent(y);
        this.setHueColor(color);
    },
    onHueClick: function(ev) {
		var y = this.getHueCoords(ev);
		var color = this.getHueByEvent(y);
        this.setHueColor(color);
    },
    onHueUp: function() {
        $tx.stopObserving(_DOC, 'mousemove', this.hueMoveHandler);
        $tx.stopObserving(_DOC, 'mouseup', this.hueUpHandler);
    },
    hex2rgb: function(str) {
        this.mRGB.r = (this.toDec(str.substr(0, 1)) * 16) + this.toDec(str.substr(1, 1));
        this.mRGB.g = (this.toDec(str.substr(2, 1)) * 16) + this.toDec(str.substr(3, 1));
        this.mRGB.b = (this.toDec(str.substr(4, 1)) * 16) + this.toDec(str.substr(5, 1));
        return this.mRGB;
    },
    toDec: function(sHex) {
        var sHexChars = "0123456789ABCDEF";
        return sHexChars.indexOf(sHex.toUpperCase());
    },
    rgb2hex: function(r,g,b) {
        r = r.toString(16);
        if (r.length == 1) {
            r = '0' + r;
        }
        g = g.toString(16);
        if (g.length == 1) {
            g = '0' + g;
        }
        b = b.toString(16);
        if (b.length == 1) {
            b = '0' + b;
        }
        return '#'+r+g+b;
    },
    hsv2rgb: function(h,s,v)  {

        h %= 360;
        s /= 100;
        v /= 100;

        var r = 0, g = 0, b = 0;

        if (s === 0) {
            r = Math.floor(v * 255);
            g = Math.floor(v * 255);
            b = Math.floor(v * 255);
        } else {
            var nH = h/60;
            var nI = Math.floor(nH);
            var nV1 = v*(1-s);
            var nV2 = v*(1-s*(nH-nI));
            var nV3 = v*(1-s*(1-(nH-nI)));

            var nR = 0, nG = 0, nB = 0;

            if (nI === 0) {nR = v; nG = nV3; nB = nV1;}
            else if (nI == 1) {nR = nV2; nG = v; nB = nV1;}
            else if (nI == 2) {nR = nV1; nG = v; nB = nV3;}
            else if (nI == 3) {nR = nV1; nG = nV2; nB = v;}
            else if (nI == 4) {nR = nV3; nG = nV1; nB = v;}
            else if (nI == 5) {nR = v; nG = nV1; nB = nV2;}

            r = Math.floor(nR * 255);
            g = Math.floor(nG * 255);
            b = Math.floor(nB * 255);
        }
        return {r:r, g:g, b:b};
    },
    rgb2hsv: function(r,g,b) {
        var nR = ( r / 255 );
        var nG = ( g / 255 );
        var nB = ( b / 255 );

        var h = 0, s = 0, v = 0;

        var nMin = Math.min( nR, nG, nB );
        var nMax = Math.max( nR, nG, nB );
        var nDiff = nMax - nMin;

        v = nDiff;

        if( nDiff === 0 ) {
           h = 0; s = 0;
        } else {
           s = nDiff / nMax;
           var nDiffR = (((nMax-nR)/6) + (nDiff/2)) / nDiff;
           var nDiffG = (((nMax-nG)/6) + (nDiff/2)) / nDiff;
           var nDiffB = (((nMax-nB)/6) + (nDiff/2)) / nDiff;

           if (nR == nMax) {
               h = nDiffB - nDiffG;
           }
           else if (nG == nMax) {
                   h = (1 / 3) + nDiffR - nDiffB;
           }else if (nB == nMax) {
                   h = (2 / 3) + nDiffG - nDiffR;
              }
           if (h < 0) {
               h += 1;
           }
           if (h > 1) {
               h -= 1;
           }
        }
        return { h:h, s:s, v:v };
    }
});


/*---- Trex.Color ------------------------------------------------------*/
Trex.Color = {
    getHexColor: function(color) {
        color = color.trim();
        if(color.indexOf("rgb") < 0) {
            if(color.length > 0 && (color.indexOf("-moz-use") > -1 || color == "transparent")) {
                return "transparent";
            } else {
                return color;
            }
        }

        if (/rgba\s?\((0,\s?){3}0\)/i.test(color)) {
            return "transparent";
        }

        var aColor = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*\d*\)/i);
        if (!aColor) {
            return color;
        }
        aColor.shift();
        if(aColor.length < 3){
            return color;
        }

        var nCh;
        var sHexColor = "#";
        for(var h=0;h<3;h++) {
            nCh = parseInt(aColor[h].trim()).toString(16).toUpperCase();
            if (nCh.length == 1) {
                sHexColor = sHexColor.concat("0" + nCh);
            }else if (nCh.length > 2) {
                sHexColor = sHexColor.concat("FF");
            }else {
                sHexColor = sHexColor.concat("" + nCh);
            }
        }
        return sHexColor;
    },
    getValidColor: function(color) {
        if(color === _NULL || color == "transparent") {
            return "transparent";
        }
        var m = color.match(/#?([0-9a-f]{6}|[0-9a-f]{3})/i);
        if(m === _NULL || color.length > 8) {
            return _NULL;
        }
        if (m[1].length == 3) {
            return "#" + m[1] + m[1];
        } else {
            return "#" + m[1];
        }
    },
    getOptColor: function(color, opacity) {
        if(!color || color.length != 7 || color.charAt(0) != '#') {
            return "#e5e5e5";
        }
        color = color.substring(1, 7).toLowerCase();
        opacity = isNaN(opacity)? 100: opacity;
        var _optColor = "#";
        var _sch, _och;
        for (var h = 0; h < 3; h++) {
            _sch = parseInt(color.substr(h * 2, 2), 16);
            _och = Math.round(Math.floor((255 -_sch) * (1 - opacity * 0.01) + _sch * (opacity * 0.02))).toString(16);
            if (_och.length == 1) {
                _optColor += "0" + _och;
            } else if (_och.length > 2) {
                _optColor += "ff";
            } else {
                _optColor += _och;
            }
        }
        return _optColor;
    }
};