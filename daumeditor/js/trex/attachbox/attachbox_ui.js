TrexMessage.addMsg({
	'@attacher.ins': "삽입",
	'@attacher.del': "삭제",
	'@attacher.preview.image': "#iconpath/pn_preview.gif",
	'@attacher.delete.confirm': "삭제하시면 본문에서도 삭제됩니다. 계속하시겠습니까?",
	'@attacher.delete.all.confirm': "모든 첨부 파일을 삭제하시겠습니까? 삭제하시면 본문에서도 삭제됩니다.",
	'@attacher.exist.alert': "이미 본문에 삽입되어 있습니다."
});

Trex.install("attachbox.onAttachBoxInitialized @if config.sidebar.attachbox.show = true", function(editor, toolbar, sidebar, canvas, config) {
	var attachbox = editor.getAttachBox();
	if (config.sidebar.attachbox.show == _TRUE) {
		Object.extend(attachbox, Trex.I.AttachBox);
		attachbox.onAttachBoxInitialized(config, canvas, editor);
	}
});
Trex.I.AttachBox = {
	useBox: _TRUE,
	isDisplay: _FALSE,
	lastSelectedEntry: _NULL,
	onAttachBoxInitialized: function(config, canvas) {
		var _entryBox = this;
		this.canvas = canvas;
		
		var _initializedId = ((config.initializedId) ? config.initializedId : "");
		this.elBox = $must("tx_attach_div" + _initializedId, "Trex.I.AttachBox");
		
		this.elList = $must("tx_attach_list" + _initializedId, "Trex.I.AttachBox");
		var _elPreview = $must('tx_attach_preview' + _initializedId, "Trex.I.AttachBox");
		this.elPreviewKind = $tom.collect(_elPreview, "p");
		var _elPreviewImg = $tom.collect(_elPreview, "img");
		this.elPreviewImg = _elPreviewImg;
		this.imageResizer = new Trex.ImageResizer(_elPreviewImg, {
			maxWidth: 147,
			maxHeight: 108,
			defImgUrl: TXMSG("@attacher.preview.image"),
			onComplete: function(width, height) { //vertical positioning
				_elPreviewImg.style.marginTop = Math.floor((108 - height) / 2).toPx();
			}
		});
		
		this.elDelete = $tom.collect("#tx_attach_delete" + _initializedId + " a");
		$tx.observe(this.elDelete, 'click', function() {
			if (config.sidebar.attachbox.confirmForDeleteAll) {
				_entryBox.onDeleteAll(false);
			} else {
				_entryBox.onDeleteAll(true);
			}
		});
		
		if (typeof showAttachBox == "function") { //NOTE: 첨부박스가 보여질 때 실행할 서비스 콜백
			this.observeJob(Trex.Ev.__ATTACHBOX_SHOW, function() {
				showAttachBox();
			});
		}
		if (typeof hideAttachBox == "function") { //NOTE: 첨부박스가 감춰질 때 실행할 서비스 콜백
			this.observeJob(Trex.Ev.__ATTACHBOX_HIDE, function() {
				hideAttachBox();
			});
		}
		
		var _elProgress = $must('tx_upload_progress' + _initializedId, 'Trex.I.AttachBox');
		this.elProgress = _elProgress;
		this.elProgressPercent = $tom.collect(_elProgress, "div");
		this.elProgressTicker = $tom.collect(_elProgress, "p");
		
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, function(entry) {
			_entryBox.registerEntryNode(entry);
			_entryBox.displayBox();
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_MODIFIED, function(entry) {
			_entryBox.modifyEntryNode(entry);
			_entryBox.refreshPreview();
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, function(entry) {
			_entryBox.removeEntryNode(entry);
			_entryBox.displayBox();
			if (_entryBox.lastSelectedEntry && _entryBox.lastSelectedEntry.key == entry.key) {
				_entryBox.refreshPreview();
			}
			
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ALL_ENTRY_REMOVED, function() {
			_entryBox.datalist.each(function(entry) {
				_entryBox.removeEntryNode(entry, _TRUE);
			});
			_entryBox.displayBox();
			if (_entryBox.lastSelectedEntry) {
				_entryBox.refreshPreview();
			}
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REFRESH, function(entry) {
			_entryBox.displayBox();
			_entryBox.refreshEntryNode(entry);
		});
		
		var _elUploadedSize = $tx('tx_attach_up_size' + _initializedId), _elMaximumSize = $tx('tx_attach_max_size' + _initializedId), _elGroupUsedSize = $tx('tx_attach_group_used_size' + _initializedId), _elGroupMaximumSize = $tx('tx_attach_group_max_size' + _initializedId);
		
		this.observeJob(Trex.Ev.__ENTRYBOX_CAPACITY_UPDATE, function() {
			var capacity = config.sidebar.capacity;
			if (capacity.show == _FALSE) {
				return;
			}
			
			if (_elUploadedSize) {
				_elUploadedSize.innerText = capacity.uploaded.toByteUnit();
			}
			if (_elMaximumSize) {
				// maximum을 안쓰고 available을 사용하는 이유는 group 값 이용시 group.used의 사용여하에 따라 최대치가 달라지기 때문
				_elMaximumSize.innerText = capacity.available.toByteUnit();
			}
			if (capacity.group) {
				if (_elGroupUsedSize) {
					_elGroupUsedSize.innerText = (capacity.group.used + capacity.uploaded).toByteUnit();
				}
				if (_elGroupMaximumSize) {
					_elGroupMaximumSize.innerText = capacity.group.maximum.toByteUnit();
				}
			}
		});
		
		// canvas에서 제거된 첨부파일은 첨부박스에는 1차로는 남아있기 때문에 아래와 같은 삭제 과정이 필요하지 않다
		//        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_DELETE_SOMETHING, function(ev){
		//            // 데이터중에 존재하지 stage에 존재하지 않는 entry는 박스에서 바로 제거
		//            _entryBox.datalist.each(function (entry) {
		//                if (entry.type =='image' && entry.actor.name == 'image' && entry.existStage == false) {
		//                    entry.execRemove();
		//                }
		//            });
		//            _entryBox.refreshPreview();
		//        });
	},
	onDeleteAll: function(force) {
		if (this.datalist.length === 0) {
			return;
		}
		if (!force && !confirm(TXMSG("@attacher.delete.all.confirm"))) {
			return;
		}
		this.datalist.each(function(entry) {
			if (entry.deletedMark == _FALSE) {
				entry.execRemove();
			}
		});
		//		this.imageResizer.execResize(TXMSG("@attacher.preview.image"));
		this.initPreviewImage();
	},
	checkDisplay: function() {
		return this.isDisplay;
	},
	setDisplay: function(isDisplay) {
		this.isDisplay = isDisplay;
	},
	displayBox: function() {
		var isDisplay = _FALSE;
		for (var i = 0; i < this.datalist.length; i++) {
			if (this.datalist[i].deletedMark == _FALSE) {
				isDisplay = _TRUE;
			}
		}
		//var isDisplay = (this.datalist.length > 0);
		if (this.isDisplay == isDisplay) {
			return;
		}
		if (isDisplay) {
			$tx.show(this.elBox);
			this.fireJobs(Trex.Ev.__ATTACHBOX_SHOW, _TRUE);
		} else {
			$tx.hide(this.elBox);
			this.fireJobs(Trex.Ev.__ATTACHBOX_HIDE, _FALSE);
		}
		this.isDisplay = isDisplay;
	},
	registerEntryNode: function(entry) {
		var _elData = tx.li({
			className: "type-" + entry.type
		});
		if (entry.actor.boxonly) {
			$tx.addClassName(_elData, "tx-boxonly");
		}
		this.elList.appendChild(_elData);
		entry.elData = _elData;
		
		entry.makeSelection = function(isPreviewed) {
			if (isPreviewed) {
				this.showEntryThumb(entry);
			} else {
				this.hideEntryThumb(entry);
			}
		}
.bind(this);
		
		//NOTE: only blog cuz iframe area
		$tx.observe(_elData, 'mouseover', this.onEntryMouseOver.bind(this, entry));
		$tx.observe(_elData, 'mouseout', this.onEntryMouseOut.bind(this, entry));
		
		var _elRow = tx.dl();
		_elData.appendChild(_elRow);
		
		var _elName = tx.dt({
			className: "tx-name",
			unselectable: "on"
		}, entry.boxAttr.name); //파일명
		entry.elName = _elName;
		_elRow.appendChild(_elName);
		$tx.observe(_elData, 'click', function(e) {
			var _el = $tx.element(e);
			if (_el.className == "tx-delete" || _el.className == "tx-insert") {
				return;
			}
			if (e.ctrlKey) {
				this.clickEntryWithCtrl(entry);
			} else if (e.shiftKey) {
				this.clickEntryWithShift(entry);
			} else {
				this.clickEntry(entry);
			}
			if (entry.actor.name == 'image') { //NOTE: get image scale
				if (!entry.data.width || !entry.data.height) {
					new Trex.ImageScale(entry.data);
				}
			}
		}
.bind(this), _FALSE);
		
		var _elButton = tx.dd({
			className: "tx-button"
		}); //버튼
		_elRow.appendChild(_elButton);
		
		var _elDelete = tx.a({
			className: "tx-delete"
		}, TXMSG("@attacher.del")); //삭제
		_elButton.appendChild(_elDelete);
		$tx.observe(_elDelete, 'click', function() {
			if (!confirm(TXMSG("@attacher.delete.confirm"))) {
				return;
			}
			entry.execRemove();
		}, _FALSE);
		
		
		var _elInsert = tx.a({
			className: "tx-insert"
		}, TXMSG("@attacher.ins")); //삽입
		entry.elInsert = _elInsert;
		_elButton.appendChild(_elInsert);
		$tx.observe(_elInsert, 'click', function() {
			if (entry.existStage && !entry.actor.config.multipleuse) {
				alert(TXMSG("@attacher.exist.alert"));
			} else {
				entry.execAppend();
			}
		}, _FALSE);
		
		
	},
	changeState: function(entry) {
		var _existStage = entry.existStage;
		if (_existStage && !entry.actor.config.multipleuse) {
			$tx.addClassName(entry.elData, "tx-existed");
		} else {
			$tx.removeClassName(entry.elData, "tx-existed");
		}
	},
	modifyEntryNode: function(entry) {
		entry.elName.innerText = entry.boxAttr.name;
	},
	removeEntryNode: function(entry, force) {
		if (force) {
			entry.elData.parentNode.removeChild(entry.elData);
		} else if (entry.deletedMark) {
			$tx.hide(entry.elData);
		}
	},
	refreshEntryNode: function(entry) {
		if (entry.deletedMark) {
			$tx.hide(entry.elData);
		} else {
			$tx.show(entry.elData);
		}
	},
	refreshPreview: function() {
		// reload last selected entry
		for (var i = 0, l = this.datalist.length - 1; i < l; ++i) {
			var entry = this.datalist[i];
			if (this.lastSelectedEntry && this.lastSelectedEntry.key == entry.key && entry.deleteMark == false) {
				this.setPreivewImage(entry);
				return _TRUE;
			}
		}
		
		// reselect
		for (var i = 0, l = this.datalist.length - 1; i < l; ++i) {
			var entry = this.datalist[i];
			if (entry.deletedMark == false && $tx.hasClassName(entry.elData, "tx-clicked")) {
				this.setPreivewImage(entry);
				return _TRUE;
			}
		}
		
		// init
		this.initPreviewImage();
		return _FALSE;
	},
	setPreivewImage: function(entry) {
		this.imageResizer.execResize(entry.boxAttr.image);
		this.lastSelectedEntry = entry;
	},
	initPreviewImage: function() {
		this.imageResizer.execResize(TXMSG("@attacher.preview.image"));
		this.lastSelectedEntry = _NULL;
	},
	showEntryThumb: function(entry) {
		$tx.addClassName(entry.elData, "tx-clicked");
		$tx.removeClassName(entry.elData, "tx-hovered");
	},
	hideEntryThumb: function(entry) {
		$tx.removeClassName(entry.elData, "tx-clicked");
	},
	onEntryMouseOver: function(entry) {
		$tx.addClassName(entry.elData, "tx-hovered");
	},
	onEntryMouseOut: function(entry) {
		$tx.removeClassName(entry.elData, "tx-hovered");
	},
	startUpload: function() {
		this.elProgressPercent.style.width = "0".toPx();
		$tx.setStyle(this.elList, {
			opacity: 0.3
		});
		$tx.show(this.elProgress);
	},
	doUpload: function(percent) {
		var progressWidth = 300;
		this.elProgressPercent.style.width = Math.floor(progressWidth * (isNaN(percent) ? 0 : parseFloat(percent) * 0.01)).toPx();
		this.elProgressTicker.innerText = Math.floor((isNaN(percent) ? 0 : parseFloat(percent))) + "%";
	},
	endUpload: function() {
		$tx.hide(this.elProgress);
		$tx.setStyle(this.elList, {
			opacity: 1
		});
	},
	clickEntry: function(entry) {
		if (this.lastSelectedEntry) {
			if (this.lastSelectedEntry.key == entry.key) {
				return;
			}
			this.datalist.each(function(entry) {
				entry.makeSelection(_FALSE);
			});
		}
		this.elPreviewKind.className = ((entry.boxAttr.className) ? entry.boxAttr.className : "");
		entry.makeSelection(_TRUE);
		this.setPreivewImage(entry);
	},
	clickEntryWithCtrl: function(entry) {
		if ($tx.hasClassName(entry.elData, 'tx-clicked')) {
			entry.makeSelection(_FALSE);
			this.refreshPreview();
		} else {
			this.elPreviewKind.className = ((entry.boxAttr.className) ? entry.boxAttr.className : "");
			entry.makeSelection(_TRUE);
			this.setPreivewImage(entry);
		}
	},
	clickEntryWithShift: function(entry) {
		if ($tx.hasClassName(entry.elData, 'tx-clicked')) {
			entry.makeSelection(_FALSE);
			this.lastSelectedEntry = _NULL;
		} else {
			var idx = this.getIndexOf(entry);
			var targetIdx;
			if (this.lastSelectedEntry) {
				targetIdx = this.getIndexOf(this.lastSelectedEntry);
			}
			
			var from = targetIdx, to = idx;
			if (idx == targetIdx) {
				from = to = idx;
			} else if (idx < targetIdx) {
				from = idx;
				to = targetIdx;
			}
			
			this.elPreviewKind.className = ((entry.boxAttr.className) ? entry.boxAttr.className : "");
			for (var i = from; i < to + 1; i++) {
				this.datalist[i].makeSelection(_TRUE);
			}
			this.setPreivewImage(entry);
		}
	},
	getIndexOf: function(entry) {
		var i, matched;
		for (i = 0; i < this.datalist.length; i++) {
			if (this.datalist[i] === entry) {
				matched = _TRUE;
				break;
			}
		}
		return matched ? i : -1;
	},
	getSelectedList: function(attachType) {
		var _list = [];
		var _source;
		if (attachType) {
			_source = this.getAttachments(attachType);
		} else {
			_source = this.datalist;
		}
		_source.each(function(entry) {
			if ($tx.hasClassName(entry.elData, "tx-clicked")) {
				_list.push(entry);
			}
		});
		return _list;
	},
	removeSelection: function(datalist) {
		datalist.each(function(data) {
			$tx.removeClassName(data.elData, "tx-clicked");
		})
	}
};
