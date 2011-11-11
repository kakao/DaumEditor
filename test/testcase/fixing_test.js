$tx.msie &&
(function() {
    var html = [];
    module("fixing html");

    html[0] = "<blockquote><span>hello</blockquote>world";
    test(html[0], function() {
        assi.setContent(html[0]);
        assi.fix();
        equal(assi.getContent().toLocaleLowerCase(), "<blockquote><span>hello</span></blockquote><span>world</span>");
    });

    html[1] = "<SPAN>Hello<DIV></SPAN></DIV><P>!</P>";
    test(html[1], function() {
        assi.setContent(html[1]);
        assi.fix();
        equal(assi.getContent().toLocaleLowerCase(), "<span>hello<span>\r\n<div></span></div></span>\r\n<p>!</p>");
    });

    html[2] = '<P><SPAN><STRONG><SPAN></P><P>이러다 미쳐 내가</P><P>여리여리 착하던 그런 내가</P></SPAN></STRONG></SPAN>';
    test(html[2], function() {
        assi.setContent(html[2]);
        assi.fix();
        assi.fix();
        equal(assi.getContent().toLocaleLowerCase(), "<p><span><strong><span>\r\n<p>이러다 미쳐 내가</p>\r\n<p>여리여리 착하던 그런 내가</p></span></p></strong></span>");
//        equal(assi.getContent().toLocaleLowerCase(), "<p><span><strong><span>\r\n<p>이러다 미쳐 내가</p>\r\n<p>여리여리 착하던 그런 내가</p></span></strong></span></p>");
    });

    html[3] = '<P style="LINE-HEIGHT: 0.5" align=center><SPAN style="FONT-FAMILY: Verdana"><STRONG><SPAN style="FONT-FAMILY: Arial"><FONT color=#22741c><SPAN style="FONT-SIZE: 12pt">궁금하신점이 있으시면 질문을 남겨주세요^^</SPAN></FONT></STRONG></SPAN></SPAN></P>';
    false && test(html[3], function() {
        assi.setContent(html[3]);
        assi.fix();
        equal(assi.getContent().toLocaleLowerCase(), '<p style="line-height: 0.5" align=center><span style="font-family: verdana"><strong><span style="font-family: arial"><font color=#22741c><span style="font-size: 12pt">궁금하신점이 있으시면 질문을 남겨주세요^^</span></font></span></strong></span></p>');
    });

    html[4] = '<p><u>1<b>a</u>2</b></p>';
    test(html[4], function() {
        assi.setContent(html[4]);
        assi.fix();
        equal(assi.getContent().toLocaleLowerCase(), '<p><u>1<b>a</b></u><b>2</b></p>');
    });
})();