/**
 * @fileoverview 
 * Tool '내어쓰기' Source,
 * Class Trex.Tool.Outdent 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"outdent",
	{
		sync: _FALSE,
		status: _FALSE,
        hotKey: { // shift + tab - 내어쓰기
			shiftKey: _TRUE,
			keyCode: 9
		}
	}
);

Trex.Tool.Outdent = Trex.Class.create({
	$const: {
		__Identity: 'outdent'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
        this.weave(new Trex.Button(this.buttonCfg), _NULL, this.handler);
        this.createHandlers();
		if ($tx.opera == _FALSE) {
            this.observeBackspace();
		}
        this.bindKeyboard(config.hotKey, this.shiftTabKeyHandler.bind(this));
	},
    handler: function() {
        var self = this;
        this.canvas.execute(function(processor) {
            self.onOutdentClicked.handle(processor);
        });
    },
    shiftTabKeyHandler: function() {
        var self = this;
        this.canvas.execute(function(processor) {
            self.onShiftTabPressed.handle(processor);
        });
    },
    observeBackspace: function() {
        var canvas = this.canvas;
        var self = this;
        canvas.observeKey({ keyCode: Trex.__KEY.BACKSPACE }, function() {
            canvas.query(function(processor) {
                self.onBackspace.handle(processor);
            });
        });
    },
    createHandlers: function() {
        var IndentTool = Trex.Tool.Indent;
        var Judge = IndentTool.Judge;
        var Operation = IndentTool.Operation;
        var Handler = IndentTool.Handler;
        var Chain = Trex.ChainHandler;

        var onDefaultOutdent = Chain.connect([
            new Chain(Judge.ListItem, Operation.OutdentListItem),
            new Chain(Judge.BlockNode, Operation.OutdentBlockNode)
        ]);
        var propagate = Chain.connect([
            new Chain(Judge.AlwaysTrue, Operation.Propagate)
        ]);
        var onCollapsedShiftTabPressed = Chain.connect([
            new Chain(Judge.ListItem, Operation.OutdentListItem),
            new Chain(Judge.ChildOfFirstTableCell, Operation.GoToAboveTable),
            new Chain(Judge.ChildOfTableCell, Operation.GoToPreviousCell),
            new Chain(Judge.BlockNode, Operation.OutdentBlockNode)
        ]);
        var onCollapsedBackspace = Chain.connect([
            new Chain(Judge.And(Judge.HeadOfParagraph, Judge.OneDepthList), Operation.Propagate),
            new Chain(Judge.And(Judge.HeadOfParagraph, Judge.ListItem), Operation.OutdentListItem),
            new Chain(Judge.And(Judge.HeadOfParagraph, Judge.IndentedBlockNode), Operation.OutdentBlockNode),
            new Chain(Judge.AlwaysTrue, Operation.Propagate)
        ]);

        this.onShiftTabPressed = new Handler(onCollapsedShiftTabPressed, onDefaultOutdent, onDefaultOutdent);
        this.onOutdentClicked = new Handler(onDefaultOutdent, onDefaultOutdent, onDefaultOutdent);
        this.onBackspace = new Handler(onCollapsedBackspace, propagate, propagate);
    }
});