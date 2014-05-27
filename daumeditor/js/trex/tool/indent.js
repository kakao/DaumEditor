/**
 * @fileoverview
 * '들여쓰기' Icon Source,
 * Class Trex.Tool.Indent configuration을 포함
 *
 */
TrexConfig.addTool(
    "indent",
    {
        sync: _FALSE,
        status: _FALSE,
        hotKey: {
            // tab - 들여쓰기
            keyCode: 9
        }
    }
);

Trex.Tool.Indent = Trex.Class.create({
    $const: {
        __Identity: 'indent'
    },
    $extend: Trex.Tool,
    oninitialized: function(config) {
        this.weave(new Trex.Button(this.buttonCfg), _NULL, this.handler);
        this.bindKeyboard(config.hotKey, this.tabKeyHandler.bind(this));
        this.createHandlers();
    },
    handler: function() {
        var self = this, canvas = self.canvas;
        canvas.execute(function(processor) {
            self.onIndentClicked.handle(processor);
        });
    },
    tabKeyHandler: function() {
        var self = this;
        this.canvas.execute(function(processor) {
            self.onTabPressed.handle(processor);
        });
    },
    createHandlers: function() {
        var IndentTool = Trex.Tool.Indent;
        var Judge = IndentTool.Judge;
        var Operation = IndentTool.Operation;
        var Handler = IndentTool.Handler;
        var ChainHandler = Trex.ChainHandler;
        
        var onDefaultIndent = ChainHandler.connect([
            new ChainHandler(Judge.ListItem, Operation.IndentListItem),
            new ChainHandler(Judge.BlockNode, Operation.IndentBlockNode)
        ]);
        var onCollapsedTabPressed = ChainHandler.connect([
            new ChainHandler(Judge.And(Judge.HeadOfParagraph, Judge.ListItem), Operation.IndentListItem),
            new ChainHandler(Judge.ChildOfLastTableCell, Operation.GoToBelowTable),
            new ChainHandler(Judge.ChildOfTableCell, Operation.GoToNextCell),
            new ChainHandler(Judge.AlwaysTrue, Operation.IndentBlockNode)
//            new ChainHandler(Judge.And(Judge.HeadOfParagraph, Judge.BlockNode), Operation.IndentBlockNode),
//            new ChainHandler(Judge.AlwaysTrue, Operation.AddFourSpaces)
        ]);

        this.onTabPressed = new Handler(onCollapsedTabPressed, onDefaultIndent, onDefaultIndent);
        this.onIndentClicked = new Handler(onDefaultIndent, onDefaultIndent, onDefaultIndent);
    }
});

Trex.Tool.Indent.Handler = Trex.Class.create({
    initialize: function (collasped, selection, tableCell) {
        var IndentTool = Trex.Tool.Indent;
        var RangeIndenter = IndentTool.RangeIndenter;
        var TableCellIndenter = IndentTool.TableCellIndenter;
        this.collapsedRange = new RangeIndenter(collasped);
        this.selectedRange = new RangeIndenter(selection);
        this.tableCellSelected = new TableCellIndenter(tableCell);
    },
    handle: function(processor) {
        var tableCells = (processor.table) ? processor.table.getTdArr() : [];
        if (tableCells.length > 0) {
            this.tableCellSelected.indent(processor);
        } else if (processor.isCollapsed()) {
            this.collapsedRange.indent(processor);
        } else {
            this.selectedRange.indent(processor);
        }
    }
});

Trex.ChainHandler = Trex.Class.create({
    $const: {
        connect: function(handlers) {
            var firstHandler = handlers[0];
            for (var i = 1; i < handlers.length; i++) {
                handlers[i - 1].setNext(handlers[i]);
            }
            return firstHandler;
        }
    },
    initialize: function(judge, executor) {
        this.judge = judge;
        this.executor = executor;
        return this;
    },
    setNext: function(successor) {
        this.successor = successor;
        return this.successor;
    },
    handle: function() {
    	var args = arguments;
        if (this.judge.apply(this, args)) {
            this.executor.apply(this, args);
        } else if (this.successor) {
            this.successor.handle.apply(this.successor, args);
        }
    }
});
