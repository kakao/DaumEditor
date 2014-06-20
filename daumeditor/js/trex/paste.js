!function() {

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
            html = html.replace(/[\n|\r]/g, '');// 줄바꿈 제거 #1
            html = html.replace(/(<[a-z]+[^>]*>)/gi, '\n$1');// 태그 제거를 위한 줄바꿈 문자 추가
            html = html.replace(/\n<head>.*<\/head>/gi, '');// head태그 제거
            html = html.replace(/<\/?(html|body)[^>]*>/gi, '');
            html = html.replace(/<!--/g, '\n<!--');// 주석 제거를 위한 줄바꿈 문자 추가
            html = html.replace(/\n<!--.*-->/g, '');// 주석 제거
            html = html.replace(/<p[^>]*>/gi, '<p>');// p태그에 속성 제거
            html = html.replace(/\n<(font|span)[^>]*>\s*<\/\1>/gi, '');// 빈 태그 제거
            html = html.replace(/(\d+)?\.(\d+)([a-z]+)/gi, function (matched, p1, p2, p3) {
                p1 = p1 || '0';
                var val = Math.round(parseFloat(p1 + '.' + p2));
                return val + p3;
            });// 0.65pt, .5pt 같이 소수점 style값을 정수화 변환
            return html;
        },
        defaultFilterEnd: function (html) {
            html = html.replace(/[\n|\r]/g, '');// 줄바꿈 제거 #2
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
        initialize: function (editor, canvas, cleaner) {
            this.editor = editor;
            this.canvas = canvas;
            this.cleaner = cleaner;

            this.doc = _NULL;

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

            this.canvas.execute(function (processor) {
                self.restoreRange();
                processor.pasteContent(self.cleaner.execute(html));
                self.isPasteProcessing = _FALSE;
            });
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

            this.canvas.execute(function (processor) {
                dummy.parentNode.removeChild(dummy);
                dummy = null;
                processor.pasteContent(cleanHtml);
            });
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
        setRangeToDummy: function (dummyNode) {
            var doc = this.getDocument();
            var dummy = dummyNode || this.getPasteDummy();

            var processor = this.canvas.getProcessor();
            processor.focus();

            var rng = doc.createRange();
            rng.setStart(dummy, 0);
            rng.setEnd(dummy, 0);

            var sel = doc.defaultView.getSelection();
            sel.removeAllRanges();
            sel.addRange(rng);
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
            range.removeContents();
        },
        saveRange: function() {
            var range = this.canvas.getProcessor().createGoogRange();
            this.savedCaret = range.saveUsingCarets();
        },
        restoreRange: function() {
            if (!this.savedCaret.isDisposed()) {
                this.savedCaret.restore();
            }
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
            tagName = tagName || 'body';// ie는 body로 생성;

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

            return node;
        },
        appendPasteDummy: function (dummyNode) {
            var doc = this.getDocument();
            doc.body.parentNode.appendChild(dummyNode);
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
        createPasteDummy: Trex.Paste.I.TridentStandard.createPasteDummy,
        appendPasteDummy: Trex.Paste.I.TridentStandard.appendPasteDummy,
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

            this.pasteByRedirection(ev);
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
            var paster = new Trex.Paste.Paster(editor, canvas, cleaner);

            editor.getPaster = function () {
                return paster;
            };

            editor.getPasteCleaner = function () {
                return paster.cleaner;
            };
        }
    );
}();