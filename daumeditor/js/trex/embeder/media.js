TrexConfig.addTool(
	"media",
	{
		wysiwygonly: _TRUE,
		sync: _FALSE,
		status: _FALSE
	}
);

TrexMessage.addMsg({
	'@media.title': "멀티미디어",
	'@media.prev.url': "#iconpath/spacer2.gif?v=2",
	'@media.prev.url.tvpot': "#iconpath/img_multi_tvpot.gif?v=2",
	'@media.prev.url.wmp': "#iconpath/spacer2.gif?v=2"
});
	
Trex.Tool.Media = Trex.Class.create({
	$const: {
		__Identity: 'media'
	},
	$extend: Trex.Tool,
	oninitialized: function() {
		var _editor = this.editor;
		this.weave.bind(this)(
			new Trex.Button(this.buttonCfg), 
			_NULL,
			function() {
				_editor.getSidebar().getEmbeder("media").execute();
			}
		);
	}
});

TrexConfig.addEmbeder(
	"media",
	{
		wysiwygonly: _TRUE,
		useCC: _FALSE,
		features: {
			left:250, 
			top:65, 
			width:458, 
			height:568,
			resizable:"yes"
		},
		popPageUrl: "#host#path/pages/trex/multimedia.html",
		allowNetworkingFilter: _FALSE,
		allowNetworkingSites: []
	},
	function(root) {
		var _config = root.sidebar.embeder.media; 
		_config.popPageUrl = TrexConfig.getUrl(_config.popPageUrl);
		_config.features = TrexConfig.getPopFeatures(_config.features);
	}
);

(function() {

	Trex.Embeder.Media = Trex.Class.create({
		$const: {
			__Identity: 'media'
		},
		$extend: Trex.Embeder,
		name: 'media',
		title: TXMSG("@media.title"),
		canResized: _TRUE,
		getCreatedHtml: function(data){
			var _source = data.code || this.makeSourceByUrl(data.url);
			return convertToHtml(_source);
		},
		getDataForEntry: function(){
			//This function is not needed anymore but absence may generate initializing error. So remained...
		},
        makeSourceByUrl: function(url) {
            var ext = this.getUrlExt(url);
            var size = getDefaultSizeByUrl(url);

            switch (ext) {
                case "swf":
                    return this.generateHTMLForFlash(url, size);
                case "mp3":
                case "wma":
                case "asf":
                case "asx":
                case "mpg":
                case "mpeg":
                case "wmv":
                case "avi":
                    return this.generateHTMLForMoviePlayer(url, size);
                case "mov":
                    return this.generateHTMLForQuicktime(url, size);
                case 'jpg':
                case 'bmp':
                case 'gif':
                case 'png':
                    return this.generateHTMLForImage(url, size);
                default:
                    var iframeHtml = this.generateHTMLIfIframeSource(url, size);
                    if (iframeHtml) {
                        return iframeHtml;
                    }

                    return this.generateHTMLForDefaultEmbed(url, size);
            }
        },
        getUrlExt: function(url) {
            return url.split(".").pop().split("?")[0].toLowerCase();
        },
        getAllowScriptAccess: function(url) {
            var allowScriptAccessAttr = " allowScriptAccess='never'";
            if (this.config.allowNetworkingFilter && isAllowNetworkingSite(url, this.config) == _FALSE) {
                allowScriptAccessAttr += " allowNetworking='internal'";
            }
            return allowScriptAccessAttr;
        },
        generateHTMLForDefaultEmbed: function (url, size) {
            return "<embed src=\"" + url + "\" width='" + size.width + "' height='" + size.height + "' " + this.getAllowScriptAccess(url) + " ></embed>";
        },
        generateHTMLForImage: function (url, size) {
            return "<img src=\"" + url + "\" border=\"0\"/>";
        },
        generateHTMLForFlash: function (url, size) {
            return "<embed src=\"" + url + "\" quality='high' " + this.getAllowScriptAccess(url) + " type='application/x-shockwave-flash' allowfullscreen='true' pluginspage='http://www.macromedia.com/go/getflashplayer' wmode='transparent' width='" + size.width + "' height='" + size.height + "'></embed>";
        },
        generateHTMLForMoviePlayer: function (url, size) {
            return "<embed src=\"" + url + "\" type=\"application/x-mplayer2\" pluginspage=\"http://www.microsoft.com/Windows/MediaPlayer/\" width='" + size.width + "' height='" + size.height + "'></embed>";
        },
        generateHTMLForQuicktime: function (url, size) {
            return "<embed src=\"" + url + "\" type=\"video/quicktime\" pluginspage=\"http://www.apple.com/quicktime/download/indext.html\" width='" + size.width + "' height='" + size.height + "'></embed>";
        },
        generateHTMLIfIframeSource: function(url, size) {
            var tvpotKey = getTvPotKey(url);
            if (tvpotKey) {
                return "<iframe src=\"http://videofarm.daum.net/controller/video/viewer/Video.html?play_loc=undefined&vid=" + tvpotKey + "\" width='"+size.width+"' height='"+size.height+"' frameborder=\"0\" allowfullscreen></iframe>";
            }

            var youtubeMovieKey = getYouTubeMovieKey(url);
            if (youtubeMovieKey) {
                return "<iframe src=\"http://www.youtube.com/embed/" + youtubeMovieKey + "\" width='"+size.width+"' height='"+size.height+"' frameborder=\"0\" allowfullscreen></iframe>";
            }

            return _NULL;
        }
	});
	
	Trex.register("filter > media ", function(editor, toolbar, sidebar){
		var _config = sidebar.embeders.media.config;
		editor.getDocParser().registerFilter('filter/embeder/media', {
			'text@load': function(contents){
				return contents;
			},
			'source@load': function(contents){
				return convertToHtml(contents);
			},
			'html@load': function(contents){
				return convertToHtml(contents);
			},
			'text4save': function(contents){
				return contents;
			},
			'source4save': function(contents){
				contents = convertFromHtml(contents);
				contents = addFlashOptAllowNetworking(contents, _config);
				return contents;
			},
			'html4save': function(contents){
				contents = convertFromHtml(contents);
				contents = addFlashOptAllowNetworking(contents, _config);
				return contents;
			},
			'text2source': function(contents){
				return contents;
			},
			'text2html': function(contents){
				return contents;
			},
			'source2text': function(contents){
				return contents;
			},
			'source2html': function(contents){
				return convertToHtml(contents);
			},
			'html2text': function(contents){
				return convertFromHtml(contents);
			},
			'html2source': function(contents){
				return convertFromHtml(contents);
			}
		});
	});

    function isAllowNetworkingSite(url, config) {
        var _matchs, host, i, len;
        host = "";
        _matchs = /[\/]*\/\/([^\/]+)\//i.exec(url);
        if (_matchs && _matchs[1]) {
            host = _matchs[1];
        }
        len = config.allowNetworkingSites.length;
        for (i = 0; i < len; i += 1) {
            if (host == config.allowNetworkingSites[i].host) {
                return _TRUE;
            }
        }
        return _FALSE;
    }
	
	function addFlashOptAllowNetworking (content, config) {
		var filteredContent;
		if (config.allowNetworkingFilter == _FALSE) {
			return content;
		}
		filteredContent = content.replace(/(<object[^>]*>)((?:\n|.)*?)(<\/object>)/gi, function(match, start, param, end) {
			var _matchs, _matchsForUrl;
            var isBlockContent = _FALSE;
            _matchs = /data[\s]*=[\s"']*(http:\/\/[^\/]+\/)[^("'\s)]+/i.exec(start);
            if(_matchs && _matchs.length == 2) {
                _matchsForUrl = _matchs[1];
                if (isAllowNetworkingSite(_matchsForUrl, config) === _FALSE){
                    isBlockContent = _TRUE;
                }
            }
            _matchs = /<param[^>]*=[^\w]*movie[^\w]+[^>]*>/i.exec(param);
            if (_matchs && _matchs[0]) {
                _matchsForUrl = /\s+value=["']?([^\s"']*)["']?/i.exec(_matchs[0]);
                if (_matchsForUrl && _matchsForUrl[1]) {
                    if (isAllowNetworkingSite(_matchsForUrl[1], config) === _FALSE) {
                        isBlockContent = _TRUE;
                    }
                }
            }
            _matchs = /<param[^>]*=[^\w]*src[^\w]+[^>]*>/i.exec(param);
            if (_matchs && _matchs[0]) {
                _matchsForUrl = /\s+value=["']?([^\s"']*)["']?/i.exec(_matchs[0]);
                if (_matchsForUrl && _matchsForUrl[1]) {
                    if (isAllowNetworkingSite(_matchsForUrl[1], config) === _FALSE) {
                        isBlockContent = _TRUE;
                    }
				}
			}
            if (isBlockContent === _TRUE) {
                param = param.replace(/<param[^>]*=[^\w]*allowNetworking[^\w]+[^>]*>/i, "");
                param = '<param name="allowNetworking" value="internal" />'.concat(param);
            }
			return start + param + end;
		});
		filteredContent = filteredContent.replace(/(<embed)([^>]*)(><\/embed>|\/>)/gi, function(match, start, attr, end) { //NOTE: #FTDUEDTR-1071 -> #FTDUEDTR-1105
			var _matchs = /\s+src=["']?([^\s"']*)["']?/i.exec(attr);
			if (_matchs && _matchs[1]) {
				if (isAllowNetworkingSite(_matchs[1], config)) {
					return start + attr + end;
				}
			}
			attr = attr.replace(/\s+allowNetworking=["']?[\w]*["']?/i, "").concat(' allowNetworking="internal"');
			return start + attr + end;
		});
		return filteredContent;
	}
	
	function convertFromHtml(content){
		var _matchs;
		var _regLoad = new RegExp("<(?:img|IMG)[^>]*txc-media[^>]*\/?>", "gim");
		var tempContent = content;
		
		while ((_matchs = _regLoad.exec(tempContent)) != _NULL) {
			var _html = _matchs[0];
			var _source = getSourceByExt(_html);
			if (!$tx.msie && _source.indexOf("$") > -1) {
				_source = _source.replace(/\$/g, "$$$$");
			}
			content = content.replace(_html, _source);
		}
		
		return content;
	}
		
	function convertToHtml(content) {
		if ($tx.msie) { //NOTE: #FTDUEDTR-366 + #FTDUEDTR-372 -> #FTDUEDTR-403
            if ($tx.msie_ver < 10) {
                content = content.replace(/<iframe[^>]*src=("|'|)https?:\/\/www\.youtube\.com\/embed\/(\w+)\1[^>]*><\/iframe>/i, function (html, quote, vid) {
                    var matched, width, height;
                    matched = html.match(/\swidth=['"]?(\d+)/);
                    width = (matched && matched[1]) || "560";
                    matched = html.match(/\sheight=['"]?(\d+)/);
                    height = (matched && matched[1]) || "315";
                    return '<object width="' + width + '" height="' + height + '"><param name="movie" ' + 'value="https://www.youtube.com/v/' + vid + '?version=3&amp;hl=ko_KR" /><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="wmode" value="transparent" /><embed src="https://www.youtube.com/v/' + vid + '?version=3&amp;hl=ko_KR" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" allowscriptaccess="always" allowfullscreen="true" wmode="transparent"></embed></object>';
                });
            }
            if(/<object/.test(content) && /<embed[^>]*type=['"]application\/x-shockwave-flash['"][^>]*>/i.test(content) &&!/<object[^>]*type=['"]application\/x-shockwave-flash['"][^>]*>/i.test(content)) {
                var index = content.indexOf('>');
                content = content.substring(0,index)+ ' type="application\/x-shockwave-flash"' + content.substring(index);
            }
//			content = content.replace(/(<object[^>]*>)((?:\n|.)*?)(<\/object>)/gi, function(match, start, param, end) {
//				param = param.replace(/<param[^>]*=[^\w]*wmode[^\w]+[^>]*>/i, "");
//				param = param.replace(/<param[^>]*=[^\w]*play[^\w]+[^>]*>/i, "");
//				param = '<param name="wmode" value="transparent" />'.concat(param);
//				return start + param + end;
//			});
//			content = content.replace(/(<embed)([^>]*)(>)/gi, function (match, start, attr, end) {
//				attr = attr.replace(/\s+wmode=("|'|)\w*\1/i, '');
//				attr += ' wmode=transparent';
//				return start + attr + end;
//			});

			return content;
		} else {
			var _matchs, _source, _html, _embed;
			var tempContent = content;

			/* Substitute <embed tag within script to <xxembed */
			var _regScript = new RegExp("<(?:script)[^>]*>[\\S\\s]*?(<(?:embed|EMBED)[^>]*src=[^>]*>)[\\S\\s]*?<\/(?:script)>", "gim");
			while ((_matchs = _regScript.exec(tempContent)) != _NULL) {
				_source = _matchs[0];
				_html = _source.replace(/<embed/i, "<xxembed");
				content = content.replace(_source, _html);
			}
			var _regLoad = new RegExp("<(?:object|OBJECT)[^>]*>[\\S\\s]*?(<(?:embed|EMBED)[^>]*src=[^>]*>)[\\S\\s]*?<\/(?:object|OBJECT)>", "gim");
			while ((_matchs = _regLoad.exec(tempContent)) != _NULL) {
				_source = _matchs[0];
				_embed = _matchs[1];
				_html = getHtmlByExt(_source, _embed);
				content = content.replace(_source, _html);
			}

			_regLoad = new RegExp("<(?:embed|EMBED)[^>]*src=[^>]*(?:\/?>|><\/(?:embed|EMBED)>)", "gim");
			while ((_matchs = _regLoad.exec(tempContent)) != _NULL) {
				_source = _matchs[0];
				_embed = _matchs[0];
				_html = getHtmlByExt(_source, _embed);
				content = content.replace(_source, _html);
			}

			content = content.replace(/<xxembed/i, "<embed");
			return content;
		}
	}
	
	function getHtmlByExt(source, embed) {
		var _attrs = Trex.Util.getAllAttributesFromEmbed(embed);
		var _url = _attrs['src'];
		var _width = _attrs['width'].isPercent()?_attrs['width']:(_attrs['width'] || " ").parsePx();
		var _height = _attrs['height'].isPercent()?_attrs['height']:(_attrs['height'] || " ").parsePx();
		if(parseInt(_width, 10) === 0 || parseInt(_height, 10) ===0) {
			var _size = getDefaultSizeByUrl(_url);
			_width = _size.width;
			_height = _size.height;
		}
		
		/* make new embed source */
		var _newEmbedSrc = "<embed";
		for( var name in _attrs ){
            if (_attrs.hasOwnProperty(name)) {
                _newEmbedSrc += " " + name + "=\""+_attrs[name]+"\"";
            }
		}
		_newEmbedSrc += ">";
		
		/* If source has 'object' then it is needed to add 'object' TAG */
		var arr = source.split(embed);
		source = arr[0] + _newEmbedSrc;
		for( var i = 1; i < arr.length; i++){
			source += arr[i];
		} 
		
		var _prev = getPreviewByUrl(_url);
		return "<img src=\"" + _prev.imageSrc + "\" width=\"" + _width + "\" height=\"" + _height + "\" border=\"0\" class=\"tx-entry-embed txc-media" + _prev.className + "\" ld=\"" + encodeURIComponent(source) + "\"/>";
	}
	
	function getSourceByExt(html) {
		var _attrs = Trex.Util.getAllAttributes(html);
		var _longdesc = _attrs['ld'];
		if(!_longdesc || _longdesc.length == 0) {
			return "";
		}
		var _width = _attrs['width'];
		var _height = _attrs['height'];
		var _source = decodeURIComponent(_longdesc);
		
		var _embed = _source;
		if(_source.indexOf("object") > -1 || _source.indexOf("OBJECT") > -1) {
			var _matchs;
			var _regLoad = new RegExp("<(?:embed|EMBED)[^>]*src=[^>]*(?:\/?>|><\/(?:embed|EMBED)>)", "gim");
			while ((_matchs = _regLoad.exec(_source)) != _NULL) {
				_embed = _matchs[0];
			}
		}
		
		_attrs = Trex.Util.getAllAttributes(_embed);
		var _url = _attrs['src'];
		var _size = getDefaultSizeByUrl(_url);
		if(isNaN(_width)) {
			_source = Trex.String.changeAttribute(_source, "width", _width, _size.width);
		} else {
			_source = Trex.String.changeAttribute(_source, "width", _width, _width);
		}
		if(isNaN(_height)) {
			_source = Trex.String.changeAttribute(_source, "height", _height, _size.height);
		} else {
			_source = Trex.String.changeAttribute(_source, "height", _height, _height);
		}
		return _source;
	}
	
    function getTvPotKey(url) {
        return (url.match(/http:\/\/tvpot\.daum\.net\/v\/(.{23})/) || [])[1];
    }

    function getYouTubeMovieKey(url) {
        return (url.match(/(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/) || [])[1];
    }

	function getDefaultSizeByUrl(url) {
		var _width, _height;
		if(url.indexOf("api.bloggernews.media.daum.net/static/recombox1") > -1) {
			_width = 400;
			_height = 80;
		} else if(url.indexOf("flvs.daum.net/flvPlayer") > -1) {
			_width = 502;
			_height = 399;
        } else if(url.indexOf('youtube') != -1 || url.indexOf('youtu.be') != -1 || url.indexOf('tvpot.daum.net') != -1) {
            var size = TrexConfig.get('size');
            if (size.contentWidth > 640) {
                _width = 640;
                _height = 360;
            } else {
                _width = 560;
                _height = 315;
            }
            // else 853x480
		} else {
			var _ext = url.split(".").pop().split("?")[0].toLowerCase();
			switch (_ext) {
				case "mp3":
				case "wma":
				case "asf":
				case "asx":
					_width = 280;
					_height = 45;
					break;
				case "mpg":
				case "mpeg":
				case "wmv":
				case "avi":
					_width = 320;
					_height = 285;
					break;
				default:
					_width = 400;
					_height = 300;
					break;
			}
		}
		return {
			width: _width,
			height: _height
		};
	}
	
	function getPreviewByUrl(url) {
		var _class = "";
		var _image = "";
		if(url.indexOf("api.bloggernews.media.daum.net/static/recombox1") > -1) {
			_class = "";
			_image = TXMSG("@media.prev.url");
		} else if(url.indexOf("flvs.daum.net/flvPlayer") > -1) {
			_class = " txc-media-tvpot";
			_image = TXMSG("@media.prev.url.tvpot");
		} else {
			var _ext = url.split(".").pop().split("?")[0].toLowerCase();
			switch (_ext) {
				case "mp3":
				case "wma":
				case "asf":
				case "asx":
					_class = " txc-media-wmp";
					_image = TXMSG("@media.prev.url.wmp");
					break;
				case "mpg":
				case "mpeg":
				case "wmv":
				case "avi":
					_class = " txc-media-wmp";
					_image = TXMSG("@media.prev.url.wmp");
					break;
				default:
					_class = "";
					_image = TXMSG("@media.prev.url");
					break;
			}
		}
		return {
			className: _class,
			imageSrc: _image
		};
	}
	
})();
