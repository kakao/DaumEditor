/**
 * @fileoverview
 * 에디터에서 사용되는 button의 모음 
 * 
 */

Trex.MarkupTemplate.add(
	'button.itsnew', '<em class="tx-itsnew" title="new">new</em>'
);

Trex.MarkupTemplate.add(
	'button.select.text', '<span>#{data}</span>'
);

/**
 * 일반적인 동작의 버튼 객체로, 특화된 버튼은 이 클래스를 상속받아 사용한다.<br/>
 * 해당 엘리먼트는 미리 DOM에 있어야 하며, __borderClasses에 지정된 클래스이름을 가져야한다. 
 * 
 * @class
 * @param {Object} config
 * 
 * @example
 *	<div id="tx_example" class="tx-example tx-btn-lrbg" unselectable="on">
 *		<a title="예제" class="tx-icon" href="javascript:;">예제</a>
 *	</div>
 * 
 * 	new Trex.Button({
 * 		id: 'tx_example',
 * 		wysiwygonly: _TRUE,
 * 		sync: false,
 * 		status: false
 * 	});
 */
Trex.Button = Trex.Class.create(/** @lends Trex.Button.prototype */{
	/** @ignore */
	$const: {
		__borderClasses: {	
			'tx-btn-trans': _TRUE,
			'tx-btn-lbg': _TRUE, 
			'tx-btn-bg': _TRUE, 
			'tx-btn-rbg': _TRUE,
			'tx-btn-lrbg': _TRUE,
			'tx-slt-tlbg': _TRUE, 
			'tx-slt-tbg': _TRUE, 
			'tx-slt-trbg': _TRUE, 
			'tx-slt-blbg': _TRUE, 
			'tx-slt-bbg': _TRUE, 
			'tx-slt-brbg': _TRUE, 
			'tx-slt-31bg': _TRUE,
			'tx-slt-31lbg': _TRUE, 
			'tx-slt-31rbg': _TRUE, 
			'tx-slt-70lbg': _TRUE, 
			'tx-slt-70bg': _TRUE, 
			'tx-slt-59bg': _TRUE, 
			'tx-slt-42bg': _TRUE, 
			'tx-slt-56bg': _TRUE, 
			'tx-btn-nlrbg': _TRUE,
			'tx-btn-43lrbg': _TRUE,
			'tx-btn-52lrbg': _TRUE,
			'tx-btn-57lrbg': _TRUE,
			'tx-btn-71lrbg': _TRUE,
			'tx-btn-48lbg': _TRUE, 
			'tx-btn-48rbg': _TRUE, 
			'tx-btn-30lrbg': _TRUE, 
			'tx-btn-46lrbg': _TRUE,
			'tx-btn-67lrbg': _TRUE,
			'tx-btn-49lbg': _TRUE,
			'tx-btn-58bg': _TRUE,
			'tx-btn-46bg': _TRUE,
			'tx-btn-49rbg': _TRUE,
			'tx-btn-widget': _TRUE,
			'tx-btn-widget-tbg': _TRUE,
			'tx-btn-widget-brbg': _TRUE
		},
		addBorderClass: function(className){
			Trex.Button.__borderClasses[className] = _TRUE;
		},
		getBorderClass: function(el){
			var _classes = $tx.classNames(el);
			for(var i =0; i < _classes.length; i++){
				var _class = _classes[i];
				var _matched = Trex.Button.__borderClasses[_class];
				if(_matched){
					return _class;
				}
			}
		}
	},
	/**
	 * 상태가 있는지 여부
	 */
	hasState: _NULL,
	/**
	 * disabled 상태인지 여부
	 */
	isDisabled: _NULL,
	/**
	 * 메뉴가 있는 버튼의 경우 선택된 값 (ex: font-family tool에서 '궁서'를 선택하면 lastValue는 'Gungsuh,궁서'이다.)
	 */
	lastValue: _NULL,
	/**
	 * 메뉴가 있는 버튼의 경우 선택된 메뉴항목의 레이블
	 */
	lastText: _NULL,
	/**
	 * 버튼 dom element
	 */
	elButton: _NULL,
	/**
	 * 버튼의 아이콘 dom element
	 */
	elIcon: _NULL,
	/**
	 * 버튼의 배경 이미지 클래스이름
	 */
	borderClass: _NULL,
	/**
	 * 버튼의 실행 command function
	 * @function
	 */
	_command: function(){},
	/**
	 * 버튼을 실행하면 호출 될 command function을 지정한다. 
	 * @private
	 * @function
	 */
	setCommand: function(cmd){
		this._command = cmd;
	},
	initialize: function(config) { //only superclass
		var _config = this.config = config;
		if (_config.borderClass) {
			Trex.Button.addBorderClass(_config.borderClass);
		}
		
		this.itsNew = !!_config.itsnew;
		this.hasState = !!_config.status; //pushed status
		this.isDisabled = _FALSE;
		this.lastValue = _config.selectedValue || _NULL;
		
		if ( config.el ){
			this.elButton = config.el;
		}else{
			var _elementId = _config.id || "tx_" + _config.identity;
			this.elButton = $must(_elementId + (_config.initializedId || ""));
		}
		var _elButton = this.elButton;
		
		var _elIcon = this.elIcon = $tom.collect(_elButton, "a");
		if (!_elIcon) {
			throw new Error("[Exception]Trex.Button : can't find elIcon for button '"+ _elementId +"'");
		}
		this.borderClass = Trex.Button.getBorderClass(_elButton);
		
		if(this.oninitialized){
			this.oninitialized.bind(this)(_config);	
		}
		this.generate();
		
		if(this.itsNew) {
			$tom.append(_elIcon, Trex.MarkupTemplate.get('button.itsnew').evaluateAsDom({}));
		}
		
		if (_config.selectedValue && this.setValue) {
			this.setValue(_config.selectedValue);
		}
		if (_config.selectedText && this.setText) {
			this.setText(_config.selectedText);
		}
		if ( _config.selectedState && this.setState ){
			this.setState( _config.selectedState );
		}
	},
	/**
	 * 버튼의 이벤트에 handler function 을 걸어준다.
	 * @function
	 */
	generate: function() {
		var _elIcon = this.elIcon;
		this.hdlMouseDown = this.onMouseDown.bindAsEventListener(this);
		this.hdlMouseOver = this.onMouseOver.bindAsEventListener(this);
		this.hdlMouseOut = this.onMouseOut.bindAsEventListener(this);
		this.hdlKeydown = this.onKeyDown.bindAsEventListener(this);
		this.hdlClick = this.onClick.bindAsEventListener(this);
		
		$tx.observe(_elIcon, 'mousedown', this.hdlMouseDown);
		$tx.observe(_elIcon, 'mouseover', this.hdlMouseOver);
		$tx.observe(_elIcon, 'mouseout', this.hdlMouseOut);
		$tx.observe(_elIcon, 'keydown', this.hdlKeydown);
		$tx.observe(_elIcon, 'click', this.hdlClick);

		if (this.ongenerated) {
			this.ongenerated.bind(this)(this.config);
		}
	},
	/**
	 * 버튼에 추가된 이벤트를 제거한다.
	 * @function
	 */
	removeHandler: function(){
		if( !this.hdlMouseDown ){
			return;
		}
		var _elIcon = this.elIcon;
		$tx.stopObserving(_elIcon, 'mousedown', this.hdlMouseDown);
		$tx.stopObserving(_elIcon, 'mouseover', this.hdlMouseOver);
		$tx.stopObserving(_elIcon, 'mouseout', this.hdlMouseOut);
		$tx.stopObserving(_elIcon, 'keydown', this.hdlKeydown);
		$tx.stopObserving(_elIcon, 'click', this.hdlClick);
	},
	/**
	 * 버튼의 border class 이름을 가져온다.
	 * @function
	 * @returns {String} css class name 또는 'undefined'
	 */
	getCurrentBorderClass: function(el){
		var _classes = $tx.classNames(el);
		
		for(var i =0; i < _classes.length; i++){
			var _class = _classes[i];
			if(_class.indexOf(this.borderClass) != -1){
				return _class; 
			}
		}
		return _UNDEFINED+'';
	},
	/**
	 * 버튼의 css class 를 초기상태로 변경한다.
	 * @function
	 */
	normalState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		if(_currBorderClass == this.borderClass) {
			return;
		}
		$tx.removeClassName(this.elButton, _currBorderClass);
		$tx.addClassName(this.elButton, this.borderClass);
	},
	/**
	 * 버튼의 css class 를 mouse over 상태로 변경한다.
	 * @function
	 */
	hoveredState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		$tx.removeClassName(this.elButton, _currBorderClass);
		$tx.addClassName(this.elButton, this.borderClass + '-hovered');
		this.decreaseZindex();
	},
	/**
	 * 버튼의 css class 를 눌려있는 상태로 변경한다.
	 * @function
	 */
	pushedState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		$tx.removeClassName(this.elButton, _currBorderClass);
		$tx.addClassName(this.elButton, this.borderClass + '-pushed');
	},
	/**
	 * 버튼의 현재 상태를 반환한다.
	 * @function
	 * @return {String} 'normal', 'pushed', 'hovered'
	 */
	currentState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		var cs = "normal";
		if(_currBorderClass.indexOf('-pushed') != -1){
			cs = "pushed";
		}else if(_currBorderClass.indexOf('-hovered') != -1){
			cs = "hovered";
		}
		return cs;
	},
	/**
	 * 버튼이 눌린 상태인지 아닌지 판단한다.
	 * @function
	 * @return {boolean} 눌린 상태(pushed)이면 true, 아니면 false
	 */
	isPushed: function(){
		return ("pushed" == this.currentState());
	},
	/**
	 * 메뉴가 있는 버튼인지 판단한다.
	 * @function
	 * @return {boolean} 메뉴가 있으면 true, 아니면 false
	 */
	hasMenu: function(){
		return this.tool ? !!(this.tool.menu) : _FALSE;
	},
	/**
	 * 버튼을 누르면 normal state 또는 pushed state로 변경한다.
	 * @function
	 */
	onMouseDown: function(ev) {
		if(ev){
			$tx.stop(ev);
		}
		if(this.isDisabled) {
			return;
		}
		if(this.hasMenu() || this.hasState){
			if (this._command(ev) === _FALSE) {
				return;
			}
		}else{
			this.evsessionstarted = _TRUE;
		}
		if (this.isPushed()) {
			this.normalState();
		} else {
			this.pushedState();
		}
	},
	/**
	 * 마우스 커서를 버튼영역 위에 올리면 hovered state로 변경한다.
	 * @function
	 */
	onMouseOver: function() {
		if(this.isDisabled || this.isPushed()) {
			return;
		}
		this.hoveredState();
	},
	/**
	 * 마우스 커서가 버튼영역 바깥으로 나가면 normal state로 변경한다.
	 * @function
	 */
	onMouseOut: function() {
		if(this.evsessionstarted){
			this.normalState();
			this.evsessionstarted = _FALSE;
		}
		if(this.isDisabled || this.isPushed()){
			return;
		}
		this.normalState();
	},
	/**
	 * 버튼을 클릭하면 command function을 실행하고 normal state로 변경한다.
	 * @function
	 */
	onClick: function(ev) {
		if(ev){
			$tx.stop(ev);
		}
		if(this.isDisabled) {
			return;
		}	
		if(!this.hasState){
			this._command();
			this.normalState();
			this.evsessionstarted = _FALSE;
		}
	},
	/**
	 * event keyCode가 13이면 onMouseDown(), onClick() 을 실행한다.
	 * @function
	 */
	onKeyDown: function(ev){
		if(ev.keyCode === 13){
			this.onMouseDown(ev);
			this.onClick(ev);
		}
	},
	/**
	 * command function 실행 후 lastValue, lastText의 값을 업데이트 한다.
	 * @function
	 */
	updateAfterCommand: function(value, text){
		this.setValueAndText(value, text);
		this.normalState();
	},
	/**
	 * lastValue, lastText의 값을 설정한다.
	 * @function
	 */
	setValueAndText: function(value, text){
		this.setValue(value);
		this.setText(text);
	},
	/**
	 * lastValue 값을 설정한다.
	 * @function
	 */
	setValue: function(value) {
		if(value) {
			this.lastValue = value;
		}
	},
	/**
	 * lastText 값을 설정한다.
	 * @function
	 */
	setText: function(text) {
		this.lastText = text;
	},
	/**
	 * lastValue 값을 가져온다.
	 * @function
	 * @return {String}
	 */
	getValue: function() {
		return this.lastValue;
	},
	/**
	 * lastText 값을 가져온다.
	 * @function
	 * @return {String}
	 */
	getText: function() {
		return this.lastText;
	},
	/**
	 * pushed에서 normal state로 또는 그 반대로 상태를 변경한다.
	 * @function
	 */
	setState: function(push) {
		if (push) {
			this.pushedState();
		} else {
			this.normalState();
		}
	},
	/**
	 * 아이콘 element 의 css class 를 설정한다.
	 * @function
	 */
	setClassName: function(className) {
		this.elIcon.className = className;
	},
	/**
	 * 버튼을 사용불가 상태로 변경한다.
	 * @function
	 */
	disable: function() {
		if(this.elButton) {
			this.isDisabled = _TRUE;
			$tx.addClassName(this.elButton, "tx-disable");
		}
	},
	/**
	 * 버튼을 사용가능 상태로 변경한다.
	 * @function
	 */
	enable: function() {
		if(this.elButton) {
			this.isDisabled = _FALSE;
			$tx.removeClassName(this.elButton, "tx-disable");
		}
	},
	/**
	 * 버튼을 normal state로 변경한다.
	 * @function
	 */
	release: function() {
		if(this.isDisabled) {
			return;
		}
		if(this.hasMenu() || !this.hasState){
			this.normalState();	
		}
	},
	/**
	 * 버튼의 zindex 크게 만든다.
	 * @function
	 */
	increaseZindex: function(){
		var zIndexValue = 10;
		if( $tom.parent(this.elButton)){
			$tx.setStyle( $tom.parent(this.elButton), { zIndex: zIndexValue});
		}
	},
	/**
	 * 버튼의 zindex 작게 만든다.
	 * @function
	 */
	decreaseZindex: function(){
		var zIndexValue = 4;
		if( $tom.parent(this.elButton)){
			$tx.setStyle( $tom.parent(this.elButton), { zIndex: zIndexValue});
		}
	}
});

/**
 * Trex.Button.Select
 * 
 * @extends Trex.Button
 * @class
 */
Trex.Button.Select = Trex.Class.create(/** @lends Trex.Button.Select.prototype */{
	/** @ignore */
	$extend: Trex.Button,
	/**
	 * 버튼에 화살표 버튼이 더 붙어 있을 경우 화살표 버튼에 event handler function 을 걸어준다.
	 * @function
	 */
	ongenerated: function(){
		Trex.MarkupTemplate.get('button.select.text').evaluateToDom({
			'data': $tom.getText(this.elIcon)
		}, this.elIcon);
		this.elText = $tom.collect(this.elIcon, 'span');
		
		var _elArrow = $tom.collect(this.elButton, "a.tx-arrow");
		if(_elArrow) {
			$tx.observe(_elArrow, 'mousedown', this.onMouseDown.bindAsEventListener(this));
			$tx.observe(_elArrow, 'mouseover', this.onArrowMouseOver.bindAsEventListener(this));
			$tx.observe(_elArrow, 'mouseout', this.onArrowMouseOut.bindAsEventListener(this));
			$tx.observe(_elArrow, 'click', this.onClick.bindAsEventListener(this));	
		}
	},
	/**
	 * 메뉴에서 선택된 값의 레이블을 설정한다.
	 * @function
	 */
	setText: function(text) {
		this.elText.innerText = text;
	},
	/**
	 * 마우스 커서를 버튼영역 위에 올리면 hovered state로 변경한다.
	 * @function
	 */
	onArrowMouseOver: function() {
		if(this.isDisabled || this.isPushed()) {
			return;
		}
		this.hoveredState();
	},
	/**
	 * 마우스 커서가 버튼영역 바깥으로 나가면 normal state로 변경한다.
	 * @function
	 */
	onArrowMouseOut: function() {
		if(this.isDisabled || this.isPushed()) {
			return;
		}
		this.normalState();
	}
});

/**
 * Trex.Button.Splits
 * 
 * @extends Trex.Button
 * @class
 */
Trex.Button.Splits = Trex.Class.create(/** @lends Trex.Button.Splits.prototype */{
	/** @ignore */
	$extend: Trex.Button,
	ongenerated: function(){
		var _elButton = this.elButton;
		var _elArrow = this.elArrow = $tom.collect(_elButton, "a.tx-arrow");
		if(!_elArrow) {
			throw new Error("[Exception]Trex.Button.Splits : not exist element(a.tx-arrow)");
		}
		$tx.observe(_elArrow, 'mousedown', this.onArrowMouseDown.bindAsEventListener(this));
		$tx.observe(_elArrow, 'mouseover', this.onArrowMouseOver.bindAsEventListener(this));
		$tx.observe(_elArrow, 'mouseout', this.onArrowMouseOut.bindAsEventListener(this));
		$tx.observe(_elArrow, 'click', this.onArrowClick.bindAsEventListener(this));
	},
	/**
	 * 화살표 버튼의 css class 를 mouse over 상태로 변경한다.
	 * @function
	 */
	arrowHoveredState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		$tx.removeClassName(this.elButton, _currBorderClass);
		$tx.addClassName(this.elButton, this.borderClass + '-arrow-hovered');
	},
	/**
	 * 화살표 버튼의 css class 를 pushed 상태로 변경한다.
	 * @function
	 */
	arrowPushedState: function(){
		var _currBorderClass = this.getCurrentBorderClass(this.elButton);
		$tx.removeClassName(this.elButton, _currBorderClass);
		$tx.addClassName(this.elButton, this.borderClass + '-arrow-pushed');
	},
	/**
	 * 버튼을 누르면 상태를 변경하고 command를 실행한다. 버튼 옆에 있는 화살표의 상태를 본다.  
	 * @function
	 */
	onMouseDown: function() {
		if(this.isDisabled) {
			return;
		}
		if(this.isPushed()){
			this._command();
			this.normalState();
			this.commandexecuted = _TRUE;
		}else{
			this.pushedState();
			this.commandexecuted = _FALSE;
			this.evsessionstarted = _TRUE;
		}
	},
	/**
	 * tool의 execute를 실행하고 normal state로 변경한다.
	 * @function
	 */
	onClick: function(ev) {
		if(ev){
			$tx.stop(ev);	
		}
		if(this.isDisabled) {
			return;
		}
		if(!this.commandexecuted){
			this.tool.execute(this.lastValue, this.lastText);
			this.evsessionstarted = _FALSE;
		}else{
			this.commandexecuted = _FALSE;
		}
		this.normalState();
	},
	/**
	 * 화살표를 pushed state 로 변경하거나 normal state로 변경한다. 
	 * @function
	 */
	onArrowMouseDown: function() {
		if(this.isDisabled) {
			return;
		}
		if (this._command() === _FALSE) {
			return;
		}
		if(this.isPushed()){
			this.normalState();
		}else{
			this.arrowPushedState();
		}
	},
	/**
	 * @function
	 */
	onArrowClick: function(ev) {
		if(ev){
			$tx.stop(ev);	
		}
		if(this.isDisabled) {
			return;
		}	
	}, 
	/**
	 * 화살표 버튼의 css class 를 mouse over 상태로 변경한다.
	 * @function
	 */
	onArrowMouseOver: function() {
		if(this.isDisabled || this.isPushed()) {
			return;
		}
		this.arrowHoveredState();
	},
	/**
	 * 화살표 버튼의 css class 를 normal 상태로 변경한다.
	 * @function
	 */
	onArrowMouseOut: function() {
		if(this.isDisabled || this.isPushed()) {
			return;
		}
		if(this.commandexecuted){
			this.commandexecuted = _FALSE;
		}
		this.normalState();
	}
});

/** 
 * Trex.Button.Toggle 
 * 
 * @extends Trex.Button
 * @class
 */
Trex.Button.Toggle = Trex.Class.create(/** @lends Trex.Button.Toggle.prototype */{
	/** @ignore */
	$extend: Trex.Button,
	/**
	 * pushed 또는 normal state로 변경한다.
	 * @function
	 */
	setValue: function(selected) {
		if (selected) {
			this.pushedState();
		} else {
			this.normalState();
		}
	}
});

/** 
 * Trex.Button.Widget 
 * 
 * @extends Trex.Button.Select
 * @class
 */
Trex.Button.Widget = Trex.Class.create(/** @lends Trex.Button.Widget.prototype */{
	/** @ignore */
	$extend: Trex.Button.Select,
	/**
	 * lastText 값을 설정한다.
	 * @function
	 */
	setText: function(text) {
		this.elIcon.innerText = text;
		if ( this.lastText ){
			$tx.removeClassName( this.elIcon, this.lastText );
		}
		
		$tx.addClassName( this.elIcon, text );
		this.lastText = text;
	},
	/**
	 * 버튼에 menu와 menu handler를 설정한다.
	 * @function
	 */
	setMenu: function(menu, handler) {
		this.hasState = _TRUE;
		var _button = this;
		
		menu.setCommand(function() { 
			var success = handler.apply(this, arguments);
			_button.updateAfterCommand.apply(_button, arguments);
			return success;
		});
		
		_button.setCommand(
			function() {
				if(!_button.isPushed()) {
					var _lastvalue = _button.getValue();
					menu.show(_lastvalue);
				} else {
					menu.hide();
				}
				return _TRUE;
			}
		);
	}
});

/** 
 * Trex.Button.ColorWidget 
 * 
 * @extends Trex.Button.Widget
 * @class
 */
Trex.Button.ColorWidget = Trex.Class.create(/** @lends Trex.Button.ColorWidget.prototype */{
	/** @ignore */
	$extend: Trex.Button.Widget,
	/**
	 * lastValue 값을 설정한다.
	 * @function
	 */
	setValue: function(value){
		$tx.setStyle( this.elIcon.parentNode, {'backgroundColor': value});
		this.lastValue = value;
	},
	/**
	 * do nothing
	 * @function
	 */
	setText: function(){
		// do Nothing
	}
});

