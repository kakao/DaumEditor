/**
 * Created by sungwon on 14. 4. 25.
 */
asyncTest("li > p > #text #text중간에서 enter key", function() {
    var p = ax.p("Hello");
    var ol = ax.ol(ax.li(p));
    assi.setContentElement(ol);
    assi.selectForNodes(p.firstChild, 1, p.firstChild, 1);
    assi.doc.body.focus();
    //assi.pressEnter();
    robot.type('\n', false, function() {
        equal(assi.getBodyHTML(), '<ol><li><p>H</p></li><li><p>ello</p></li></ol>');
        QUnit.start();
    });
});

asyncTest("table 삭제", function() {
    Editor.modify({
        content: '<table id="test" border="1">\
<tbody>\
<tr>\
<td rowspan="1" colspan="1">1</td>\
<td rowspan="1" colspan="1">2</td>\
<td rowspan="1" colspan="1">3</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">4</td>\
<td rowspan="1" colspan="1">5</td>\
<td rowspan="1" colspan="1">6</td>\
</tr>\
<tr>\
<td rowspan="1" colspan="1">7</td>\
<td rowspan="1" colspan="1">8</td>\
<td rowspan="1" colspan="1">9</td>\
</tr>\
</tbody>\
</table><p><br></p>'
    });
    var p = assi.byTag('p');
    assi.selectForNodes(p.firstChild, 0, p.firstChild, 0);
    assi.doc.body.focus();
    //assi.pressEnter();
    robot.type('\b', false, function() {
        equal(assi.getBodyHTML(), '<p><br></p>');
        QUnit.start();
    });
});