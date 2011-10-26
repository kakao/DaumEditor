window.txEval = function(source, target){
	if (typeof source == "function") {
		return source.call(target || this);
	} else if (typeof source == "string") {
		return (target) ? target.eval(source) : this.eval(source);
	}
};