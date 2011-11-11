(function() {
    var autosaver, el;

    module("autosaver", {
        setup: function() {
            var editor = Editor,
            toolbar = Editor.getToolbar(),
            sidebar = Editor.getSidebar(),
            canvas = Editor.getCanvas(),
            config = Editor.getConfig();

            TrexConfig.getSave("autosave", config).use = true;
            autosaver = new Trex.AutoSave(editor, toolbar, sidebar, canvas, config);
            autosaver.curList = [ { meta : { title: 'title1', category: 'category1' }, upddate: '20000101000000' } ];
            autosaver.isChanged = true;

            el = autosaver.el;
        }
    });

    test("get autosaver instance", function() {
        ok(autosaver);
    });

    test("get autosave view element", function() {
        ok(el);
        equal(el.id, "tx_autosave" + Editor.config.initializedId);
    });

    test("show list element", function() {
        autosaver.showList();
        ok($tx.visible(autosaver.elListBox));
    });

    test("showList() should fire event", 1, function() {
        autosaver.observeJob(Trex.Ev.__AUTOSAVER_LIST_OPENED, function() {
            ok(true);
        });
        autosaver.showList();
    });

    test("hide list element", function() {
        autosaver.hideList();
        ok(!$tx.visible(autosaver.elListBox));
    });

    test("show message", function() {
        autosaver.showMessage("message");
        ok($tx.visible(autosaver.elMsg));
        equal($tom.getText(autosaver.elMsg), "message");
    });

    test("hide message", function() {
        autosaver.hideMessage();
        ok(!$tx.visible(autosaver.elMsg));
    });

    test("draw empty list", function() {
        autosaver.curList = [];
        autosaver.drawList();
        var dd = Sizzle("dd", el)[0];
        ok($tx.hasClassName(dd, "tx-autosave-empty"));
        equal(assi.extractText(dd), "");
    });

    test("draw non-empty list should not have empty classanme", function() {
        autosaver.drawList();
        var dd = Sizzle("dd", el)[0];
        ok(!$tx.hasClassName(dd, "tx-autosave-empty"));
        var autosavedTitle = Sizzle("li a", el)[0];
        equal(assi.extractText(autosavedTitle), "title1");
        ok(!autosaver.isChanged);
    });

    test("draw updated list", function() {
        autosaver.drawList();
        autosaver.curList[0].meta.title = "title_modified";
        autosaver.drawList();

        var autosavedTitle = Sizzle("li a", el)[0];
        equal(assi.extractText(autosavedTitle), "title_modified");
    });


    /* TODO
    1. view 분리
    2. controller 분리
    3. dao 분리 (adaptor 제거)
    4. thread 제거
    6. autosave list paging 제거

    interfaces
        count
        load
        save
        list
        discard

        throwover

        showlist
        hidelist
        togglelist
        showList
        hideList
        showMessage
        hideMessage
        drawCount
        drawList
        getMetaAsJSON 시리즈... (뭐하는 애들이지?)

     */


})();