/**
 * Created by sungwon on 14. 7. 2.
 */
Trex.I.point = Trex.Faculty.create({
    /**
     * @param {Event} e
     * @returns {Number[]}
     * @private
     */
    _getPointByEvent: function(e){
        var el = $tx.element(e);
        var doc = el.ownerDocument;
        var x = $tx.pointerX(e);
        var y = $tx.pointerY(e);
        if(doc !== this._doc){
            var of = $tx.getOffset(this._panel.el);
            return [x-of.left+(this._win.pageXOffset || this._doc.documentElement.scrollLeft), y-of.top+(this._win.pageYOffset || this._doc.documentElement.scrollTop)];
        }
        return [x,y]
    },/**
     * @param {Number[]} p1
     * @param {Number[]} p2
     * @return {Number[]}
     * @private
     */
    _subtractPoint: function(p1, p2){
        return [ p1[0] - p2[0], p1[1] - p2[1] ];
    },
    _addPoint: function(p1, p2){
        return [ p1[0] + p2[0], p1[1] + p2[1] ];
    },
    _distancePoint: function(p1, p2){
        var point = this._subtractPoint(p1,p2);
        return Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2));
    }
});