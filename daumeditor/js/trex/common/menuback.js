$tx.msie && Trex.module("add menu layer shield for IE flash object", function(editor, toolbar, sidebar, canvas/*, config*/) {

    /**
     * IE에서 object의 wmode=window에 대응하여 iframe을 메뉴 레이어 하단에 삽입한다.
     */
    Trex.MarkupTemplate.add(
        'menu.shield', [
            '<div class="tx-menu-back" style="overflow:hidden;position:absolute;border:0;">',
            '<iframe src="about:blank" width="100%" height="100%" frameborder="0"></iframe>',
            '</div>'
        ].join("")
    );

    /**
     * 각 메뉴 레이어에 추가되는 요소
     */
    var MenuShieldEntry = Trex.Class.create({
        initialize: function (id, menuEl) {
            this.id = id;
            this.menuEl = menuEl;
            this.shieldEl = Trex.MarkupTemplate.get('menu.shield').evaluateAsDom({});
        },
        show: function() {
            this.update();
            $tom.insertAt(this.shieldEl, this.menuEl);
            $tx.show(this.shieldEl);
        },
        hide: function() {
            $tx.hide(this.shieldEl);
            $tom.remove(this.shieldEl);
        },
        update: function() {
            var style = {
                "width": this.menuEl.offsetWidth.toPx(),
                "height": this.menuEl.offsetHeight.toPx(),
                "left": $tx.getStyle(this.menuEl, 'left'),
                "top": $tx.getStyle(this.menuEl, 'top')
            };
            $tx.setStyle(this.shieldEl, style);
        },
        destroy: function() {
            this.id = _NULL;
            this.menuEl = _NULL;
            this.shieldEl = _NULL;
        }
    });

    /**
     * 레이어 추가/삭제/갱신을 위한 컨트롤러
     */
    var MenuShield = Trex.Class.create({
        initialize: function() {
            this.entry = {};
        },
        show: function(id, menu) {
            var trg = this.entry[id];
            if (!trg) {
                console.log('show', id, this.entry);
                var entry = new MenuShieldEntry(id, menu);
                this.entry[id] = trg = entry;
            }
            trg.show();
        },
        hide: function(id) {
            var trg = this.entry[id];
            if (trg) {
                console.log('hide', id, this.entry);
                trg.hide();
                trg.destroy();
                delete this.entry[id];
            }
        },
        updateAll: function() {
            var cache = this.entry;
            setTimeout(function(){
                for(var p in cache) {
                    if(cache.hasOwnProperty(p)) {
                        cache[p].update();
                    }
                }
            }, 1);
        }
    });

    var shield = new MenuShield();

    function getMenuId(menu) {
        var id;
        try {
            if (menu.config.id) {
                id = menu.config.id + menu.config.initializedId;
            } else {
                id = menu.config.el.className;
            }
        } catch(e) {
            id = 'unknown';
        }
        return id;
    }

    toolbar.observeJob(Trex.Ev.__MENU_LAYER_SHOW, function(ev){
        var menu = ev.detail.menu;
        shield.show(getMenuId(menu), menu.elMenu);
    });

    toolbar.observeJob(Trex.Ev.__MENU_LAYER_HIDE, function(ev){
        var menu = ev.detail.menu;
        shield.hide(getMenuId(menu));
    });

    toolbar.observeJob(Trex.Ev.__MENU_LAYER_CHANGE_SIZE, function(ev){
        shield.updateAll();
    });
});