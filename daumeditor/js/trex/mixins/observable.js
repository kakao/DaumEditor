_WIN.$stop = {};
_WIN.$propagate = {};
/**
 * 에디터에 정의된 custom 이벤트들을 발생시키고 등록된 이벤트 핸들러들을 실행시킨다.
 * custom 이벤트를 발생시키거나 혹은 custom 이벤트 발생시 핸들러를 실행시키기 위해서는 이 클래스를 minxin 받아야 한다. 
 * @class
 */
Trex.I.JobObservable = Trex.Faculty.create(/** @lends Trex.I.JobObservable */{
	/**
	 * @private
	 */
	jobObservers: {},
	/**
	 * custom 이벤트가 발생하는지를 관찰하는 observer를 등록한다.
	 * @param {String} name - custom 이벤트의 이름 
	 * @param {Function} observer - custom 이벤트 발생시 실행될 handler
	 * @example
	 * canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(){alert('canvas의 크기가 변했네요')}) 
	 * cinema.observeJob("cinema_on_paste", function(){alert('영화가 첨부되었네요')}) 
	 */
	observeJob: function(name, observer) {
		if(!this.jobObservers[name]) {
			this.jobObservers[name] = [];
		}
		this.jobObservers[name].push(observer);
	},
	reserveJob: function(name, observer, delay) {
		delay = delay || 500;
		if(!this.jobObservers[name]) {
			this.jobObservers[name] = [];
		}
		var _self = this;
		this.jobObservers[name].push(function() {
			var args = $A(arguments);
			setTimeout(function() {
				observer.apply(_self, args);
			}, delay);
		});
	},
    removeJob: function(name, observe){
        if(!this.jobObservers[name])
            return;
        if(!observe){
            this.jobObservers[name].length = 0;
        }else {
            for(var i = 0 ; i < this.jobObservers[name].length; i++){
                if(this.jobObservers[name][i]===observe){
                    this.jobObservers[name].splice(i,1);
                }
            }
        }

    },
	/**
	 * custom 이벤트를 발생시킨다. 이때 발생시킨 이벤트는 observerJob를 통해 등록된 observer들에게 전파된다.
	 * @param {String} name - custom 이벤트의 이름 
	 * @example
	 * canvas.observeJob(Trex.Ev.__CANVAS_HEIGHT_CHANGE, function(){alert('canvas의 크기가 변했네요')}) 
	 * cinema.observeJob("cinema_on_paste", function(){alert('영화가 첨부되었네요')}) 
	 */
	fireJobs: function(name) {
		var _self = this;
		var args = $A(arguments).slice(1);
		if(!this.jobObservers[name]) {
			return;
		}
        if (_WIN['DEBUG']) {
            this.jobObservers[name].each(function(observer) {
                observer.apply(_self, args);
            });
        } else {
            try {
                this.jobObservers[name].each(function(observer) {
                    observer.apply(_self, args);
                });
            } catch (e) {
                if(e != $stop) { throw e; }
            }
        }

	}
});

/**
 * 에디터에서 custom key이벤트들을 발생시키고 등록된 이벤트 핸들러들을 실행시킨다.
 * custom key 이벤트를 발생시키거나 혹은 custom key 이벤트 발생시 핸들러를 실행시키기 위해서는 이 클래스를 minxin 받아야 한다. 
 * @class
 */
Trex.I.KeyObservable = Trex.Faculty.create(/** @lends Trex.I.KeyObservable */{
	/**
	 * @private
	 */
	keyObservers: {},
	/**
	 * custom 이벤트가 발생하는지를 관찰하는 observer를 등록한다.
	 * @param {Object} keys - 이벤트가 발생하길 원하는 키의 조합 {ctrlKey:T, altKey:F, shiftKey:T, keyCode:17} 
	 * @param {Function} observer - 해당 이벤트 발생시 실행될 handler
	 * @example
	 * canvas.observeKey({ctrlKey:'T', altKey:'F', keyCode:32}, function(){alert('ctrl + 32키가 눌렸네요.')}) 
	 */
	observeKey: function(keys, observer) {
		var _name = function(keys) {
			return (keys.ctrlKey? 'T': 'F') + (keys.altKey? 'T': 'F') + (keys.shiftKey? 'T': 'F') + "_" + keys.keyCode;
		}(keys);
		if(!this.keyObservers[_name]) {
			this.keyObservers[_name] = [];
		}
		this.keyObservers[_name].push(observer);
	},
	/**
	 * 사용자가 정의한 custom key event를 발생시킨다. 이때 발생시킨 이벤트는 observerKey를 통해 등록된 observer들에게 전파된다.
	 * @param {Object} ev - 사용자가 정의한 key의 pushed 상태 객체
	 * @example
	 * canvas.fireKyes({ctrlKey:'T', altKey:'F', keyCode:32}), function(){alert('영화가 첨부되었네요')}) 
	 */
	fireKeys: function(ev) {
		var _name = function(ev) {
			return (ev.ctrlKey? 'T': 'F') + (ev.altKey? 'T': 'F') + (ev.shiftKey? 'T': 'F') + "_" + ev.keyCode;
		}(ev);
		if(!this.keyObservers[_name]) {
			return;
		}
		var _self = this;
		var eventStopped = _FALSE;
		var stopEventOnce = function() {
			if (!eventStopped) {
				$tx.stop(ev);
				eventStopped = _TRUE;
			}
		};
		this.keyObservers[_name].each(function(observer) {
			try {
				observer.apply(_self, [ev]);
				stopEventOnce();
			} catch (e1) {
				if(e1 === $stop) {
					stopEventOnce();
				} else if (e1 !== $propagate) {
					console.log(e1, e1.stack);
				}
			}
		});
	},
	registerKeyEvent: function(el) {
		try {
			$tx.observe(el, 'keydown', this.fireKeys.bind(this), _TRUE);
		} catch(e) {}
	}
});

/**
 * 마우스클릭이나 방향키를 이용해 특정 엘리먼트에 포커스가 갔을 경우 등록된 handler를 실행시킨다.  
 * @class
 */
Trex.I.ElementObservable = Trex.Faculty.create(/** @lends Trex.I.ElementObservable */{
	elementObservers: {},
	/**
	 * 선택되길 원하는 element를 등록한다 .
	 * @param {Object} layer - 관찰하기를 원하는 element의 tag name과 class name {tag: 'div', klass: 'txc-textbox'}
	 * @param {Function} observer - 원하는 엘리먼트가 선택되었을때 실행되길 원하는 handler  
	 * @example
	 * canvas.observeElement({tag:'div', klass: 'txc-textbox'}), function(){alert("div.txc-textbox가 선택되었네요.")})
	 */
	observeElement: function(layer, observer) {
		if(layer == _NULL) { //all
			this.observeElement({ tag: "*tx-final-body*"}, observer);
		} else if (layer.length) {
			for (var i = 0; i < layer.length; i++) {
				var item = layer[i];
				this.observeElement(item, observer);
			}
		} else {
			if (!this.elementObservers[layer.tag]) {
				this.elementObservers[layer.tag] = {};
			}
			if (!layer.klass) {
				layer.klass = "*tx-all-class*";
			}
			if (!this.elementObservers[layer.tag][layer.klass]) {
				this.elementObservers[layer.tag][layer.klass] = [];
			}
			this.elementObservers[layer.tag][layer.klass].push(observer);
		}
	},
	/**
	 * 특정 element가 선택되었을때 그 element가 선택되길 기다린 observer들에게 알려준다. 
	 * 해당하는 observer들은 handler를 실행시킨다.
	 * @param {Element} node - 선택된 node
	 * @example
	 * canvas.fireElements(document.body)
	 */
	fireElements: function(node) {
		if(!node) {
			return;
		} 
		var _node = node;
		var args = $A(arguments).slice(1);
		
		var _self = this;
		try {
			var _observers;
			if($tom.kindOf(_node, 'img,hr,table,button,iframe')) {
				_observers = this.collectObserverByElement(_node.nodeName.toLowerCase(), _node.className);
				if(_observers) {
					_observers.each(function(observer) {
						observer.apply(_self, [_node].concat(args));
					});	
				}
			} else {
				while (_node) {
					_observers = this.collectObserverByElement(_node.nodeName.toLowerCase(), _node.className);
					if(_observers) {
						_observers.each(function(observer) {
							observer.apply(_self, [_node].concat(args));
						});	
					}
					if($tom.isBody(_node)) {
						break;
					}
					_node = $tom.parent(_node);
				}
			}
			
		} catch (e) {
			if(e != $stop) { throw e; }
		}
		this.fireFinally();
	},
	fireFinally: function() {
		var _self = this;
		var args = $A(arguments).slice(1);
		var _observers = this.collectObserverByElement("*tx-final-body*");
		if(_observers) {
			_observers.each(function(observer) {
				observer.apply(_self, [_NULL].concat(args));
			});	
		}
	},
	collectObserverByElement: function(tag, klass) {
		if(!this.elementObservers[tag]) {
			return _NULL;
		}

		var _observers = [];
		klass = klass || "";
		if(klass != "") {
			var _classes = klass.split(" ");
			for(var _klass in this.elementObservers[tag]) {
				if(_classes.contains(_klass)) {
					_observers.push(this.elementObservers[tag][_klass]);
				}
			}
		}
		if (this.elementObservers[tag]["*tx-all-class*"]) {
			_observers.push(this.elementObservers[tag]["*tx-all-class*"]);
		}
		return _observers.flatten();
	}
});

Trex.I.MouseoverObservable = Trex.Faculty.create(/** @lends Trex.I.MouseoverObservable */{
	mouseoverObservers: {},
	/**
	 * 선택되길 원하는 element를 등록한다 .
	 * @param {Object} selector - 관찰하기를 원하는 element의 tag name과 class name {tag: 'div', klass: 'txc-textbox'}
	 * @param {Function} successObserver - 원하는 엘리먼트가 선택되었을때 실행되길 원하는 handler
	 * @param {Function} failObserver
	 * @example
	 * canvas.observeElement({tag:'div', klass: 'txc-textbox'}), function(){alert("div.txc-textbox가 선택되었네요.")})
	 */
	observeMouseover: function(selector, successObserver, failObserver) {
		if (!this.mouseoverObservers[selector]) {
			this.mouseoverObservers[selector] = {
				'success': [],
				'fail': [],
				'flag': _FALSE
			}	
		}
		this.mouseoverObservers[selector]['success'].push(successObserver);
		if ( failObserver ){
			this.mouseoverObservers[selector]['fail'].push(failObserver);
		}
	},
	fireMouseover: function(node) {
		if(!node) { return;	} 
		var _node = node;
		var _self = this;
		
		try {
			for (var i in this.mouseoverObservers){
				this.mouseoverObservers[i].flag = _FALSE;
			}
			while (_node) {
				var _observers = this.collectMouseoverObserver(_node);
				if(_observers.length > 0) {
					var _nodePos = this.getPositionByNode(_node);
					_observers.each(function(observer) {
						observer.apply(_self, [_node, _nodePos]);
					});	
				}
				if($tom.isBody(_node)) {
					break;
				}
				_node = $tom.parent(_node);
			}
		} catch (e) {
			if(e != $stop) { throw e; }
		}
		this.runMouseoverFailHandler();	
	},
	runMouseoverFailHandler: function(){
		var _failHandlers = [];
		for (var i in this.mouseoverObservers){
			if ( !this.mouseoverObservers[i].flag ){
				_failHandlers.push( this.mouseoverObservers[i]['fail'] );
			}
		}
		
		_failHandlers.flatten().each( function(handler){
			handler();
		});
	},
	collectMouseoverObserver: function(node) {
		var _observers = [];
		var klass = node.className || "";
		var tag = node.tagName;
		
		if ( tag ){
			tag = tag.toLowerCase();
			if ( this.mouseoverObservers[tag] ){
				_observers.push( this.mouseoverObservers[tag]['success'] );
				this.mouseoverObservers[tag]['flag'] = _TRUE;
			}
		}
		
		if(klass != "") {
			var _classes = klass.split(" ");
			for(var i = 0, len = _classes.length; i < len; i++ ){
				var key = tag + "." + _classes[i];
				if ( this.mouseoverObservers[key] ) {
					_observers.push(this.mouseoverObservers[key]['success']);
					this.mouseoverObservers[key]['flag'] = _TRUE;
				}
			}
			
		}
		return _observers.flatten();
	}
});

/*---- Trex.I.Runnable ------------------------------------------------------*/
Trex.I.Runnable = Trex.Faculty.create({
	isRunning: _FALSE,
	repeater: _NULL,
	threads: [],
	startThread: function(term) {
		if (this.repeater) {
			this.repeater.clear();
		} else {
			this.repeater = new Trex.Repeater(this.runThread.bind(this));
		}
		this.repeater.start(term);
	},
	stopThread: function() {
		this.repeater.clear();
	},
	runThread: function() {
		if(this.isRunning) {
			return;
		}
		if(this.threads.length > 0) {
			this.isRunning = _TRUE;
			(this.threads.shift())();
			this.isRunning = _FALSE;
		}
	},
	putThread: function(thread, important) {
		if(important) {
			this.threads.unshift(thread);
		} else {
			this.threads.push(thread);
		}
	}
});