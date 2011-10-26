
var TrexMessage = function() {
	var __MESSAGES = {};
	
	var _trexMessage = {
		getMsg: function(msgid){
			var _message = __MESSAGES[msgid] || "";
			
			if (_message.indexOf("#iconpath") > -1) {
				_message = TrexConfig.getIconPath(_message);
			}
			if (_message.indexOf("#decopath") > -1) {
				_message = TrexConfig.getDecoPath(_message);
			}
			return _message;
		},
		addMsg: function(messages) {
			$tx.deepcopy(__MESSAGES, messages);
		},
		printAll: function() {
			var _cc = console;
			for(var _name in __MESSAGES) {
				_cc.log(_name + '=' + __MESSAGES[_name]);
			}
		}
	};
	
	return _trexMessage;
}();

_WIN.TXMSG = TrexMessage.getMsg;
_WIN.TrexMessage = TrexMessage;

