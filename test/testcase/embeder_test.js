(function() {
    var mediaFilter, mediaEmbeder;

    function testEmbedObjectByCode(title, objectHtml, compareCallback) {
        asyncTest("embed media " + title + " by html source", function() {
            assi.setContent('');
            mediaEmbeder.embedHandler({
                code: objectHtml
            });
            setTimeout(function(){
                QUnit.start();
                compareCallback(objectHtml);
            }, 30)
        });
    }

    function testEmbedObjectByUrl(title, url, compareCallback) {
        asyncTest("embed media " + title + " by html source", function() {
            assi.setContent('');
            mediaEmbeder.embedHandler({
                url: url
            });
            setTimeout(function(){
                QUnit.start();
                compareCallback(url);
            }, 30)
        });
    }

    function getNodeAttribute(selector, key) {
        var obj = assi.$$(selector);
        if (obj.length != 1) {
            return null;
        }
        return obj[0].getAttribute(key);
    }

    function getParamValue(key) {
        var obj = assi.$$('param[name="' + key + '"]');
        if (obj.length != 1) {
            return null;
        }
        return obj.value;
    }


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


    /**
     * embed, object소스 입력
     *  - swf
     *  - mov
     *  - mp3
     *  - img
     *
     * 멀티미디어 링크
     *  - tvpot
     *  - ...
     *  - youtube
     *
     * 모드 컨버팅시 변경되는 마크업
     *
     *  - 로드
     *  - 저장
     *  - src > wysiwyg
     *  - src > text
     *  - wysiwyg > src
     *  - wysiwyg > text
     *  - text > src
     *  - text > wysiwyg
     */

    test("get media instance", function() {
        ok(mediaFilter);
        ok(mediaEmbeder);
    });

    [
        ['tvpot', "<object type='application/x-shockwave-flash' id='DaumVodPlayer_vdf9dTg64ysywv2u1TuwBg2' width='640px' height='360px' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,3,0,0'><param name='movie' value='http://videofarm.daum.net/controller/player/VodPlayer.swf' /><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='bgcolor' value='#000000' /><param name='wmode' value='window' /><param name='flashvars' value='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined' /><embed src='http://videofarm.daum.net/controller/player/VodPlayer.swf' width='640px' height='360px' allowScriptAccess='always' type='application/x-shockwave-flash' allowFullScreen='true' bgcolor='#000000' flashvars='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined'></embed></object>"],
        ['roadview', '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" name="daumFlashTarget" width="500" height="350" id="daumFlashTarget" style="visibility: visible;"><param name="classid" value="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie"  value="http://dmaps.daum.net/apis/roadview2.0/RoadViewLite.swf?v=1395814218967"><param name="src" value="http://dmaps.daum.net/apis/roadview2.0/RoadViewLite.swf?v=1395814218967"><param name="allowScriptAccess" value="always"><param name="wmode" value="opaque"><param name="bgcolor" value="#000000"><param name="flashvars" value="serviceName=roadviewLite&bShowRedirectionButton=false&disableSmartJump=false&caption=%EC%84%9C%EC%9A%B8%20%EC%9A%A9%EC%82%B0%EA%B5%AC%20%ED%95%9C%EB%82%A8%EB%8F%99&width=500&height=350&pan=30&tilt=-20&panoX=501143&panoY=1121497&panoId=1028792152&zoom=0&storeId="><embed src="http://dmaps.daum.net/apis/roadview2.0/RoadViewLite.swf?v=1395814218967" loop="false" menu="false" quality="best" bgcolor="#000000" width="500" height="350" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="serviceName=roadviewLite&bShowRedirectionButton=false&disableSmartJump=false&caption=%EC%84%9C%EC%9A%B8%20%EC%9A%A9%EC%82%B0%EA%B5%AC%20%ED%95%9C%EB%82%A8%EB%8F%99&width=500&height=350&pan=30&tilt=-20&panoX=501143&panoY=1121497&panoId=1028792152&zoom=0&storeId=" wmode="opaque" ></embed></object>'],
        ['pandora', '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="480" height="360" id="movie" align="middle">	<param name="quality" value="high" />	<param name="movie" value="http://flvr.pandora.tv/flv2pan/flvmovie.dll/userid=beaps333&amp;prgid=50204581&amp;skin=1&amp;share=on&countryChk=ko" />	<param name="allowScriptAccess" value="always" />	<param name="allowFullScreen" value="true" />	<param name="wmode" value="transparent" />	<embed src="http://flvr.pandora.tv/flv2pan/flvmovie.dll/userid=beaps333&amp;prgid=50204581&amp;skin=1&amp;share=on&countryChk=ko" type="application/x-shockwave-flash" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" pluginspage="http://www.macromedia.com/go/getflashplayer" width="480" height="360" /></embed></object>']
    ].each(function(item){
            testEmbedObjectByCode(item[0],
                item[1],
                function compareCallback(url) {
                    if ($tx.msie) {
                        var embed = assi.$$('embed');
                        ok(embed, 'IE는 embed 태그로 변환되어 보여진다');
                    } else {
                        var img = assi.$$('img');
                        if (img.length) {
                            ok(img[0].className.indexOf('txc-media') !== -1, '기본 변형 이미지로 추가되어야 한다');

                            var ldAttr = img[0].getAttribute('ld');
                            ok(ldAttr, 'ld속성이 존재해야 한다');
                            ok(ldAttr.length, 'ld속성에 태그정보가 존재해야 한다');
                        }
                    }
                });
            });

    testEmbedObjectByUrl('normal swf',
        'http://mfiles.naver.net/ed78f14a506667d7f61a764e7790ee9531639218/20120719_200_blogfile/dj_phila_1342699262798_f5bwQ9_swf/%5Bmix%5D%5BJTBC%5D+%BD%C5%C8%AD%B9%E6%BC%DB.E18.120714.HDTV.H264.450p-AKK.swf',
        function compareCallback(url) {
            if ($tx.msie) {
                ok(assi.$$('embed')[0].src, url, 'embed 경로확인');
            } else {
                ok(assi.$$('img')[0].className.indexOf('txc-entry-embed'), 'txc-entry-embed class 를 포함하는 img태그로 필터링되어 보여져야 한다');
            }
        });

    testEmbedObjectByUrl('img url',
        'http://icon.daumcdn.net/w/icon/1312/19/152729032.png',
        function compareCallback(url) {
            equal(assi.$$('img')[0].src, url);
        });


    testEmbedObjectByUrl('tvpot url',
        'http://tvpot.daum.net/v/vbb55CznNImnvxxUvaxa221',
        function compareCallback(url) {
            var playerUrl = 'http://videofarm.daum.net/controller/video/viewer/Video.html?play_loc=undefined&vid=vbb55CznNImnvxxUvaxa221';
            if ($tx.msie) {
                if ($tx.msie_ver < 10) {
                    ok(assi.$$('embed')[0], 'IE10 이하는 object(embed)로 iframe을 변형한다');
                } else {
                    equal(assi.$$('iframe')[0].src, playerUrl, '페이지 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
                }
            } else {
                equal(assi.$$('iframe')[0].src, playerUrl, '페이지 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
            }

        });

    testEmbedObjectByUrl('youtube url',
        'http://www.youtube.com/watch?v=onOZ5IFYrV0',
        function compareCallback(url) {
            var playerUrl = 'http://www.youtube.com/embed/onOZ5IFYrV0';
            if ($tx.msie) {
                if ($tx.msie_ver < 10) {
                    ok(assi.$$('embed')[0], 'IE10 이하는 object(embed)로 iframe을 변형한다');
                } else {
                    equal(assi.$$('iframe')[0].src, playerUrl, '페이지 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
                }
            } else {
                equal(assi.$$('iframe')[0].src, playerUrl, '페이지 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
            }

        });

    testEmbedObjectByUrl('youtube url',
        'http://youtu.be/onOZ5IFYrV0',
        function compareCallback(url) {
            var playerUrl = 'http://www.youtube.com/embed/onOZ5IFYrV0';
            if ($tx.msie) {
                if ($tx.msie_ver < 10) {
                    ok(assi.$$('embed')[0], 'IE10 이하는 object(embed)로 iframe을 변형한다');
                } else {
                    equal(assi.$$('iframe')[0].src, playerUrl, '단축 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
                }
            } else {
                equal(assi.$$('iframe')[0].src, playerUrl, '단축 url로 추가하면 player iframe으로 경로를 바꿔 삽입한다');
            }
        });

    test("valid embed source - daum.net tvpot #1", function() {
        var html = "<object type='application/x-shockwave-flash' id='DaumVodPlayer_vdf9dTg64ysywv2u1TuwBg2' width='640px' height='360px' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,3,0,0'><param name='movie' value='http://videofarm.daum.net/controller/player/VodPlayer.swf' /><param name='allowScriptAccess' value='always' /><param name='allowFullScreen' value='true' /><param name='bgcolor' value='#000000' /><param name='wmode' value='window' /><param name='flashvars' value='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined' /><embed src='http://videofarm.daum.net/controller/player/VodPlayer.swf' width='640px' height='360px' allowScriptAccess='always' type='application/x-shockwave-flash' allowFullScreen='true' bgcolor='#000000' flashvars='vid=vdf9dTg64ysywv2u1TuwBg2&playLoc=undefined'></embed></object>";
        assi.setContent(html);
        equal(assi.getContent(), Editor.getContent());
    });

    test("valid embed source - daum.net roadview #1", function() {
        var roadviewSample = '<object type="application/x-shockwave-flash" name="flashTarget" data="http://dmaps.daum.net/apis/roadview2.0/RoadviewLite_233.swf" width="500" height="350" id="flashTarget" style="visibility: visible; "><param name="classid" value="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="http://dmaps.daum.net/apis/roadview2.0/RoadviewLite_233.swf"><param name="allowScriptAccess" value="always"><param name="wmode" value="opaque"><param name="bgcolor" value="#000000"><param name="flashvars" value="serviceName=roadviewLite&serviceNameSub=local&useType=dragon&showToolBar=true&bShowStoreviewRoadviewToggleButton=true&bRotateToolbar=true&caption=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC%EC%8B%9C%20%EC%95%84%EB%9D%BC%EB%8F%99&width=500&height=350&pan=0&tilt=0&panoX=388387&panoY=-7918&panoId=$panoId&zoom=0&storeId="></object>';
        assi.setContent(roadviewSample);
        var obj = assi.$$('object')[0];
        equal(assi.getContent(), Editor.getContent());
    });


})();