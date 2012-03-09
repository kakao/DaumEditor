Trex.I.ListExecution = Trex.Mixin.create(/** @lends Trex.I.ListExecution */{
	executeToList: function(processor, tag, attributes) {
		
		this.rngLstNodes = [];
		this.newGrpNode = function(){
			var _gNode = processor.newNode(tag);
			processor.apply(_gNode, attributes);
			return _gNode;
		};
		this.newLstNode = function(){
			return processor.newNode('li');
		};
		this.newPrNode = function(){
			return processor.newNode('p');
		};
		
		var _nodes = processor.blocks(function() {
			return '%wrapper,%paragraph';
		});
		this._wrapList(processor, _nodes);
		
		$A(this.rngLstNodes).each(function(node) {
			processor.stuffNode(node);
		});
	},
	_wrapList: function(processor, nodes) {
		var _curGrpNode = _NULL;
		var _tool = this;
		$A(nodes).each(function(node) {
			if($tom.kindOf(node, "td,th")) {
				var _subLstNodes = $tom.descendants(node, '%wrapper,%paragraph');
				if(_subLstNodes.length == 0) {
					var _pNode = _tool.newPrNode();
					$tom.moveChild(node, _pNode);
					$tom.append(node, _pNode);
					_subLstNodes = [_pNode];
				}
				_tool._wrapList(processor, _subLstNodes);
				
			} else if($tom.kindOf(node, 'li')) {
				if (_curGrpNode) {
					$tom.append(_curGrpNode, node);
				} else {
					_curGrpNode = _tool.newGrpNode();
					var _gNode = $tom.parent(node);
					if ($tom.kindOf(_gNode, 'ul,ol')) {
						var _clnGrpNode = $tom.divideNode(_gNode, $tom.indexOf(node)); //나누기

						$tom.insertAt(_curGrpNode, _clnGrpNode);
						$tom.append(_curGrpNode, node);
						
						if (!$tom.hasUsefulChildren(_gNode)) {
							$tom.remove(_gNode);
						}
						if (!$tom.hasUsefulChildren(_clnGrpNode)) {
							$tom.remove(_clnGrpNode);
						}
					} else { //invalid
						$tom.append(_curGrpNode, node);
					}
				}
				_tool.rngLstNodes.push(node);
				
			} else {
				if (!_curGrpNode) {
					_curGrpNode = _tool.newGrpNode();
					$tom.insertAt(_curGrpNode, node);
				}
				
				var _lNode = _tool.newLstNode();
				if($tom.kindOf(node, '%wrapper')) {
					$tom.wrap(_lNode, node);
					
				} else if($tom.kindOf(node, '%paragraph')) {
                    // FTDUEDTR-1133 List툴이 IE에서 layout block으로 선택되고, 세로로 써지는 쓰여짐
//					try{
//						if ( node.style && _lNode.style ){
//							 $tx.extend( _lNode.style, node.style );
//						}
//					}catch(e){}
					$tom.replace(node, _lNode);
					/* split paragraph by linebreak node
					$tom.split(node, 'br').each(function(line) {
						var _lNode = _processor.create('li');
						$tom.append(_tool.curGrpNode, $tom.replace(line, _lNode));
					});
					*/
					
				} else {
					$tom.wrap(_lNode, node);
				}
				$tom.append(_curGrpNode, _lNode);
				_tool.rngLstNodes.push(_lNode);
			}
		});
	},
	executeOffList: function(processor) {
		var _nodes = processor.blocks(function() {
			return '%listhead';
		});
		
		$A(_nodes).each(function(node) {
			var _tag = "p";
			if($tom.ancestor(node, '%listgroup')) {
				_tag = "li";
			}
			var _cNodes = $tom.children(node, 'li'); 
			$A(_cNodes).each(function(cNode) {
				$tom.replace(cNode, processor.newNode(_tag));
			});
			$tom.unwrap(node);
		});
	}
});

/*
 * @deprecated 
/**
 * 배열 내의 모든 노드를 주어진 리스트로 감싼다.
 * @param {Array} nodes - 리스트로 감쌀 노드 배열
 * @param {String} tag - 리스트 노드 명
 * @param {Object} attributes - 리스트 노드에 적용할 속성
 * @returns {Element} - 생성한 리스트 노드
 * @example
 * 	processor.tolist([p,p,p], 'ol', {});
 * /
tolist: function(nodes, tag, attributes) {
	if(!nodes) {
		return null;
	}
	var _processor = this;
	var _curGNode;
	var _ancestor;
	
	$A(nodes).each(function(node) {
		if($tom.kindOf(node, '%wrapper')) {
			if(!_curGNode) {
				_curGNode = _processor.create(tag, attributes);
				$tom.insertAt(_curGNode, node);
			}
			$tom.append(_curGNode, _processor.wrap(node, 'li', {}));
		} else {
			if ($tom.kindOf(node, '%listgroup')) {
				if (_curGNode) {
					$tom.append(_curGNode, node);
				} else {
					var _gNode = $tom.ancestor(node, 'ul,ol');
					if (_gNode) {
						if ($tom.kindOf(_gNode, tag)) {
							if (_curGNode != _gNode) {
								$tom.apply(_gNode, attributes);
							}
							_curGNode = _gNode;
						} else {
							var _cloneGNode = $tom.divideNode(_gNode, $tom.indexOf(node)); //나누기
							var _newGNode = _processor.create(tag, attributes);
							$tom.insertAt(_newGNode, _cloneGNode);
							$tom.append(_newGNode, node);
							_curGNode = _newGNode;
							if (!$tom.hasUsefulChildren(_cloneGNode)) {
								$tom.remove(_cloneGNode);
							}
							if (!$tom.hasUsefulChildren(_gNode)) {
								$tom.remove(_gNode);
							}
						}
					} else { //invalid
						var _newGNode = _processor.create(tag, attributes);
						$tom.insertAt(_newGNode, node);
						_curGNode = _newGNode;
						$tom.append(_curGNode, node);
					}
				}
			} else {
				var _curAncestor = $tom.ancestor(node, '%datagroup,%tablegroup');
				if(!!_curAncestor) {
					if (_ancestor != _curAncestor ){
						_ancestor = _curAncestor;
						_curGNode = null;
					}
				} 
				if(!_curGNode) {
					_curGNode = _processor.create(tag, attributes);
					$tom.insertAt(_curGNode, node);
				}
				
				var str = ( $tx.opera && nodes.length == 1 )?"&nbsp;":"";
				var _lNode = _processor.newNode('li'); //_processor.create('li', str);
				$tom.replace(node, _lNode);
				_processor.stuffNode(_lNode);
				$tom.append(_curGNode, _lNode);
			}
		}
	});
	return _curGNode;
}, 
/**
 * 리스트를 일반 노드로 변경한다.
 * @param {Element} node - 일반 노드로 변경할 리스트 노드
 * @returns {Element} - 변경된 노드들의 첫번째 노드
 * @example
 * 	processor.offlist(ul,ol);
 * /
offlist: function(node) {
	if(!node) {
		return null;
	}
	var _lNodes = $tom.children(node, 'li'); 
	var _tag = "p";
	if($tom.ancestor(node, '%listgroup')) {
		_tag = "li";
	}
	var _processor = this;
	$A(_lNodes).each(function(lNode) {
		$tom.replace(lNode, _processor.create(_tag));
	});
	this.bookmark.saveAroundNode(node);
	return $tom.unwrap(node);
}
*/