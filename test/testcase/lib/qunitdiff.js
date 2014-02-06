/**
 * Created by sungwon on 14. 2. 6.
 */
var dmp = new diff_match_patch();
QUnit.diff = function(o, n) {
    var diffs = dmp.diff_main(o, n);
    dmp.diff_cleanupSemantic(diffs);
    //console.log(diffs);
    return diffs.map(function(diff) {
        switch(diff[0]) {
            case -1:
                return '<del style="background-color:#E0F2BE; color:#374E0C; text-decoration:none;">' + diff[1] + '</del>';
            case 0:
                return diff[1];
            case 1:
                return '<ins style="background-color:#FFCACA; color:#500;">' + diff[1] + '</ins>';
        }
    }).join("");
};
var ignore_test = false;