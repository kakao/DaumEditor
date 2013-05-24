Trex.register("filter > clear redundancy",
	function (editor) {
		function clearRedundancy(contents) {
			var clearHandler = function (content, style, loop) {
				var matchCount = 0;
				var matchHandler = function (all, value, text) {
					matchCount++;
					if (text.length == 0 || text.trim().length == 0) {
						return "";
					} else {
						return ['<span style="', style, ':', value, ';">', text, '</span>'].join("");
					}
				};
				var regex = new RegExp("(?:<span[^>;]*style=\"" + style + ":[^\";]*;?\"[^>;]*>){" + loop + "}<span\\s*style=['\"]?" + style + ":\\s*(\\w+)[;'\"]*>([\\S\\s]*?)<\/span>(?:<\/span>){" + loop + "}", "gi"); //#FTDUEDTR-1119
				do {
					matchCount = 0;
					content = content.replace(regex, matchHandler);
				} while (matchCount > 0);

				return content;
			};

			contents = contents.replace(/<(span|font)([^>]*)><\/\1>/gi, function (fullMatched, tagName, subMatched) {
				if (/ (?:id|class)=/i.test(subMatched)) { //NOTE: #FTDUEDTR-1041
					return fullMatched;
				}
				return "";
			});

			var styles = ['font-size', 'font-family'];
			for (var i = 0; i < styles.length; i++) {
				contents = clearHandler(contents, styles[i], 2);
				contents = clearHandler(contents, styles[i], 1);
			}
			return contents;
		}

		function removeSpacerParagraph(contents) {
			// FTDUEDTR-1319
			return $tx.msie ? contents.replace(/<p>\s*<\/p>/gi, '') : contents;
		}

		function makeSpacerParagraph(contents) {
			// FTDUEDTR-1319
			return $tx.msie ? contents.replace(/<p>\s*<\/p>/gi, $tom.EMPTY_PARAGRAPH_HTML) : contents;
		}

		var docparser = editor.getDocParser();
		docparser.registerFilter(
			'filter/redundancy', {
				'text@load': function (contents) {
					return contents;
				},
				'source@load': function (contents) {
					return removeSpacerParagraph(clearRedundancy(contents));
				},
				'html@load': function (contents) {
					return removeSpacerParagraph(clearRedundancy(contents));
				},
				'text4save': function (contents) {
					return contents;
				},
				'source4save': function (contents) {
					return makeSpacerParagraph(contents);
				},
				'html4save': function (contents) {
					return makeSpacerParagraph(contents);
				},
				'text2source': function (contents) {
					return contents;
				},
				'text2html': function (contents) {
					return contents;
				},
				'source2text': function (contents) {
					return contents;
				},
				'source2html': function (contents) { //source2wysiwyg
					return contents;
				},
				'html2text': function (contents) {
					return contents;
				},
				'html2source': function (contents) { //wysiwyg2source
					return clearRedundancy(contents);
				}
			}
		);
	}
);
