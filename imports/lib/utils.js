const mergeSortedC = function(left, right){
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.push(left[il],left[il+1],left[il+2],left[il+3]);
            il+=4;
        } else {
            result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
};

const copyArrayN = function(obj){
    if (!obj || !obj.pos || !obj.time )
      return {pos: [], time: []};
    let pos = obj.pos.map(function(arr) { return arr ? arr.slice() : [];});
    let time = obj.time.map(function(arr) { return arr ? arr.slice() : [];});
    return {'pos':pos, 'time':time};
};


export {mergeSortedC, copyArrayN};
