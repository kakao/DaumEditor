/*
 * 특정 태그인 경우에는 IE에서 무한루프를 돈다
 * p에 쓰타일이 있는 경우에는 p의 쓰타일을 하위 span으로 복사할 것인가?
 O 복사한다
 X font-weight:normal로 한다.
 * 불필요한 <span>text</span>이 생긴다
 X 없애준다
 O 그냥 놔둔다
 * 속도 개선
 - goog_range를 3번 iteration하는 것을 줄여야 한다
 * fontsize
 O safari && os_win에서 execCommand 그리고
 - 9pt, 11pt에서는 addDummyNbsp 를 사용한다
 * fontfamily
 O safari && os_win에서 execCommand
 * fontStyleTool / toggleFontTool / selectFontTool
 O 상속
 X 구현 ?

 V queryCurrentStyle에서 Error 발생 (targetNode.parentNode가 없을 때에)
 V fontfamily
 - favorite 기능 안되는 듯 : this.menuInitHandler.bind(this);
 V 테스트 만들기
 - fontfamily : IE에서 웹폰트 적용
 - fontfamily : favorite 기능
 V 웹폰트 사용인 경우의 테스트 케이스

 <div style="font-weight:bolder">
 <span style="font-weight:bold">bold <span style="font-weight:normal">normal1 <span>normal2</span> normal3 <span style="font-weight:bold">bold</span>normal4</span></span>
 </div>
 */
(function() {
    var NodeSet = Trex.Class.create({
        tagSet: {},
        containedNodes: [],
        initialize: function() {
        },
        push: function(node) {
            if (!node) {
                return;
            }
            var tagName = node.tagName;
            var self = this;
            if (!self.tagSet[tagName]) {
                self.tagSet[tagName] = [];
            }
            if (!self.tagSet[tagName].contains(node)) {
                self.tagSet[tagName].push(node);
                self.containedNodes.push(node);
            }
        },
        toArray: function() {
            return this.containedNodes;
        }
    });

    Trex.I.FontTool = Trex.Mixin.create({
        initialize: function(editor, toolbar, config) {
            this.$super.initialize(editor, toolbar, config);
            this.legacyMode = false;
        },
        SPAN_CONTAINABLE_TAGS: "%paragraph,pre,noscript,form,hr,address,fieldset,blockquote,a,tt,dfn,code,samp,kbd,var,cite,abbr,acronym,q,bdo,label",
        handler: function(data) {
            this.onBeforeHandler(data);
            this.doHandle(data);
            this.onAfterHandler(data);
        },
        onBeforeHandler: function() {
        },
        doHandle: function(data) {
            var self = this, canvas = self.canvas;
            var range, newStyle;
            canvas.execute(function(processor) {
                var selectedCells = (processor.table) ? processor.table.getTdArr() : [];
                if (selectedCells.length > 0) {
                    processor.executeUsingCaret(function() {
                        range = goog.dom.Range.createFromNodeContents(selectedCells[0]);
                        newStyle = self.computeNewStyle(data, range);
                        self.tableCellsExecutor(processor, newStyle, selectedCells);
                    });
                } else {
                    range = processor.createGoogRange();
                    if (range) {
                        newStyle = self.computeNewStyle(data, range);
                        if (self.legacyMode) {
                            self.legacyModeExecutor(processor, self.computeNewStyle(data, range));
                        } else if (range.isCollapsed()) {
                            self.collapsedExecutor(processor, newStyle, range);
                        } else {
                            self.selectedExecutor(processor, newStyle, range);
                        }
                    }
                }
            });
        },
        onAfterHandler: function() {
        },
        findQueryingNode: function(goog_range) {
            if (goog_range) {
                var textNode = this.findFirst(goog_range.__iterator__(), function(node) {
                    return node.nodeType == 3 && node.nodeValue.trim();
                });
                if (textNode) {
                    return textNode.parentNode;
                } else {    // fallback condition
                    var startNode = goog_range.getStartNode();
                    if (startNode && startNode.nodeType == 3) {
                        return startNode.parentNode;
                    }
                    return startNode;
                }
            }
        },
        tableCellsExecutor: function(processor, newStyle, cells) {
            var self = this;
            cells.each(function(cell) {
                var range = goog.dom.Range.createFromNodeContents(cell),
                    savedCaret = range.saveUsingCarets(),
                    startCaret = savedCaret.getCaret(_TRUE),
                    endCaret = savedCaret.getCaret(_FALSE);
                /**
                 * 주의 : normalizeText에서 없어지지 않는 노드를 파라미터로 넘겨줘야 한다.
                 */
                try {
                    self.applyNewFontStyle(startCaret, 0, endCaret, 0, newStyle, processor);
                } finally {
                    savedCaret.dispose();
                }
            });
        },
        collapsedExecutor: function(processor, newStyle, goog_range) {
            if ($tx.safari && $tx.os_win) {
                this.winSafariExecutor(processor, newStyle, goog_range);
                return;
            }
            var startNode = goog_range.getStartNode();
            var parentNode = startNode.parentNode;

            var targetNode = this.findOrCreateDummySpan(parentNode, processor, goog_range);
            this.applyNewFontStyle(targetNode, 0, targetNode, 0, newStyle, processor);

            var wordJoiner = targetNode.firstChild;
            processor.createGoogRangeFromNodes(wordJoiner, wordJoiner.length, wordJoiner, wordJoiner.length).select();
        },
        legacyModeExecutor: function(processor, newStyle) {
            processor.execCommand(this.getQueryCommandName(), newStyle[this.getCssPropertyName()]);
        },
        winSafariExecutor: function(processor, newStyle) {
            this.legacyModeExecutor(processor, newStyle);
        },
        selectedExecutor: function(processor, newStyle, goog_range) {
            // executeUsingCaret을 사용하지 않는 이유는 goog_range를 파라미터로 받고 있어서..
            var savedCaret = goog_range.saveUsingCarets();
            try {
                var startCaret = savedCaret.getCaret(_TRUE);
                var endCaret = savedCaret.getCaret(_FALSE);

                this.applyNewFontStyle(startCaret, 0, endCaret, 0, newStyle, processor);
            } finally {
                savedCaret.restore();
            }
        },
        /**
         * startNode, endNode는 TextNode이면 안된다. normalizeText과정에서 사라질 수 있고 이 때문에 오류가 발생한다.
         */
        applyNewFontStyle: function(startNode, startOffset, endNode, endOffset, newStyle, processor) {
            var elements = this.collectSpanContainableElements(startNode, startOffset, endNode, endOffset);
            this.arrangeMarkup(elements);
            this.applyFontStyleToText(startNode, startOffset, endNode, endOffset, newStyle, processor);
        },
        /**
         * collapsed 일 때에 style을 적용할 수 있는 span을 찾거나, 새로 span을 만든다.
         */
        findOrCreateDummySpan: function(parentNode, processor, goog_range) {
            var reuseExistNode = (parentNode.tagName == "SPAN" && !$tom.hasChildren(parentNode, _TRUE));
            if (reuseExistNode) {
                return parentNode;
            } else {
                return this.createDummySpan(parentNode, processor, goog_range);
            }
        },
        createDummySpan: function (parentNode, processor, goog_range) {
            var newNode = null;
            if (parentNode.tagName == "SPAN") {
                newNode = $tom.clone(parentNode);
            } else {
                newNode = processor.create('span');
            }
            newNode.appendChild(processor.newDummy());
            newNode = goog_range.insertNode(newNode);    // NOTE: IE에서는 return된 value를 사용해야 한다.

            // insertNode로 인해 빈 TextNode가 생긴 경우, 바로 삭제해준다.
            $tom.removeEmptyTextNode(newNode.previousSibling);
            $tom.removeEmptyTextNode(newNode.nextSibling);
            return newNode;
        },

        /**
         * start element와 end element 사이에  포함되는 element 중 font와 관련된 style을 하위 노드로 이동시켜야 하는 element 를 반환
         */
            // TODO : 중복되는 부분에 어떤 이름을 지어야 할까?
            // TODO : 이렇게 구하지 않고, subtree? 를 찾는 거 같다.
        collectSpanContainableElements: function (startNode, startOffset, endNode, endOffset) {
            var result = new NodeSet();

            result.push(this.findSpanContainble(startNode));

            var spanContainer = this.SPAN_CONTAINABLE_TAGS;
            var iterator = new goog.dom.TextRangeIterator(startNode, startOffset, endNode, endOffset);
            goog.iter.forEach(iterator, function(node) {
                if ($tom.kindOf(node, spanContainer)) {
                    result.push(node);
                }
            });

            result.push(this.findSpanContainble(endNode));

            return result.toArray();
        },

        findSpanContainble: function(node) {
            var spanContainer = this.SPAN_CONTAINABLE_TAGS;
            var spanContainableNode = $tom.kindOf(node, spanContainer) ? node : $tom.ancestor(node, spanContainer);
            if (spanContainableNode) {
                return spanContainableNode;
            } else {
                return $tom.wrapInlinesWithP(node, $tom.getOwnerDocument(node).body);
            }
        },

        arrangeMarkup: function(blockNodes) {
            var self = this;
            blockNodes.each(function(blockNode) {
                if (blockNode) {
                    self.spanizeAncestor(blockNode);
                    self.flattenChildren(blockNode);
                    self.normalizeText(blockNode);
                    self.inheritFontStyle(blockNode, self.getRelatedCssPropertyNames());
                }
            });
        },
        spanizeAncestor: function(node) {
            var self = this;
            var ancestors = self.findInheritingPath(node);
            ancestors.each(function(ancestor) {
                self.presentationalTagToSpan(ancestor);
            });
        },
        /**
         *해당 노드가 TAGS_FOR_PRESENTATION에 포함된 tag이면 span으로 변환
         */
        presentationalTagToSpan: function(node) {
            var styleMap = this.TAGS_FOR_PRESENTATION;
            if (styleMap[node.tagName]) {
                return this.convertToStyledSpan(node, styleMap[node.tagName]);
            } else {
                return node;
            }
        },
        convertToStyledSpan: function(node, style) {
            if (typeof style == "function") {
                style = style(node);
            }
            var span = $tom.getOwnerDocument(node).createElement("span");
            $tom.addStyles(span, this.getFontStyles(node));
            $tom.addStyles(span, style);
            $tom.replace(node, span);
            return span;
        },
        inheritFontStyle: function(node, styleNames) {
            var self = this;
            var ancestors = self.findInheritingPath(node);

            for (var i = ancestors.length - 1; i >= 0; i--) {
                var ancestor = ancestors[i];
                var inhertingStyle = {};
                var hasStyleInherited = _FALSE;
                var fontStyles = this.getFontStyles(ancestor);

                styleNames.each(function(name) {
                    var styleValue = fontStyles[name];
                    if (styleValue) {
                        hasStyleInherited = _TRUE;
                        inhertingStyle[name] = styleValue;
                    }
                });
                if (hasStyleInherited) {
                    this.inheritStyle(ancestor, inhertingStyle);
                }

                var removedStyles = {};
                styleNames.each(function(name) {
                    // block에 지정된 backgroundColor style은 없애지 않는다.
                    if (name != "backgroundColor" || !$tom.kindOf(ancestor, "%block")) {
                        removedStyles[name] = null;
                    }
                });
                $tom.removeStyles(ancestor, removedStyles);
            }
        },
        findInheritingPath: function(startNode) {
            var result = [];
            var visiting = startNode;
            while (this.needToInheritFontStyle(visiting)) {
                result.push(visiting);
                visiting = visiting.parentNode;
            }
            return result;
        },
        needToInheritFontStyle: function(node) {
            var styleInheritingNode = $tom.kindOf(node, "%paragraph,%inline,ol,ul");
            var inTextbox = $tom.kindOf(node, ".txc-textbox");
            return styleInheritingNode && !inTextbox;
        },
        FLATTEN_TARGET_TAG: new $tx.Set("SPAN", "FONT", "U", "I", "B", "EM", "STRONG", "BIG", "SMALL", "A", "SUB", "SUP",
            "TT", "DFN", "CODE", "SAMP", "KBD", "VAR", "CITE", "ABBR", "ACRONYM", "Q", "BDO", "LABEL", "DIV"),
        flattenChildren: function(element) {
            var self = this;
            var iterator = new goog.dom.NodeIterator(element);
            var nodesNeededFlatten = [];
            var loopCount = 0;
            goog.iter.forEach(iterator, function(node) {
                var convertedNode = self.presentationalTagToSpan(node);
                if (convertedNode != node) {
                    loopCount++;
                    iterator.node = convertedNode; // presentationalTagToSpan로 인해, 기존 node가 없어지기 때문에 변경된 node로 iterator를 조정
                    node = convertedNode;
                }
                if (self.FLATTEN_TARGET_TAG[node.tagName]) {
                    nodesNeededFlatten.push(node);
                } else if ($tom.kindOf(node, "%block,blockquote") && $tom.kindOf(node.parentNode, "%inline")) {
                    // span > blockquote 이런 형태로 잘못된 구조의 본문에서도 실행되도록 하기 위함이다.
                    nodesNeededFlatten.push(node);
                }
            });
            nodesNeededFlatten.each(function(node) {
                self.flattenSpanChild(node);
            });
        },
        flattenSpanChild: function(element) {
            var parentNode = $tom.parent(element);
            if ($tom.tagName(parentNode) == "SPAN") {
                var nextToParent = $tom.splitAt(parentNode, $tom.indexOf(element));
                this.copyStyleToChildren(parentNode, element);
                try {
                    $tom.insertNext(element, parentNode);
                } catch(e) {
                    // IE에서 순환 tree 구조인 경우 실행된다.
                    console.log("meet incorrect dom tree");
                }
                // 불필요한 node는 지워준다.
                if (parentNode.childNodes.length == 0) {
                    $tom.remove(parentNode);
                }
                if (nextToParent.childNodes.length == 0) {
                    $tom.remove(nextToParent);
                }
            }
        },
        // 이름이 맘에 안 듦
        copyStyleToChildren: function(parentNode, element) {
            var parentFontStyles = this.getFontStyles(parentNode);
            if ($tom.tagName(element) == "SPAN") {
                this.addStylesForFont(element, parentFontStyles);
            } else {
                var elementFontStyles = this.getFontStyles(element);
                $tom.removeStyles(element, elementFontStyles);

                // inheritStyle를 이용할 수 있는데...
                this.normalizeText(element);
                for (var i = 0; i < element.childNodes.length; i++) {
                    var childNode = element.childNodes[i];
                    if (childNode.nodeType == 3) {
                        var newNode = $tom.getOwnerDocument(element).createElement('span');
                        $tom.wrap(newNode, [childNode]);
                        childNode = newNode;
                    }
                    this.addStylesForFont(childNode, elementFontStyles);
                    this.addStylesForFont(childNode, parentFontStyles);
                }
            }
        },
        applyFontStyleToText: function(startCaret, startOffset, endCaret, endOffset, newStyle, processor) {
            var iterator = new goog.dom.TextRangeIterator(startCaret, startOffset, endCaret, endOffset);
            var self = this;
            var disallowedTextNode = [];
            goog.iter.forEach(iterator, function(node) {
                if (node.nodeType == 3) {
                    var parentNode = node.parentNode;
                    if ($tom.kindOf(parentNode, "table,tr,thead,tbody,tfooter")) {
                        disallowedTextNode.push(node);
                    } else if ($tom.tagName(parentNode) == "SPAN") {
                        self.setStylesForFont(parentNode, newStyle);
                        // style, 속성 등이 없는 span은 삭제를 하자.
                        self.unwrapIfMeaninglessSpan(parentNode);
                    } else if (node.nodeValue.trim()) {
                        var newNode = processor.create('span', { style : newStyle });
                        $tom.wrap(newNode, [node]);
                    }
                }
            });
            disallowedTextNode.each(function(node) {
                if (node.nodeValue.trim().length == 0) {
                    $tom.remove(node);
                }
            });
        },
        unwrapIfMeaninglessSpan: function(span) {
            // style, 속성 등이 없는 span은 삭제를 하자.
            if (span.childNodes.length == 1 && span.firstChild.nodeValue != Trex.__WORD_JOINER
                && !span.style.cssText && !span.className && !span.id) {
                $tom.insertNext(span.firstChild, span);
                $tom.remove(span);
            }
        },
        // node의 font 관련 스타일을 overwrite
        setStylesForFont: function(node, style) {
            var computedStyle = Object.extend({}, style);

            var textDecoration = computedStyle.textDecoration;
            if (textDecoration) {
                computedStyle.textDecoration = this.computeTextDecoration(textDecoration, node.style.textDecoration);
            }

            if (node.style.font) {
                var fontCssProperty = new FontCssProperty();
                fontCssProperty.setProperty("font", node.style.font);
                for (var name in computedStyle) {
                    fontCssProperty.setProperty(name, computedStyle[name]);
                }
                computedStyle = fontCssProperty.getComputedStyles();
            }

            $tom.applyStyles(node, computedStyle);
        },
        // node의 font 관련 스타일을  유지함
        addStylesForFont: function(node, styles) {
            if ($tom.isElement(node)) {
                var fontCssProperty = new FontCssProperty();
                for (var name in styles) {
                    fontCssProperty.setProperty(name, styles[name]);
                }
                if (node.style.font) {
                    fontCssProperty.setProperty("font", node.style.font);
                }
                $tom.addStyles(node, fontCssProperty.getComputedStyles());
            }
        },
        computeTextDecoration: function(newValue, existValue) {
            if (newValue.charAt(0) == '-') { // remove text-decoration
                return existValue.replace(new RegExp(newValue.substring(1), "g"), "");
            } else if (!existValue.include(newValue)) {   // add text-decoration
                return (existValue.replace(/none/i, "") + " " + newValue).trim();
            } else {    // keep text-decoration
                return existValue;
            }
        },
        inheritStyle: function(parent, style) {
            this.normalizeText(parent);
            var child = parent.firstChild, nextChild;
            while (child) {
                nextChild = child.nextSibling;
                var isFontStylableElement = $tom.isElement(child) && !$tom.kindOf(child, "%control,br");
                if (isFontStylableElement) {
                    this.addStylesForFont(child, style);
                } else if (child.nodeType == 3) {
                    var span = $tom.getOwnerDocument(parent).createElement("span");
                    this.addStylesForFont(span, style);
                    $tom.wrap(span, [child]);
                }
                child = nextChild;
            }
        },

        FONT_RELATED_CSS_PROPERTIES: {
            "font": "font",
            "font-style": "fontStyle",
            "font-weight": "fontWeight",
            "font-size": "fontSize",
            "font-family": "fontFamily",
            "text-decoration": "textDecoration",
            "color": "color",
            "background-color": "backgroundColor",
            "vertical-align": "verticalAlign",
            "FONT": "font",
            "FONT-STYLE": "fontStyle",
            "FONT-WEIGHT": "fontWeight",
            "FONT-SIZE": "fontSize",
            "FONT-FAMILY": "fontFamily",
            "TEXT-DECORATION": "textDecoration",
            "COLOR": "color",
            "BACKGROUND-COLOR": "backgroundColor",
            "VERTICAL-ALIGN": "verticalAlign"
        },
        getFontStyles: function(node) {
            if (!node || !node.style) {
                return;
            }
            var fontCssProperty = new FontCssProperty();
            var cssText = node.style.cssText;
            if (cssText) {
                cssText = cssText.replace(/[\w-]+:\s?;/g, "");
                var properties = cssText.split(/; ?|: ?/);
                for (var i = 0; i < properties.length - 1; i += 2) {
                    var styleName = this.FONT_RELATED_CSS_PROPERTIES[properties[i]];
                    if (styleName) {
                        // block에 지정된 backgroundColor style은 가져오지 않는다.
                        if (styleName != "backgroundColor" || !$tom.kindOf(node, "%block")) {
                            fontCssProperty.setProperty(styleName, properties[i + 1]);
                        }
                    }
                }
            } else {
                var fontTagStyle = this.TAGS_FOR_PRESENTATION.FONT(node);
                for (var name in fontTagStyle) {
                    fontCssProperty.setProperty(name, fontTagStyle[name]);
                }
            }
            return fontCssProperty.getComputedStyles();
        },
        normalizeText: function(node) {
            node.normalize();
        },
        findFirst: function(iterator, condition) {
            try {
                return goog.iter.filter(iterator, condition).next();
            } catch(e) {
                return null;
            }
        },
        TAGS_FOR_PRESENTATION: {
            U: { textDecoration: "underline" },
            B: { fontWeight: "bold" },
            STRONG: { fontWeight: "bold" },
            I: { fontStyle: "italic" },
            EM: { fontStyle: "italic" },
            SUB: { fontSize: "smaller", verticalAlign: "sub"},
            SUP: { fontSize: "smaller", verticalAlign: "super"},
            BIG: { fontSize: "larger" },
            SMALL: { fontSize: "smaller" },
            S: { textDecoration: "line-through" },
            STRIKE: { textDecoration: "line-through" },
            INS: { textDecoration: "underline" },
            DEL: { textDecoration: "line-through" },
            FONT: function(node) {
                var result = {};
                if (node.getAttribute("face")) {
                    result.fontFamily = node.getAttribute("face");
                }
                if (node.getAttribute("color")) {
                    result.color = node.getAttribute("color");
                }

                var fontSizeMap = ["", "x-small", "small", "medium", "large", "x-large", "xx-large"];
                if (node.getAttribute("size")) {
                    var fontSize = node.getAttribute("size");
                    result.fontSize = isNaN(fontSize) ?
                        fontSize : fontSizeMap[Math.min(Math.max(1, fontSize), 6)];
                }
                return result;
            }
        }
    });

    var FontCssProperty = Trex.Class.create({
        $const: {
            FONT_CSS_REGEXP: /(.*?)(\w+)(\/\w+)?\s+(['"]?[\w\uac00-\ud7a3]+['"]?)$/
        },
        properties: {},
        NORMAL_VALUE: "normal",
        initialize: function() {
            this.empty = true;
            this.shorthand = false;
        },
        isEmpty: function() {
            return this.empty;
        },
        setProperty: function(name, value) {
            if (/^font$/i.test(name)) {
                // because of opera
                var parsedProperties = this.fromShorthand(value);
                if (parsedProperties) {
                    this.shorthand = true;
                    Object.extend(this.properties, this.fromShorthand(value));
                }
            } else {
                this.properties[name] = value;
            }
            this.empty = false;
        },
        fromShorthand: function(fontCssText) {
            // parse extra font-families
            var indexOfComma = fontCssText.indexOf(","), extraFontFamilies = "";
            if (indexOfComma > 0) {
                extraFontFamilies = fontCssText.substring(indexOfComma);
                fontCssText = fontCssText.substring(0, indexOfComma);
            }
            var splittedProperties = fontCssText.match(FontCssProperty.FONT_CSS_REGEXP);
            if (splittedProperties === _NULL) {  // invalid font css property value
                return _NULL;
            }
            var NORMAL = this.NORMAL_VALUE;
            // parse main properties
            var properties = {
                fontSize: splittedProperties[2],
                lineHeight: (splittedProperties[3] || NORMAL).replace("/", ""),
                fontFamily: splittedProperties[4] + extraFontFamilies,
                fontWeight: NORMAL,
                fontStyle: NORMAL,
                fontVarient: NORMAL
            };
            // parse optional properties
            var optionalProperties = splittedProperties[1];
            if (/bold|700/i.test(optionalProperties)) {
                properties.fontWeight = "bold";
            }
            if (/italic/i.test(optionalProperties)) {
                properties.fontStyle = "italic";
            }
            if (/small-caps/i.test(optionalProperties)) {
                properties.fontVarient = "small-caps";
            }
            return properties;
        },
        getComputedStyles: function() {
            if (this.shorthand) {
                return this.toShorthand();
            } else {
                return Object.extend({}, this.properties);
            }
        },
        toShorthand: function() {
            var propertiesClone = Object.extend({}, this.properties);
            var NORMAL = this.NORMAL_VALUE;
            var validFontProperties = [];
            ["fontWeight", "fontStyle", "fontVarient"].each(function(name) {
                if (propertiesClone[name] != NORMAL) {
                    validFontProperties.push(propertiesClone[name]);
                }
            });
            if (propertiesClone.lineHeight != NORMAL) {
                validFontProperties.push(propertiesClone.fontSize + "/" + propertiesClone.lineHeight);
            } else {
                validFontProperties.push(propertiesClone.fontSize);
            }
            validFontProperties.push(propertiesClone.fontFamily);
            ["fontWeight", "fontStyle", "fontVarient", "fontSize", "lineHeight", "fontFamily"].each(function(name) {
                delete propertiesClone[name];
            });
            var result = { font: validFontProperties.join(" ") };
            result = Object.extend(result, propertiesClone);
            return result;
        }
    });
})();