Trex.install("attachbox.onFileCapacityInitialized @if sidebar.capacity.show = true",
	function(editor, toolbar, sidebar, canvas, config){
		var attachbox = editor.getAttachBox();
		if (config.sidebar.capacity.show === _TRUE) {
			Object.extend(attachbox, Trex.I.FileCapacity);
			attachbox.onFileCapacityInitialized(config, canvas);
		}
	}
);
Trex.module("attachbox.updateCapacity on Trex.Ev.__ATTACHBOX_SHOW",
    function(editor/*, toolbar, sidebar, canvas, config*/) {
        var attachbox = editor.getAttachBox();
        attachbox.observeJob(Trex.Ev.__ATTACHBOX_SHOW, function() {
            attachbox.updateCapacity();
        });
    }
);

TrexConfig.addSidebar('capacity',
	{
		show: _TRUE,
		maximum: 3145728, //3M <= 1024
        filemaximum: _NULL,
		filter: {
			use: '', //sound,movie
			sound: {
				title: 'sound file',
				maximum: 3145728,
				extensions: ",mp3,wav,ogg,wma,mp4,ape,wmv,asf,ra,ram,"
			},
			movie: {
				title: 'movie file',
				maximum: 3145728,
				extensions: ",wmv,mpg,avi,"
			}
		}
	}
);
Trex.I.FileCapacity = {
	onFileCapacityInitialized: function(config, canvas) {
		var _initializedId = (config.initializedId) ? config.initializedId : "";
		var _fileConfig = config.sidebar.capacity;

		//#FTDUEDTR-1260
		//아래 부분이 소스상 전혀 사용되는 부분이 없어서 일단 주석처리하였습니다.
		//this.elList = $must("tx_attach_list" + _initializedId, "Trex.I.FileCapacity");

		_fileConfig.uploaded = 0; //Initialize capacity
		_fileConfig.available = _fileConfig.maximum; //Remaining capacity
		_fileConfig.uploadedFileNum = 0;  //Uploaded file number.

		var _setCapacity = function(name, size) {
			size = parseInt(size, 10);
	 		if ( isNaN(size) || _fileConfig[name] == _UNDEFINED ){
	 			return _FALSE;            // invalid setting
	 		}

            if( _fileConfig.group && name == 'available' ){
                _fileConfig[name] = Math.min(size, _fileConfig.maximum, _fileConfig.group.maximum - _fileConfig.group.used); //사용가능한 용량 - 그룹용량 포함
            } else {
                _fileConfig[name] = size;
            }

	 		return _fileConfig[name];
	 	};

		this.checkAvailableCapacity = function() { //Before Popup override
			return (_fileConfig.uploaded < _fileConfig.available);
		};
		this.checkInsertableSize = function(attachSize) { //Before Attach override
			return (parseInt(_fileConfig.uploaded, 10) + parseInt(attachSize, 10) <= parseInt(_fileConfig.available, 10));
		};

		/**
		 * Gets capacity by attachment type
		 * @memberOf Trex.AttachBox.prototype
		 * @alias getCapacity
		 * @param {Object} name
		 */
		this.getCapacity = function(name) {
			return (_fileConfig[name] || 0);
		};

		/**
		 * Change available capacity
		 * @memberOf Trex.AttachBox.prototype
		 * @alias changeAvailableCapacity
		 * @param {Number} size
		 */
		this.changeAvailableCapacity = function(size){
			if ( _setCapacity("available", size ) ){
                capacityUpdateEvent();
				return size;
			}

			return _FALSE;
		};

        /**
         * Change maximum capacity
         * @memberOf Trex.AttachBox.prototype
         * @alias changeMaximumCapacity
         * @param {Number} size
         */
        this.changeMaximumCapacity = function(size){
            if ( _setCapacity("maximum", size ) ){
                return size;
            }
            return _FALSE;
        };

        /**
         * Change one file maximum capacity
         * @memberOf Trex.AttachBox.prototype
         * @alias changeFileMaximumCapacity
         * @param {Number} size
         */
        this.changeFileMaximumCapacity = function(size){
            if ( _setCapacity("filemaximum", size ) ){
                return size;
            }
            return _FALSE;
        };

        this.updateCapacity = function() {
            capacityUpdateEvent();
        }

		/**
		 *  Resets uploaded file count & size
		 *
		 *  @memberOf Trex.AttachBox.prototype
		 *  @alias empty
		 */
		var _setAttachSize = function(fileSize) {
			var uploaded = _fileConfig.uploaded + fileSize.toNumber();
            if( uploaded < 0 ){
                uploaded = 0;
            }
            _fileConfig.uploaded = uploaded;
		};
        var decreaseCapacity = function(fileSize) {
            _setAttachSize(-1 * fileSize);
            _fileConfig.uploadedFileNum -= 1;
        };
        var increaseCapacity = function(fileSize){
            _setAttachSize(fileSize);
            _fileConfig.uploadedFileNum += 1;
        };

		var _filters = {};
		if(_fileConfig.filter.use.length > 0) {
			_fileConfig.filter.use.split(",").each(function(filterName) {
				if(_fileConfig.filter[filterName]) {
					_filters[filterName] = Object.extend({}, _fileConfig.filter[filterName]);
				}
			});
		}
		this.getFiltersNameByExt = function(ext) {
			var _filterNames = [];
			for(var _filterName in _filters) {
				if(_filters[_filterName].extensions.indexOf("," + ext.toLowerCase() + ",") > -1) {
					_filterNames.push(_filterName);
				}
			}
			return _filterNames;
		};
		this.getFilterExtensions = function(filterName) {
			if (_filters[filterName]) {
				return _filters[filterName].extensions;
			}else {
				return _NULL;
			}
		};
		this.getFilterMaximum = function(filterName) {
			if (_filters[filterName]) {
				return _filters[filterName].maximum;
			}else {
				return _NULL;
			}
		};
		this.getUploadedSizeByFilter = function(filterName) {
			var _uploadedSize = 0;
			var _extensions = _filters[filterName].extensions;
			this.datalist.each(function(entry) {
				if (entry.data && entry.data.filename) {
					var _ext = entry.data.filename.split(".").pop().toLowerCase();
					if (_extensions.indexOf("," + _ext + ",") > -1) {
						_uploadedSize += entry.data.filesize;
					}
				}
			});
			return _uploadedSize;
		};

        //그룹용량사용
		if(_fileConfig.group) {
            //사용가능한 용량 - 그룹용량 포함
            _setCapacity("available", Math.min(_fileConfig.maximum, _fileConfig.group.maximum - _fileConfig.group.used) );
		}
		this.getGroupCapacity = function(name){
			return ((_fileConfig.group)? (_fileConfig.group[name] || 0): 0);
		};

		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, function(entry){
			if(entry.actor.isCheckSize) {
				increaseCapacity(entry.data.filesize || 0);
                capacityUpdateEvent();
			}
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, function(entry){
			if(entry.actor.isCheckSize) {
				decreaseCapacity(entry.data.filesize || 0);
                capacityUpdateEvent();
			}
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ALL_ENTRY_REMOVED, function() {
			_fileConfig.uploaded = 0;
			_fileConfig.uploadedFileNum = 0;
            capacityUpdateEvent();
		});
        this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REFRESH, function(entry) {
            if (!entry.actor.isCheckSize) {
                return;
            }
            var size = entry.data.filesize || 0;
            if (entry.deletedMark) {
                decreaseCapacity(size);
            } else {
                increaseCapacity(size);
            }
            capacityUpdateEvent();
        });

        var self = this;
        var capacityUpdateEvent = function(){
            // 필요한 정보만 넘겨 줘야할까? _fileConfig를 그냥 넘겨도 될까??
            var senddata = {
                uploaded: _fileConfig.uploaded,
                available: _fileConfig.available,
                maximum: _fileConfig.maximum,
                uploadedFileNum: _fileConfig.uploadedFileNum,
                group: _fileConfig.group
            };
            self.fireJobs(Trex.Ev.__ENTRYBOX_CAPACITY_UPDATE, senddata);
        };
	}
};
