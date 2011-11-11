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
            equal(assi.byTag("table").getAttribute("align"), tool.constructor.__TextModeProps.paragraph.style.textAlign);
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
}
testAlign("center");
testAlign("left");
testAlign("right");
testAlign("full");

