/**
 * Referred Sources
 * http://ckeditor.com/ htmlparser.js
 * http://ejohn.org/blog/pure-javascript-html-parser/ by John Resig (ejohn.org)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js by Erik Arvidsson
 */
(function() {
    /**
     * <o:p>MSO</o:p>
     * <table><tr><td></td>Text<td></td></tr></table>
     * <embed></embed>, <embed>
     * area, param
     */
    function extend(dest, org) {
        for (var key in org) {
            dest[key] = org[key];
        }
        return dest;
    }
    
    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++) {
            obj[ items[i] ] = true;
            obj[ items[i].toUpperCase() ] = true;
        }
        return obj;
    }

    var htmlPartsRegex = /<(?:(?:\/([A-Za-z][-A-Za-z0-9_:]*)[^>]*>)|(?:!--([\S\s]*?)-->)|(?:([A-Za-z][-A-Za-z0-9_:]*)((?:\s+(?:\/(?!>)|[^>\s=])+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*?)\s*(\/?)>))/g;

    // Empty Elements - HTML 4.01
    var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

    // Block Elements - HTML 4.01
    var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

    // Inline Elements - HTML 4.01
    var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

    // Attributes that have their values filled in disabled="disabled"
    // var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // Special Elements (can contain anything)
    var special = makeMap("script,style,textarea");

    // 다른 데에서도 사용을 할까?
    var Set = {
        isEmpty: function(obj) {
            for (var key in obj) {
                return false;
            }
            return true;
        },
        intersection: function(s1, s2) {
            var result = {};
            for (var key in s1) {
                if (key in s2 && s1[key] === s2[key]) {
                    result[key] = s1[key];
                }
            }
            return result;
        },
        difference: function(s1, s2) {
            var result = extend({}, s1);
            for (var key in s2) {
                delete result[key];
            }
            return result;
        },
        union: function(s1, s2) {
            var result = extend({}, s1);
            for (var key in s2) {
                result[key] = s2[key];
            }
            return result;
        },
        isSubset: function(s1, s2) {
            for (var key in s2) {
                if (s2[key] !== s1[key]) {
                    return false;
                }
            }
            return true;
        }
    };

    var HTMLTree = this.HTMLTree = function() {
        this.current = null;
        this.depth = 0;
        this.maxDepth = 0;
    };

    HTMLTree.create = function() {
        var tree = new HTMLTree();
        tree.openTag(1, "ROOT", "", false, false);
        return tree;
    };

    HTMLTree.parseAttributes = function(attrText) {
        var ATTRIBUTE_REGEX = /\s*([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;
        var attribMatch, attribs = {};
        if (attrText) {
            while (( attribMatch = ATTRIBUTE_REGEX.exec(attrText) )) {
                var attName = attribMatch[1].toLowerCase(),
                    attValue = attribMatch[2] || attribMatch[3] || attribMatch[4] || '';
                if (attName == "class") {
                    attName = "className"; // class is special. {class:1}, {}.class makes error.
                }
                attribs[ attName ] = attValue;
            }
        }
        return attribs;
    };

    HTMLTree.prototype.openTag = function(nodeType, nodeData, restText, unary) {
        var tagName = nodeType == 1 ? nodeData.toUpperCase() : null;
        var data = {
            parent: this.current,
            nodeType: nodeType,
            tagName: tagName,
            nodeData: nodeData,
            restText: restText || "",
            children: [],
            inheritingFontStyle: {},
            fontStyle: {},
            hasText: nodeType == 8 || (nodeType == 3 && !/^(\r|\n)*$/.test(nodeData)),
            valid: true,
            unary: nodeType == 1 ? unary : true,
            hasKeyAttribute: false
        };

        // attribute, font관련 css에 대한 처리를 한다.
        if (nodeType == 1) {
            // ancestor에서 정의된 font 속성
            var inheritedFontStyle = data.parent ? data.parent.inheritingFontStyle : {};
            if (tagName == "TABLE" /* && quirks mode */) {
                inheritedFontStyle = {};
            }

            var attributes = HTMLTree.parseAttributes(restText);
            // 중요한 속성을 갖고 있는가?
            if (attributes.id || attributes.className) {
                // TODO : naming
                data.hasKeyAttribute = true;
            }
            // 현재 node에서 정의한 font 속성
            var currentFontStyle = FontCssProperty.create(tagName, attributes);
            data.fontStyle = currentFontStyle;
            /* <span style="font-size:12pt"><span style="font-size:12pt">Hello</span></span> 에서 문제 발생, valid 여부 확인하면서 돌면 될듯함
            // ancestor에서 정의된 속성에 포함이 되는가?
            // TODO font related tags
            if ((FontCssProperty.TAGS_FOR_PRESENTATION[tagName] || tagName == "SPAN") && Set.isSubset(inheritedFontStyle, currentFontStyle) && !data.hasAttributes) {
                data.valid = false;
            }
            */
            // descendant에 적용될 font 속성
            var inheritingFontStyle = extend({}, inheritedFontStyle);
            inheritingFontStyle = extend(inheritedFontStyle, currentFontStyle);
            data.inheritingFontStyle = inheritingFontStyle;
        }

        if (this.current) {
            this.current.children.push(data);
        } else {
            this.root = data;
            data.valid = false;
        }
        this.depth += 1;
        this.maxDepth = Math.max(this.depth, this.maxDepth);
        this.current = data;
    };

    HTMLTree.prototype.unaryTag = function(nodeType, nodeData, restText) {
        this.openTag(nodeType, nodeData, restText, true);
        this.closeTag();
    };

    HTMLTree.prototype.closeTag = function() {
        this.depth -= 1;
        this.current = this.current.parent;
    };

    HTMLTree.prototype.toString = function() {
        var result = [];
        var root = this.root;
        visitNode(root);
        return result.join('');

        function visitNode(node) {
            if (root != node) {
                if (node.nodeType == 1) {
                    result.push("<");
                    result.push(node.nodeData);
                    result.push(node.restText);
                    result.push(">");
                } else if (node.nodeType == 3) {
                    result.push(node.nodeData);
                } else if (node.nodeType == 8) {
                    result.push("<!--");
                    result.push(node.nodeData);
                    result.push("-->");
                }
            }
            for (var i = 0; i < node.children.length; i++) {
                visitNode(node.children[i]);
            }
            if (root != node && !node.unary) {
                result.push("</");
                result.push(node.nodeData);
                result.push(">");
            }
        }
    };

    HTMLTree.prototype.cleanHTML = function() {
        if (!this.cleanedUp) {
            this.removeUseless();
            this.cleanedUp = true;
        }
        var result = [];
        visitNode(this.root);
        return result.join("");

        function visitNode(node) {
            if (node.valid) {
                if (node.nodeType == 1) {
                    result.push("<");
                    result.push(node.nodeData);
                    result.push(node.restText);
                    result.push(">");
                } else if (node.nodeType == 3) {
                    result.push(node.nodeData);
                } else if (node.nodeType == 8) {
                    result.push("<!--");
                    result.push(node.nodeData);
                    result.push("-->");
                }
            }
            for (var i = 0; i < node.children.length; i++) {
                visitNode(node.children[i]);
            }
            if (node.valid && !node.unary) {
                result.push("</");
                result.push(node.nodeData);
                result.push(">");
            }
        }
    };

    HTMLTree.prototype.postOrder = function(callback) {
        visitNode(this.root);

        function visitNode(node) {
            for (var i = 0; i < node.children.length; i++) {
                visitNode(node.children[i]);
            }
            callback(node);
        }
    };

    HTMLTree.prototype.removeUseless = function() {
        var start = new Date().getTime();
        var count = 0;
        this.postOrder(function(node) {
            switch(node.nodeType) {
            case 1:
                var tagName = node.tagName;

                var childrenCommonStyles = {};
                for (var i = 0; i < node.children.length; i++) {
                    var child = node.children[i];
                    if (i == 0) {
                        childrenCommonStyles = extend({}, child.fontStyle);
                    } else {
                        childrenCommonStyles = Set.intersection(childrenCommonStyles, child.fontStyle);
                    }
                    if (!node.hasText) {
                        node.hasText = child.hasText;
                    }
                }
//            console.log(tagName, JSON.stringify(node.fontStyle), JSON.stringify(childCommonStyles));

                var effectingStyle = Set.difference(node.fontStyle, childrenCommonStyles);
                node.fontStyle = Set.union(node.fontStyle, childrenCommonStyles);
                // TODO font related
                if (!node.hasKeyAttribute && (FontCssProperty.TAGS_FOR_PRESENTATION[tagName] || tagName == "SPAN")) {
                    if (Set.isEmpty(effectingStyle) || !node.hasText) {
                        count++;
                        node.valid = false;
                    }
                }
                break;
            case 3:
                node.fontStyle = {};
                break;
            case 8:
                node.fontStyle = {};
                break;
            }
        });
//        console.log('# of removed elements: ' + count);
//        console.log('duration: ' + (new Date().getTime() - start));
    };

    this.HTMLParser = function(html) {
        var wellFormed = true,
            parts,
            tagName,
            nextIndex = 0,
            stack = [],
            tree = HTMLTree.create(),
            cdata;	// The collected data inside a CDATA section.
        stack.empty = function() {
            return this.length === 0;
        };
        stack.last = function() {
            return this[this.length - 1];
        };

        while (( parts = htmlPartsRegex.exec(html) )) {
            // visit TextNode
            var tagIndex = parts.index;
            if (tagIndex > nextIndex) {
                var text = html.substring(nextIndex, tagIndex);

                if (cdata) {
                    cdata.push(text);
                } else {
                    onText(text);
                }
            }

            nextIndex = htmlPartsRegex.lastIndex;

            /*
             "parts" is an array with the following items:
             0 : The entire match for opening/closing tags and comments.
             1 : Group filled with the tag name for closing tags.
             2 : Group filled with the comment text.
             3 : Group filled with the tag name for opening tags.
             4 : Group filled with the attributes part of opening tags.
             */

            // Closing tag
            if (( tagName = parts[ 1 ] )) {
                if (cdata && special[ tagName ]) {
                    onCDATA(cdata.join(''));
                    cdata = null;
                }

                if (!cdata) {
                    onEndTag(tagName);
                    continue;
                }
            }

            // If CDATA is enabled, just save the raw match.
            if (cdata) {
                cdata.push(parts[ 0 ]);
                continue;
            }

            // Opening tag
            if (( tagName = parts[ 3 ] )) {

                // There are some tag names that can break things, so let's
                // simply ignore them when parsing. (#5224)
                if (/="/.test(tagName))
                    continue;

                var unary = !!( parts[ 4 ] && parts[ 4 ].charAt(parts[ 4 ].length - 1) == '/' );

                onStartTag(tagName, parts[ 4 ], unary);

                // Open CDATA mode when finding the appropriate tags.
                if (!cdata && special[ tagName ]) {
                    cdata = [];
                }

                continue;
            }

            // Comment
            if (( tagName = parts[ 2 ] )) {
                onComment(tagName);
            }
        }
        onText(html.substring(nextIndex));
        cleanUnclosedUp();
        return {
            wellFormed: wellFormed,
            maxDepth: tree.maxDepth,
            cleanHTML: tree.cleanHTML()
        };

        function onStartTag(tagName, rest, unary) {
            if (closeSelf[ tagName ] && !stack.empty() && stack.last().tagName == tagName) {
                onEndTag(tagName);
            }

            var repair = [];
            /** p > block을 해결위한 코드이지만, tree를 과다하게 크게 생성하기 때문에 제외함.
            while (!stack.empty() && tagName.toLowerCase() == 'p') {
                var last = stack.last();
                if (inline[ last.tagName ]) {
                    onEndTag(last.tagName);
                    repair.push(last);
                } else if (last.tagName.toLowerCase() == "p") {
                    onEndTag(last.tagName);
                    break;
                } else {
                    break;
                }
            }
            */
            unary = empty[ tagName ] || !!unary;
            if (!unary) {
                stack.push({
                    tagName: tagName,
                    rest: rest,
                    unary: unary
                });
                tree.openTag(1, tagName, rest, unary);
                for (var i = repair.length - 1; i >= 0; i--) {
                    onStartTag(repair[i].tagName, repair[i].rest, repair[i].unary);
                }
            } else {
                tree.unaryTag(1, tagName, rest);
            }
        }

        function onEndTag(tagName) {
            if (stack.empty()) {
                wellFormed = false;
//                console.log('stack is empty : ' + tagName);
                return;
            }

            var repair = [],
                found = -1,
                i;
            for (i = stack.length - 1; i >= 0; i--) {
                var visit = stack[i];
                if (visit.tagName == tagName) {
                    found = i;
                    break;
                } else {
                    wellFormed = false;
                    if (closeSelf[visit.tagName]) {
//                        console.log('self close by meeting closing tag : ' + tagName);
                    } else {
                        repair.push(visit);
//                        console.log('invalid : ' + tagName);
                    }
                }
            }
            if (found == -1) {
                wellFormed = false;
//                console.log('not opened tag : ' + tagName);
                return;
            }
            for (i = stack.length - 1; i >= found; i--) {
                stack.pop();
                tree.closeTag();
            }
            for (i = repair.length - 1; i >= 0; i--) {
//                console.log("wrong pair : " + tagName);
                onStartTag(repair[i].tagName, repair[i].rest, repair[i].unary);
            }
        }

        function onText(text) {
            tree.unaryTag(3, text);
        }

        function onCDATA(cdata) {
            tree.unaryTag(3, cdata);
        }

        function onComment(comment) {
            tree.unaryTag(8, comment);
        }

        function cleanUnclosedUp() {
            if (stack.length > 0) {
                wellFormed = false;

                for (var i = stack.length - 1; i >= 0; i--) {
                    if (closeSelf[ stack[ i ].tagName ]) {
//                        console.log('self close : ' + stack[i].tagName);
                    } else {
//                        console.log('not closed : ' + stack[i].tagName);
                    }
                    tree.closeTag();
                }
            }
        }
    }
})();