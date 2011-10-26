Trex.I.AlignExecution = Trex.Mixin.create(/** @lends Trex.I.AlignExecution */{
	executeAlignImageMode: function(processor) {
		var _imageAlignProps = this.constructor.__ImageModeProps['image'];
		var _node = processor.getControl();
		if(!_node) {
			return;
		}
		processor.apply(_node, _imageAlignProps);

		var _textAlignProps = this.constructor.__ImageModeProps['paragraph'];
		if (_textAlignProps) {
			var _wNode = $tom.find(_node, "%paragraph");
			processor.apply(_wNode, _textAlignProps);
		}
	},
	executeAlignTextMode: function(processor) {
		var _textAlignProps = this.constructor.__TextModeProps['paragraph'];
		var _node = processor.getControl();
		if(_node && $tom.kindOf(_node, 'button') ) {
			var _wNode = $tom.find(_node, '%paragraph');
			if (_wNode) {
				processor.apply(_wNode, _textAlignProps);
			}
			var _tNode = $tom.collect(_node, 'blockquote'); //NOTE: # FTDUEDTR-1027
			if(_tNode) {
				_tNode.style.margin = this.constructor.__TextModeProps['button']['style']['margin'];
			}
		} else {
			var _nodes = processor.blocks(function(){
				return '%paragraph';
			});
			processor.apply(_nodes, _textAlignProps);

			var _controlNodes = [];
			_nodes.each(function (node) {
				var tables;
				tables = $tom.collectAll(node, 'table,hr');
				tables.each(function (table) {
					_controlNodes.push(table);
				});
			});
			processor.apply(_controlNodes, {
				'align': _textAlignProps['style']['textAlign']
			});
		}
	},
	queryImageFloat: function(processor) {
		var _node = processor.getControl();
		if (_node) {
			return processor.queryStyle(_node, 'float');
		} else {
			return _NULL;
		}
	},
	queryTextAlign: function(processor) {
		var _node = processor.findNode('%paragraph');
		var _value = processor.queryStyle(_node, 'textAlign');
		if(!_value) {
			_value = processor.queryAttr(_node, 'align');
		}
		if(!_value || _value == "start" || _value == "auto" || _value == "-webkit-auto") {
			_value = 'left';
		}
		return _value;
	},
	queryControlAlign: function(processor) {
		var node = processor.getControl();
        return processor.queryAttr(node, 'align');
	},
    executeAlign: function(processor) {
        var tool = this;
        var alignMode = tool.getAlignMode(processor);
        if (alignMode == "tableCell") {
            tool.executeTableCellMode(processor);
        } else if (alignMode == "image") {
            tool.executeAlignImageMode(processor);
        } else {
            tool.executeAlignTextMode(processor);
        }
    },
    getAlignMode: function(processor) {
		var selectedTdArr = (processor.table) ? processor.table.getTdArr() : [];
        if (selectedTdArr.length > 0) {
            return "tableCell";
        } else if (this.imageAlignMode) {
            return "image";
        } else {
            return "text";
        }
    },
    executeTableCellMode: function(processor) {
        if (!this.indenter) {
            var Judge = Trex.Tool.Indent.Judge;
            var ChainHandler = Trex.ChainHandler;
            var self = this;
            function alignBlockNode(node) {
                $tom.applyAttributes(node, self.constructor.__TextModeProps.paragraph);
            }

            var defaultAlign = ChainHandler.connect([
                new ChainHandler(Judge.ListItem, alignBlockNode),
                new ChainHandler(Judge.BlockNode, alignBlockNode)
            ]);

            this.indenter = new Trex.Tool.Indent.TableCellIndenter(defaultAlign);
        }
        this.indenter.indent(processor);
    },
    syncButtonState: function(textAlign, imageFloat) {
        var self = this;
        var state = self.canvas.query(function(processor) {
            return self.queryCurrentStyle(processor, textAlign, imageFloat);
        });
        self.button.setState(state);
    },
    queryCurrentStyle: function(processor, textAlign, imageFloat) {
        var self = this;
        if (self.imageAlignMode) {
            return self.queryImageMode(processor, textAlign, imageFloat)
        }
        return self.queryTextMode(processor, textAlign);
    },
    queryImageMode: function(processor, textAlign, imageFloat) {
        var self = this, currentFloat;
        if (!this.constructor.__ImageModeProps['paragraph']) {
            currentFloat = self.queryImageFloat(processor);
            return (currentFloat == imageFloat);
        } else {
            var align = self.queryTextAlign(processor);
            if (align == textAlign) {
                currentFloat = self.queryImageFloat(processor) || 'none';
                return (currentFloat == imageFloat);
            } else {
                return _FALSE;
            }
        }
    },
    queryTextMode: function(processor, textAlign) {
        var self = this;
        var controlAlign = self.queryControlAlign(processor);
        if (controlAlign == _NULL) {
            var align = self.queryTextAlign(processor) || 'left';
            return (align == textAlign);
        } else {
            return (controlAlign == textAlign);
        }
    }
});