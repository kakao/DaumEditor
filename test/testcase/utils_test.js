module("utils");

test("getAllAttributes basic", function() {
    var dispHtml = '<img actualwidth="452" width="452" exif="{}" data-filename="2.jpg" style="clear:none;float:none;" id="tx_entry_69451_" src="http://cfile143.uf.daum.net/image/2303033A5350914626C759" class="txc-image">';
    var attrMap = Trex.Util.getAllAttributes(dispHtml);

    equal(attrMap.actualwidth, "452", "actualwidth");
    equal(attrMap.width, "452", "width");
    equal(attrMap.exif, "{}", 'exif');
    equal(attrMap['data-filename'], "2.jpg", 'data-filename');
    equal(attrMap.style, "clear:none;float:none;", 'style');
    equal(attrMap.id, "tx_entry_69451_", 'id');
    equal(attrMap.src, "http://cfile143.uf.daum.net/image/2303033A5350914626C759", 'src');
    equal(attrMap.class, "txc-image", 'class');

});


test("getAllAttributes style width", function() {
    var dispHtml = '<img actualwidth="452" exif="{}" data-filename="2.jpg" style="clear:none;float:none;width:300px" id="tx_entry_69451_" src="http://cfile143.uf.daum.net/image/2303033A5350914626C759" class="txc-image">';
    var attrMap = Trex.Util.getAllAttributes(dispHtml);

    equal(attrMap.width, '300');
});

test("getAllAttributes style height", function() {
    var dispHtml = '<img actualwidth="452" exif="{}" data-filename="2.jpg" style="clear:none;float:none;height:300px" id="tx_entry_69451_" src="http://cfile143.uf.daum.net/image/2303033A5350914626C759" class="txc-image">';
    var attrMap = Trex.Util.getAllAttributes(dispHtml);

    equal(attrMap.height, '300');
});

