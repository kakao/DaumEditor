(function() {
//    var htmlPartsRegex  = new RegExp('<(?:(?:\\/([^>]+)>)|(?:!--([\\S|\\s]*?)-->)|(?:([^\\s>]+)\\s*((?:(?:"[^"]*")|(?:\'[^\']*\')|[^"\'>])*)\\/?>))', 'g');
//    var htmlPartsRegex = /<(?:(?:\/([A-Za-z][-A-Za-z0-9_]*)[^>]*>)|(?:!--([\S\s]*?)-->)|(?:([A-Za-z][-A-Za-z0-9_]*)(\s*(?:(?:"[^"]*")|(?:'[^']*')|[^"'>])*)\s*(\/?)>))/g;
    var htmlPartsRegex = /<(?:(?:\/([A-Za-z][-A-Za-z0-9_]*)[^>]*>)|(?:!--([\S\s]*?)-->)|(?:([A-Za-z][-A-Za-z0-9_]*)((?:\s+(?:\/(?!>)|[^>\s=])+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*?)\s*(\/?)>))/g;
    var attribsRegex = /\s*([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;

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

    this.HTMLParser = function(html) {
        var wellFormed = true,
            parts,
            tagName,
            nextIndex = 0,
            fragment = [],
            stack = [],
            cdata;	// The collected data inside a CDATA section.
        stack.empty = function() { return this.length === 0; };
        stack.last = function() { return this[this.length - 1]; };

        while (( parts = htmlPartsRegex.exec(html) )) {
            // visit TextNode
            var tagIndex = parts.index;
            if (tagIndex > nextIndex) {
                var text = html.substring(nextIndex, tagIndex);

                if (cdata) {
                    cdata.push(text);
                } else {
                    append(text);
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
                    append(cdata.join(''));
                    cdata = null;
                }

                if (!cdata) {
                    parseEndTag(tagName);
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

                parseStartTag(tagName, parts[ 4 ], unary);

                // Open CDATA mode when finding the appropriate tags.
                if (!cdata && special[ tagName ]) {
                    cdata = [];
                }

                continue;
            }

            // Comment
            if (( tagName = parts[ 2 ] )) {
                append(["<!--", tagName, "-->"].join(""));
            }
        }
        append(html.substring(nextIndex));
        cleanUnclosedUp();
        return {
            wellFormed: wellFormed,
            wellFormedHtml: fragment.join("")
        };

        function append(text) {
            fragment.push(text);
        }

        function parseStartTag(tagName, rest, unary) {
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
    }

    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++) {
            obj[ items[i] ] = true;
            obj[ items[i].toUpperCase() ] = true;
        }
        return obj;
    }
})();