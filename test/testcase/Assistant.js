(function() {
    var LOREM = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    /**
     * Editor Unit Test Helper
     */
    Assistant = function(editor) {
    	var self = this;
    	self.editor = editor || Editor;
    	self.canvas = self.editor.getCanvas();
    	if (self.editor.__PANEL_LOADED) {
    		setData();
    	} else {
    		self.canvas.observeJob(Trex.Ev.__IFRAME_LOAD_COMPLETE, function() {
    			setData();
    		});
    	}
    	function setData() {
    		self.processor = self.canvas.getProcessor();
        	self.doc = self.processor.doc;
        	self.win = self.processor.win;
    	}
    };
    Assistant.prototype = {
        $: function(id) {
            return this.doc.getElementById(id);
        },
        $$: function(selector, context) {
            context = context || this.doc;
            if (context.querySelectorAll) {
                return context.querySelectorAll(selector);
            } else if (typeof Sizzle == 'function') {
                return Sizzle(selector, context);
            } else {
                throw new Error("not supported operation");
            }
        },
        byTag: function(tagName, index) {
            return this.doc.getElementsByTagName(tagName)[index || 0];
        },
        createGoogRange: function() {
            return goog.dom.Range.createFromWindow(this.win);
        },
        selectAll: function() {
            this.processor.selectAll();
        },

        setContent: function(content) {
            this.canvas.setContent(content);
        },

        setContentElement: function(element) {
            this.doc.body.innerHTML = '';
            this.doc.body.appendChild(element);
        },

        emptyContent: function() {
            this.doc.body.innerHTML = '';
        },

        getContent: function() {
            return this.canvas.getContent();
        },

        focusOnTop: function() {
            this.canvas.focusOnTop();
            // opera 의 경우 명시적으로 block 지정을 하지 않으면 selection.anchorOffset 을 읽어오지 못한다.
            if ($tx.opera) {
                this.selectAll();
            }
        },

        getTool: function(toolName) {
            return Editor.getToolbar().tools[toolName];
        },

        executeTool: function(toolName, opt_params) {
            var params = $A(arguments);
            params.shift();
            var tool = this.getTool(toolName);
            if (tool.menu) {
                var menu = tool.menu;
                menu._command.apply(menu, params || []);
            } else {
                tool.handler.apply(tool, params || []);
            }
        },

        getRange: function() {
            return this.processor.getRange();
        },

        pressTab: function() {
            this.canvas.fireKeys({
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                keyCode: $tx.KEY_TAB
            });
        },

        pressShiftTab: function() {
            this.canvas.fireKeys({
                ctrlKey: false,
                altKey: false,
                shiftKey: true,
                keyCode: $tx.KEY_TAB
            });
        },

        pressBackspace: function(ev) {
            ev = Object.extend(ev || {},
                    {
                        ctrlKey: false,
                        altKey: false,
                        shiftKey: false,
                        keyCode: $tx.KEY_BACKSPACE
                    });
            this.canvas.fireKeys(ev);
        },

        pressEnter: function(ev) {
            ev = Object.extend(ev || {}, {
                keyCode: Trex.__KEY.ENTER
            });
            this.canvas.fireKeys(ev);
        },

        selectForNodes: function(startNode, startOffset, endNode, endOffset) {
            var range = goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset);
            range.select();
            return range;
        },

        collapse: function() {
            var range = this.createGoogRange();
            range.collapse();
        },

        selectNodeContents: function(node) {
            var range = goog.dom.Range.createFromNodeContents(node);
            range.select();
        },

        createControlRangeFrom: function(node) {
            return goog.dom.ControlRange.createFromElements(node);
        },

        getElementsBySelector: function(selector) {
            return Sizzle(selector, this.doc);
        },

        delayedAssertion: function(fn) {
            QUnit.stop(1000);
            setTimeout(function() {
                fn.call(this);
                QUnit.start();
            }, 0);
        },

        assertToolExecution: function(toolName, toolParam, testFunction) {
            assi.executeTool(toolName, toolParam);
            if ($tx.msie) {
                assi.delayedAssertion(testFunction);
            } else {
                testFunction();
            }
        },

        getBodyHTML: function() {
            return this.doc.body.innerHTML;
        },

        extractText: function(elem) {
            var t = "";
            elem = elem.childNodes || elem;
            for (var i = 0; i < elem.length; i++) {
                t += elem[i].nodeType != 1 ? elem[i].nodeValue : arguments.callee(elem[i].childNodes);
            }
            return t;
        },

        getText: function() {
            return this.processor.getText();
        },

        queryStyle: function(node, style) {
            return this.processor.queryStyle(node, style);
        },

        getStyle: function(node, name) {
            var value = $tx.getStyle(node, name);
            if (name == "fontWeight") {
                value = value.replace("700", "bold");
                value = value.replace("400", "normal");
            }
            return value;
        },

        getNode: function() {
            return this.processor.getNode();  
        },

        valid: function(opt_node) {
            var testNode = function(node, parent, sibling) {
                var result = true;
                if (parent && node.parentNode != parent) {
                    console.log('invalid parent ', node, parent, node.parentNode);
                    result = false;
                }
                if (sibling && node.nextSibling != sibling) {
                    console.log('invalid sibling ', node, parent, node.nextSibling);
                    result = false;
                }
                for (var i = 0, len = node.childNodes.length; i < len; i++) {
                    result = testNode(node.childNodes[i], node, node.childNodes[i + 1]) && result;
                }
                return result;
            };
            return testNode(opt_node || this.doc.body);
        },
        /*
         * 잘못 닫힌 html을 수정해보려는 노력
         * 잘 동작하는 코드인지는 충분히 테스트를 해야 알 수 있을 듯
         */
        fix: function(opt_node) {
            var fixNode = function(node, parent, sibling) {
                var front, rear, refNode;
                if (!node) {
                    return;
                }
                if (parent && node.parentNode != parent) {
                    console.log('invalid parent ', node, parent, node.parentNode);
                    var realParent = node.parentNode;
                    front = $tom.clone(realParent);
                    rear = $tom.clone(realParent);
                    $tom.insertAt(front, realParent);
                    $tom.moveChild(realParent, front);
                    $tom.remove(realParent);
                }
                if (sibling && node.nextSibling != sibling) {
                    console.log('invalid sibling ', node, parent, node.nextSibling);
                    if (node.nodeType == 3) {
                        refNode = parent;
                    } else {
                        refNode = node;
                    }
                    front = $tom.clone(refNode);
                    rear = $tom.clone(refNode);

                    $tom.insertAt(front, refNode);
                    $tom.insertNext(rear, front);

                    $tom.moveChild(refNode, rear, $tom.indexOf(node) + 1);
                    $tom.moveChild(refNode, front);
                    $tom.insertNext(rear, refNode.parentNode);
                    $tom.remove(refNode);
                }
                for (var i = 0, len = node.childNodes.length; i < len; i++) {
                    fixNode(node.childNodes[i], node, node.childNodes[i + 1]);
                }
            };
            fixNode(opt_node || this.doc.body);
        },

        tidy: function(opt_node) {
            var html = (opt_node || this.doc.body).innerHTML;
            Trex.I.FHRequester.sendRequest('post',
                    'http://uie.daum.net/cgi-bin/tidy.py',
                    "content=" + encodeURIComponent(html),
                    false,
                    showTidyError);
            var self = this;
            function showTidyError(text) {
                var result = JSON.parse(text);
                self.setContent(result.content);
                console.log(result.content);
                console.log(result.errors);
            }
        },

        tree: function(opt_node, opt_detail) {
            var logger = new BatchLogger(), to_s;
            var visitNode = function(node, depth) {
                to_s = new Array(depth).join('  ');
                if (node.nodeType == 3) {
                    var text = (node.textContent || node.nodeValue);
                    to_s += '"' + text + '" ' + text.length;
                } else if (node.nodeType == 8) {
                    to_s += "<!-- " + node.nodeValue + " -->";
                } else {
                    to_s += node.tagName;
                    if (node.id) {
                        to_s += "#" + node.id;
                    }
                    if (node.style.cssText) {
                        if (opt_detail) {
                            to_s += " [style=" + node.style.cssText + "]";
                        } else {
                            to_s += " [style]";
                        }
                    }
                }
                logger.add(to_s);
                for (var i = 0, len = node.childNodes.length;  i < len; i++) {
                    visitNode(node.childNodes[i], depth + 1);
                }
            };
            visitNode(opt_node || this.doc.body, 1);
            logger.print();
        },
        createMarker: function() {
            return new Trex.Canvas.Marker(this.processor);
        },

        getHTML: function() {
            var div = ax.div.apply(null, $A(arguments));
            return div.innerHTML;
        },

        inspect: function(object) {
            for (var name in object) {
                if (object.hasOwnProperty(name)) {
                    console.log(name + ": " + object[name]);
                }
            }
        },

        trace: function() {
            try {
                throw new Error("stacktrace");
            } catch(e) {
                console.log(e, e.stack);
            }
        },
        showMemento: function() {
            var history = this.canvas.history;
            console.log(' > undoMementoList ' + history.undoMementoList.length);
            console.log(JSON.stringify(history.undoMementoList));
            console.log(' > redoMementoList ' + history.redoMementoList.length);
            console.log(JSON.stringify(history.redoMementoList));
        },

        LOREM : LOREM
    };

    Assistant.LOREM = LOREM;
    EditorJSLoader.ready(function() {
        if (!window.assi) {
            window.assi = new Assistant();
        }
    });
})();

/* Qunit Helper Methods */
(function() {
    function regexpEqual(actual, expectedRegexp) {
        ok(new RegExp("^" + expectedRegexp + "$").test(actual), 'expected regexp: "' + expectedRegexp + '" result: "' + actual + '"');
    }

    function htmlEqual(actual, expected, opt_message) {
        if (actual.nodeType) {
            actual = actual.innerHTML;
        }
        if (expected.nodeType) {
            expected = expected.innerHTML;
        }
        equal(standardizeHTML(actual), standardizeHTML(expected), opt_message);
    }

    function standardizeStyle(name, value) {
        if (name == "fontWeight") {
            value = value.replace("400", "normal").replace("700", "bold");
        } else if (name == "color") {
            value = value.replace("#ff0000", "red");
        }
        return value;
    }
    function styleEqual(actual, expected, opt_message) {
        var name;
        for (name in actual) {
            actual[name] = standardizeStyle(name, actual[name]);
        }
        for (name in expected) {
            expected[name] = standardizeStyle(name, expected[name]);
        }
        deepEqual(actual, expected, opt_message);
    }
    window.regexpEqual = regexpEqual;
    window.htmlEqual = htmlEqual;
    window.styleEqual = styleEqual;
})();

(function() {
    function standardizeHTML(html) {    // from closure
        var translator = document.createElement('DIV');
        translator.innerHTML = html;

        // Trim whitespace from result (without relying on goog.string)
        var renderedHTML = translator.innerHTML
                .replace(/^\s+|\s+$/g, '')
                .replace(/<([a-z]+)\s+([^>]+)>/gi, function(matched, tag, attrText) { return "<" + tag + normalizeAttributes(attrText) + ">";})
                .replace(/style=(['"])([^\1]+?);? ?\1/g, function(matched, quote, styleText) { return 'style="' + normalizeStyleText(styleText)  + '"'; })
                .replace(Trex.__WORD_JOINER_REGEXP, "");
        if ($tx.opera) {
            renderedHTML = renderedHTML.replace(/style="[^"]+"/g,
                    function(matched) {
                        return matched
                            .replace(/font-weight: 400/g, "font-weight: normal")
                            .replace(/font-weight: 700/g, "font-weight: bold"); });
        }
		if ($tx.msie_ver == 8) {
			renderedHTML = renderedHTML.replace(/<(TD|TH)[^>]+>/gi, function(matched){
				return matched.replace(/ colSpan=1/g, "").replace(/ rowSpan=1/g, "");
			});
		} //for table test in IE8 rendering.
        return renderedHTML;
    }

    function normalizeAttributes(attrText) {
        return " " +
                attrText.replace(/(\w+)=(['"])([^\2]+?)(\2)/g, function(matched, attrName, quote, attrValue) { return attrName + '=' + quote + attrValue.replace(/\s+/g, '\uffff') + quote; })
                        .split(/\s+/)
                        .map(function(attr) { return attr.replace(/\uffff/g, ' '); })
                        .sort()
                        .join(" ");
    }

    function normalizeStyleText(styleText) {
        return styleText
                .split(/; ?/)
                .map(function(token) { return token.replace(/ ?: ?/g, ": "); })
                .map(function(token) { return toHexColor(token); })
                .map(function(token) { return token.replace(/: "([^\s]+)"$/, ": $1"); })
                .map(sortTextDecorationValue)
                .map(function(token) { return token.replace(/#0000ff/gi, "blue"); })
                .map(function(token) { return token.replace(/#ff0000/gi, "red"); })
                .sort()
                .join("; ");
    }

    function sortTextDecorationValue(token) {
        return token.replace(/(.*): (.*)/g,
            function(matched, styleName, styleValue) {
                if (styleName == "text-decoration") {
                    return styleName + ": " + styleValue.split(" ").sort().join(" ");
                } else {
                    return matched;
                }
            }
        );
    }

    function toHexColor(rgbColor) {
        return rgbColor.replace(/\b(rgba?\s?\((\d+,?\s?){3,}\))/g,
                function(matched){
                    return Trex.Color.getHexColor(matched).toLowerCase();
                });
    }

    window.standardizeHTML = standardizeHTML;
    window.toHexColor = toHexColor;
})();

/* IE에서 매번 console.log 실행하면 느려서.. */
var BatchLogger = function() {
    this.log = [];
};
BatchLogger.prototype.add = function() {
    this.log.push($A(arguments).join(" "));
};
BatchLogger.prototype.print = function() {
    console.log(this.log.join("\n") + "\n");
    this.log = [];
};