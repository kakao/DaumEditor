
Trex.register("filter > mode change", function(editor, toolbar, sidebar, canvas, config) {

    /* -> Text Convert */
    function toText(html) {
        // FTDUEDTR-1360
        var filterList = [
            [Trex.__WORD_JOINER_REGEXP, ""], // word_joiner 제거
            //모든 태그 속성제거
            [new RegExp("<(\\/?[a-z]+)[^>]*>", "gi"), "<$1>"],
            //모든 태그 줄바꿈 제거
            [new RegExp("\\n\\s*", "g"), ""],
            //head, script, style, 주석 제거
            [new RegExp("<head>.*?<\\/head>", "gi"), ""], //<head ~ <\\/head> delete
            [new RegExp("<s" + "cript>.*?<\\/s" + "cript>", "gi"), ""],
            [new RegExp("<style>.*?<\\/style>", "gi"), ""], //<style ~ <\\/style> delete
            [new RegExp("<!--.*?-->", "gi"), ""], //comment delete
            //빈 태그삭제
            [new RegExp("<span></span>", "gi"), ""], //<br>
            //기본태그삭제
            [new RegExp("^<p>&nbsp;</p>$", "gi"), ""],
            [new RegExp("^<p><br></p>$", "gi"), ""],
            //테이블 처리.
            [new RegExp("<td>(.+?)<\\/td>", "gi"), "\t$1"], //<td>
            [new RegExp("<th>(.+?)<\\/th>", "gi"), " \t$1"], //<th>
            [new RegExp("<\\/tr>", "gi"), ""], //</tr>
            [new RegExp("<tr>", "gi"), "\n"], //<tr>
            [new RegExp("<\\?tbody>", "gi"), ""], //<tbody> 14
            //개행 처리
            [new RegExp("<div>([^<]*)<\\/div>", "gi"), "\n$1"],
            [new RegExp("<p>&nbsp;</p>", "gi"), "\n"],
            [new RegExp("<p><br></p>", "gi"), "\n"],
            [new RegExp("<br>(<\\/p>)", "gi"), "$1"],
            [new RegExp("<h[1-6]>(.+?)<\\/h[1-6]>", "gi"), "\n$1\n\n"], //<h1(h6) ~ <\\/h1(h6]> 제거
            [new RegExp("(<p>(.+?)<\\/p>)", "gi"), "$1\n"], //<td>
            [new RegExp("<br>\\n", "gi"), "\n"], //<br>+개행
            [new RegExp("<br>", "gi"), "\n"], //<br>
            [new RegExp("(<ul>|<\\/ul>|<ol>|<\\/ol>|<\\/table>)", "gi"), "\n\n"], //<ul>
            //공백 처리
            [new RegExp("(<li>(.+?)<\\/li>)", "gi"), "\t$1\n"], //<li>
            //나머지 모든 태그 삭제
            [new RegExp("<div><\\/div>\n", "gi"), "~"],
            [new RegExp("<[\\/a-zA-Z!]+>", "g"), ""],
            //특수문자 치환
            [new RegExp("&nbsp;?", "g"), " "], [new RegExp("&quot;?", "g"), "\""], [new RegExp("&gt;?", "g"), '>'], [new RegExp("&lt;?", "g"), '<'], [new RegExp("&amp;?", "g"), '&'], [new RegExp("&copy;?", "g"), '(c)'], [new RegExp("&trade;?", "g"), '(tm)'], [new RegExp("&#8220;?", "g"), "\""], [new RegExp("&#8221;?", "g"), "\""], [new RegExp("&#8211;?", "g"), "_"], [new RegExp("&#8217;?", "g"), "'"], [new RegExp("&#38;?", "g"), "&"], [new RegExp("&#169;?", "g"), "(c)"], [new RegExp("&#8482;?", "g"), "(tm)"], [new RegExp("&#151;?", "g"), "--"], [new RegExp("&#039;?", "g"), "'"], [new RegExp("&#147;?", "g"), "\""], [new RegExp("&#148;?", "g"), "\""], [new RegExp("&#149;?", "g"), "*"], [new RegExp("&reg;?", "g"), "(R]"], [new RegExp("&bull;?", "g"), "*"]];


        var tmp = html;
        for (var i = 0; i < filterList.length; i++) {
            tmp = tmp.replace(filterList[i][0], filterList[i][1]);
        }
        return tmp;
    }

    function brn2n(html) {
        try {
            return html.replace(new RegExp("<br[^>]*>\\n", "gi"), "\n");
        } catch (ignore) {
        }
        return html;
    }

    function fromText(txt) {
        if (txt !== _NULL && txt.length !== 0) {
            txt = txt.replace(/&/g, "&amp;");
            txt = txt.replace(/ /g, "&nbsp;");
            txt = txt.replace(/\"/g, "&quot;");
            txt = txt.replace(/>/g, "&gt;");
            txt = txt.replace(/</g, "&lt;");
            if (txt.lastIndexOf("\n") === txt.length - 1) {
                txt = txt.substr(0, txt.length - 1);
            }
            if (txt.lastIndexOf("\r") === txt.length - 1) {
                txt = txt.substr(0, txt.length - 1);
            }
            txt = txt.replace(/\r\n|\r|\n/g, "<br>\n");
        }
        return txt;
    }
	
	// FTDUEDTR-794 : new line formatting on the source mode.
	function addNewlineToSource(html) {
		return html.replace(/<\/(p)><(p[\s>])/gi, '</$1>\n<$2');
	}
	function removeNewlineFromSource(source) {
		return source.replace(/<\/(p)>\n+<(p[\s>])/gi, '</$1><$2');
	}

    // FTDUEDTR-1387
    function removeEditorOriginDomain(content) {
        if(!($tx.msie && $tx.msie_docmode < 9))
            return content;
        if(!canvas.isWYSIWYG())
            return content;

        var wysiwygLocation = canvas.getCurrentPanel().getWindow().location,
            wysiwygLocationHost = wysiwygLocation.protocol + '//' + wysiwygLocation.host,
            wysiwygLocationHref = wysiwygLocation.href,
            editorHostPath = wysiwygLocationHref.substring(0,wysiwygLocationHref.lastIndexOf('/')+1),
            hrefRegexPattern = new RegExp("(href=[\"'])"
                + "(" + wysiwygLocationHost.getRegExp() + "[^\"']*)"
                + "([\"'])", "gi");

        return content.replace(hrefRegexPattern, function(match, p1_prefix, p2_url, p3_postfix/*, offset, string*/){
            var url = p2_url.replace(wysiwygLocationHref, '').
                    replace(editorHostPath, '').
                    replace(wysiwygLocationHost, '');
            return p1_prefix + url + p3_postfix;
        });
    }

    var _docparser = editor.getDocParser();
	_docparser.registerFilter('filter/converting', {
		'text@load': function(contents) {
			return toText(contents);
		},
		'source@load': function(contents) {
			return contents;
		},
		'html@load': function(contents) {
			return contents;
		},
		'text4save': function(contents) {
			var content;
			if (config.canvas.escapeTextModeContents) {
				content = fromText(contents);
			} else {
				content = contents;
			}
			if (config.canvas.removeTextModeBr) {
				content = brn2n(content);
			}
			return content;
		},
		'source4save': function(contents) {
			return contents;
		},
		'html4save': function(contents) {
			return removeEditorOriginDomain(contents);
		},
		'text2source': function(contents) {
			return fromText(contents);
		},
		'text2html': function(contents) {
			return fromText(contents);
		},
		'source2text': function(contents) {
			return toText(removeNewlineFromSource(contents));
		},
		'source2html': function(contents) {
			return removeNewlineFromSource(contents);
		},
		'html2text': function(contents) {
			return toText(contents);
		},
		'html2source': function(contents) {
			return removeEditorOriginDomain(addNewlineToSource(contents));
		}
	});
});



Trex.register("filter > non-breaking space", function(editor/*, toolbar, sidebar, canvas, config*/) {

    function convertNonBreakingSpaceToNoramlSpace(contents) {
        return contents.replace(/\u00A0/g, ' ');
    }

    var _docparser = editor.getDocParser();
    _docparser.registerFilter('filter/converting/nonbreakingsapce', {
        'text@load': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
        'source@load': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
        'html@load': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
        'text4save': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
        'source4save': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
        'html4save': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
//        'text2source': function(contents) {
//            return contents;
//        },
        'text2html': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
//        'source2text': function(contents) {
//            return contents;
//        },
        'source2html': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        },
//        'html2text': function(contents) {
//            return contents;
//        },
        'html2source': function(contents) {
            return convertNonBreakingSpaceToNoramlSpace(contents);
        }
    });
});
