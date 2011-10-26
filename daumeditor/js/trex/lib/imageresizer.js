/**
 * @fileoverview
 * Class Trex.ImageResizer를 포함하고 있다. 
 *    
 * @author iamdanielkim
 * 
 */

/**
 * img element에 원하는 width, height로 변경된 image를 loading한다.
 *  
 * 
 * @example
 *  var imageResizer = new Trex.ImageResizer(el, config);
 *  imageResizer.execResize(imageurl);
 *  
 * @constructor
 * @param {Object} elImage
 * @param {Object} config
 */
Trex.ImageResizer = Trex.Class.create({
	initialize: function(elImage, config) {
		var _elImage = elImage;

		var _maxWidth = config.maxWidth || 200;
		var _maxHeight = config.maxHeight || 200;
		var _defImgUrl = config.defImgUrl;
		var _loadHandler = config.onComplete || function() {};
		
		function doResize(imgEl, imgurl){
			var _resizedHeight, _resizedWidth;
			var _originWidth = imgEl.width;
			var _originHeight = imgEl.height;
			if (_originWidth == _maxWidth && _originHeight == _maxHeight) {
				_resizedWidth = _maxWidth;
				_resizedHeight = _maxHeight;
			} else if (_originWidth < _maxWidth && _originHeight < _maxHeight) {
				_resizedWidth = _originWidth;
				_resizedHeight = _originHeight;
			} else {
				_resizedHeight = _maxHeight;
				_resizedWidth = Math.floor(_maxHeight * (_originWidth / _originHeight));
				if (_resizedWidth > _maxWidth) {
					_resizedWidth = _maxWidth;
					_resizedHeight = Math.floor(_maxWidth * (_originHeight / _originWidth));
				}
			}
			_elImage.width = _resizedWidth;
			_elImage.height = _resizedHeight;
			_elImage.src = imgurl;
			_loadHandler(_resizedWidth, _resizedHeight);
		}
		
		/**
		 * resize를 실행한다.
		 * 
		 * @memberOf Trex.ImageResizer.prototype 
		 * @param {Object} imgurl
		 */			
		this.execResize =  function(imgurl) {
			var _tmpImage = new Image();
			_tmpImage.onerror = function() {
				_elImage.width = _maxWidth;
				_elImage.height = _maxHeight;
				_elImage.src = _defImgUrl;
				_tmpImage = _NULL;
			};
			
			if( _tmpImage.onreadystatechange ) { //IE
				_tmpImage.onreadystatechange = function() {
					if(this.readyState == "complete") {
						doResize(_tmpImage, imgurl);
					}
				};
			} else {
				_tmpImage.onload = function(){
					doResize(_tmpImage, imgurl);
				}	
			}
			_tmpImage.src = imgurl;
		};
	}
});


