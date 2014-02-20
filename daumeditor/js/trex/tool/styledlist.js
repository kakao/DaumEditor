/**
 * @fileoverview
 *  여러 Style의 리스트를 삽입 할 수 있는 Tool 'styledlist' Source,
 * Class Trex.Tool.StyledList 와 configuration을 포함
 *
 */

TrexMessage.addMsg({
	'@styledlist.subtitle1': '취소',
	'@styledlist.subtitle2': '동그라미',
	'@styledlist.subtitle3': '네모',
	'@styledlist.subtitle4': '숫자',
	'@styledlist.subtitle5': '로마숫자',
	'@styledlist.subtitle6': '알파벳'
});

TrexConfig.addTool(
	"styledlist",
	{
		status: _TRUE,
		options: [
			{ label: TXMSG('@styledlist.subtitle1'), title: 'cancel', type: 'cancel', data: 'cancel', klass: 'tx-styledlist-0' },
			{ label: TXMSG('@styledlist.subtitle2'), title: 'disc', type: 'ul', data: 'disc', klass: 'tx-styledlist-1' },
			{ label: TXMSG('@styledlist.subtitle3'), title: 'square', type: 'ul', data: 'square', klass: 'tx-styledlist-2' },
			{ label: TXMSG('@styledlist.subtitle4'), title: 'decimal', type: 'ol', data: 'decimal', klass: 'tx-styledlist-3' },
			{ label: TXMSG('@styledlist.subtitle5'), title: 'upper-roman', type: 'ol', data: 'upper-roman', klass: 'tx-styledlist-4' },
			{ label: TXMSG('@styledlist.subtitle6'), title: 'upper-alpha', type: 'ol', data: 'upper-alpha', klass: 'tx-styledlist-5' }
		],
        hotKey: {
            ul: { // ctrl + alt + u
                ctrlKey: _TRUE,
                altKey: _TRUE,
                keyCode: 85
            },
            ol: { // ctrl + alt + o
                ctrlKey: _TRUE,
                altKey: _TRUE,
                keyCode: 79
            }
        }
	}
);

Trex.Tool.StyledList = Trex.Class.create({
	$const: {
		__Identity: 'styledlist'
	},
	$extend: Trex.Tool,
    oninitialized: function(config) {
        var self = this;
        self.createListStyleMap(config);
        self.weave(
			new Trex.Button.StyledList(self.buttonCfg),
			new Trex.Menu.Select(self.menuCfg),
			self.handler,
			self.menuInitHandler.bind(self)
		);
        self.indentHelper = Trex.Tool.Indent.Helper;
        self.bindKeyboard(config.hotKey.ul, self.handler.bind(self, "disc"));
        self.bindKeyboard(config.hotKey.ol, self.handler.bind(self, "decimal"));
        self.startSyncButtonWithStyle();
	},
    createListStyleMap: function(config) {
        var listStyleMap = this.listStyleMap = {};
		config.options.each(function(option) {
			listStyleMap[option.data] = {
				type: option.type,
				klass: option.klass
			};
		});
    },
    handler: function(data) {
        var self = this;
        if (!self.listStyleMap[data]) {
            return;
        }
        var listTag = self.listStyleMap[data].type;
        var listHeadStyle = {listStyleType: data};

        self.canvas.execute(function(processor) {
            if (listTag == 'cancel') {
                self.outdentListItem(processor);
            } else {
                self.createListFromSelection(processor, listTag, listHeadStyle);
            }
        });
    },
    outdentListItem: function(processor) {
        processor.executeUsingCaret(function(range, savedCaret) {
            var blockNodes = Trex.Tool.Indent.Helper.findBlocksToIndentFromRange(range, processor, savedCaret);
            blockNodes.each(function(node) {
                Trex.Tool.Indent.Operation.OutdentListItem(node, processor);

            });
        });
    },
    createListFromSelection: function(processor, listTag, listHeadStyle) {
        var self = this;
        processor.executeUsingCaret(function(range, savedCaret) {
            var blockNodes = self.indentHelper.findBlocksToIndentFromRange(range, processor, savedCaret);
            var listGroups = self.groupEachList(blockNodes);
            listGroups.each(function(nodes) {
                var builder = new Trex.Tool.StyledList.ListBuilder(processor, listTag, listHeadStyle);
                builder.createListForNodes(nodes);
            });
        });
        this._removeBrInListItemForIE(processor);
    },
    _removeBrInListItemForIE: function(processor) {
        // FTDUEDTR-1391
        if ($tx.msie_docmode >= 11) {
            var range = processor.createGoogRange();
            var startNode = range.getStartNode();
            if (range.isCollapsed()
                && $tom.isElement(startNode)
                && $tom.isElement(startNode.firstChild)
                && $tom.isTagName(startNode.firstChild, 'br')) {
                $tom.remove(startNode.firstChild);
                startNode.appendChild(processor.newText(''));
            }
        }
    },
    groupEachList: function(blockNodes) {
        var indentHelper = this.indentHelper;
        var groupsForList = [];
        var currentGroup = [];
        var previousCell = _NULL;
        blockNodes.each(function(node) {
            var currentCell = indentHelper.findCurrentCell(node);
            // new list group detected
            if (currentCell != previousCell) {
                if (currentGroup.length > 0) {
                    groupsForList.push(currentGroup);
                    currentGroup = [];
                }
                previousCell = currentCell;
            }

            currentGroup.push(node);
        });
        // remained group
        if (currentGroup.length > 0) {
            groupsForList.push(currentGroup);
        }
        return groupsForList;
    },
    menuInitHandler: function() {
        var insideList = this.canvas.query(function(processor) {
            return !! processor.findNode('%listhead');
        });
        var elCancel = $tom.collect(this.menu.elMenu, 'li');
        if (insideList) {
            $tx.show(elCancel);
        } else {
            $tx.hide(elCancel);
        }
    },
    startSyncButtonWithStyle: function() {
        var self = this;
        var canvas = self.canvas;
        var cachedProperty = self.getDefaultProperty();

        canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
			var listHeadStyle = canvas.query(function(processor) {
				var node = processor.findNode('%listhead');
				return processor.queryStyle(node, 'listStyleType');
			});
			listHeadStyle = listHeadStyle || self.getDefaultProperty();
			if(cachedProperty == listHeadStyle) {
				return;
			}

			var text = self.getButtonClassByValue(listHeadStyle);
			self.button.setText(text);
			cachedProperty = listHeadStyle;
		});
	},
    getDefaultProperty: function() {
        return "decimal";
    },
    getButtonClassByValue: function(value) {
        var listStyleMap = this.listStyleMap;
        if(listStyleMap[value]) {
            return listStyleMap[value].klass;
        } else {
            return listStyleMap[this.getDefaultProperty()].klass;
        }
    }
});

Trex.Button.StyledList = Trex.Class.create({
	$extend: Trex.Button.Select,
	setText: function(text) {
		this.elIcon.className = "tx-icon " + text;
	}
});

Trex.Tool.StyledList.ListBuilder = Trex.Class.create({
    currentDepth: _NULL,
    prepared: _FALSE,
    listElement: _NULL,
    uselessListCandidate: [],
    processor: _NULL,
    initialize: function(processor, listTag, listHeadStyle) {
        this.processor = processor;
        this.listTag = listTag;
        this.listStyle = listHeadStyle;
    },
    createListForNodes: function(nodes) {
        var self = this;
        var depthList = self.getNodeDepthList(nodes);
        depthList.each(function(object) {
            var node = object.node;
            var depth = object.depth;
            if (!self.prepared) {
                self.prepareRootList(node, depth);
            }
            self.adjustDepth(node, depth);
            self.appendAsListItem(node);
        });
        self.cleanupEmptyList();
    },
    getNodeDepthList: function(list) {
        var self = this;
        return list.map(function(node) {
            return {node: node, depth: self.countDepthOfList(node)};
        });
    },
    countDepthOfList: function (node) {
        var count = 0;
        var parent = $tom.parent(node);
        while (parent && !$tom.isBody(parent)) {
            if ($tom.kindOf(parent, "ol,ul")) {
                count++;
            } else if ($tom.kindOf(parent, "th,td")) {
                break;
            }
            parent = $tom.parent(parent);
        }
        return (count || 1);
    },
    prepareRootList: function(node, depth) {
        var self = this;
        self.listElement = self.createNewList();
        var insertionPoint;
        if (node.tagName == "LI") {
            self.uselessListCandidate.push(node.parentNode);
            insertionPoint = $tom.divideNode(node.parentNode, $tom.indexOf(node));
        } else {
            insertionPoint = node;
        }
        $tom.insertAt(self.listElement, insertionPoint);
        self.currentDepth = depth;
        self.listDepth = depth;
        self.prepared = _TRUE;
    },
    adjustDepth: function(node, depth) {
        var self = this;
        while (depth != self.currentDepth) {
            if (depth > self.currentDepth) {
                self.increaseDepth();
            } else {
                self.decreaseDepth();
            }
        }
    },
    increaseDepth: function() {
        var self = this;
        var listElement = self.listElement;
        
        self.currentDepth++;
        var subList = self.createNewList();
        listElement.appendChild(subList);
        self.listElement = subList;
    },
    decreaseDepth: function() {
        var self = this;
        var listElement = self.listElement;
        
        self.currentDepth--;
        if (self.listDepth > self.currentDepth) {  // 새로 만든 listgroup의 depth가 부족하기 때문에 최상위에 listgroup을 추가해서 트리를 키운다.
            self.uselessListCandidate.push(listElement.parentNode);
            var insertPosition = $tom.divideNode(listElement.parentNode, $tom.indexOf(listElement));
            var newList = self.createNewList();
            $tom.insertAt(newList, insertPosition);
            newList.appendChild(listElement);
        }
        self.listElement = listElement.parentNode;
    },
    createNewList: function() {
        var self = this;
        var newList = self.processor.newNode(self.listTag);
        $tx.setStyle(newList, self.listStyle);
        return newList;
    },
    cleanupEmptyList: function() {
        this.uselessListCandidate.each(function(node) {
            $tom.removeListIfEmpty(node);
        });
    },
    wrapWithListItem: function(node) {
        if (node.tagName == "LI") {
            return node;
        } else if (node.tagName == "P" || ($tx.webkit && node.tagName == "DIV")) {
            // p에 스타일이 있으면 marginLeft는 지우고 li로 감싸기
            var newListItem = this.createListItem();
            $tom.applyStyles(node, {marginLeft: _NULL});
            if ($tom.getStyleText(node)) {
            	$tom.wrap(newListItem, node);
                return newListItem;
            } else {
                return $tom.replace(node, newListItem);
            }
        } else {
            var li = this.createListItem();
            li.appendChild(node);
            return li;
        }
    },
    createListItem: function() {
        return this.processor.newNode("li");
    },
    appendAsListItem: function(node) {
        var listItem = this.wrapWithListItem(node);
        if ($tom.kindOf(node.parentNode, "%listhead")) {
            this.uselessListCandidate.push(node.parentNode);
        }
        this.listElement.appendChild(listItem);
    }
});