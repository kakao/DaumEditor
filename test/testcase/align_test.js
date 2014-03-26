function testAlign(alignDirection) {
    var TABLE_STYLE = {border: "1", width: 500};
    var IMG_SIZE = {width: 50, height: 50};
    var currentToolName = "align" + alignDirection;

    function alignHtmlEqual(node, templateHTML) {
        var propertyValue = (alignDirection == "full") ? "justify" : alignDirection;
        htmlEqual(node, templateHTML.replace(/#{direction}/g, propertyValue));
    }

    var tool;
    var canvas;
    module("align > " + alignDirection, {
        setup: function() {
            tool = assi.getTool(currentToolName);
            tool.imageAlignMode = false;
            canvas = assi.canvas;
        }
    });

    test("P를 " + alignDirection, function() {
        var p = ax.p("Hello");
        assi.setContentElement(p);
        assi.selectNodeContents(p);
        assi.assertToolExecution(currentToolName, null, function() {
            equal($tx.getStyle(p, "textAlign"), tool.constructor.__TextModeProps.paragraph.style.textAlign);
        });
    });

    test("P에 table이 포함된 경우에 " + alignDirection, function() {
        var p = ax.p("hi", assi.getHTML(ax.table(TABLE_STYLE, ax.tr(ax.td("table")))));
        assi.setContentElement(p);
        assi.selectNodeContents(p);
        assi.assertToolExecution(currentToolName, null, function() {
            equal(p.style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            var table = assi.$$('p table');
            if (table.length) {
                equal(table[0].getAttribute("align"), tool.constructor.__TextModeProps.paragraph.style.textAlign);
            } else {
                ok(true, '랜더링이 되면 p 태그 내부에 table이 존재하지 않음.')
            }

        });
    });

    test("P에 button이 포함된 경우에" + alignDirection, function() {
        var p = ax.p('<button><blockquote>block</blockquote></button> text');
        assi.setContentElement(p);
        var button = assi.byTag("button");
        if ($tx.msie) {
            var range = assi.createControlRangeFrom(button);
            range.select();
        } else {
            assi.selectForNodes(p, 0, p, 1);
        }
        assi.assertToolExecution(currentToolName, null, function() {
            equal(p.style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            equal(button.style.cssText, "");
            equal($tx.getStyle(assi.byTag("blockquote"), "margin").replace(/0px|0pt/g, "0"), tool.constructor.__TextModeProps.button.style.margin);
        });
    });

    test("IMG를 " + alignDirection, function() {
        var img = ax.img(IMG_SIZE);
        var p = ax.p(img);
        assi.setContentElement(p);
        if ($tx.msie) {
            var range = assi.createControlRangeFrom(img);
            range.select();
        } else {
            assi.selectNodeContents(p);
        }
        tool.imageAlignMode = true;
        assi.assertToolExecution(currentToolName, null, function() {
            if (tool.constructor.__ImageModeProps.paragraph) {
                equal($tx.getStyle(p, "textAlign"), tool.constructor.__ImageModeProps.paragraph.style.textAlign);
            } else {
                equal(p.style.cssText, "");
            }
            equal($tx.getStyle(img, "clear"), tool.constructor.__ImageModeProps.image.style.clear);
            equal($tx.getStyle(img, "float"), tool.constructor.__ImageModeProps.image.style.float);
            equal(img.style.marginLeft, tool.constructor.__ImageModeProps.image.style.marginLeft);
            equal(img.style.marginRight, tool.constructor.__ImageModeProps.image.style.marginRight);
            tool.imageAlignMode = false;
        });
    });

    test("text,p,h1,align이 속성으로 지정된 p가 각각 들어있는 td를 선택하여" + alignDirection + "정렬", function() {
        var table = ax.table(TABLE_STYLE, ax.tr(ax.td(ax.p("Hello")), ax.td("World"), ax.td(ax.h1("!!")), ax.td(ax.p({align: "right"}, "no attribute!"))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        var cell3 = assi.byTag("td", 2);
        var cell4 = assi.byTag("td", 3);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2, cell3, cell4];
        };

        assi.assertToolExecution(currentToolName, null, function() {
            alignHtmlEqual(cell1, '<p style="text-align:#{direction}">Hello</p>');
            alignHtmlEqual(cell2, '<p style="text-align:#{direction}">World</p>');
            alignHtmlEqual(cell3, '<h1 style="text-align:#{direction}">!!</h1>');
            alignHtmlEqual(cell4, '<p style="text-align:#{direction}">no attribute!</p>');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

    test("list가 들어있는 td 두 개를 선택하여 " + alignDirection + " 정렬", function() {
        var table = ax.table(TABLE_STYLE, ax.tr(ax.td(ax.ol(ax.li("Hello"), ax.li("World"))), ax.td(ax.ul(ax.li("Hello2"))), ax.td(ax.p("!!"))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution(currentToolName, null, function() {
            alignHtmlEqual(cell1, '<ol><li style="text-align:#{direction}">Hello</li><li style="text-align:#{direction}">World</li></ol>');
            alignHtmlEqual(cell2, '<ul><li style="text-align:#{direction}">Hello2</li></ul>');
            alignHtmlEqual(assi.byTag("td", 2), '<p>!!</p>');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

    test("img가 들어있는 td를 선택하여 " + alignDirection + " 정렬", function() {
        var table = ax.table(TABLE_STYLE, ax.tr(ax.td(ax.img(IMG_SIZE), "Hello"), ax.td(ax.img(IMG_SIZE)), ax.td(ax.p("!!"))));
        assi.setContent(assi.getHTML(table));

        var originalGetTdArr = assi.processor.table.getTdArr;
        var cell1 = assi.byTag("td", 0);
        var cell2 = assi.byTag("td", 1);
        assi.processor.table.getTdArr = function() {
            return [cell1, cell2];
        };

        assi.assertToolExecution(currentToolName, null, function() {
            var imgSize = ' height="50" width="50"';
            alignHtmlEqual(cell1, '<p style="text-align:#{direction}"><img' + imgSize + '>Hello</p>');
            alignHtmlEqual(cell2, '<p style="text-align:#{direction}"><img' + imgSize + '></p>');
            assi.processor.table.getTdArr = originalGetTdArr;
        });
    });

    test("imageAlignMode에서 " + currentToolName + " 정렬 버튼 눌린 상태", function() {
        var imageStyle = Object.extend(tool.constructor.__ImageModeProps.image, IMG_SIZE);
        var img = ax.img(imageStyle);

        var paragraphStyle = tool.constructor.__ImageModeProps.paragraph || {};
        var p = ax.p(paragraphStyle, img, "Hello");
        
        assi.setContentElement(p);
        if ($tx.msie) {
            var range = assi.createControlRangeFrom(assi.byTag("img"));
            range.select();
        } else {
            assi.selectForNodes(p, 0, p, 1);
        }
        canvas.fireElements(img);

        canvas.fireJobs(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, assi.createGoogRange());
        expect(2);
        equal(tool.button.currentState(), "pushed");
        equal(tool.button.elIcon.title, TXMSG("@align.image.align." + alignDirection));
    });

    test("텍스트모드 모드일 때 " + currentToolName + " 정렬 버튼 눌린 상태", function() {
        var paragraphStyle = tool.constructor.__TextModeProps.paragraph || {};
        var p = ax.p(paragraphStyle, "Hello");

        assi.setContentElement(p);
        assi.selectNodeContents(p);
        canvas.fireElements(assi.doc.body);

        canvas.fireJobs(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, assi.createGoogRange());
        expect(2);
        equal(tool.button.currentState(), "pushed");
        equal(tool.button.elIcon.title, TXMSG("@align.text.align." + alignDirection));
    });

    test("인용구 포함 " + currentToolName + " 정렬", function() {
        var html = '<p>1</p><p>2</p><blockquote class="tx-quote1"><p>quote</p></blockquote><p>3</p><p>4</p>';
        assi.setContent(html);

        var plist = assi.$$('p');
        assi.selectForNodes(plist[0].firstChild, 0, plist[plist.length-1].firstChild, 1);
        assi.assertToolExecution(currentToolName, null, function() {
            equal(plist[0].style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            equal(plist[1].style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            equal(assi.$$('blockquote')[0].style.cssText, "");
            equal(plist[2].style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            equal(plist[3].style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
            equal(plist[4].style.textAlign, tool.constructor.__TextModeProps.paragraph.style.textAlign);
        });
    });

    test("P로 감싸지지 않은 테이블 포함 " + currentToolName + " 정렬", function() {
        var html = '<p>123</p>'
            + '<table class="txc-table" width="200" border="1" cellspacing="3" cellpadding="5"><tbody><tr>'
                + '<td><p>1</p></td>'
                + '<td><p>2</p></td>'
            + '</tr>'
            + '<tr><td><p>3</p></td>'
                + '<td><p>4</p></td>'
            + '</tr>'
            + '</tbody></table>'
            + '<p>123</p>';

        assi.setContent(html);

        var plist = assi.$$('p');
        assi.selectForNodes(plist[0].firstChild, 1, plist[plist.length-1].firstChild, 2);

        assi.assertToolExecution(currentToolName, null, function() {
            var CURRENT_ALIGN = tool.constructor.__TextModeProps.paragraph.style.textAlign;
            equal(plist[0].style.textAlign, CURRENT_ALIGN);
            equal(assi.$$('table')[0].style.cssText, "");
            equal(assi.$$('tr')[0].style.cssText, "");
            equal(assi.$$('td')[0].style.textAlign, CURRENT_ALIGN);
            equal(assi.$$('td')[1].style.textAlign, CURRENT_ALIGN);
            equal(assi.$$('td')[2].style.textAlign, CURRENT_ALIGN);
            equal(assi.$$('td')[3].style.textAlign, CURRENT_ALIGN);
            equal(plist[1].style.cssText, "");
            equal(plist[2].style.cssText, "");
            equal(plist[3].style.cssText, "");
            equal(plist[4].style.cssText, "");
            equal(plist[5].style.textAlign, CURRENT_ALIGN);
        });
    });

    test("P로 감싸진 테이블 포함 " + currentToolName + " 정렬", function() {
        var html = '<p>123</p>'
            + '<p><table class="txc-table" width="200" border="1" cellspacing="3" cellpadding="5"><tbody><tr>'
            + '<td><p>1</p></td>'
            + '<td><p>2</p></td>'
            + '</tr>'
            + '<tr><td><p>3</p></td>'
            + '<td><p>4</p></td>'
            + '</tr>'
            + '</tbody></table></p>'
            + '<p>123</p>';

        assi.setContent(html);

        var plist = assi.$$('p');
        assi.selectForNodes(plist[0].firstChild, 1, plist[plist.length-1].firstChild, 2);

        assi.assertToolExecution(currentToolName, null, function() {
            var CURRENT_ALIGN = tool.constructor.__TextModeProps.paragraph.style.textAlign;
            equal(plist[0].style.textAlign, CURRENT_ALIGN);
            equal(assi.$$('table')[0].style.cssText, "");
            equal(assi.$$('tr')[0].style.cssText, "");
            if($tx.msie_quirks) {
                equal(assi.$$('td')[0].style.cssText, "");
                equal(assi.$$('td')[1].style.cssText, "");
                equal(assi.$$('td')[2].style.cssText, "");
                equal(assi.$$('td')[3].style.cssText, "");
            } else {
                equal(assi.$$('td')[0].style.textAlign, CURRENT_ALIGN);
                equal(assi.$$('td')[1].style.textAlign, CURRENT_ALIGN);
                equal(assi.$$('td')[2].style.textAlign, CURRENT_ALIGN);
                equal(assi.$$('td')[3].style.textAlign, CURRENT_ALIGN);
            }
            equal(plist[1].style.textAlign, CURRENT_ALIGN);
            equal(plist[2].style.cssText, "");
            equal(plist[3].style.cssText, "");
            equal(plist[4].style.cssText, "");
            equal(plist[5].style.cssText, "");
            equal(plist[6].style.textAlign, CURRENT_ALIGN);
        });
    });
}
testAlign("center");
testAlign("left");
testAlign("right");
testAlign("full");