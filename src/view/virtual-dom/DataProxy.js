
const DataProxy = function (caller,  data, propFields, updateCallBack) {
    this._caller = caller
    this._updateCb = updateCallBack
    // this._propUpdater = r
    this._data = data
    this._changes = []
    this._childPaths = {}
    this._propFields = propFields
    // this._hidingValue = !1
}

DataProxy.create = function(caller, updateCallBack, data, propFields) {
    return new DataProxy(caller, updateCallBack, data, propFields)
}

DataProxy.prototype.setHidingValue = function(){
}

DataProxy.prototype.addPathObserver = function(){

}


DataProxy.prototype.removePathObserver = function(){

}


DataProxy.prototype.addObserver = function(){

}


DataProxy.prototype.removeObserver = function(){

}



DataProxy.prototype.triggerObservers = function(){

}

DataProxy.prototype.scheduleMerge = function(e,t,n){
    this._changes.push([!0, e, t, n])
}


DataProxy.prototype.scheduleReplace = function(e, t, n){
    this._changes.push([!1, e, t, n])
}


DataProxy.prototype.setChanges = function(){

}


DataProxy.prototype.getChanges = function(){

}


DataProxy.prototype.doUpdates = function(ele){
    var t = this._changes;
    this._changes = [];
    for (var n = [], i = [], r = 0; r < t.length; r++) {
        var a = t[r]
            // , l = a[0]
            , c = a[1]
            , d = a[2]
            // , u = this._propFields[c[0]]
            , A = void 0;

        if (1 === c.length){
            ele.__propData[c[0]] = d
        }

        // else {
        //     for (var g = this._data, _ = c[0], v = 1; v < c.length; v++) {
        //         var w = c[v];
        //         "number" == typeof w && isFinite(w) ? s.call(g, _) && g[_]instanceof Array || (g[_] = []) : (!s.call(g, _) || null === g[_] || "object" != typeof g[_] || g[_]instanceof Array) && (g[_] = {}),
        //             g = g[_],
        //             _ = w
        //     }
        //     if (l) {
        //         var m = null !== d && "object" == typeof d;
        //         m && !(d instanceof Array) && s.call(g, _) && null !== g[_] && "object" == typeof g[_] && !(g[_]instanceof Array) ? f(g[_], d, this._propFields) : g[_] = m ? p(d) : d
        //     } else
        //         g[_] = d
        // }
        n.push(c)
        // i.push([d, A])
    }

    this._updateCb(n, t, ele);
}

export default DataProxy


