/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */
(function() {
    // Regular Expressions for parsing tags and attributes
    var startTag = /^<([A-Za-z][-A-Za-z0-9_]*)((?:\s+(?:\/(?!>)|[^>\s=])+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*?)\s*(\/?)>/m,
        endTag = /^<\/([A-Za-z][-A-Za-z0-9_]*)[^>]*>/m,
        attrPattern = /((?:\/(?!>)|[^>\s=])+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/mg;

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
    var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // Special Elements (can contain anything)
    var special = makeMap("script,style,textarea");

    var trivial = makeMap("span,font");

    var mustHaveText = makeMap("span,font,strong,p");

    this.HTMLParserResig = function(html) {
        var fragment = [];

        var index, chars, match, stack = [], last = 0;
        var wellFormed = true;
        stack.last = function() {
            return this[ this.length - 1 ];
        };
        stack.empty = function() {
            return this.length == 0;
        };
        var at = 0;

        while (at < html.length) {
            chars = true;

            // Make sure we're not in a script or style element
            if (stack.empty() || !special[ stack.last().tagName ]) {
                if (charAt(0) == '<') {
                    if (substring(1, 4) == "!--") { // Comment
                        index = indexOf("-->");

                        if (index >= 0) {
                            append(substring(0, index + 3));
                            proceed(index + 3);
                            chars = false;
                        }
                    } else if (charAt(1) == '!') {  // <!
                        index = indexOf(">", 1);
                        if (index >= 0) {
                            append(substring(0, index + 1));
                            proceed(index + 1);
                            chars = false;
                        }
                    } else if (charAt(1) == '/') { // end tag, </
                        match = matching(endTag);

                        if (match) {
                            proceed(match[0].length);
                            parseEndTag(match[1]);
                            chars = false;
                        }
                    } else { // start tag, <
                        match = matching(startTag);

                        if (match) {
                            proceed(match[0].length);
                            parseStartTag(match[1], match[2], match[3]);
                            chars = false;
                        }
                    }
                }
            } else {
                match = matching(new RegExp("((?:\\s|.)*?)<\/" + stack.last().tagName + "[^>]*>"));

                if (match) {
                    proceed(match[0].length);
                    append(match[1]);
                    parseEndTag(stack.last().tagName);
                    chars = false;
                }
            }

            if (chars) {
                index = indexOf("<", 1);
                if (index == -1) {
                    index = html.length - at;
                }
                var text = substring(0, index);
                proceed(index);

                append(text);
            }

            if (at == last) {
                throw "Parse Error: " + html;
            }
            last = at;
        }

        // Clean up any remaining tags
        cleanUnclosedUp();

        return {
            wellFormed: wellFormed,
            wellFormedHtml: fragment.join('')
        };

        function proceed(pos) {
            at += pos;
        }

        function append(text) {
            fragment.push(text);
        }

        function charAt(pos) {
            return html.charAt(at + pos);
        }

        function indexOf(str, pos) {
            pos = pos || 0;
            var index = html.indexOf(str, at + pos) - at;
            return index < 0 ? -1 : index;
        }

        function matching(pattern) {
            return substring(0).match(pattern);
        }

        function substring(start, end) {
            if (arguments.length == 1) {
                return html.substring(at + start);
            } else {
                return html.substring(at + start, at + end);
            }
        }

        function parseStartTag(tagName, rest, unary) {
//            var repair = [];
//            if (block[ tagName ]) {
//                while (stack.last() && inline[ stack.last().tagName ]) {
//                    console.log('inline > block');
//                    wellFormed = false;
//                    repair.push(stack.last());
//                    parseEndTag(stack.last().tagName);
//                }
//            }

            if (closeSelf[ tagName ] && !stack.empty() && stack.last().tagName == tagName) {
                if (stack.last().valid) {
                    parseEndTag(tagName);
                }
            }

            unary = empty[ tagName ] || !!unary;
            var valid = !trivial[tagName] || rest != "";

            if (!unary) {
                stack.push({
                    tagName: tagName,
                    rest: rest,
                    unary: unary,
                    valid: valid
                });
            }

            if (valid) {
                    append("<" + tagName + rest + (unary ? "/" : "") + ">");
            }

//            for (var i = repair.length - 1; i >= 0; i--) {
//                if (repair[i].valid) {
//                    parseStartTag(repair[i].tagName, repair[i].rest, repair[i].unary);
//                }
//            }
        }

        function parseEndTag(tagName) {
            if (stack.empty()) {
                wellFormed = false;
                console.log('stack is empty');
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
                        console.log('self close by meeting closing tag');
                    } else {
                        repair.push(visit);
                        console.log('invalid');
                    }
                }
            }
            if (found == -1) {
                wellFormed = false;
                console.log('not opened tag');
                return;
            }
            for (i = stack.length - 1; i >= found; i--) {
                var last = stack.pop();
                if (last.valid) {
                    append("</" + last.tagName + ">");
                }
            }
            for (i = repair.length - 1; i >= 0; i--) {
                console.log("wrong pair");
                if (repair[i].valid) {
                    parseStartTag(repair[i].tagName, repair[i].rest, repair[i].unary);
                }
            }
        }

        function cleanUnclosedUp() {
            if (stack.length > 0) {
                wellFormed = false;

                for (var i = stack.length - 1; i >= 0; i--) {
                    if (closeSelf[ stack[ i ].tagName ]) {
                        console.log('self close');
                    } else {
                        console.log('not closed');
                    }
                    if (stack[i].valid) {
                        append("</" + stack[i].tagName + ">");
                    }
                }
            }
        }
    };

    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++) {
            obj[ items[i] ] = true;
            obj[ items[i].toUpperCase() ] = true;
        }
        return obj;
    }
})();