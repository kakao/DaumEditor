(function() {
    var mediaFilter, mediaEmbeder;

    var SOURCE_SAMPLE_FROM_TVPOT = "<object type='application/x-shockwave-flash' id='DaumVodPlayer_vdf9dTg64ysywv2u1TuwBg2' width='640px' height='360px' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,3,0,0'><param name='movie' value='http://videofarm.daum.net/controller/player/VodPlayer.swf' /><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='bgcolor' value='#000000' /><param name='wmode' value='window' /><param name='flashvars' value='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined' /><embed src='http://videofarm.daum.net/controller/player/VodPlayer.swf' width='640px' height='360px' allowScriptAccess='always' type='application/x-shockwave-flash' allowFullScreen='true' bgcolor='#000000' flashvars='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined'></embed></object>",
        SOURCE_SAMPLE_FROM_ROADVIEW = '<object type="application/x-shockwave-flash" name="flashTarget" data="http://dmaps.daum.net/apis/roadview2.0/RoadviewLite_233.swf" width="500" height="350" id="flashTarget" style="visibility: visible; "><param name="classid" value="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="http://dmaps.daum.net/apis/roadview2.0/RoadviewLite_233.swf"><param name="allowScriptAccess" value="always"><param name="wmode" value="opaque"><param name="bgcolor" value="#000000"><param name="flashvars" value="serviceName=roadviewLite&serviceNameSub=local&useType=dragon&showToolBar=true&bShowStoreviewRoadviewToggleButton=true&bRotateToolbar=true&caption=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC%EC%8B%9C%20%EC%95%84%EB%9D%BC%EB%8F%99&width=500&height=350&pan=0&tilt=0&panoX=388387&panoY=-7918&panoId=$panoId&zoom=0&storeId="></object>',
        SOURCE_SAMPLE_FROM_MGOON = "<object id='V4510908' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'  width='500' height='375' align='middle'><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='movie' value='http://play.mgoon.com/Video/V4510908' /><param name='quality' value='high' /><param name='bgcolor' value='#000000' /><embed src='http://play.mgoon.com/Video/V4510908' quality='high' bgcolor='#000000' width='500' height='375' name='mgoonPlayer' align='middle' allowScriptAccess='always' allowFullScreen='true' type='application/x-shockwave-flash' /></object>";

    var SOURCE_SAMPLE_BADCASE_MGOON = "<object id='V4510908' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'  width='500' height='375' align='middle'><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='movie' value='http://play.mgoon.com/Video/V4510908' /><param name='quality' value='high' /><param name='bgcolor' value='#000000' /><embed src='http://play.mgoon.com/Video/V4510908' quality='high' bgcolor='#000000' width='500' height='375' name='mgoonPlayer' align='middle' allowScriptAccess='always' allowFullScreen='true' type='application/x-shockwave-flash' /></object>";

    module("embeder", {
        setup: function() {
            var editor = Editor,
                toolbar = Editor.getToolbar(),
                sidebar = Editor.getSidebar(),
                canvas = Editor.getCanvas(),
                config = Editor.getConfig();

            mediaFilter = editor.getDocParser().getFilter('filter/embeder/media');
            mediaEmbeder = editor.getSidebar().getEmbeder('media');
        }
    });

    test("get media filter instance", function() {
        ok(mediaFilter);
    });

    test("get media embeder instance", function() {
        ok(mediaEmbeder);
    });

    test("embed media by html source", function() {
        assi.setContent('');

        var data = {
            code: SOURCE_SAMPLE_FROM_TVPOT
        };
        mediaEmbeder.embedHandler(data);

//        var expectCanvasContent = "<p><img src=\"//i1.daumcdn.net/icon/editor/spacer2.gif?v=2\" width=\"640\" height=\"360\" border=\"0\" class=\"tx-entry-embed txc-media\" ld=\"%3Cobject%20type%3D'application%2Fx-shockwave-flash'%20id%3D'DaumVodPlayer_vdf9dTg64ysywv2u1TuwBg2'%20width%3D'640px'%20height%3D'360px'%20align%3D'middle'%20classid%3D'clsid%3Ad27cdb6e-ae6d-11cf-96b8-444553540000'%20codebase%3D'http%3A%2F%2Ffpdownload.macromedia.com%2Fpub%2Fshockwave%2Fcabs%2Fflash%2Fswflash.cab%23version%3D10%2C3%2C0%2C0'%3E%3Cparam%20name%3D'movie'%20value%3D'http%3A%2F%2Fvideofarm.daum.net%2Fcontroller%2Fplayer%2FVodPlayer.swf'%20%2F%3E%3Cparam%20name%3D'allowScriptAccess'%20value%3D'always'%20%2F%3E%3Cparam%20name%3D'allowFullScreen'%20value%3D'true'%20%2F%3E%3Cparam%20name%3D'bgcolor'%20value%3D'%23000000'%20%2F%3E%3Cparam%20name%3D'wmode'%20value%3D'window'%20%2F%3E%3Cparam%20name%3D'flashvars'%20value%3D'vid%3Dvdf9dTg64ysywv2u1TuwBg2%26playLoc%3Dundefined'%20%2F%3E%3Cembed%20src%3D%22http%3A%2F%2Fvideofarm.daum.net%2Fcontroller%2Fplayer%2FVodPlayer.swf%22%20width%3D%22640px%22%20height%3D%22360px%22%20allowscriptaccess%3D%22always%22%20type%3D%22application%2Fx-shockwave-flash%22%20allowfullscreen%3D%22true%22%20bgcolor%3D%22%23000000%22%20flashvars%3D%22vid%3Dvdf9dTg64ysywv2u1TuwBg2%26playLoc%3Dundefined%22%3E%3C%2Fembed%3E%3C%2Fobject%3E\"></p>";
//        var resultCanvasContent = assi.getContent();
//        equal(resultCanvasContent, expectCanvasContent);

        var expectContent = "<p><object type='application/x-shockwave-flash' id='DaumVodPlayer_vdf9dTg64ysywv2u1TuwBg2' width=\"640\" height=\"360\" align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,3,0,0'><param name='movie' value='http://videofarm.daum.net/controller/player/VodPlayer.swf' /><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='bgcolor' value='#000000' /><param name='wmode' value='window' /><param name='flashvars' value='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined' /><embed src=\"http://videofarm.daum.net/controller/player/VodPlayer.swf\" width=\"640\" height=\"360\" allowscriptaccess=\"always\" type=\"application/x-shockwave-flash\" allowfullscreen=\"true\" bgcolor=\"#000000\" flashvars=\"vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined\"></embed></object></p>";
        var resultContent = Editor.getContent().replace(/<p><br><\/p>/g, '');
        equal(resultContent, expectContent);
    });

    test("valid embed source - daum.net tvpot", function() {
        assi.setContent(SOURCE_SAMPLE_FROM_TVPOT);
        equal(assi.getContent(), Editor.getContent());
    });

    test("valid embed source - daum.net roadview", function() {
        assi.setContent(SOURCE_SAMPLE_FROM_ROADVIEW);
        equal(assi.getContent(), Editor.getContent());
    });

    test("valid embed source - mgoon", function() {
        var config = Editor.getConfig();
        if (config.sidebar.embeder.media.allowNetworkingFilter == true ){
            var source = '<object id="V4510908" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="500" height="375" align="middle"><param name="allowScriptAccess" value="always"><param name="allowFullScreen" value="true"><param name="movie" value="http://play.mgoon.com/Video/V4510908"><param name="quality" value="high"><param name="bgcolor" value="#000000"><embed src="http://play.mgoon.com/Video/V4510908" quality="high" bgcolor="#000000" width="500" height="375" name="mgoonPlayer" align="middle" allowscriptaccess="always" allowfullscreen="true" type="application/x-shockwave-flash"></object>';
            var result = '<object id="V4510908" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="500" height="375" align="middle"><param name="allowNetworking" value="internal" /><param name="allowScriptAccess" value="always"><param name="allowFullScreen" value="true"><param name="movie" value="http://play.mgoon.com/Video/V4510908"><param name="quality" value="high"><param name="bgcolor" value="#000000"><embed src="http://play.mgoon.com/Video/V4510908" quality="high" bgcolor="#000000" width="500" height="375" name="mgoonPlayer" align="middle" allowscriptaccess="always" allowfullscreen="true" type="application/x-shockwave-flash"></object>';
            assi.setContent(SOURCE_SAMPLE_BADCASE_MGOON);
            equal(source, assi.getContent());
            equal(result, Editor.getContent());
        } else {
            assi.setContent(SOURCE_SAMPLE_FROM_MGOON);
            equal(assi.getContent(), Editor.getContent());
        }

    });

})();