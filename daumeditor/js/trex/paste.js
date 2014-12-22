!function() {

    var ELEMENT_NODE = _WIN['Node'] ? Node.ELEMENT_NODE : 1;
    var TEXT_NODE = _WIN['Node'] ? Node.TEXT_NODE : 3;


    /**
     * Paste를 가로채서 추가될 HTML 및 Text를 정제하는 기능
     *
     */
    Trex.Paste = {
        I: {},
        isMSSelection: typeof _WIN.getSelection != 'function',
        MODE_OFF: 'off',
        MODE_HTML: 'html',
        MODE_TEXT: 'text'
    };

    /**
     * pasteContent를 보완하는 processor(BETA)
     * 해당 기능을 충분히 테스트&검증&사용 후 기존의 processor의 pasteContent를 대체하는 방향으로 한다.
     */
    Trex.Paste.I.ProcessorBETA = Trex.Mixin.create({
        initialize: function(editor, canvas) {
            this.editor = editor;
            this.canvas = canvas;

            this.processor = null;
        },
        getProcessor: function() {
            if (!this.processor) {
                this.processor = this.canvas.getProcessor();
            }
            return this.processor;
        },
        /**
         * html을 편집화면에 붙여넣는다.
         *
         * @param html
         */
        pasteContent: function(html) {
            var processor = this.getProcessor();
            var range = processor.createGoogRange();

            var anchorNode = this._getAnchorNodeByRange(range);

            var _tmpNode = processor.create('div');
            html = html.replace(/<\/p>\s+/gi, '</p>');
            html = html.replace(/<br class="Apple-interchange-newline">\s*/g, '');// for chrome clipboard.getData()..
            html = html.replace(/<\/(span|font|i|b|strong|center|i)>[\r\n]+/g, '<\/$1> ');
            html = this.cleanPasteHtml(html);
            _tmpNode.innerHTML = html;

            var targetNodes = $tom.children(_tmpNode);

            var isOnlyTextNode = _FALSE;
            var isAllInlineNode = _TRUE;
            for (var i = 0, m = targetNodes.length; i < m; i++) {
                var node = targetNodes[i];
                if (m == 1 && node.nodeType === TEXT_NODE) {
                    isOnlyTextNode = _TRUE;
                    break;
                } else {
                    if ($tom.isBlock(node)) {
                        isAllInlineNode = _FALSE;
                        break;
                    }
                }
            }

            if (isOnlyTextNode) {
                this._pasteTextOnly(targetNodes, range);
            } else {
                this._pasteHtmlAndText(targetNodes, range, isAllInlineNode, anchorNode);
            }
            this.removeDummyText();
        },
        /**
         * html을 유효한 마크업으로 변형이 필요하다면 이 메소드를 구현하도록 한다.
         *
         * @param html
         * @returns {*}
         */
        cleanPasteHtml: function(html) {
            var dom = this.getProcessor().create('div');
            dom.innerHTML = html;
            return dom.innerHTML;
        },

        /**
         * caret의 이동 및 노드 삽입의 보조역을 위해 word_joiner을 생성한다.
         * 기존에 생성되어 있던 객체가 있다면 재활용 하도록 한다.
         *
         * @returns {Text}
         */
        getDummyText: function() {
            if (!this.dummyText) {
                this.dummyText = this.getProcessor().doc.createTextNode(Trex.__WORD_JOINER);
            }
            return this.dummyText;
        },
        /**
         * caret용 word_joiner를 제거한다.
         */
        removeDummyText: function() {
            if (this.dummyText) {
                $tom.remove(this.dummyText);
                this.dummyText = _NULL;
            }
        },

        /**
         * caret이 위치한 노드를 기준으로 상위 노드까지 tree를 2분할 한다.
         *
         * @param topNode
         * @param range
         * @returns {{previousNode: (_NULL|*), nextNode: (_NULL|*)}}
         */
        divideTree: function(topNode, range) {
            if ($tom.isBody(topNode)) {
                return {
                    previousNode: null,
                    nextNode: null
                }
            }

            var processor = this.canvas.getProcessor();
            range = range || processor.createGoogRange();

            var pNode = _NULL,
                nNode = _NULL;

            var copyRange;

            // range 기준 '이전' 트리노드를 복사 > 끼워넣기
            copyRange = processor.createGoogRangeFromNodes(topNode, 0, range.getFocusNode(), range.getFocusOffset());
            var pHtml = copyRange.getPastableHtml().trim();
            if (pHtml !== '') {
                pNode = topNode.cloneNode(false);
                pNode.innerHTML = pHtml;
                $tom.insertAt(pNode, topNode);

                if (pNode.childNodes.length == 1 && $tom.isElement(pNode.childNodes[0]) && pNode.tagName == pNode.childNodes[0].tagName) {
                    pNode = $tom.unwrap(pNode);
                }
                copyRange = processor.createGoogRangeFromNodes(topNode, 0, range.getFocusNode(), range.getFocusOffset());
                copyRange.select();
                var text = copyRange.getText();
                if (text !== '') {
                    copyRange.removeContents();
                }
            }

            // 끼워넣는 노드 사이에 캐럿을 이동시키기 위한 임시노드 추가
            var caretNode = this.getDummyText();
            $tom.insertAt(caretNode, topNode);

            var caretRange = processor.createGoogRangeFromNodes(caretNode, caretNode.length, caretNode, caretNode.length);
            caretRange.select();
            var savedCaret = caretRange.saveUsingCarets();

            // range 기준 '다음' 트리노드를 topNode에서 '이전' 트리노드에 해당하는 range를 제거하여 완성
            var nHtml = topNode.innerHTML.trim();
            if (nHtml !== '') {
                topNode.innerHTML = nHtml;
                nNode = topNode;
            } else {
                // 빈태그만 존재하므로 topNode를 제거해 준다
                $tom.remove(topNode);
            }

            // 캐럿 이동을 위한 임시 노드로 range 이동
            savedCaret.restore();

            return {
                previousNode: pNode,
                nextNode: nNode
            };
        },

        _pasteTextOnly: function (targetNodes, range) {
            var textNode = targetNodes[0];
            range.insertNode(textNode);

            range = this.getProcessor().createGoogRangeFromNodes(textNode, $tom.getLength(textNode), textNode, $tom.getLength(textNode));
            var savedCaret = range.saveUsingCarets();
            savedCaret.restore();
            return range;
        },

        _removeNodeIfContentIsEmpty: function(node) {
            var text = (node && (node.textContent || node.innerText));
            if (node && text && (text.trim() === '')) {
                $tom.remove(node);
            }
        },

        _pasteHtmlAndText: function (targetNodes, range, isAllInlineNode, anchorNode) {
            if (!range) {
                return;
            }
            var processor = this.getProcessor();

            // anchorNode가 p태그 이거나 p태그를 포함한 하위노드라면 상위의 p를 찾아서 반으로 쪼갠다
            // 단, p태그가 없을 수 있는데 body하위 레벨의 node를 찾거나 신규로 생성하는 방법을 사용하도록 한다.
            var markerContainer = processor.create('div');
            var dividedResult;

            if (isAllInlineNode === _FALSE && anchorNode.nodeType === ELEMENT_NODE) {
                dividedResult = this.divideTree(anchorNode, range);
                this._removeNodeIfContentIsEmpty(dividedResult.previousNode);
                this._removeNodeIfContentIsEmpty(dividedResult.nextNode);
                range = processor.createGoogRange();
                range.insertNode(markerContainer);
                this.removeDummyText();
            } else {
                range.insertNode(markerContainer);
            }


            // range를 marker의 가장 마지막으로 위치이동하고 node를 삽입한다.
            var childNodes;
            targetNodes.each(function (node) {
                childNodes = markerContainer.childNodes.length;
                range = processor.createGoogRangeFromNodes(markerContainer, childNodes, markerContainer, childNodes);
                range.select();
                if (node.nodeType === TEXT_NODE) {
                    var p = processor.create('p');
                    p.appendChild(node);
                    markerContainer.appendChild(p);
                } else {
                    markerContainer.appendChild(node);
                }
            });

            // marker를 unwrapping 시키고
            var lastNode = $tom.bottom(markerContainer);
            if (lastNode == markerContainer) {
                lastNode = markerContainer.childNodes[markerContainer.childNodes.length-1];
            }
            $tom.unwrap(markerContainer);

            // range 이동
            if ($tom.isElement(lastNode)) {
                var txtNode = processor.doc.createTextNode(Trex.__WORD_JOINER);
                $tom.insertAt(txtNode, lastNode);
                $tom.insertAt(lastNode, txtNode);
                range = processor.createGoogRangeFromNodes(txtNode, 0, txtNode, $tom.getLength(txtNode));
                range.removeContents();
            } else {
                // text인 경우 해당 text의 끝에 위치하게 range를 변경
                range = processor.createGoogRangeFromNodes(lastNode, $tom.getLength(lastNode), lastNode, $tom.getLength(lastNode));
            }

            range.select();
            return range;
        },
        _getAnchorNodeByRange: function (range) {
            if (!range) {
                return;
            }
            var anchorNode = range.getFocusNode();

            while (anchorNode) {

                var parentNode = anchorNode.parentNode;
                if ($tom.kindOf(parentNode, 'p,div')) {
                    // 상위 노드까지 포함해서 리턴
                    anchorNode = parentNode;
                    break;
                } else if ($tom.isBody(parentNode) || $tom.kindOf(parentNode, '%innergroup') || $tom.isBlock(parentNode)) {
                    // 중단
                    break;
                } else if ($tom.kindOf(parentNode, '%text,%inline')){
                    // 계속진행

                } else {
                    // 1.
                    // 2.
                    // 중단
                    break;
                }

                anchorNode = parentNode;
            }

            return anchorNode;
        }
    });

    Trex.Paste.I.ProcessorBETATridentLegacy = Trex.Mixin.create({
        cleanPasteHtml: function(html) {
            // TODO: invalid markup에 대한 보완처리가 필요하다.
            return html;
//            return HTMLParser(html).cleanHTML;
        },
        _pasteTextOnly: function (targetNodes, range_notused) {
            var processor = this.getProcessor();
            var range = processor.doc.selection.createRange();
            range.pasteHTML(targetNodes[0].nodeValue);
        },
        _pasteHtmlAndText: function (targetNodes, range, isAllInlineNode, anchorNode) {
            var processor = this.getProcessor();

            // anchorNode가 p태그 이거나 p태그를 포함한 하위노드라면 상위의 p를 찾아서 반으로 쪼갠다
            // 단, p태그가 없을 수 있는데 body하위 레벨의 node를 찾거나 신규로 생성하는 방법을 사용하도록 한다.
            if (isAllInlineNode === _FALSE && anchorNode.nodeType === ELEMENT_NODE) {
                var dividedResult = this.divideTree(anchorNode, range);
                range = processor.createGoogRange();
                this._removeNodeIfContentIsEmpty(dividedResult.previousNode);
                this._removeNodeIfContentIsEmpty(dividedResult.nextNode);
            }

            targetNodes.each(function(node) {
                range.collapse(false);
                if (node.nodeType === TEXT_NODE) {
                    var p = processor.create('p');
                    p.appendChild(node);
                    range.insertNode(p);
                } else {
                    range.insertNode(node);
                }
            });

            range.collapse(false);
        }
    });


    Trex.Paste.Helper = Trex.Class.create({
        $mixins: [
            Trex.Paste.I.ProcessorBETA,
            Trex.Paste.isMSSelection ? Trex.Paste.I.ProcessorBETATridentLegacy : {}
        ]
    });

    Trex.Paste.I.CleanerStandard = Trex.Mixin.create({
        $const: {
            __Identity: 'cleaner-standard'
        },
        filters: {},
        initialize: function (editor, canvas) {
            this.editor = editor;
            this.canvas = canvas;
        },
        /**
         * 불필요한 태그의 제거를 실행한다.
         *
         * @param originalHtml
         * @returns {String} filteredHtml
         */
        execute: function (originalHtml) {
            var self = this;
            var html = originalHtml;

            // 필터링 시작
            html = this.defaultFilterBegin(html);
            html = this.filterOptional(html);
            // 추가 필터링
            for (var filter in this.filters) {
                var filterCallback = this.filters[filter];
                if (this.filters.hasOwnProperty(filter) && typeof filterCallback === 'function') {
                    html = filterCallback.call(self, html);
                }
            }
            // 필터링 종료
            html = this.defaultFilterEnd(html);
            return html;
        },
        defaultFilterBegin: function (html) {
            html = html.replace(/>\s+</g, '><');// 태그간 공백 제거
//            html = html.replace(/[\n|\r]/g, '');// 줄바꿈 제거 #1
            html = html.replace(/(<[a-z]+[^>]*>)/gi, '\n$1');// 태그 제거를 위한 줄바꿈 문자 추가
            html = html.replace(/\n<head>.*<\/head>/gi, '');// head태그 제거
            html = html.replace(/<\/?(html|body|meta)[^>]*>/gi, '');
            html = html.replace(/<!--/g, '\n<!--');// 주석 제거를 위한 줄바꿈 문자 추가
            html = html.replace(/\n<!--.*-->/g, '');// 주석 제거
            html = html.replace(/<p[^>]*>/gi, '<p>');// p태그에 속성 제거
            html = html.replace(/<(font|span[^>]*)>/gi, '<$1>');// 빈 태그 제거
            html = html.replace(/\n<(font|span)[^>]*>\s*<\/\1>/gi, '');// 빈 태그 제거
            html = html.replace(/(\d+)?\.(\d+)([a-z]+)/gi, function (matched, p1, p2, p3) {
                p1 = p1 || '0';
                var val = Math.round(parseFloat(p1 + '.' + p2));
                return val + p3;
            });// 0.65pt, .5pt 같이 소수점 style값을 정수화 변환
            return html;
        },
        defaultFilterEnd: function (html) {
//            html = html.replace(/[\n|\r]/g, '');// 줄바꿈 제거 #2
            return html;
        },
        filterOptional: function (html) {
            // NOTE: 브라우저별로 overwrite를 위한 함수
            html = html.replace(/<p>&nbsp;<\/p>/gi, $tom.EMPTY_PARAGRAPH_HTML);
            return html;
        },
        /**
         * 외부에서 필터를 추가
         * @param name
         * @param callback
         */
        addFilter: function (name, callback) {
            this.filters[name] = callback;
        },
        /**
         * 외부에서 추가한 필터를 제거
         * @param name
         */
        removeFilter: function (name) {
            this.filters[name] = _NULL;
            delete this.filters[name];
        }
    });

    /**
     * 최신 IE를 위한 확장 클래스
     */
    Trex.Paste.I.CleanerTridentStandard = Trex.Mixin.create({
        $const: {
            __Identity: 'cleaner-trident-standard'
        },
        filterOptional: function (html) {
            html = html.replace(/<p><br[^>]*><\/p>/gi, $tom.EMPTY_PARAGRAPH_HTML);
            return html;
        }
    });

    /**
     * 구형 IE를 위한 확장 클래스
     */
    Trex.Paste.I.CleanerTridentLegacy = Trex.Mixin.create({
        $const: {
            __Identity: 'cleaner-trident-legacy'
        },
        filterOptional: function (html) {
            html = html.replace(/<p><br[^>]*><\/p>/gi, $tom.EMPTY_PARAGRAPH_HTML);
            return html;
        }
    });

    Trex.Paste.Cleaner = Trex.Class.create({
        $mixins: [
            Trex.Paste.I.CleanerStandard,
            ($tx.msie && Trex.Paste.isMSSelection ? Trex.Paste.I.CleanerTridentLegacy : {}),
            ($tx.msie && !Trex.Paste.isMSSelection ? Trex.Paste.I.CleanerTridentStandard : {})
        ]
    });


    /**
     * Paste standard 모듈
     */
    Trex.Paste.I.Standard = Trex.Mixin.create({
        $const: {
            __Identity: 'paste-standard'
        },
        isTextOnly: _FALSE,
        isEnable: _FALSE,
        isPasteProcessing: _FALSE,
        initialize: function (editor, canvas, cleaner, helper) {
            this.editor = editor;
            this.canvas = canvas;
            this.cleaner = cleaner;
            this.helper = helper;

            this.doc = _NULL;
            this.processor = _NULL;

            this.bindEvents();
        },
        bindEvents: function () {
            var self = this;
            this.canvas.observeJob(Trex.Ev.__CANVAS_PANEL_PASTE, function (ev) {
                if (self.isEnable) {
                    if (!self.isPasteProcessing) {
                        self.onNativePaste(ev);
                    } else {
                        self.preventPasteDefault(ev);
                    }
                }
            });
        },
        onNativePaste: function (ev) {
            if (!this.canvas.isWYSIWYG()) {
                return _FALSE;
            }

            var dummy = this.getPasteDummy();
            if (dummy) {
                this.preventPasteDefault(ev);
                return _FALSE;
            }

            var clipboardData = ev.clipboardData;
            if (clipboardData && clipboardData.getData) {
                console.log('paste clipboard data');
                return this.pasteByClipboardGetData(ev);
            } else {
                console.log('paste redirect range');
                return this.pasteByRedirection(ev);
            }
        },
        /**
         * 붙여넣기 결과를 off/html/text 상태 3가지 중 1개로 변경한다.
         * @param pasteMode
         */
        switchMode: function(pasteMode) {
            switch(pasteMode) {
                case Trex.Paste.MODE_HTML:
                    this.isTextOnly = _FALSE;
                    this.isEnable = _TRUE;
                    break;
                case Trex.Paste.MODE_TEXT:
                    this.isTextOnly = _TRUE;
                    this.isEnable = _TRUE;
                    break;
                case Trex.Paste.MODE_OFF:
                default:
                    this.isTextOnly = _FALSE;
                    this.isEnable = _FALSE;
            }
        },
        getMode: function() {
            if (!this.isTextOnly && this.isEnable) {
                return Trex.Paste.MODE_HTML;
            } else if (this.isTextOnly && this.isEnable) {
                return Trex.Paste.MODE_TEXT;
            } else {
                return Trex.Paste.MODE_OFF;
            }
        },
        /**
         * paste가 실행되는 wysiwyg document 객체
         * @returns {Object} document 객체
         */
        getDocument: function () {
            if (!this.doc) {
                this.doc = this.canvas.getPanel(Trex.Canvas.__WYSIWYG_MODE).getDocument();
            }
            return this.doc;
        },
        /**
         * clipboard의 내용을 임시 저장하는 node
         * @returns {HTMLElement}
         */
        getPasteDummy: function () {
            return this.getDocument().getElementById('pasteDummy');
        },
        getProcessor: function() {
            if (!this.processor) {
                this.processor = this.canvas.getProcessor();
            }
            return this.processor;
        },
        /**
         * 이벤트 기본 기능을 제한한다.
         * @param {Object} ev
         */
        preventPasteDefault: function (ev) {
            if (ev.preventDefault) {
                ev.preventDefault();
                ev.stopPropagation();
            } else {
                ev.returnValue = _FALSE;
                ev.cancelBubble = _FALSE;
            }
        },
        pasteByClipboardGetData: function (ev) {
            this.preventPasteDefault(ev);

            this.isPasteProcessing = _TRUE;
            var clipboardData = ev.clipboardData;

            var types = $A(clipboardData.types);
            var html = '';
            var self = this;
            if (!this.isTextOnly && types.include('text/html')) {
                html = clipboardData.getData('text/html');
            } else if (types.include('text/plain')) {
                html = clipboardData.getData('text/plain');
            } else {
                html = '???';
            }

            this.removeRangeContents();
            this.saveRange();

            this.restoreRange();
            this.pasteHTML(this.cleaner.execute(html));
            this.isPasteProcessing = _FALSE;
        },
        pasteByRedirection: function (ev) {
            var self = this;
            this.isPasteProcessing = _TRUE;

            this.removeRangeContents();
            this.saveRange();
            var dummy = this.createPasteDummy();
            this.appendPasteDummy(dummy);
            this.setRangeToDummy(dummy);
            this.execPasteCommand();

            setTimeout(function () {
                self.restoreRange();
                self.copyContentToOriginalRange(dummy);
                self.isPasteProcessing = _FALSE;
            }, 1);

        },
        copyContentToOriginalRange: function (dummyNode) {
            var dummy = dummyNode || this.getPasteDummy();
            if (!dummy) {
                throw new Error('paste-dummy node is not found');
                return;
            }

            var cleanHtml = this.isTextOnly ? dummy.innerText : this.cleaner.execute(dummy.innerHTML);
            this.pasteHTML(cleanHtml);
        },
        createPasteDummy: function (tagName) {
            tagName = tagName || 'div';// default div;

            var node = this.getDocument().createElement(tagName);
            node.id = 'pasteDummy';
            node.innerHTML = Trex.__WORD_JOINER;
            node.style.position = 'absolute';
            node.style.overflow = 'hidden';
            node.style.left = '-999em';
            node.style.top = '0';
            node.style.width = '100%';
            node.style.height = '200px';
            node.style.background = 'gray';
            return node;
        },
        appendPasteDummy: function (dummyNode) {
            var doc = this.getDocument();
            doc.body.appendChild(dummyNode);
        },
        removePasteDummy: function() {
            var dummy = this.getPasteDummy();
            if (dummy) {
                $tom.remove(dummy);
                dummy  = _NULL;
            }
        },
        setRangeToDummy: function (dummyNode) {
            var doc = this.getDocument();
            var dummy = dummyNode || this.getPasteDummy();

            var processor = this.canvas.getProcessor();
            dummy.focus();
            processor.createGoogFromNodeContents(dummy).select();
        },
        execPasteCommand: function () {
            try {
                this.getDocument().execCommand('paste');
            } catch (e) {
                console.log(e);
                return _FALSE;
            }
            return _TRUE;
        },
        removeRangeContents: function() {
            var range = this.canvas.getProcessor().createGoogRange();
            if (range) {
                range.removeContents();
            }
        },
        saveRange: function() {
            var range = this.canvas.getProcessor().createGoogRange();
            if (range) {
                this.savedCaret = range.saveUsingCarets();
            }
        },
        restoreRange: function() {
            if (!this.savedCaret.isDisposed()) {
                this.savedCaret.restore();
            }
        },
        pasteHTML: function(html) {
            var self = this;
            this.canvas.execute(function (processor) {
                self.processor = processor;
                self.helper.pasteContent(html);
                self.removePasteDummy();
            });
        }
    });

    /**
     * Paste trident 모듈
     */

    Trex.Paste.I.TridentStandard = Trex.Mixin.create({
        $const: {
            __Identity: 'paste-trident-standard'
        },
        createPasteDummy: function (tagName) {
            tagName = tagName || 'div';
            var node = this.getDocument().createElement(tagName);
            node.id = 'pasteDummy';
            node.innerHTML = Trex.__WORD_JOINER;
            node.style.position = 'absolute';
            node.style.overflow = 'hidden';
            node.style.left = '-999em';
            node.style.top = '0';
            node.style.width = '100%';
            node.style.height = '200px';
            node.style.background = 'gray';
            node.setAttribute('contentEditable', _TRUE);// contentEditable 속성을 부여한다
            ['beforedeactivate', 'focusin', 'focusout', 'paste'].each(function (name){
                    $tx.observe(node, name, function(e){
                        $tx.stopPropagation(e);
                    });
            });
            return node;
        },
        appendPasteDummy: function (dummyNode) {
            var doc = this.getDocument();
            doc.body.appendChild(dummyNode);
            //ie11 은 body 밑에다 생성해야 정상동작 된다.
        },
        pasteByRedirection: function (ev) {
            var self = this;
            this.isPasteProcessing = _TRUE;

            // IE는 paste기본 동작을 무조건 막는다.
            this.preventPasteDefault(ev);

            this.removeRangeContents();
            this.saveRange();
            var dummy = this.createPasteDummy();
            this.appendPasteDummy(dummy);
            this.setRangeToDummy(dummy);
            this.execPasteCommand();

            setTimeout(function () {
                self.restoreRange();
                self.copyContentToOriginalRange(dummy);
                self.isPasteProcessing = _FALSE;
            }, 10);

        }
    });

    Trex.Paste.I.TridentLegacy = Trex.Mixin.create({
        $const: {
            __Identity: 'paste-trident-legacy'
        },
        createPasteDummy: function (tagName) {
            tagName = tagName || 'body';
            var node = this.getDocument().createElement(tagName);
            node.id = 'pasteDummy';
            node.innerHTML = Trex.__WORD_JOINER;
            node.style.position = 'absolute';
            node.style.overflow = 'hidden';
            node.style.left = '-999em';
            node.style.top = '0';
            node.style.width = '100%';
            node.style.height = '200px';
            node.style.background = 'gray';
            node.setAttribute('contentEditable', _TRUE);// contentEditable 속성을 부여한다
            ['beforedeactivate', 'focusin', 'focusout', 'paste'].each(function (name){
                $tx.observe(node, name, function(e){
                    $tx.stopPropagation(e);
                });
            });
            return node;
        },
        appendPasteDummy: function (dummyNode) {
            var doc = this.getDocument();
            doc.body.parentNode.appendChild(dummyNode);
        },
        pasteByRedirection: Trex.Paste.I.TridentStandard.pasteByRedirection,
        setRangeToDummy: function (dummyNode) {
            var dummy = dummyNode || this.getPasteDummy();

            var range = dummy.createTextRange();
            range.moveToElementText(dummy);
            range.collapse(_TRUE);
            range.moveStart("character", 0);
            range.moveEnd("character", 0);
            range.execCommand('paste', _NULL, _FALSE);
        },
        execPasteCommand: function () {
            // setRangeToDummy에서 range.execCommand를 한번에 실행하게 되어 execPasteCommand의 할 일은 없다.
        }
    });


    /**
     * Paste gecko windows용 모듈
     * - 2014.06.19 : windows용 ff는 "text/html"이 정상 동작하지 않고 있어서 clipboardData 객체를 이용 할 수 없다.
     * - 2014.07.10 : windows용 ff의 "text/html" 못 불러오는 문제가 해결되어 다시 기본으로 onNativePaste를 사용하도록 한다.
     */
    Trex.Paste.I.GeckoForWindows = Trex.Mixin.create({
        $const: {
            __Identity: 'paste-gecko-for-windows'
        },
        onNativePaste: function (ev) {
            if (!this.canvas.isWYSIWYG()) {
                return _FALSE;
            }

            var dummy = this.getPasteDummy();
            if (dummy) {
                this.preventPasteDefault(ev);
                return _FALSE;
            }

                console.log('paste redirect range');
                return this.pasteByRedirection(ev);
        },
        execPasteCommand: function () {
            // empty method
        }
    });

    Trex.Paste.Paster = Trex.Class.create({
        $mixins: [
            Trex.Paste.I.Standard,
            ($tx.msie && Trex.Paste.isMSSelection ? Trex.Paste.I.TridentLegacy : {}),
            ($tx.msie && !Trex.Paste.isMSSelection ? Trex.Paste.I.TridentStandard : {}),
            ($tx.os_win && $tx.gecko ? Trex.Paste.I.GeckoForWindows : {})
        ]
    });

    Trex.install("editor.getPaster",
        function (editor, toolbar, sidebar, canvas, config) {
            var cleaner = new Trex.Paste.Cleaner(editor, canvas);
            var pasteProcessor = new Trex.Paste.Helper(editor, canvas);
            var paster = new Trex.Paste.Paster(editor, canvas, cleaner, pasteProcessor);


            editor.getPaster = function () {
                return paster;
            };

            editor.getPasteCleaner = function () {
                return paster.cleaner;
            };

            editor.getPasteProcessor = function() {
                return pasteProcessor;
            };
        }
    );
}();

Trex.register("filter > paste",
    function(editor, toolbar, sidebar, canvas, config) {
        if(!($tx.msie && !Trex.Paste.isMSSelection))
            return;
        function removePasteBin(contents){
            var d = document.createElement('div');
            d.style.display = 'none';
            d.innerHTML = contents;
            document.body.appendChild(d);
            var el = document.getElementById('pasteDummy');
            if(el && $tom.findAncestor(el, function(node){
                    return node === d;
                }, function(node){
                    return $tom.isBody(node)||node.parentNode == _NULL;
                })){
                $tom.remove(el);
            }
            var res = d.innerHTML;
            $tom.remove(d);
            return res;
        }

        var _docparser = editor.getDocParser();
        _docparser.registerFilter(
            'filter/paste', {
                'source@load': function(contents){
                    return contents;
                },
                'html@load': function(contents){
                    return contents;
                },
                'source4save': function(contents){
                    return contents;
                },
                'html4save': function(contents){
                    return removePasteBin(contents);
                },
                'text4save': function(contents){
                    return contents;
                },
                'html2text': function(contents) {
                    return removePasteBin(contents);
                },
                'source2text': function(contents) {
                    return contents;
                },
                'source2html': function(contents){
                    return contents;
                },
                'html2source': function(contents){
                    return removePasteBin(contents);
                }
            });
    });